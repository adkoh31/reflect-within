import { useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { retryWithBackoff } from '../utils/errorHandler';

export const useInsights = (
  messages,
  isGeneratingInsights,
  setIsGeneratingInsights,
  setInsights,
  handleError
) => {
  const generateInsights = useCallback(async () => {
    if (messages.length === 0) return;

    setIsGeneratingInsights(true);
    try {
      const reflections = [];
      for (let i = 0; i < messages.length; i += 2) {
        if (messages[i] && messages[i + 1] && 
            messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
          reflections.push({
            userInput: messages[i].text,
            aiQuestion: messages[i + 1].text
          });
        }
      }

      if (reflections.length > 0) {
        const response = await retryWithBackoff(async () => {
          return await axios.post(API_ENDPOINTS.INSIGHTS, { reflections });
        });
        setInsights(response.data);
      }
    } catch (error) {
      handleError(error, 'Failed to generate insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [messages, setIsGeneratingInsights, setInsights, handleError]);

  return {
    generateInsights
  };
}; 