import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { generateEnhancedResponse } from '../utils/enhancedAI.js';

/**
 * Enhanced AI Hook
 * Provides sophisticated AI interactions with better personalization and proactive support
 */
export const useEnhancedAI = (userData, conversationPersistence, isPremium = false) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);

  /**
   * Generate enhanced AI response with improved personalization
   */
  const generateResponse = useCallback(async (userMessage, conversationContext = null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get conversation context if not provided
      let context = conversationContext;
      if (!context && conversationPersistence?.currentConversation) {
        context = conversationPersistence.currentConversation.messages
          .slice(-10)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text || msg.content
          }));
      }

      // Get memory insights
      const memoryInsights = conversationPersistence?.getMemoryInsightsForAI?.() || null;

      // Get auth token
      const token = localStorage.getItem('reflectWithin_token');

      // Use enhanced AI endpoint
      const endpoint = token ? API_ENDPOINTS.ENHANCED_REFLECT : API_ENDPOINTS.ENHANCED_REFLECT_PUBLIC;

      const response = await axios.post(endpoint, {
        message: userMessage,
        pastEntries: userData?.journalEntries?.slice(-5) || [],
        conversationContext: context || [],
        isPremium: isPremium,
        memoryInsights: memoryInsights
      }, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });

      const enhancedResponse = {
        response: response.data.question,
        suggestions: response.data.suggestions || [],
        followUps: response.data.followUps || [],
        strategy: response.data.strategy || 'general',
        analysis: response.data.analysis || {}
      };

      setLastResponse(enhancedResponse);
      return enhancedResponse;

    } catch (error) {
      console.error('Enhanced AI response error:', error);
      setError(error.message);
      
      // Fallback to basic response
      return {
        response: "I'm here to support you. What would you like to explore?",
        suggestions: [],
        followUps: ["How are you feeling right now?"],
        strategy: 'fallback',
        analysis: { error: error.message }
      };
    } finally {
      setIsLoading(false);
    }
  }, [userData, conversationPersistence, isPremium]);

  /**
   * Generate proactive suggestions based on user patterns
   */
  const generateProactiveSuggestions = useCallback(async () => {
    if (!userData || !conversationPersistence) {
      return [];
    }

    try {
      const memoryInsights = conversationPersistence.getMemoryInsightsForAI();
      const currentConversation = conversationPersistence.currentConversation;
      
      // Use the enhanced AI utility to generate suggestions
      const { suggestions } = await generateEnhancedResponse(
        "Generate proactive suggestions",
        userData,
        currentConversation?.messages?.slice(-5) || [],
        memoryInsights
      );

      return suggestions;
    } catch (error) {
      console.error('Error generating proactive suggestions:', error);
      return [];
    }
  }, [userData, conversationPersistence]);

  /**
   * Generate contextual follow-up questions
   */
  const generateFollowUpQuestions = useCallback(async (userMessage, context = null) => {
    if (!userData) {
      return ["How are you feeling right now?"];
    }

    try {
      const memoryInsights = conversationPersistence?.getMemoryInsightsForAI?.() || null;
      
      const { followUps } = await generateEnhancedResponse(
        userMessage,
        userData,
        context || [],
        memoryInsights
      );

      return followUps;
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return ["What's on your mind about this?"];
    }
  }, [userData, conversationPersistence]);

  /**
   * Analyze conversation patterns and provide insights
   */
  const analyzeConversationPatterns = useCallback(async (conversationContext) => {
    if (!conversationContext || conversationContext.length === 0) {
      return {
        depth: 'new',
        engagement: 'low',
        emotionalState: 'neutral',
        topics: [],
        suggestions: []
      };
    }

    try {
      const memoryInsights = conversationPersistence?.getMemoryInsightsForAI?.() || null;
      
      const { analysis } = await generateEnhancedResponse(
        "Analyze conversation patterns",
        userData,
        conversationContext,
        memoryInsights
      );

      return analysis;
    } catch (error) {
      console.error('Error analyzing conversation patterns:', error);
      return {
        depth: 'unknown',
        engagement: 'unknown',
        emotionalState: 'neutral',
        topics: [],
        suggestions: []
      };
    }
  }, [userData, conversationPersistence]);

  /**
   * Generate personalized insights based on user data
   */
  const generatePersonalizedInsights = useCallback(async () => {
    if (!userData) {
      return {
        patterns: [],
        suggestions: [],
        growthAreas: []
      };
    }

    try {
      const memoryInsights = conversationPersistence?.getMemoryInsightsForAI?.() || null;
      
      // Analyze recent entries and patterns
      const recentEntries = userData.journalEntries?.slice(-10) || [];
      const patterns = [];
      const suggestions = [];
      const growthAreas = [];

      // Analyze sentiment trends
      if (recentEntries.length > 0) {
        const sentiments = recentEntries.map(entry => {
          // Simple sentiment analysis (you can enhance this)
          const content = entry.content || '';
          const positiveWords = ['happy', 'excited', 'great', 'amazing', 'wonderful', 'progress'];
          const negativeWords = ['sad', 'frustrated', 'stressed', 'overwhelmed', 'difficult'];
          
          const positiveCount = positiveWords.filter(word => content.toLowerCase().includes(word)).length;
          const negativeCount = negativeWords.filter(word => content.toLowerCase().includes(word)).length;
          
          return positiveCount - negativeCount;
        });

        const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
        
        if (avgSentiment > 0) {
          patterns.push('Positive momentum');
          suggestions.push('Build on this positive energy');
        } else if (avgSentiment < 0) {
          patterns.push('Challenging period');
          suggestions.push('Focus on self-care and support');
          growthAreas.push('Stress management');
        }
      }

      // Analyze goal progress
      if (userData.goals?.personalGoals?.length > 0) {
        const goalMentions = recentEntries.filter(entry => 
          (entry.content || '').toLowerCase().includes('goal')
        ).length;

        if (goalMentions > 0) {
          patterns.push('Goal-focused');
          suggestions.push('Continue working toward your objectives');
        } else {
          suggestions.push('Consider revisiting your goals');
          growthAreas.push('Goal alignment');
        }
      }

      // Add memory insights
      if (memoryInsights?.longTermPatterns?.recurringThemes?.length > 0) {
        patterns.push(`Recurring themes: ${memoryInsights.longTermPatterns.recurringThemes.join(', ')}`);
      }

      return {
        patterns,
        suggestions,
        growthAreas
      };

    } catch (error) {
      console.error('Error generating personalized insights:', error);
      return {
        patterns: [],
        suggestions: [],
        growthAreas: []
      };
    }
  }, [userData, conversationPersistence]);

  /**
   * Get AI response with enhanced context
   */
  const getEnhancedResponse = useCallback(async (userMessage, options = {}) => {
    const {
      includeSuggestions = true,
      includeFollowUps = true,
      includeAnalysis = true,
      conversationContext = null
    } = options;

    const response = await generateResponse(userMessage, conversationContext);

    return {
      response: response.response,
      ...(includeSuggestions && { suggestions: response.suggestions }),
      ...(includeFollowUps && { followUps: response.followUps }),
      ...(includeAnalysis && { analysis: response.analysis }),
      strategy: response.strategy
    };
  }, [generateResponse]);

  return {
    // State
    isLoading,
    error,
    lastResponse,
    
    // Actions
    generateResponse,
    generateProactiveSuggestions,
    generateFollowUpQuestions,
    analyzeConversationPatterns,
    generatePersonalizedInsights,
    getEnhancedResponse,
    
    // Utilities
    clearError: () => setError(null),
    reset: () => {
      setError(null);
      setLastResponse(null);
    }
  };
};

export default useEnhancedAI; 