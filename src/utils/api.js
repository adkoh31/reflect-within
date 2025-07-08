import axios from 'axios';

// API call to get reflection question
export const getReflectionQuestion = async (message, pastEntries) => {
  const response = await axios.post('/api/reflect', { message, pastEntries });
  return response.data.question;
};

// API call to save reflection (premium)
export const saveReflection = async (userInput, aiQuestion) => {
  const response = await axios.post('/api/save-reflection', { userInput, aiQuestion });
  return response.data;
};

// API call to get insights
export const getInsights = async (reflections) => {
  const response = await axios.post('/api/insights', { reflections });
  return response.data;
}; 