import { useState, useEffect, useCallback } from 'react';
import { useUnifiedData } from './useUnifiedData.js';
import { createEnhancedMetadata, extractTopicsFromText, analyzeEmotionalState } from '../utils/conversationAnalytics.js';

/**
 * Core conversation management hook
 * Handles basic CRUD operations for conversations
 */
export const useConversations = (user, isPremium) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  const { userData, updateProfile } = useUnifiedData(user);

  // Load conversations from user data on mount
  useEffect(() => {
    if (userData?.conversations) {
      setConversations(userData.conversations);
      
      // Set current conversation to the most recent one
      if (userData.conversations.length > 0) {
        const mostRecent = userData.conversations
          .sort((a, b) => {
            try {
              const dateA = new Date(a.lastActive);
              const dateB = new Date(b.lastActive);
              
              // Handle invalid dates by putting them at the end
              if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
              if (isNaN(dateA.getTime())) return 1;
              if (isNaN(dateB.getTime())) return -1;
              
              return dateB - dateA;
            } catch (error) {
              return 0;
            }
          })[0];
        setCurrentConversationId(mostRecent.id);
      }
    }
  }, [userData?.conversations]);

  // Generate conversation ID
  const generateConversationId = useCallback(() => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create new conversation with enhanced metadata
  const createNewConversation = useCallback(async (title = null) => {
    const conversationId = generateConversationId();
    const newConversation = {
      id: conversationId,
      title: title || `Conversation ${conversations.length + 1}`,
      startDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      messages: [],
      metadata: createEnhancedMetadata()
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    setCurrentConversationId(conversationId);

    // Save to user data if premium
    if (isPremium && user) {
      try {
        await updateProfile({
          ...userData,
          conversations: updatedConversations
        });
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    }

    return conversationId;
  }, [conversations, isPremium, user, userData, updateProfile, generateConversationId]);

  // Update conversation metadata with advanced analysis
  const updateConversationMetadata = useCallback((metadata, message, allMessages) => {
    const updatedMetadata = { ...metadata };
    const messageText = message.text || message.content || '';

    // Extract topics with clustering
    const topics = extractTopicsFromText(messageText);
    if (topics.length > 0) {
      updatedMetadata.topics = [...new Set([...metadata.topics, ...topics])];
    }

    // Analyze emotional state
    const emotionalState = analyzeEmotionalState(messageText);
    updatedMetadata.emotionalState = emotionalState;

    // Update engagement metrics
    updatedMetadata.engagement.userMessageLength = messageText.length;
    updatedMetadata.engagement.interactionFrequency = allMessages.length;

    // Update long-term memory patterns
    updateLongTermMemory(updatedMetadata, messageText, allMessages);

    return updatedMetadata;
  }, []);

  // Update long-term memory patterns
  const updateLongTermMemory = useCallback((metadata, messageText, allMessages) => {
    const textLower = messageText.toLowerCase();

    // Track recurring themes
    const themeKeywords = {
      'work stress': ['work', 'stress', 'deadline', 'pressure'],
      'fitness goals': ['goal', 'fitness', 'workout', 'progress'],
      'relationship challenges': ['relationship', 'friend', 'family', 'partner'],
      'health concerns': ['health', 'pain', 'injury', 'sick'],
      'motivation struggles': ['motivation', 'tired', 'exhausted', 'burnout']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        if (!metadata.longTermMemory.recurringThemes.includes(theme)) {
          metadata.longTermMemory.recurringThemes.push(theme);
        }
      }
    });

    // Track emotional triggers
    const triggerKeywords = ['when(?:ever)?\\s+(.+?)(?:\s|$)', 'every\\s+time\\s+(.+?)(?:\s|$)', 'always\\s+(.+?)(?:\s|$)', 'never\\s+(.+?)(?:\s|$)'];
    if (triggerKeywords.some(pattern => new RegExp(pattern).test(textLower))) {
      const trigger = extractEmotionalTrigger(messageText);
      if (trigger && !metadata.longTermMemory.emotionalTriggers.includes(trigger)) {
        metadata.longTermMemory.emotionalTriggers.push(trigger);
      }
    }

    // Track goal mentions
    if (textLower.includes('goal') || textLower.includes('target')) {
      const goal = extractGoalMention(messageText);
      if (goal && !metadata.longTermMemory.goalMentions.includes(goal)) {
        metadata.longTermMemory.goalMentions.push(goal);
      }
    }

    // Track achievements
    const achievementKeywords = ['achieved', 'accomplished', 'reached', 'hit', 'pr', 'personal record'];
    if (achievementKeywords.some(keyword => textLower.includes(keyword))) {
      const achievement = extractAchievement(messageText);
      if (achievement) {
        metadata.longTermMemory.achievementCelebrations.push({
          achievement,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, []);

  // Extract emotional trigger from message
  const extractEmotionalTrigger = useCallback((text) => {
    const triggerPatterns = [
      /when(?:ever)?\s+(.+?)(?:\s|$)/i,
      /every\s+time\s+(.+?)(?:\s|$)/i,
      /always\s+(.+?)(?:\s|$)/i,
      /never\s+(.+?)(?:\s|$)/i
    ];

    for (const pattern of triggerPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }, []);

  // Extract goal mention from message
  const extractGoalMention = useCallback((text) => {
    const goalPatterns = [
      /goal\s+(?:is|to|of)\s+(.+?)(?:\s|$)/i,
      /target\s+(?:is|to|of)\s+(.+?)(?:\s|$)/i,
      /want\s+to\s+(.+?)(?:\s|$)/i
    ];

    for (const pattern of goalPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }, []);

  // Extract achievement from message
  const extractAchievement = useCallback((text) => {
    const achievementPatterns = [
      /achieved\s+(.+?)(?:\s|$)/i,
      /hit\s+(.+?)(?:\s|$)/i,
      /reached\s+(.+?)(?:\s|$)/i,
      /pr\s+(.+?)(?:\s|$)/i
    ];

    for (const pattern of achievementPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }, []);

  // Add message to current conversation with enhanced analysis
  const addMessageToConversation = useCallback(async (message, conversationId = currentConversationId) => {
    if (!conversationId) {
      const newConvId = await createNewConversation();
      conversationId = newConvId;
    }

    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, {
          ...message,
          conversationId,
          timestamp: message.timestamp || new Date().toISOString()
        }];

        const updatedMetadata = updateConversationMetadata(conv.metadata, message, updatedMessages);

        return {
          ...conv,
          messages: updatedMessages,
          metadata: updatedMetadata,
          lastActive: new Date().toISOString()
        };
      }
      return conv;
    });

    setConversations(updatedConversations);

    // Save to user data if premium
    if (isPremium && user) {
      try {
        await updateProfile({
          ...userData,
          conversations: updatedConversations
        });
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    }
  }, [conversations, currentConversationId, isPremium, user, userData, updateProfile, createNewConversation, updateConversationMetadata]);

  // Get current conversation
  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || null;

  // Get conversation messages
  const getConversationMessages = useCallback((conversationId = currentConversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    return conversation ? conversation.messages : [];
  }, [conversations, currentConversationId]);

  // Switch to conversation
  const switchToConversation = useCallback((conversationId) => {
    setCurrentConversationId(conversationId);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);

    // If we deleted the current conversation, switch to the most recent one
    if (conversationId === currentConversationId) {
      if (updatedConversations.length > 0) {
        const mostRecent = updatedConversations
          .sort((a, b) => {
            try {
              const dateA = new Date(a.lastActive);
              const dateB = new Date(b.lastActive);
              
              // Handle invalid dates by putting them at the end
              if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
              if (isNaN(dateA.getTime())) return 1;
              if (isNaN(dateB.getTime())) return -1;
              
              return dateB - dateA;
            } catch (error) {
              return 0;
            }
          })[0];
        setCurrentConversationId(mostRecent.id);
      } else {
        setCurrentConversationId(null);
      }
    }

    // Save to user data if premium
    if (isPremium && user) {
      try {
        await updateProfile({
          ...userData,
          conversations: updatedConversations
        });
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  }, [conversations, currentConversationId, isPremium, user, userData, updateProfile]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (conversationId, newTitle) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, title: newTitle } : conv
    );
    setConversations(updatedConversations);

    // Save to user data if premium
    if (isPremium && user) {
      try {
        await updateProfile({
          ...userData,
          conversations: updatedConversations
        });
      } catch (error) {
        console.error('Failed to update conversation title:', error);
      }
    }
  }, [conversations, isPremium, user, userData, updateProfile]);

  // Get conversation summary
  const getConversationSummary = useCallback((conversationId = currentConversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return null;

    const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
    const aiMessages = conversation.messages.filter(msg => msg.sender === 'ai');

    return {
      id: conversation.id,
      title: conversation.title,
      startDate: conversation.startDate,
      lastActive: conversation.lastActive,
      totalMessages: conversation.messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      topics: conversation.metadata?.topics || [],
      emotionalState: conversation.metadata?.emotionalState || { primary: 'neutral', intensity: 0 }
    };
  }, [conversations, currentConversationId]);

  // Search conversations
  const searchConversations = useCallback((query) => {
    if (!query.trim()) return conversations;

    const searchTerm = query.toLowerCase();
    return conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(searchTerm)) return true;
      
      // Search in topics with null check
      if (conv.metadata?.topics && conv.metadata.topics.some(topic => topic.toLowerCase().includes(searchTerm))) return true;
      
      // Search in long-term memory patterns with null check
      if (conv.metadata?.longTermMemory?.recurringThemes && 
          conv.metadata.longTermMemory.recurringThemes.some(theme => 
            theme.toLowerCase().includes(searchTerm))) return true;
      
      // Search in messages
      return conv.messages.some(msg => 
        (msg.text || msg.content || '').toLowerCase().includes(searchTerm)
      );
    });
  }, [conversations]);

  return {
    // State
    conversations,
    currentConversationId,
    currentConversation,
    isLoadingConversations,
    
    // Actions
    createNewConversation,
    addMessageToConversation,
    switchToConversation,
    deleteConversation,
    updateConversationTitle,
    
    // Getters
    getConversationMessages,
    getConversationSummary,
    searchConversations,
    
    // Utilities
    extractTopicsFromText,
    analyzeEmotionalState
  };
}; 