import { useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { retryWithBackoff } from '../utils/errorHandler';

export const useMessages = (
  messages,
  setMessages,
  inputText,
  setInputText,
  isLoading,
  setIsLoading,
  isListening,
  setIsListening,
  resetTranscript,
  formatTimestamp,
  last5JournalEntries,
  isPremium,
  user,
  handleError,
  onMessageSent
) => {
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: formatTimestamp()
    };

    // Always add user message to chat first
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    if (isListening) {
      // Stop speech recognition
      setIsListening(false);
      resetTranscript();
    }

    // Only set loading for AI response, not for user message
    setIsLoading(true);

    try {
      const response = await retryWithBackoff(async () => {
        return await axios.post(API_ENDPOINTS.REFLECT, { 
          message: inputText, 
          pastEntries: last5JournalEntries,
          isPremium: isPremium
        });
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.question,
        sender: 'ai',
        timestamp: formatTimestamp()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show success feedback
      if (onMessageSent) {
        onMessageSent();
      }

      if (isPremium && user) {
        try {
          await axios.post(API_ENDPOINTS.SAVE_REFLECTION, {
            userInput: inputText,
            aiQuestion: response.data.question
          });
        } catch (error) {
          console.error('Failed to save to MongoDB:', error);
        }
      }
    } catch (error) {
      // Don't remove user message - just show error and add a fallback AI message
      console.error('AI response failed:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now, but I've saved your reflection. You can continue journaling and I'll respond when I'm back online.",
        sender: 'ai',
        timestamp: formatTimestamp()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputText, 
    setMessages, 
    setInputText, 
    isListening, 
    setIsListening, 
    resetTranscript, 
    setIsLoading, 
    formatTimestamp, 
    last5JournalEntries, 
    isPremium, 
    user, 
    onMessageSent
  ]);

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

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    handleSendMessage,
    handleClearChat,
    handleSaveChat,
    handleKeyPress
  };
}; 