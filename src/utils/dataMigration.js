/**
 * Data Migration Utility for ReflectWithin
 * Transforms existing localStorage data into the new unified data model
 */

import { 
  createUserDataContainer, 
  generateId, 
  calculateDataSize,
  // ValidationSchemas - removed unused import
} from '../models/DataModel';

// ============================================================================
// MIGRATION VERSIONS
// ============================================================================

export const MIGRATION_VERSIONS = {
  V1_TO_V2: '1.0.0_to_2.0.0',
  V2_TO_V2_1: '2.0.0_to_2.1.0'
};

// ============================================================================
// DATA EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract user profile from existing data
 */
const extractUserProfile = (user, existingData) => {
  const profile = {
    id: user?.id || user?.email,
    email: user?.email || '',
    name: user?.name || '',
    createdAt: user?.createdAt ? new Date(user.createdAt) : new Date(),
    lastLogin: new Date(),
    preferences: {
      theme: localStorage.getItem('reflectWithin_theme') || 'auto',
      notifications: true,
      journalingFrequency: 'inspired',
      reminders: ['daily'],
      aiFeatures: ['insights', 'questions']
    },
    fitnessProfile: {
      level: user?.fitnessLevel || 'beginner',
      primaryActivities: user?.primaryActivities || [],
      activityLevel: user?.activityLevel || null,
      experienceLevel: user?.experienceLevel || null,
      collected: user?.fitnessProfileCollected || false
    }
  };

  // Extract journaling preferences from onboarding data
  const onboardingData = existingData.onboardingData;
  if (onboardingData?.goals?.preferences) {
    profile.preferences.journalingFrequency = onboardingData.goals.preferences.journalingGoal || 'inspired';
    profile.preferences.reminders = onboardingData.goals.preferences.reminders || ['daily'];
  }

  return profile;
};

/**
 * Extract goals from existing data
 */
