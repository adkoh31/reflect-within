import { useCallback, useMemo, useEffect } from 'react';
import { enhancedMemoryManager } from '../utils/enhancedMemoryManager';

/**
 * Enhanced Multi-Turn Memory Hook
 * Integrates sophisticated memory capabilities with existing conversation systems
 */
export const useEnhancedMultiTurnMemory = (conversations, currentConversationId, userData) => {
  
  // Process conversation memory when conversations change
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      conversations.forEach(conversation => {
        if (conversation.messages && conversation.messages.length > 0) {
          enhancedMemoryManager.processConversationMemory(
            conversation.id,
            conversation.messages,
            userData
          );
        }
      });
    }
  }, [conversations, userData]);

  /**
   * Get enhanced memory context for AI response
   */
  const getEnhancedMemoryContext = useCallback((currentMessage) => {
    if (!currentConversationId) return null;

    return enhancedMemoryManager.getMemoryContext(currentConversationId, currentMessage);
  }, [currentConversationId]);

  /**
   * Get memory insights for conversation continuity
   */
  const getMemoryInsights = useCallback(() => {
    const stats = enhancedMemoryManager.getMemoryStats();
    const emotionalContext = enhancedMemoryManager.getEmotionalContext();
    const goalContext = enhancedMemoryManager.getGoalContext();
    const userPatterns = enhancedMemoryManager.getUserPatterns();

    return {
      stats,
      emotionalContext,
      goalContext,
      userPatterns,
      hasSignificantMemory: stats.conversationMemories > 0 || stats.emotionalHistoryLength > 0
    };
  }, []);

  /**
   * Generate memory-enhanced conversation starters
   */
  const generateMemoryEnhancedStarters = useCallback(() => {
    const insights = getMemoryInsights();
    const starters = [];

    // Time-based starters (existing functionality)
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour <= 10) {
      starters.push({
        text: "How are you feeling this morning?",
        type: "time-based",
        priority: 1
      });
    } else if (currentHour >= 18 && currentHour <= 22) {
      starters.push({
        text: "How was your day? What's on your mind?",
        type: "time-based",
        priority: 1
      });
    }

    // Memory-based starters
    if (insights.hasSignificantMemory) {
      // Emotional pattern starters
      if (insights.emotionalContext) {
        const { recentTrend, dominantEmotion } = insights.emotionalContext;
        
        if (recentTrend === 'declining') {
          starters.push({
            text: "I've noticed you've been going through some challenges lately. How are you doing today?",
            type: "emotional-support",
            priority: 3
          });
        } else if (recentTrend === 'improving') {
          starters.push({
            text: "You've been in such a positive space lately! What's contributing to that energy?",
            type: "celebration",
            priority: 2
          });
        }
      }

      // Goal continuity starters
      if (insights.goalContext && insights.goalContext.recentGoals.length > 0) {
        const recentGoal = insights.goalContext.recentGoals[0];
        const daysSinceMention = Math.floor(
          (new Date() - new Date(recentGoal.timestamp)) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceMention <= 7) {
          starters.push({
            text: `You mentioned wanting to ${recentGoal.goal} recently. How's that coming along?`,
            type: "goal-continuity",
            priority: 2
          });
        }
      }

      // Pattern-based starters
      if (insights.userPatterns.length > 0) {
        const userPattern = insights.userPatterns[0];
        if (userPattern.recurringThemes.length > 0) {
          const recentTheme = userPattern.recurringThemes[0];
          starters.push({
            text: `I've noticed you've been thinking about ${recentTheme} lately. How's that going?`,
            type: "pattern-based",
            priority: 2
          });
        }
      }

      // Success moment starters
      const successMoments = enhancedMemoryManager.successMoments;
      if (successMoments.length > 0) {
        const recentSuccess = successMoments[successMoments.length - 1];
        const daysSinceSuccess = Math.floor(
          (new Date() - new Date(recentSuccess.timestamp)) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceSuccess <= 3) {
          starters.push({
            text: "I remember you had a great moment recently. How are you feeling about that progress?",
            type: "success-celebration",
            priority: 2
          });
        }
      }
    }

    // Default starters if no memory-based ones
    if (starters.length === 0) {
      starters.push(
        {
          text: "How are you feeling today?",
          type: "default",
          priority: 1
        },
        {
          text: "What would you like to work on or explore?",
          type: "default",
          priority: 1
        }
      );
    }

    return starters.sort((a, b) => a.priority - b.priority);
  }, [getMemoryInsights]);

  /**
   * Get conversation continuity suggestions
   */
  const getContinuitySuggestions = useCallback((currentMessage) => {
    if (!currentConversationId) return [];

    const memoryContext = enhancedMemoryManager.getMemoryContext(currentConversationId, currentMessage);
    return memoryContext.continuitySuggestions || [];
  }, [currentConversationId]);

  /**
   * Check if conversation has memory context
   */
  const hasMemoryContext = useMemo(() => {
    if (!currentConversationId) return false;
    
    const conversation = conversations.find(conv => conv.id === currentConversationId);
    return conversation && conversation.messages && conversation.messages.length > 5;
  }, [conversations, currentConversationId]);

  /**
   * Get memory summary for current conversation
   */
  const getCurrentConversationMemory = useCallback(() => {
    if (!currentConversationId) return null;

    const conversation = conversations.find(conv => conv.id === currentConversationId);
    if (!conversation) return null;

    const memory = enhancedMemoryManager.memoryCache.get(currentConversationId);
    if (!memory) return null;

    return {
      topics: memory.topics,
      emotionalState: memory.emotionalState,
      goals: memory.goals,
      patterns: memory.patterns,
      insights: memory.insights
    };
  }, [conversations, currentConversationId]);

  /**
   * Get cross-conversation memory insights
   */
  const getCrossConversationMemory = useCallback(() => {
    const allMemories = Array.from(enhancedMemoryManager.memoryCache.values());
    
    if (allMemories.length === 0) return null;

    // Aggregate patterns across all conversations
    const allTopics = allMemories.flatMap(memory => memory.topics);
    const allGoals = allMemories.flatMap(memory => memory.goals);
    const allEmotions = allMemories.map(memory => memory.emotionalState);

    // Find most common patterns
    const topicFrequency = {};
    allTopics.forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });

    const goalFrequency = {};
    allGoals.forEach(goal => {
      const goalKey = goal.goal.toLowerCase();
      goalFrequency[goalKey] = (goalFrequency[goalKey] || 0) + 1;
    });

    const emotionFrequency = {};
    allEmotions.forEach(emotion => {
      emotionFrequency[emotion.primary] = (emotionFrequency[emotion.primary] || 0) + 1;
    });

    return {
      recurringTopics: Object.entries(topicFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, frequency: count })),
      
      recurringGoals: Object.entries(goalFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([goal, count]) => ({ goal, frequency: count })),
      
      dominantEmotions: Object.entries(emotionFrequency)
        .sort(([,a], [,b]) => b - a)
        .map(([emotion, count]) => ({ emotion, frequency: count })),
      
      totalConversations: allMemories.length,
      averageMessagesPerConversation: Math.round(
        allMemories.reduce((sum, memory) => sum + memory.messages.length, 0) / allMemories.length
      )
    };
  }, []);

  /**
   * Clear memory for specific conversation
   */
  const clearConversationMemory = useCallback((conversationId) => {
    enhancedMemoryManager.clearConversationMemory(conversationId);
  }, []);

  /**
   * Clear all memory
   */
  const clearAllMemory = useCallback(() => {
    enhancedMemoryManager.clearAllMemory();
  }, []);

  /**
   * Get memory statistics
   */
  const getMemoryStats = useCallback(() => {
    return enhancedMemoryManager.getMemoryStats();
  }, []);

  return {
    // Core memory functions
    getEnhancedMemoryContext,
    getMemoryInsights,
    getCurrentConversationMemory,
    getCrossConversationMemory,
    
    // Conversation enhancement
    generateMemoryEnhancedStarters,
    getContinuitySuggestions,
    hasMemoryContext,
    
    // Memory management
    clearConversationMemory,
    clearAllMemory,
    getMemoryStats,
    
    // Direct access to memory manager (for advanced use cases)
    memoryManager: enhancedMemoryManager
  };
}; 