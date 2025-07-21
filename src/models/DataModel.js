/**
 * Unified Data Model for ReflectWithin
 * Consolidates all user data into a structured schema with proper relationships
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

/**
 * User Profile & Preferences
 * @typedef {Object} UserProfile
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {Date} createdAt - Account creation date
 * @property {Date} lastLogin - Last login date
 * @property {Object} preferences - User preferences
 * @property {'light'|'dark'|'auto'} preferences.theme - UI theme
 * @property {boolean} preferences.notifications - Notification settings
 * @property {'daily'|'weekly'|'inspired'} preferences.journalingFrequency - Journaling frequency
 * @property {string[]} preferences.reminders - Reminder settings
 * @property {string[]} preferences.aiFeatures - AI feature preferences
 * @property {Object} fitnessProfile - Fitness profile data
 * @property {'beginner'|'intermediate'|'advanced'} fitnessProfile.level - Fitness level
 * @property {string[]} fitnessProfile.primaryActivities - Primary activities
 * @property {string|null} fitnessProfile.activityLevel - Activity level
 * @property {string|null} fitnessProfile.experienceLevel - Experience level
 * @property {boolean} fitnessProfile.collected - Whether profile is collected
 */
export const UserProfile = {
  id: 'string',
  email: 'string',
  name: 'string',
  createdAt: 'date',
  lastLogin: 'date',
  preferences: {
    theme: 'light|dark|auto',
    notifications: 'boolean',
    journalingFrequency: 'daily|weekly|inspired',
    reminders: 'string[]',
    aiFeatures: 'string[]'
  },
  fitnessProfile: {
    level: 'beginner|intermediate|advanced',
    primaryActivities: 'string[]',
    activityLevel: 'string|null',
    experienceLevel: 'string|null',
    collected: 'boolean'
  }
};

/**
 * Goals & Focus Areas
 * @typedef {Object} UserGoals
 * @property {string} id - Goals ID
 * @property {string} userId - User ID
 * @property {string[]} categories - Focus area categories
 * @property {Object} metrics - Selected metrics by category
 * @property {string[]} metrics.physical - Physical health metrics
 * @property {string[]} metrics.mental - Mental wellness metrics
 * @property {string[]} metrics.growth - Personal growth metrics
 * @property {string[]} metrics.lifestyle - Lifestyle metrics
 * @property {Object[]} personalGoals - Personal goal objects
 * @property {Object} preferences - Goal preferences
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */
export const UserGoals = {
  id: 'string',
  userId: 'string',
  categories: 'string[]', // ['physical', 'mental', 'growth', 'lifestyle']
  metrics: {
    physical: 'string[]', // ['weight', 'workouts', 'sleep', 'nutrition']
    mental: 'string[]',   // ['mood', 'stress', 'energy', 'meditation']
    growth: 'string[]',   // ['goals', 'habits', 'learning', 'productivity']
    lifestyle: 'string[]' // ['routine', 'social', 'creative', 'balance']
  },
  personalGoals: [{
    id: 'string',
    title: 'string',
    description: 'string',
    category: 'string',
    target: 'number',
    unit: 'string',
    deadline: 'date',
    status: 'active|completed|paused',
    progress: 'number',
    createdAt: 'date',
    updatedAt: 'date'
  }],
  preferences: {
    journalingGoal: 'string',
    reminders: 'string[]',
    aiFeatures: 'string[]'
  },
  createdAt: 'date',
  updatedAt: 'date'
};

/**
 * Journal Entries
 * @typedef {Object} JournalEntry
 * @property {string} id - Entry ID
 * @property {string} userId - User ID
 * @property {Date} date - Entry date
 * @property {string} content - Entry content
 * @property {string[]} topics - Entry topics
 * @property {string[]} tags - Entry tags
 * @property {number|null} mood - Mood rating (1-10)
 * @property {number|null} energy - Energy rating (1-10)
 * @property {string|null} template - Template used
 * @property {Object[]} attachments - File attachments
 * @property {number} wordCount - Word count
 * @property {boolean} aiGenerated - Whether AI generated
 * @property {string} aiQuestion - AI question
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */
export const JournalEntry = {
  id: 'string',
  userId: 'string',
  date: 'date',
  content: 'string',
  topics: 'string[]',
  tags: 'string[]',
  mood: 'number|null', // 1-10 scale
  energy: 'number|null', // 1-10 scale
  template: 'string|null',
  attachments: [{
    type: 'image|audio|file',
    url: 'string',
    name: 'string',
    size: 'number'
  }],
  wordCount: 'number',
  aiGenerated: 'boolean',
  aiQuestion: 'string',
  createdAt: 'date',
  updatedAt: 'date'
};

