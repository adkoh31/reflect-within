import { useState, useEffect, useCallback, useRef } from 'react';
import { isOnline, waitForConnection, globalOperationQueue } from '../utils/errorHandler';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'failed'
  const syncTimeoutRef = useRef(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      if (pendingOperations.length > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('failed');
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
      retries: 0
    };

    setPendingOperations(prev => [...prev, operationWithId]);

    // If online, try to sync immediately
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  // Handle sync process
  const handleSync = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0 || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');

    try {
      // Process all pending operations
      const operationsToProcess = [...pendingOperations];
      
      for (const pendingOp of operationsToProcess) {
        try {
          await pendingOp.operation();
          // Remove successful operation from pending list
          setPendingOperations(prev => prev.filter(op => op.id !== pendingOp.id));
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
      
      // Clear sync status after 3 seconds
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('failed');
    }
  }, [isOnline, pendingOperations, syncStatus]);

  // Retry failed operations
  const retryFailedOperations = useCallback(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline, handleSync]);

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
      hasFailedOperations: pendingOperations.some(op => op.retries > 0)
    };
  }, [isOnline, pendingOperations, syncStatus, lastSyncTime]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOnline,
    pendingOperations,
    syncStatus,
    lastSyncTime,
    addPendingOperation,
    handleSync,
    retryFailedOperations,
    clearPendingOperations,
    getSyncInfo
  };
}; 