const extractGoals = (user, existingData) => {
  const userId = user?.id || user?.email;
  
  // Try to get goals from multiple sources
  let goalsData = null;
  
  // Check if goals exist in onboarding data
  if (existingData.onboardingData?.goals) {
    goalsData = existingData.onboardingData.goals;
  }
  
  // Check if goals exist in separate localStorage key
  const userGoalsKey = `reflectWithin_user_goals_${userId}`;
  const savedGoals = localStorage.getItem(userGoalsKey);
  if (savedGoals && !goalsData) {
    try {
      goalsData = JSON.parse(savedGoals);
    } catch (error) {
      console.warn('Failed to parse saved goals:', error);
    }
  }

  const goals = {
    id: `goals_${userId}`,
    userId,
    categories: goalsData?.categories || [],
    metrics: goalsData?.metrics || {},
    personalGoals: goalsData?.goals || [],
    preferences: {
      journalingGoal: goalsData?.preferences?.journalingGoal || 'inspired',
      reminders: goalsData?.preferences?.reminders || ['daily'],
      aiFeatures: goalsData?.preferences?.aiFeatures || ['insights', 'questions']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return goals;
};

/**
 * Extract journal entries from existing data
 */
const extractJournalEntries = (user, existingData) => {
  const userId = user?.id || user?.email;
  const entries = [];
  
  // Get journal entries from localStorage
  const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
  if (savedEntries) {
    try {
      const parsedEntries = JSON.parse(savedEntries);
      
      Object.entries(parsedEntries).forEach(([id, entry]) => {
        const migratedEntry = {
          id: generateId(),
          userId,
          date: new Date(entry.date),
          content: entry.content || '',
          topics: entry.topics || entry.topic ? [entry.topic] : [],
          tags: entry.tags || [],
          mood: entry.mood || null,
          energy: entry.energy || null,
          template: entry.template || null,
          attachments: entry.attachments || [],
          wordCount: entry.wordCount || 0,
          aiGenerated: entry.aiGenerated || false,
          aiQuestion: entry.aiQuestion || '',
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
          updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date()
        };
        
        entries.push(migratedEntry);
      });
    } catch (error) {
      console.error('Failed to migrate journal entries:', error);
    }
  }

  return entries;
};

/**
 * Extract tracking data from existing data
 */
const extractTrackingData = (user, existingData) => {
  const userId = user?.id || user?.email;
  const trackingData = [];
  
  // Get tracking data from localStorage
  const userTrackingKey = `reflectWithin_tracking_data_${userId}`;
  const savedTracking = localStorage.getItem(userTrackingKey);
  
  if (savedTracking) {
    try {
      const parsedTracking = JSON.parse(savedTracking);
      
      Object.entries(parsedTracking).forEach(([dateKey, dayData]) => {
        const migratedTracking = {
          id: generateId(),
          userId,
          date: new Date(dateKey),
          metrics: {
            physical: {
              weight: dayData.physical?.weight || null,
              workouts: dayData.physical?.workouts || null,
              sleep: dayData.physical?.sleep || null,
              nutrition: dayData.physical?.nutrition || null
            },
            mental: {
              mood: dayData.mental?.mood || null,
              stress: dayData.mental?.stress || null,
              energy: dayData.mental?.energy || null,
              meditation: dayData.mental?.meditation || null
            },
            growth: {
              goals: dayData.growth?.goals || null,
              habits: dayData.growth?.habits || null,
              learning: dayData.growth?.learning || null,
              productivity: dayData.growth?.productivity || null
            },
            lifestyle: {
              routine: dayData.lifestyle?.routine || null,
              social: dayData.lifestyle?.social || null,
              creative: dayData.lifestyle?.creative || null,
              balance: dayData.lifestyle?.balance || null
            }
          },
          notes: dayData.notes || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        trackingData.push(migratedTracking);
      });
    } catch (error) {
      console.error('Failed to migrate tracking data:', error);
    }
  }

  return trackingData;
};

/**
 * Extract chat messages from existing data
 */
const extractChatMessages = (user, existingData) => {
  const userId = user?.id || user?.email;
  const messages = [];
  
  // Get chat messages from localStorage
  const savedMessages = localStorage.getItem('reflectWithin_messages');
  if (savedMessages) {
    try {
      const parsedMessages = JSON.parse(savedMessages);
      
      parsedMessages.forEach((message, index) => {
        const migratedMessage = {
          id: generateId(),
          userId,
          role: message.role || 'user',
          content: message.content || '',
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
          metadata: {
            isJournalEntry: message.isJournalEntry || false,
            relatedEntryId: message.relatedEntryId || null,
            topics: message.topics || [],
            mood: message.mood || null,
            energy: message.energy || null
          }
        };
        
        messages.push(migratedMessage);
      });
    } catch (error) {
      console.error('Failed to migrate chat messages:', error);
    }
  }

  return messages;
};

/**
 * Extract analytics from existing data
 */
const extractAnalytics = (user, existingData) => {
  const userId = user?.id || user?.email;
  const analytics = [];
  
  // Get insights from localStorage
  const savedInsights = localStorage.getItem('reflectWithin_insights');
  if (savedInsights) {
    try {
      const parsedInsights = JSON.parse(savedInsights);
      
      // Create analytics entry from insights
      const analyticsEntry = {
        id: generateId(),
        userId,
        type: 'weekly',
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          end: new Date()
        },
        metrics: {
          journalingConsistency: {
            entries: 0,
            streak: 0,
            goalMet: false,
            progress: 0
          },
          moodTrends: {
            average: 0,
            trend: 'stable',
            change: 0,
            goalMet: false
          },
          energyPatterns: {
            average: 0,
            workoutCorrelation: 0,
            goalMet: false
          },
          goalAlignment: {
            alignmentPercentage: 0,
            mostFocusedCategory: null,
            goalMet: false
          }
        },
        insights: parsedInsights.themes?.map(theme => ({
          type: 'suggestion',
          category: 'general',
          title: theme,
          message: `Theme: ${theme}`,
          priority: 'medium',
          icon: '📊',
          actionable: false,
          actionUrl: null
        })) || [],
        createdAt: new Date()
      };
      
      analytics.push(analyticsEntry);
    } catch (error) {
      console.error('Failed to migrate analytics:', error);
    }
  }

  return analytics;
};

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Migrate all user data to the new unified model
 */
export const migrateUserData = (user) => {
  console.log('🔄 Starting data migration for user:', user?.email);
  
  try {
    // Extract existing data
    const existingData = {
      onboardingData: null
    };
    
    // Get onboarding data
    const userOnboardingDataKey = `reflectWithin_onboarding_data_${user?.id || user?.email}`;
    const savedOnboardingData = localStorage.getItem(userOnboardingDataKey);
    if (savedOnboardingData) {
      try {
        existingData.onboardingData = JSON.parse(savedOnboardingData);
      } catch (error) {
        console.warn('Failed to parse onboarding data:', error);
      }
    }

    // Create new data container
    const userProfile = extractUserProfile(user, existingData);
    const newDataContainer = createUserDataContainer(user?.id || user?.email, userProfile);
    
    // Migrate each data type
    newDataContainer.goals = extractGoals(user, existingData);
    newDataContainer.journalEntries = extractJournalEntries(user, existingData);
    newDataContainer.trackingData = extractTrackingData(user, existingData);
    newDataContainer.chatMessages = extractChatMessages(user, existingData);
    newDataContainer.analytics = extractAnalytics(user, existingData);
    
    // Update metadata
    newDataContainer.metadata.dataSize = calculateDataSize(newDataContainer);
    newDataContainer.metadata.lastSync = new Date();
    newDataContainer.metadata.backupDate = new Date();
    
    console.log('✅ Data migration completed successfully');
    console.log('📊 Migration summary:', {
      journalEntries: newDataContainer.journalEntries.length,
      chatMessages: newDataContainer.chatMessages.length,
      trackingData: newDataContainer.trackingData.length,
      analytics: newDataContainer.analytics.length,
      dataSize: newDataContainer.metadata.dataSize
    });
    
    return {
      success: true,
      data: newDataContainer,
      summary: {
        journalEntries: newDataContainer.journalEntries.length,
        chatMessages: newDataContainer.chatMessages.length,
        trackingData: newDataContainer.trackingData.length,
        analytics: newDataContainer.analytics.length,
        dataSize: newDataContainer.metadata.dataSize
      }
    };
    
  } catch (error) {
    console.error('❌ Data migration failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// ============================================================================
// BACKUP AND RESTORE
// ============================================================================

/**
 * Create backup of migrated data
 */
export const createMigratedBackup = (userDataContainer) => {
  try {
    const backup = {
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      app: 'ReflectWithin',
      migrationVersion: MIGRATION_VERSIONS.V1_TO_V2,
      data: userDataContainer
    };

    return { success: true, backup };
  } catch (error) {
    console.error('Failed to create migrated backup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save migrated data to localStorage
 */
export const saveMigratedData = (userDataContainer, user) => {
  try {
    const userId = user?.id || user?.email;
    const containerKey = `reflectWithin_user_data_${userId}`;
    
    // Save the complete data container
    localStorage.setItem(containerKey, JSON.stringify(userDataContainer));
    
    // Mark migration as completed
    localStorage.setItem(`reflectWithin_migration_completed_${userId}`, 'true');
    localStorage.setItem(`reflectWithin_migration_date_${userId}`, new Date().toISOString());
    
    console.log('✅ Migrated data saved to localStorage');
    return { success: true };
  } catch (error) {
    console.error('Failed to save migrated data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if migration is needed
 */
export const isMigrationNeeded = (user) => {
  const userId = user?.id || user?.email;
  const migrationCompleted = localStorage.getItem(`reflectWithin_migration_completed_${userId}`);
  return !migrationCompleted;
};

/**
 * Get migration status
 */
export const getMigrationStatus = (user) => {
  const userId = user?.id || user?.email;
  const migrationCompleted = localStorage.getItem(`reflectWithin_migration_completed_${userId}`);
  const migrationDate = localStorage.getItem(`reflectWithin_migration_date_${userId}`);
  
  return {
    completed: !!migrationCompleted,
    date: migrationDate ? new Date(migrationDate) : null,
    needed: !migrationCompleted
  };
};

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Clean up old localStorage keys after successful migration
 */
export const cleanupOldData = (user, options = {}) => {
  const { 
    keepBackup = true, 
    backupPrefix = 'reflectWithin_backup_' 
  } = options;
  
  const userId = user?.id || user?.email;
  const keysToRemove = [
    'reflectWithin_journal_entries',
    'reflectWithin_messages',
    'reflectWithin_insights',
    `reflectWithin_user_goals_${userId}`,
    `reflectWithin_tracking_data_${userId}`,
    `reflectWithin_onboarding_data_${userId}`,
    'reflectWithin_last_backup'
  ];
  
  const removed = [];
  const errors = [];
  
  keysToRemove.forEach(key => {
    try {
      if (keepBackup) {
        // Create backup before removing
        const data = localStorage.getItem(key);
        if (data) {
          const backupKey = `${backupPrefix}${key}_${Date.now()}`;
          localStorage.setItem(backupKey, data);
        }
      }
      
      localStorage.removeItem(key);
      removed.push(key);
    } catch (error) {
      errors.push({ key, error: error.message });
    }
  });
  
  return {
    success: errors.length === 0,
    removed,
    errors,
    backupCreated: keepBackup
  };
};

const dataMigrationUtils = {
  migrateUserData,
  createMigratedBackup,
  saveMigratedData,
  isMigrationNeeded,
  getMigrationStatus,
  cleanupOldData,
  MIGRATION_VERSIONS
};

export default dataMigrationUtils; 