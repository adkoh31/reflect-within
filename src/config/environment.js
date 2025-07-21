// Environment Configuration System
// Manages different environments with proper validation

const environments = {
  development: {
    API_URL: 'http://localhost:3001',
    SENTRY_DSN: null,
    ANALYTICS_ID: null,
    NODE_ENV: 'development',
    DEBUG: true,
    LOG_LEVEL: 'debug'
  },
  staging: {
    API_URL: process.env.VITE_STAGING_API_URL || 'https://reflect-within-staging.up.railway.app',
    SENTRY_DSN: process.env.VITE_SENTRY_DSN,
    ANALYTICS_ID: process.env.VITE_ANALYTICS_ID,
    NODE_ENV: 'staging',
    DEBUG: true,
    LOG_LEVEL: 'info'
  },
  production: {
    API_URL: process.env.VITE_PRODUCTION_API_URL || 'https://reflect-within-production.up.railway.app',
    SENTRY_DSN: process.env.VITE_SENTRY_DSN,
    ANALYTICS_ID: process.env.VITE_ANALYTICS_ID,
    NODE_ENV: 'production',
    DEBUG: false,
    LOG_LEVEL: 'warn'
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
};

// Validate environment configuration
const validateEnvironment = (config) => {
  const requiredFields = ['API_URL', 'NODE_ENV'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required environment variables:', missingFields);
    throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`);
  }
  
  // Validate API URL format
  try {
    new URL(config.API_URL);
  } catch (error) {
    console.error('❌ Invalid API_URL format:', config.API_URL);
    throw new Error('Invalid API_URL format');
  }
  
  console.log('✅ Environment configuration validated');
  return true;
};

// Get validated configuration
const config = getCurrentEnvironment();
validateEnvironment(config);

// Environment-specific utilities
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isStaging = () => config.NODE_ENV === 'staging';
export const isProduction = () => config.NODE_ENV === 'production';
export const isDebugEnabled = () => config.DEBUG;

// Logging utility
export const log = (level, message, data = {}) => {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  const currentLevel = levels[config.LOG_LEVEL] || 1;
  const messageLevel = levels[level] || 1;
  
  if (messageLevel >= currentLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data && Object.keys(data).length > 0) {
      console[level](prefix, message, data);
    } else {
      console[level](prefix, message);
    }
  }
};

// Feature flags
export const featureFlags = {
  OFFLINE_SYNC: true,
  AI_ASSISTANT: true,
  PREMIUM_FEATURES: true,
  ANALYTICS: isProduction() || isStaging(),
  ERROR_TRACKING: isProduction() || isStaging(),
  PERFORMANCE_MONITORING: isProduction()
};

// Export configuration
export default config;

// Export individual values for convenience
export const {
  API_URL,
  SENTRY_DSN,
  ANALYTICS_ID,
  NODE_ENV,
  DEBUG,
  LOG_LEVEL
} = config; 