import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook for managing Web Workers
 * Provides a clean interface for background data processing
 */
export const useWorkerManager = (workerPath = '/src/workers/dataProcessor.worker.js') => {
  const workerRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  const isWorkerReadyRef = useRef(false);
  const fallbackModeRef = useRef(false);

  // Initialize worker
  const initializeWorker = useCallback(() => {
    if (workerRef.current) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
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
          // Fall back to main thread processing
          fallbackModeRef.current = true;
          workerRef.current = null;
          console.warn('Falling back to main thread processing');
          resolve();
        };

        isWorkerReadyRef.current = true;
        resolve();
      } catch (error) {
        console.error('Failed to initialize worker:', error);
        // Don't reject, just log the error and continue without worker
        fallbackModeRef.current = true;
        console.warn('Continuing without Web Worker support - using fallback processing');
        resolve();
      }
    });
  }, [workerPath]);

  // Fallback processing functions (run in main thread)
  const fallbackProcessAnalytics = (data) => {
    const startTime = performance.now();
    
    try {
      const { journalEntries, chatMessages, trackingData } = data;
      
      // Calculate sentiment analysis
      const sentimentScores = journalEntries.map(entry => {
        const text = (entry.content || '').toLowerCase();
        const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'love', 'wonderful', 'amazing'];
        const negativeWords = ['sad', 'angry', 'frustrated', 'anxious', 'worried', 'depressed'];
        
        let score = 0;
        positiveWords.forEach(word => {
          score += (text.match(new RegExp(word, 'g')) || []).length;
        });
        negativeWords.forEach(word => {
          score -= (text.match(new RegExp(word, 'g')) || []).length;
        });
        
        return {
          id: entry.id,
          score: score / Math.max(text.split(' ').length, 1),
          date: entry.timestamp
        };
      });

      const processingTime = performance.now() - startTime;
      
      return {
        success: true,
        data: {
          sentimentScores,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  const fallbackProcessAdvancedAnalytics = (userData) => {
    const startTime = performance.now();
    
    try {
      const { journalEntries = [] } = userData;
      
      // Basic sentiment analysis
      const sentimentAnalysis = journalEntries.map(entry => ({
        id: entry.id,
        score: 0, // Simplified for fallback
        date: entry.timestamp || entry.date
      }));
      
      const result = {
        sentimentAnalysis,
        processingTime: performance.now() - startTime
      };
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  const fallbackProcessDataMigration = (oldData) => {
    const startTime = performance.now();
    
    try {
      const transformedData = {
        journalEntries: oldData.journalEntries?.map(entry => ({
          id: entry.id || Date.now().toString(),
          content: entry.content || entry.text || '',
          timestamp: entry.timestamp || entry.date || new Date().toISOString(),
          tags: entry.tags || [],
          mood: entry.mood || null,
          wordCount: (entry.content || entry.text || '').split(' ').length
        })) || [],
        
        chatMessages: oldData.chatMessages?.map(msg => ({
          id: msg.id || Date.now().toString(),
          content: msg.content || msg.text || '',
          role: msg.role || msg.sender || 'user',
          timestamp: msg.timestamp || new Date().toISOString()
        })) || [],
        
        trackingData: oldData.trackingData?.map(track => ({
          id: track.id || Date.now().toString(),
          type: track.type || 'mood',
          value: track.value,
          timestamp: track.timestamp || new Date().toISOString(),
          metadata: track.metadata || {}
        })) || []
      };
      
      const processingTime = performance.now() - startTime;
      
      return {
        success: true,
        data: transformedData,
        processingTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Send message to worker
  const sendMessage = useCallback(async (type, data) => {
    if (!workerRef.current && !fallbackModeRef.current) {
      await initializeWorker();
    }

    // If worker is not available, use fallback processing
    if (!workerRef.current || fallbackModeRef.current) {
      console.warn('Using fallback processing (main thread)');
      
      switch (type) {
        case 'PROCESS_ANALYTICS':
          return fallbackProcessAnalytics(data);
        case 'PROCESS_ADVANCED_ANALYTICS':
          return fallbackProcessAdvancedAnalytics(data);
        case 'PROCESS_MIGRATION':
          return fallbackProcessDataMigration(data);
        default:
          return { success: false, error: 'Unknown message type' };
      }
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
      fallbackModeRef.current = false;
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
    isReady: isWorkerReadyRef.current || fallbackModeRef.current,
    isFallbackMode: fallbackModeRef.current,
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