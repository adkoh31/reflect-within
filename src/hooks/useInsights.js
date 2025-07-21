import { useState, useCallback, useMemo } from 'react';
import { useAnalyticsProcessor } from './useWorkerManager.js';
import { cacheUtils } from '../utils/cacheManager.js';
import { debounce } from '../utils/performanceUtils.js';
import { processAdvancedAnalytics } from '../utils/advancedAnalytics.js';

export const useInsights = (journalEntries, isGeneratingInsights, setIsGeneratingInsights, setInsights, handleError) => {
  const { processJournalAnalytics, processUserAdvancedAnalytics, isReady: isWorkerReady } = useAnalyticsProcessor();
  const [analyticsCache, setAnalyticsCache] = useState(new Map());
  const [advancedAnalytics, setAdvancedAnalytics] = useState(null);

  // Synchronous fallback for when worker is not available
  const generateInsightsSync = useCallback((entries) => {
    const journalEntries = entries || [];
    
    // Simple sentiment analysis
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

    // Extract themes and moods for chart format
    const themesData = [];
    const moodsData = [];
    
    journalEntries.forEach(entry => {
      const text = (entry.content || '').toLowerCase();
      const date = entry.createdAt || entry.timestamp || new Date().toISOString();
      
      // Extract themes
      const themes = [];
      const commonThemes = ['work', 'family', 'health', 'fitness', 'relationships', 'goals', 'stress', 'gratitude', 'learning', 'creativity'];
      
      commonThemes.forEach(theme => {
        if (text.includes(theme)) {
          themes.push(theme);
        }
      });
      
      if (themes.length > 0) {
        themesData.push({ date, themes });
      }
      
      // Extract mood score (1-10 scale based on sentiment)
      const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'love', 'wonderful', 'amazing', 'peaceful', 'content'];
      const negativeWords = ['sad', 'angry', 'frustrated', 'anxious', 'worried', 'depressed', 'stressed', 'overwhelmed'];
      
      let moodScore = 5; // Neutral baseline
      positiveWords.forEach(word => {
        moodScore += (text.match(new RegExp(word, 'g')) || []).length * 0.5;
      });
      negativeWords.forEach(word => {
        moodScore -= (text.match(new RegExp(word, 'g')) || []).length * 0.5;
      });
      
      // Clamp to 1-10 range
      moodScore = Math.max(1, Math.min(10, moodScore));
      
      moodsData.push({ date, mood: Math.round(moodScore) });
    });

    return {
      themes: themesData,
      moods: moodsData,
      sentimentScores,
      totalEntries: journalEntries.length,
      averageSentiment: sentimentScores.length > 0 ? 
        sentimentScores.reduce((sum, s) => sum + s.score, 0) / sentimentScores.length : 0
    };
  }, []);

  // Debounced insights generation to prevent excessive processing
  const debouncedGenerateInsights = useMemo(
    () => debounce(async (entries) => {
      if (!isWorkerReady) {
        console.warn('Worker not ready, falling back to synchronous processing');
        return generateInsightsSync(entries);
      }

      try {
        const cacheKey = `analytics_${entries.length}`;
        const cached = cacheUtils.getCachedData(cacheKey);
        
        if (cached) {
          console.log('📊 Using cached analytics');
          return cached;
        }

        console.log('🔄 Processing analytics with worker...');
        const result = await processJournalAnalytics(
          entries || [],
          [], // chatMessages
          []  // trackingData
        );

        if (result.success) {
          // Cache the result for 5 minutes
          cacheUtils.cacheData(cacheKey, result.data, 5 * 60 * 1000);
          return result.data;
        } else {
          throw new Error(result.error || 'Analytics processing failed');
        }
      } catch (error) {
        console.error('Worker analytics failed, falling back to sync:', error);
        return generateInsightsSync(entries);
      }
    }, 1000),
    [isWorkerReady, processJournalAnalytics, generateInsightsSync]
  );

  // Advanced analytics generation
  const generateAdvancedInsights = useCallback(async (userData) => {
    console.log('🔍 generateAdvancedInsights called with:', { 
      hasUserData: !!userData, 
      isWorkerReady, 
      userDataKeys: userData ? Object.keys(userData) : [] 
    });
    
    if (!userData) {
      console.warn('⚠️ No userData provided to generateAdvancedInsights');
      return null;
    }

    try {
      const cacheKey = `advanced_analytics_${userData?.profile?.id || 'anonymous'}`;
      const cached = cacheUtils.getCachedData(cacheKey);
      
      if (cached) {
        console.log('📊 Using cached advanced analytics');
        return cached;
      }

      console.log('🔄 Processing advanced analytics...');
      
      let result;
      if (isWorkerReady) {
        console.log('🔧 Using worker for advanced analytics...');
        const workerResult = await processUserAdvancedAnalytics(userData);
        console.log('🔧 Worker result:', workerResult);
        
        if (workerResult.success) {
          result = workerResult.data;
        } else {
          throw new Error(workerResult.error || 'Advanced analytics processing failed');
        }
      } else {
        console.log('🔧 Using fallback synchronous processing...');
        // Fallback to synchronous processing
        result = await processAdvancedAnalytics(userData);
      }

      console.log('📊 Advanced analytics result:', result);

      // Cache for 10 minutes
      cacheUtils.cacheData(cacheKey, result, 10 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('❌ Advanced analytics failed:', error);
      throw error;
    }
  }, [isWorkerReady, processUserAdvancedAnalytics]);

  // Generate insights for the current journal entries
  const generateInsights = useCallback(async () => {
    if (isGeneratingInsights || !journalEntries || Object.keys(journalEntries).length === 0) return;

    setIsGeneratingInsights(true);
    
    try {
      // Convert journal entries object to array
      const entriesArray = Object.values(journalEntries).flat();
      
      const insights = await debouncedGenerateInsights(entriesArray);
      
      if (insights) {
        setInsights(insights);
        console.log('✅ Insights generated successfully');
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      handleError?.(error);
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [
    isGeneratingInsights, 
    journalEntries, 
    debouncedGenerateInsights,
    setInsights,
    handleError
  ]);

  // Generate advanced insights for the entire user dataset
  const generateUserAdvancedInsights = useCallback(async (userData) => {
    console.log('🔄 Starting advanced insights generation...', { userData: !!userData });
    
    try {
      const result = await generateAdvancedInsights(userData);
      console.log('📊 Advanced analytics result:', result);
      
      if (result) {
        setAdvancedAnalytics(result);
        console.log('✅ Advanced analytics generated successfully');
        return result;
      } else {
        console.warn('⚠️ Advanced analytics returned null/undefined');
      }
    } catch (error) {
      console.error('❌ Failed to generate advanced insights:', error);
      handleError?.(error);
    }
  }, [generateAdvancedInsights, handleError]);

  // Clear analytics cache
  const clearAnalyticsCache = useCallback(() => {
    cacheUtils.clearDataCache();
    setAnalyticsCache(new Map());
    setAdvancedAnalytics(null);
  }, []);

  return {
    generateInsights,
    generateUserAdvancedInsights,
    generateAdvancedInsights,
    clearAnalyticsCache,
    advancedAnalytics,
    isWorkerReady
  };
}; 