/**
 * Tracking Data (Metrics)
 * @typedef {Object} TrackingData
 * @property {string} id - Tracking ID
 * @property {string} userId - User ID
 * @property {Date} date - Tracking date
 * @property {Object} metrics - Metric values by category
 * @property {Object} metrics.physical - Physical metrics
 * @property {Object} metrics.mental - Mental metrics
 * @property {Object} metrics.growth - Growth metrics
 * @property {Object} metrics.lifestyle - Lifestyle metrics
 * @property {string} notes - Additional notes
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */
export const TrackingData = {
  id: 'string',
  userId: 'string',
  date: 'date',
  metrics: {
    physical: {
      weight: 'number|null',
      workouts: 'number|null',
      sleep: 'number|null',
      nutrition: 'number|null'
    },
    mental: {
      mood: 'number|null',
      stress: 'number|null',
      energy: 'number|null',
      meditation: 'number|null'
    },
    growth: {
      goals: 'number|null',
      habits: 'number|null',
      learning: 'number|null',
      productivity: 'number|null'
    },
    lifestyle: {
      routine: 'number|null',
      social: 'number|null',
      creative: 'number|null',
      balance: 'number|null'
    }
  },
  notes: 'string',
  createdAt: 'date',
  updatedAt: 'date'
};

/**
 * Chat Messages
 * @typedef {Object} ChatMessage
 * @property {string} id - Message ID
 * @property {string} userId - User ID
 * @property {'user'|'assistant'} role - Message role
 * @property {string} content - Message content
 * @property {Date} timestamp - Message timestamp
 * @property {Object} metadata - Message metadata
 * @property {boolean} metadata.isJournalEntry - Whether message became journal entry
 * @property {string|null} metadata.relatedEntryId - Related journal entry ID
 * @property {string[]} metadata.topics - Message topics
 * @property {number|null} metadata.mood - Mood rating
 * @property {number|null} metadata.energy - Energy rating
 */
export const ChatMessage = {
  id: 'string',
  userId: 'string',
  role: 'user|assistant',
  content: 'string',
  timestamp: 'date',
  metadata: {
    isJournalEntry: 'boolean',
    relatedEntryId: 'string|null',
    topics: 'string[]',
    mood: 'number|null',
    energy: 'number|null'
  }
};

/**
 * Conversations
 * @typedef {Object} Conversation
 * @property {string} id - Conversation ID
 * @property {string} title - Conversation title
 * @property {Date} startDate - Conversation start date
 * @property {Date} lastActive - Last activity date
 * @property {ChatMessage[]} messages - Conversation messages
 * @property {Object} metadata - Conversation metadata
 * @property {string[]} metadata.topics - Conversation topics
 * @property {number|null} metadata.mood - Overall conversation mood
 * @property {string[]} metadata.goals - Goals mentioned in conversation
 * @property {Object} metadata.insights - Conversation insights
 * @property {string|null} metadata.insights.moodTrend - Mood trend analysis
 * @property {number|null} metadata.insights.consistencyScore - Consistency score
 * @property {number|null} metadata.insights.goalProgress - Goal progress
 */
export const Conversation = {
  id: 'string',
  title: 'string',
  startDate: 'date',
  lastActive: 'date',
  messages: 'ChatMessage[]',
  metadata: {
    topics: 'string[]',
    mood: 'number|null',
    goals: 'string[]',
    insights: {
      moodTrend: 'string|null',
      consistencyScore: 'number|null',
      goalProgress: 'number|null'
    }
  }
};

/**
 * Analytics
 * @typedef {Object} Analytics
 * @property {string} id - Analytics ID
 * @property {string} userId - User ID
 * @property {Date} date - Analytics date
 * @property {string} type - Analytics type
 * @property {Object} data - Analytics data
 * @property {Object} insights - Generated insights
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */
export const Analytics = {
  id: 'string',
  userId: 'string',
  date: 'date',
  type: 'string',
  data: 'object',
  insights: 'object',
  createdAt: 'date',
  updatedAt: 'date'
};

