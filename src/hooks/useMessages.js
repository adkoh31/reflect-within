import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.js';
import { retryWithBackoff } from '../utils/errorHandler.js';

export const useMessages = (
  messages, setMessages, inputText, setInputText, isChatLoading, setIsChatLoading,
  isListening, setIsListening, resetTranscript, formatTimestamp,
  last5JournalEntries, isPremium, user, handleError, onMessageSent,
  conversationPersistence, generateEnhancedResponse
) => {
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isChatLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: formatTimestamp()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsChatLoading(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('reflectWithin_token');
      console.log('Chat - Token:', token ? 'Present' : 'Missing');
      
      // Get conversation context for AI
      let conversationContext = [];
      if (conversationPersistence?.currentConversation) {
        // Use last 10 messages from current conversation for context
        const recentMessages = conversationPersistence.currentConversation.messages
          .slice(-10)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text || msg.content
          }));
        conversationContext = recentMessages;
      }

      // Get memory insights for enhanced AI responses
      const memoryInsights = conversationPersistence?.getMemoryInsightsForAI?.() || null;
      
      // Use enhanced AI if available, otherwise fall back to basic AI
      let aiResponse;
      if (generateEnhancedResponse) {
        try {
          const enhancedResponse = await generateEnhancedResponse(inputText, conversationContext);
          aiResponse = {
            question: enhancedResponse.response,
            suggestions: enhancedResponse.suggestions || [],
            followUps: enhancedResponse.followUps || [],
            strategy: enhancedResponse.strategy || 'general',
            analysis: enhancedResponse.analysis || {}
          };
        } catch (enhancedError) {
          console.log('Enhanced AI failed, falling back to basic AI:', enhancedError);
          // Fall back to basic AI
          const response = await retryWithBackoff(async () => {
            return await axios.post(API_ENDPOINTS.REFLECT, { 
              message: inputText, 
              pastEntries: last5JournalEntries,
              conversationContext: conversationContext,
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
          });
          aiResponse = response.data;
        }
      } else {
        // Use basic AI
        const response = await retryWithBackoff(async () => {
          return await axios.post(API_ENDPOINTS.REFLECT, { 
            message: inputText, 
            pastEntries: last5JournalEntries,
            conversationContext: conversationContext,
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
        });
        aiResponse = response.data;
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse.question,
        sender: 'ai',
        timestamp: formatTimestamp(),
        suggestions: aiResponse.suggestions || [],
        followUps: aiResponse.followUps || [],
        strategy: aiResponse.strategy || 'general',
        analysis: aiResponse.analysis || {}
      };

      setMessages(prev => [...prev, aiMessage]);

      // Add AI message to conversation persistence if available
      if (conversationPersistence) {
        await conversationPersistence.addMessageToConversation(aiMessage);
      }

      // Show success feedback
      if (onMessageSent) {
        onMessageSent();
      }

      // Reset transcript after successful send
      if (resetTranscript) {
        resetTranscript();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      handleError?.(error);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: formatTimestamp(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [
    inputText, isChatLoading, setMessages, setInputText, setIsChatLoading,
    formatTimestamp, last5JournalEntries, isPremium, user, handleError,
    onMessageSent, resetTranscript, conversationPersistence
  ]);

  // Load messages from conversation
  const loadConversationMessages = useCallback(async (conversationId) => {
    if (!conversationPersistence) return;

    const conversationMessages = conversationPersistence.getConversationMessages(conversationId);
    setMessages(conversationMessages);
  }, [conversationPersistence, setMessages]);

  // Create new conversation
  const createNewConversation = useCallback(async (title = null) => {
    if (!conversationPersistence) return null;

    // Immediate UI feedback - clear messages first
    setMessages([]);
    
    const conversationId = await conversationPersistence.createNewConversation(title);
    return conversationId;
  }, [conversationPersistence, setMessages]);

  // Switch to conversation
  const switchToConversation = useCallback(async (conversationId) => {
    if (!conversationPersistence) return;

    // Immediate UI feedback - clear messages first
    setMessages([]);
    
    conversationPersistence.switchToConversation(conversationId);
    await loadConversationMessages(conversationId);
  }, [conversationPersistence, loadConversationMessages, setMessages]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationPersistence) return;

    await conversationPersistence.deleteConversation(conversationId);
    
    // If we deleted the current conversation, load the new current one
    if (conversationPersistence.currentConversationId) {
      await loadConversationMessages(conversationPersistence.currentConversationId);
    } else {
      setMessages([]); // No conversations left
    }
  }, [conversationPersistence, loadConversationMessages, setMessages]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('reflectWithin_messages');
  }, [setMessages]);

  const handleSaveChat = useCallback((onSuccess) => {
    // This function is deprecated - use DataManagementModal instead
    console.warn('handleSaveChat is deprecated. Use DataManagementModal for chat export.');
    if (onSuccess) {
      onSuccess();
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    handleSendMessage,
    handleClearChat,
    handleSaveChat,
    handleKeyDown,
    loadConversationMessages,
    createNewConversation,
    switchToConversation,
    deleteConversation
  };
}; 