// API Configuration for different environments
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_RAILWAY_URL || 'https://reflect-within-production.up.railway.app')
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const API_ENDPOINTS = {
  REFLECT: `${API_BASE_URL}/api/reflect`,
  ENHANCED_REFLECT: `${API_BASE_URL}/api/enhanced-reflect`,
  ENHANCED_REFLECT_PUBLIC: `${API_BASE_URL}/api/enhanced-reflect-public`,
  SAVE_REFLECTION: `${API_BASE_URL}/api/save-reflection`,
  INSIGHTS: `${API_BASE_URL}/api/insights`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify-token`
  },
  JOURNAL: {
    GENERATE_ENTRY: `${API_BASE_URL}/api/generate-journal-entry`
  },
  JOURNAL_ENTRIES: {
    SAVE: `${API_BASE_URL}/api/journal-entries`,
    GET_ALL: `${API_BASE_URL}/api/journal-entries`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/journal-entries/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/journal-entries/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/journal-entries/${id}`,
    STATS: `${API_BASE_URL}/api/journal-entries/stats`
  }
};

export default API_BASE_URL; 