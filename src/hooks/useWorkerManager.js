import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook for managing Web Workers
 * Provides a clean interface for background data processing
 */
export const useWorkerManager = (workerPath = '/src/workers/dataProcessor.worker.js') => {
  const workerRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  const isWorkerReadyRef = useRef(false);

  // Initialize worker
  const initializeWorker = useCallback(() => {
    if (workerRef.current) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Use the correct path for development
        const workerUrl = new URL(workerPath, import.meta.url);
        workerRef.current = new Worker(workerUrl, { type: 'module' });
        
        workerRef.current.onmessage = (event) => {
          const { id, type, result, error } = event.data;
          
          if (error) {
            console.error('Worker error:', error);
            const handler = messageHandlersRef.current.get(id);
            if (handler?.reject) {
              handler.reject(new Error(error));
            }
            messageHandlersRef.current.delete(id);
            return;
          }
          
          const handler = messageHandlersRef.current.get(id);
          if (handler?.resolve) {
            handler.resolve(result);
          }
          messageHandlersRef.current.delete(id);
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker initialization error:', error);
          reject(error);
        };

        isWorkerReadyRef.current = true;
        resolve();
      } catch (error) {
        console.error('Failed to initialize worker:', error);
        // Don't reject, just log the error and continue without worker
        console.warn('Continuing without Web Worker support');
        resolve();
      }
    });
  }, [workerPath]);

  // Send message to worker
  const sendMessage = useCallback(async (type, data) => {
    if (!workerRef.current) {
      await initializeWorker();
    }

    // If worker is still not available, return a fallback response
    if (!workerRef.current) {
      console.warn('Worker not available, using fallback processing');
      return { success: false, error: 'Worker not available' };
    }

    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString() + Math.random().toString(36).substr(2);
      
      messageHandlersRef.current.set(messageId, { resolve, reject });
      
      workerRef.current.postMessage({
        id: messageId,
        type,
        data
      });
    });
  }, [initializeWorker]);

  // Process analytics data
  const processAnalytics = useCallback(async (data) => {
    try {
      const result = await sendMessage('PROCESS_ANALYTICS', data);
      return result;
    } catch (error) {
      console.error('Analytics processing failed:', error);
      throw error;
    }
  }, [sendMessage]);

  // Process advanced analytics data
  const processAdvancedAnalytics = useCallback(async (userData) => {
    try {
      const result = await sendMessage('PROCESS_ADVANCED_ANALYTICS', userData);
      return result;
    } catch (error) {
      console.error('Advanced analytics processing failed:', error);
      throw error;
    }
  }, [sendMessage]);

  // Process data migration
  const processDataMigration = useCallback(async (oldData) => {
    try {
      const result = await sendMessage('PROCESS_MIGRATION', oldData);
      return result;
    } catch (error) {
      console.error('Data migration processing failed:', error);
      throw error;
    }
  }, [sendMessage]);

  // Cleanup worker
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CLEANUP' });
      workerRef.current.terminate();
      workerRef.current = null;
      isWorkerReadyRef.current = false;
      messageHandlersRef.current.clear();
    }
  }, []);

  // Initialize worker on mount
  useEffect(() => {
    initializeWorker().catch(console.error);
    
    return () => {
      cleanup();
    };
  }, [initializeWorker, cleanup]);

  return {
    isReady: isWorkerReadyRef.current,
    processAnalytics,
    processAdvancedAnalytics,
    processDataMigration,
    sendMessage,
    cleanup
  };
};

/**
 * Hook for analytics processing with worker
 */
export const useAnalyticsProcessor = () => {
  const { processAnalytics, processAdvancedAnalytics, isReady } = useWorkerManager();

  const processJournalAnalytics = useCallback(async (journalEntries, chatMessages, trackingData) => {
    if (!isReady) {
      throw new Error('Worker not ready');
    }

    return await processAnalytics({
      journalEntries,
      chatMessages,
      trackingData
    });
  }, [processAnalytics, isReady]);

  const processUserAdvancedAnalytics = useCallback(async (userData) => {
    if (!isReady) {
      throw new Error('Worker not ready');
    }

    return await processAdvancedAnalytics(userData);
  }, [processAdvancedAnalytics, isReady]);

  return {
    processJournalAnalytics,
    processUserAdvancedAnalytics,
    isReady
  };
};

/**
 * Hook for data migration processing with worker
 */
export const useMigrationProcessor = () => {
  const { processDataMigration, isReady } = useWorkerManager();

  const processUserDataMigration = useCallback(async (oldUserData) => {
    if (!isReady) {
      throw new Error('Worker not ready');
    }

    return await processDataMigration(oldUserData);
  }, [processDataMigration, isReady]);

  return {
    processUserDataMigration,
    isReady
  };
}; 