/**
 * User Data Container
 * Main container that holds all user data with proper relationships
 * @typedef {Object} UserDataContainer
 * @property {UserProfile} profile - User profile
 * @property {UserGoals} goals - User goals
 * @property {JournalEntry[]} journalEntries - Journal entries
 * @property {TrackingData[]} trackingData - Tracking data
 * @property {ChatMessage[]} chatMessages - Chat messages
 * @property {Conversation[]} conversations - Conversations
 * @property {Analytics[]} analytics - Analytics data
 * @property {Object} metadata - Container metadata
 * @property {string} metadata.version - Data version
 * @property {Date} metadata.lastSync - Last sync date
 * @property {number} metadata.dataSize - Data size in bytes
 * @property {Date|null} metadata.backupDate - Backup date
 */
export const UserDataContainer = {
  profile: UserProfile,
  goals: UserGoals,
  journalEntries: 'JournalEntry[]',
  trackingData: 'TrackingData[]',
  chatMessages: 'ChatMessage[]',
  conversations: 'Conversation[]',
  analytics: 'Analytics[]',
  metadata: {
    version: 'string',
    lastSync: 'date',
    dataSize: 'number',
    backupDate: 'date|null'
  }
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ValidationSchemas = {
  // Mood validation (1-10 scale)
  mood: (value) => {
    const num = Number(value);
    return num >= 1 && num <= 10 && Number.isInteger(num);
  },

  // Energy validation (1-10 scale)
  energy: (value) => {
    const num = Number(value);
    return num >= 1 && num <= 10 && Number.isInteger(num);
  },

  // Date validation
  date: (value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  // Required field validation
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  // Array validation
  array: (value) => {
    return Array.isArray(value);
  },

  // Object validation
  object: (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a new user data container
 * @param {string} userId - User ID
 * @param {Object} userProfile - User profile data
 * @returns {UserDataContainer} New data container
 */
export const createUserDataContainer = (userId, userProfile) => {
  return {
    profile: {
      ...userProfile,
      id: userId,
      createdAt: new Date(),
      lastLogin: new Date()
    },
    goals: {
      id: `goals_${userId}`,
      userId,
      categories: [],
      metrics: {},
      personalGoals: [],
      preferences: {
        journalingGoal: 'inspired',
        reminders: ['daily'],
        aiFeatures: ['insights', 'questions']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    journalEntries: [],
    trackingData: [],
    chatMessages: [],
    conversations: [],
    analytics: [],
    metadata: {
      version: '2.0.0',
      lastSync: new Date(),
      dataSize: 0,
      backupDate: null
    }
  };
};

/**
 * Validate data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Schema to validate against
 * @returns {string[]} Array of validation errors
 */
export const validateData = (data, schema) => {
  const errors = [];
  
  // Recursive validation function
  const validate = (obj, schema, path = '') => {
    for (const [key, expectedType] of Object.entries(schema)) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (expectedType === String) {
        if (typeof value !== 'string') {
          errors.push(`${currentPath} must be a string`);
        }
      } else if (expectedType === Number) {
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${currentPath} must be a number`);
        }
      } else if (expectedType === Boolean) {
        if (typeof value !== 'boolean') {
          errors.push(`${currentPath} must be a boolean`);
        }
      } else if (expectedType === Date) {
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          errors.push(`${currentPath} must be a valid date`);
        }
      } else if (Array.isArray(expectedType)) {
        if (!Array.isArray(value)) {
          errors.push(`${currentPath} must be an array`);
        } else {
          value.forEach((item, index) => {
            validate(item, expectedType[0], `${currentPath}[${index}]`);
          });
        }
      } else if (typeof expectedType === 'object') {
        if (typeof value !== 'object' || value === null) {
          errors.push(`${currentPath} must be an object`);
        } else {
          validate(value, expectedType, currentPath);
        }
      }
    }
  };
  
  validate(data, schema);
  return errors;
};

/**
 * Calculate data size in bytes
 * @param {Object} data - Data to calculate size for
 * @returns {number} Size in bytes
 */
export const calculateDataSize = (data) => {
  return new Blob([JSON.stringify(data)]).size;
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  UserProfile,
  UserGoals,
  JournalEntry,
  TrackingData,
  ChatMessage,
  Conversation,
  Analytics,
  UserDataContainer,
  ValidationSchemas,
  createUserDataContainer,
  validateData,
  calculateDataSize,
  generateId
}; 