import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export const reflectWithAI = async (message, pastEntries = []) => {
  const response = await axios.post(API_ENDPOINTS.REFLECT, { message, pastEntries });
  return response.data;
};

export const saveReflection = async (userInput, aiQuestion) => {
  const response = await axios.post(API_ENDPOINTS.SAVE_REFLECTION, { userInput, aiQuestion });
  return response.data;
};

export const getInsights = async (reflections) => {
  const response = await axios.post(API_ENDPOINTS.INSIGHTS, { reflections });
  return response.data;
}; 