import { useState, useEffect, useCallback, useRef } from 'react';
import { isOnline, waitForConnection, globalOperationQueue } from '../utils/errorHandler.js';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'failed'
  const [syncProgress, setSyncProgress] = useState(0);
  const [aiOfflineMode, setAiOfflineMode] = useState(false);
  const syncTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setAiOfflineMode(false);
      // Trigger sync when coming back online
      if (pendingOperations.length > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('failed');
      setAiOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingOperations.length]);

  // Add operation to pending queue
  const addPendingOperation = useCallback((operation) => {
    const operationWithId = {
      id: Date.now() + Math.random(),
      operation,
      timestamp: new Date().toISOString(),
      retries: 0,
      type: operation.type || 'unknown'
    };

    setPendingOperations(prev => [...prev, operationWithId]);

    // If online, try to sync immediately
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  // Add specific operation types
  const addJournalEntry = useCallback((entry) => {
    const operation = {
      type: 'journal_entry',
      data: entry,
      execute: async () => {
        // Simulate API call to save journal entry
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Synced journal entry:', entry.title);
      }
    };
    addPendingOperation(operation);
  }, [addPendingOperation]);

  const addChatMessage = useCallback((message) => {
    const operation = {
      type: 'chat_message',
      data: message,
      execute: async () => {
        // Simulate API call to save chat message
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Synced chat message:', message.content);
      }
    };
    addPendingOperation(operation);
  }, [addPendingOperation]);

  const addUserProfile = useCallback((profile) => {
    const operation = {
      type: 'user_profile',
      data: profile,
      execute: async () => {
        // Simulate API call to update user profile
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Synced user profile update');
      }
    };
    addPendingOperation(operation);
  }, [addPendingOperation]);

  // Handle AI offline limitations
  const handleAiRequest = useCallback(async (requestType, data) => {
    if (!isOnline) {
      // Store AI request for later processing
      const operation = {
        type: 'ai_request',
        data: { requestType, data, timestamp: new Date().toISOString() },
        execute: async () => {
          // Simulate AI API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('Processed AI request:', requestType);
        }
      };
      addPendingOperation(operation);
      
      // Return offline response based on request type
      return getOfflineAiResponse(requestType, data);
    }
    
    // Online - proceed with normal AI request
    return null; // Let the calling component handle the actual request
  }, [isOnline, addPendingOperation]);

  // Get appropriate offline AI response
  const getOfflineAiResponse = useCallback((requestType, data) => {
    switch (requestType) {
      case 'chat':
        return {
          type: 'offline_response',
          content: "I'm currently offline, but I can still help you reflect on your thoughts. Your message has been saved and I'll respond when we're back online.",
          isOffline: true
        };
      case 'journal_assistant':
        return {
          type: 'offline_response',
          content: "I'm offline right now, but I can still help you organize your thoughts. Your journal entry has been saved locally and I'll provide insights when we reconnect.",
          isOffline: true
        };
      case 'insights':
        return {
          type: 'offline_response',
          content: "Advanced insights require an internet connection. Your data has been saved and I'll generate insights when we're back online.",
          isOffline: true
        };
      default:
        return {
          type: 'offline_response',
          content: "I'm currently offline. Your request has been saved and will be processed when we reconnect.",
          isOffline: true
        };
    }
  }, []);

  // Handle sync process
  const handleSync = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0 || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');
    setSyncProgress(0);

    try {
      // Process all pending operations
      const operationsToProcess = [...pendingOperations];
      const totalOperations = operationsToProcess.length;
      
      for (let i = 0; i < operationsToProcess.length; i++) {
        const pendingOp = operationsToProcess[i];
        try {
          await pendingOp.operation.execute();
          // Remove successful operation from pending list
          setPendingOperations(prev => prev.filter(op => op.id !== pendingOp.id));
          setSyncProgress(((i + 1) / totalOperations) * 100);
        } catch (error) {
          console.error('Failed to sync operation:', error);
          // Increment retry count
          setPendingOperations(prev => 
            prev.map(op => 
              op.id === pendingOp.id 
                ? { ...op, retries: op.retries + 1 }
                : op
            )
          );
        }
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date().toISOString());
      setSyncProgress(100);
      
      // Clear sync status after 3 seconds
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('failed');
      setSyncProgress(0);
    }
  }, [isOnline, pendingOperations, syncStatus]);

  // Retry failed operations
  const retryFailedOperations = useCallback(() => {
    if (isOnline) {
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Add exponential backoff for retries
      const failedOperations = pendingOperations.filter(op => op.retries > 0);
      const maxRetries = Math.max(...failedOperations.map(op => op.retries), 0);
      const delay = Math.min(1000 * Math.pow(2, maxRetries), 10000); // Max 10 seconds
      
      retryTimeoutRef.current = setTimeout(() => {
        handleSync();
      }, delay);
    }
  }, [isOnline, pendingOperations, handleSync]);

  // Clear all pending operations (for testing/debugging)
  const clearPendingOperations = useCallback(() => {
    setPendingOperations([]);
  }, []);

  // Get sync status info
  const getSyncInfo = useCallback(() => {
    return {
      isOnline,
      pendingCount: pendingOperations.length,
      syncStatus,
      lastSyncTime,
      syncProgress,
      aiOfflineMode,
      hasFailedOperations: pendingOperations.some(op => op.retries > 0),
      operationTypes: [...new Set(pendingOperations.map(op => op.type))]
    };
  }, [isOnline, pendingOperations, syncStatus, lastSyncTime, syncProgress, aiOfflineMode]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      // Wait a bit for connection to stabilize
      const timer = setTimeout(() => {
        handleSync();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingOperations.length, handleSync]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOnline,
    pendingOperations,
    syncStatus,
    syncProgress,
    lastSyncTime,
    aiOfflineMode,
    addPendingOperation,
    addJournalEntry,
    addChatMessage,
    addUserProfile,
    handleAiRequest,
    handleSync,
    retryFailedOperations,
    clearPendingOperations,
    getSyncInfo
  };
}; 