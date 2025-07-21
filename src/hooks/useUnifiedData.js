/**
 * Unified Data Management Hook
 * Provides a single interface for all user data operations using the new data model
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  migrateUserData, 
  saveMigratedData, 
  isMigrationNeeded, 
  getMigrationStatus,
  cleanupOldData 
} from '../utils/dataMigration';
import { 
  createUserDataContainer, 
  generateId, 
  calculateDataSize
} from '../models/DataModel';
import { safeToISOString } from '../utils/dateUtils';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Utility function to serialize Date objects for React
const serializeForReact = (data) => {
  if (!data) return data;
  
  if (data instanceof Date) {
    return safeToISOString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeForReact);
  }
  
  if (typeof data === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeForReact(value);
    }
    return serialized;
  }
  
  return data;
};

export const useUnifiedData = (user, isPremium = false) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Performance monitoring
  const saveCount = useRef(0);
  const lastSaveTime = useRef(0);

  // ============================================================================
  // INITIALIZATION & MIGRATION
  // ============================================================================

  // Check and perform migration if needed
  const initializeData = useCallback(async () => {
    if (!user) {
      setUserData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if migration is needed
      const needsMigration = isMigrationNeeded(user);
      const status = getMigrationStatus(user);

      setMigrationStatus(status);

      if (needsMigration) {
        console.log('🔄 Migration needed, starting data migration...');
        
        // Perform migration
        const migrationResult = migrateUserData(user);
        
        if (migrationResult.success) {
          // Save migrated data
          const saveResult = saveMigratedData(migrationResult.data, user);
          
          if (saveResult.success) {
            setUserData(migrationResult.data);
            // Update migration status after successful migration
            const updatedStatus = getMigrationStatus(user);
            setMigrationStatus(updatedStatus);
            console.log('✅ Migration completed successfully');
          } else {
            throw new Error(`Failed to save migrated data: ${saveResult.error}`);
          }
        } else {
          throw new Error(`Migration failed: ${migrationResult.error}`);
        }
      } else {
        // Load existing migrated data
        const userId = user.id || user.email;
        const containerKey = `reflectWithin_user_data_${userId}`;
        const savedData = localStorage.getItem(containerKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setUserData(parsedData);
          console.log('✅ Loaded existing migrated data');
        } else {
          // Create new data container for new user
          const newDataContainer = createUserDataContainer(userId, {
            id: userId,
            email: user.email,
            name: user.name
          });
          
          setUserData(newDataContainer);
          saveMigratedData(newDataContainer, user);
          console.log('✅ Created new data container for user');
        }
      }
    } catch (err) {
      console.error('❌ Data initialization failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]); // Use stable user identifiers instead of entire user object

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // DATA ACCESS METHODS
  // ============================================================================

  // Get user profile
  const getProfile = useCallback(() => {
    return serializeForReact(userData?.profile || null);
  }, [userData]);

  // Get user goals
  const getGoals = useCallback(() => {
    return serializeForReact(userData?.goals || null);
  }, [userData]);

  // Get journal entries
  const getJournalEntries = useCallback(() => {
    return serializeForReact(userData?.journalEntries || []);
  }, [userData]);

  // Get tracking data
  const getTrackingData = useCallback(() => {
    return serializeForReact(userData?.trackingData || []);
  }, [userData]);

  // Get chat messages
  const getChatMessages = useCallback(() => {
    return serializeForReact(userData?.chatMessages || []);
  }, [userData]);

  // Get analytics
  const getAnalytics = useCallback(() => {
    return serializeForReact(userData?.analytics || []);
  }, [userData]);

  // ============================================================================
  // DATA UPDATE METHODS
  // ============================================================================

  // Update user profile
  const updateProfile = useCallback((updates) => {
    setUserData(prev => {
      if (!prev) return prev;
      
      const updated = {
        ...prev,
        ...updates,
        profile: {
          ...prev.profile,
          ...(updates.profile || {}),
          lastLogin: new Date()
        }
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });
  }, []); // Remove userData dependency

  // Update goals
  const updateGoals = useCallback((updates) => {
    setUserData(prev => {
      if (!prev) return prev;
      
      const updated = {
        ...prev,
        goals: {
          ...prev.goals,
          ...updates,
          updatedAt: new Date()
        }
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });
  }, []); // Remove userData dependency

  // Add journal entry
  const addJournalEntry = useCallback((entryData) => {
    const userId = user?.id || user?.email;
    if (!userId) return null;

    const newEntry = {
      id: generateId(),
      userId: userId,
      date: new Date(entryData.date || Date.now()),
      content: entryData.content || '',
      topics: entryData.topics || [],
      tags: entryData.tags || [],
      mood: entryData.mood || null,
      energy: entryData.energy || null,
      template: entryData.template || null,
      attachments: entryData.attachments || [],
      wordCount: entryData.wordCount || 0,
      aiGenerated: entryData.aiGenerated || false,
      aiQuestion: entryData.aiQuestion || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setUserData(prev => {
      if (!prev) return prev;
      
      const updated = {
        ...prev,
        journalEntries: [...prev.journalEntries, newEntry]
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });

    return newEntry;
  }, [user?.id, user?.email]); // Use stable user identifiers

  // Update journal entry
  const updateJournalEntry = useCallback((entryId, updates) => {
    if (!userData) return;

    setUserData(prev => {
      const updated = {
        ...prev,
        journalEntries: prev.journalEntries.map(entry =>
          entry.id === entryId
            ? { ...entry, ...updates, updatedAt: new Date() }
            : entry
        )
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });
  }, [userData]);

  // Delete journal entry
  const deleteJournalEntry = useCallback((entryId) => {
    if (!userData) return;

    setUserData(prev => {
      const updated = {
        ...prev,
        journalEntries: prev.journalEntries.filter(entry => entry.id !== entryId)
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });
  }, [userData]);

  // Add tracking data
  const addTrackingData = useCallback((trackingData) => {
    if (!userData) return;

    const newTracking = {
      id: generateId(),
      userId: user.id || user.email,
      date: new Date(trackingData.date || Date.now()),
      metrics: trackingData.metrics || {},
      notes: trackingData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setUserData(prev => {
      const updated = {
        ...prev,
        trackingData: [...prev.trackingData, newTracking]
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });

    return newTracking;
  }, [userData, user]);

  // Add chat message
  const addChatMessage = useCallback((messageData) => {
    if (!userData) return;

    const newMessage = {
      id: generateId(),
      userId: user.id || user.email,
      role: messageData.role || 'user',
      content: messageData.content || '',
      timestamp: new Date(messageData.timestamp || Date.now()),
      metadata: {
        isJournalEntry: messageData.isJournalEntry || false,
        relatedEntryId: messageData.relatedEntryId || null,
        topics: messageData.topics || [],
        mood: messageData.mood || null,
        energy: messageData.energy || null
      }
    };

    setUserData(prev => {
      const updated = {
        ...prev,
        chatMessages: [...prev.chatMessages, newMessage]
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });

    return newMessage;
  }, [userData, user]);

  // Add analytics
  const addAnalytics = useCallback((analyticsData) => {
    if (!userData) return;

    const newAnalytics = {
      id: generateId(),
      userId: user.id || user.email,
      type: analyticsData.type || 'weekly',
      period: {
        start: new Date(analyticsData.period?.start || Date.now()),
        end: new Date(analyticsData.period?.end || Date.now())
      },
      metrics: analyticsData.metrics || {},
      insights: analyticsData.insights || [],
      createdAt: new Date()
    };

    setUserData(prev => {
      const updated = {
        ...prev,
        analytics: [...prev.analytics, newAnalytics]
      };
      
      // Update metadata
      updated.metadata.lastSync = new Date();
      updated.metadata.dataSize = calculateDataSize(updated);
      
      return updated;
    });

    return newAnalytics;
  }, [userData, user]);

  // ============================================================================
  // DATA PERSISTENCE
  // ============================================================================

  // Save data to localStorage with performance monitoring
  const saveData = useCallback(() => {
    if (!userData || !user) return;

    const startTime = performance.now();
    
    try {
      const userId = user.id || user.email;
      const containerKey = `reflectWithin_user_data_${userId}`;
      
      // Check if data has actually changed to avoid unnecessary saves
      const existingData = localStorage.getItem(containerKey);
      const newDataString = JSON.stringify(userData);
      
      if (existingData === newDataString) {
        return { success: true, skipped: true };
      }
      
      localStorage.setItem(containerKey, newDataString);
      
      const saveTime = performance.now() - startTime;
      saveCount.current += 1;
      lastSaveTime.current = Date.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Data saved to localStorage (${saveTime.toFixed(2)}ms, save #${saveCount.current})`);
      }
      
      return { success: true, saveTime };
    } catch (error) {
      const saveTime = performance.now() - startTime;
      console.error(`Failed to save data after ${saveTime.toFixed(2)}ms:`, error);
      return { success: false, error: error.message, saveTime };
    }
  }, [userData, user]);

  // Create debounced save function
  const debouncedSave = useMemo(
    () => debounce(saveData, 1000), // 1 second debounce
    [saveData]
  );

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (userData && !isLoading) {
      debouncedSave();
    }
  }, [userData, debouncedSave, isLoading]);

  // ============================================================================
  // DATA QUERIES & FILTERS
  // ============================================================================

  // Get journal entries by date range
  const getJournalEntriesByDateRange = useCallback((startDate, endDate) => {
    const entries = getJournalEntries();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [getJournalEntries]);

  // Get tracking data by date range
  const getTrackingDataByDateRange = useCallback((startDate, endDate) => {
    const tracking = getTrackingData();
    return tracking.filter(data => {
      const dataDate = new Date(data.date);
      return dataDate >= startDate && dataDate <= endDate;
    });
  }, [getTrackingData]);

  // Get recent journal entries
  const getRecentJournalEntries = useCallback((limit = 10) => {
    const entries = getJournalEntries();
    return entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [getJournalEntries]);

  // Get recent chat messages
  const getRecentChatMessages = useCallback((limit = 50) => {
    const messages = getChatMessages();
    return messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [getChatMessages]);

  // ============================================================================
  // DATA STATISTICS
  // ============================================================================

  // Get data statistics
  const getDataStats = useMemo(() => {
    if (!userData) return null;

    return serializeForReact({
      journalEntries: userData.journalEntries.length,
      chatMessages: userData.chatMessages.length,
      trackingData: userData.trackingData.length,
      analytics: userData.analytics.length,
      dataSize: userData.metadata.dataSize,
      lastSync: userData.metadata.lastSync,
      version: userData.metadata.version,
      saveCount: saveCount.current,
      lastSaveTime: lastSaveTime.current
    });
  }, [userData]);

  // ============================================================================
  // CLEANUP & MAINTENANCE
  // ============================================================================

  // Clean up old data
  const cleanupData = useCallback((options = {}) => {
    if (!user) return;

    try {
      const result = cleanupOldData(user, options);
      console.log('🧹 Data cleanup completed:', result);
      return result;
    } catch (error) {
      console.error('Failed to cleanup data:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Export data
  const exportData = useCallback(() => {
    if (!userData) return null;

    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      user: userData.profile,
      data: userData,
      stats: getDataStats
    };
  }, [userData, getDataStats]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    userData,
    isLoading,
    migrationStatus,
    error,
    
    // Data access
    getProfile,
    getGoals,
    getJournalEntries,
    getTrackingData,
    getChatMessages,
    getAnalytics,
    
    // Data updates
    updateProfile,
    updateGoals,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addTrackingData,
    addChatMessage,
    addAnalytics,
    
    // Data queries
    getJournalEntriesByDateRange,
    getTrackingDataByDateRange,
    getRecentJournalEntries,
    getRecentChatMessages,
    
    // Data management
    saveData,
    debouncedSave,
    cleanupData,
    exportData,
    getDataStats
  };
}; 