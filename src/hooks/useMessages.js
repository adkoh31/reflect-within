import { useCallback } from 'react';
import axios from 'axios';
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
        return await axios.post('/api/reflect', { 
          message: inputText, 
          pastEntries: last5JournalEntries 
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
          await axios.post('/api/save-reflection', {
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
    try {
      const chatText = messages.map(msg => 
        `[${msg.timestamp}] ${msg.sender === 'user' ? 'You' : 'ReflectWithin'}: ${msg.text}`
      ).join('\n\n');
      
      const blob = new Blob([chatText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflectwithin_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success feedback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  }, [messages]);

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