import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export const useJournalEntries = (isPremium = false, user = null) => {
  const [entries, setEntries] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load entries from localStorage or database
  useEffect(() => {
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        if (isPremium && user) {
          // Load from database for premium users
          console.log('🔄 Loading journal entries from database...');
          const response = await axios.get(API_ENDPOINTS.JOURNAL_ENTRIES.GET_ALL, {
            headers: { Authorization: `Bearer ${localStorage.getItem('reflectWithin_token')}` }
          });
          
          // Convert array to object format for consistency
          const entriesObject = {};
          response.data.entries.forEach(entry => {
            entriesObject[entry.id] = {
              date: entry.date,
              content: entry.content,
              topics: entry.topics || [],
              attachments: entry.attachments || [],
              template: entry.template,
              tags: entry.tags || [],
              mood: entry.mood,
              energy: entry.energy,
              wordCount: entry.wordCount || 0,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt
            };
          });
          
          setEntries(entriesObject);
          console.log(`✅ Loaded ${Object.keys(entriesObject).length} entries from database`);
        } else {
          // Load from localStorage for free users
          console.log('🔄 Loading journal entries from localStorage...');
      const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        
        // Migrate existing entries to use topics array and add new fields
        const migratedEntries = {};
        Object.entries(parsedEntries).forEach(([id, entry]) => {
          // If entry has old 'topic' field, migrate to 'topics' array
          if (entry.topic && !entry.topics) {
            migratedEntries[id] = {
              ...entry,
              topics: [entry.topic], // Convert single topic to array
              topic: undefined, // Remove old field
              attachments: entry.attachments || [], // Add attachments field
              template: entry.template || null, // Add template field
              tags: entry.tags || [], // Add tags field
              mood: entry.mood || null, // Add mood field
              energy: entry.energy || null, // Add energy field
              wordCount: entry.wordCount || 0 // Add word count
            };
          } else if (!entry.topics) {
            // If no topics at all, initialize as empty array
            migratedEntries[id] = {
              ...entry,
              topics: [],
              attachments: entry.attachments || [],
              template: entry.template || null,
              tags: entry.tags || [],
              mood: entry.mood || null,
              energy: entry.energy || null,
              wordCount: entry.wordCount || 0
            };
          } else {
            // Already migrated or new format - ensure all new fields exist
            migratedEntries[id] = {
              ...entry,
              attachments: entry.attachments || [],
              template: entry.template || null,
              tags: entry.tags || [],
              mood: entry.mood || null,
              energy: entry.energy || null,
              wordCount: entry.wordCount || 0
            };
          }
        });
        
        setEntries(migratedEntries);
            console.log(`✅ Loaded ${Object.keys(migratedEntries).length} entries from localStorage`);
          }
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
        // Fallback to localStorage if database fails
        if (isPremium && user) {
          console.log('⚠️ Database load failed, falling back to localStorage');
          const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
          if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
          }
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadEntries();
  }, [isPremium, user]);

  // Save entries to localStorage (for free users) or database (for premium users)
  useEffect(() => {
    if (!isInitialized) return;

    try {
      if (!isPremium || !user) {
        // Save to localStorage for free users
      localStorage.setItem('reflectWithin_journal_entries', JSON.stringify(entries));
      }
      // For premium users, entries are saved to database immediately when created/updated
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  }, [entries, isPremium, user, isInitialized]);

  // Calculate word count
  const calculateWordCount = (content) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Save entry with enhanced features
  const saveEntry = useCallback(async (date, content, topics = [], options = {}) => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      let entryId = options.entryId || timestamp; // Use provided ID or timestamp
      
      // Ensure topics is always an array
      const topicsArray = Array.isArray(topics) ? topics : topics ? [topics] : [];
      
      // Calculate word count
      const wordCount = calculateWordCount(content);
      
      const newEntry = {
        date: date.toISOString().split('T')[0], // Store date for filtering
        content,
        topics: topicsArray,
        attachments: options.attachments || [],
        template: options.template || null,
        tags: options.tags || [],
        mood: options.mood || null,
        energy: options.energy || null,
        wordCount,
        createdAt: options.createdAt || timestamp,
        updatedAt: timestamp
      };

      // If updating existing entry, preserve original creation date
      if (options.entryId && entries[options.entryId]) {
        newEntry.createdAt = entries[options.entryId].createdAt;
      }
      
      if (isPremium && user) {
        // Save to database for premium users
        try {
          const token = localStorage.getItem('reflectWithin_token');
          if (options.entryId) {
            // Update existing entry
            await axios.put(API_ENDPOINTS.JOURNAL_ENTRIES.UPDATE(options.entryId), newEntry, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } else {
            // Create new entry
            const response = await axios.post(API_ENDPOINTS.JOURNAL_ENTRIES.SAVE, newEntry, {
              headers: { Authorization: `Bearer ${token}` }
            });
            entryId = response.data.entry.id; // Use the database-generated ID
          }
          
          // Update local state with database ID
          setEntries(prev => ({
            ...prev,
            [entryId]: { ...newEntry, id: entryId }
          }));
          
          console.log('✅ Journal entry saved to database');
        } catch (error) {
          console.error('Failed to save to database:', error);
          // Fallback to localStorage
          setEntries(prev => ({
            ...prev,
            [entryId]: newEntry
          }));
        }
      } else {
        // Save to localStorage for free users
      setEntries(prev => ({
        ...prev,
        [entryId]: newEntry
      }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, entryId };
    } catch (error) {
      console.error('Error saving entry:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [entries, isPremium, user]);

  // Delete entry
  const deleteEntry = useCallback(async (entryId) => {
    setIsLoading(true);
    try {
      // Clean up attachments if they exist
      const entry = entries[entryId];
      if (entry && entry.attachments) {
        entry.attachments.forEach(attachment => {
          if (attachment.url && attachment.url.startsWith('blob:')) {
            URL.revokeObjectURL(attachment.url);
          }
        });
      }

      if (isPremium && user) {
        // Delete from database for premium users
        try {
          const token = localStorage.getItem('reflectWithin_token');
          await axios.delete(API_ENDPOINTS.JOURNAL_ENTRIES.DELETE(entryId), {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Journal entry deleted from database');
        } catch (error) {
          console.error('Failed to delete from database:', error);
        }
      }

      // Remove from local state
      setEntries(prev => {
        const newEntries = { ...prev };
        delete newEntries[entryId];
        return newEntries;
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    } catch (error) {
      console.error('Error deleting entry:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [entries, isPremium, user]);

  // Get entries for a specific date
  const getEntriesForDate = useCallback((date) => {
    const dateKey = date.toISOString().split('T')[0];
    return Object.entries(entries)
      .filter(([id, entry]) => entry.date === dateKey)
      .map(([id, entry]) => ({ id, ...entry }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
  }, [entries]);

  // Get all entries sorted by date
  const getAllEntries = useMemo(() => {
    return Object.entries(entries)
      .map(([id, entry]) => ({ id, ...entry }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [entries]);

  // Get recent entries
  const getRecentEntries = useMemo(() => {
    return getAllEntries.slice(0, 10);
  }, [getAllEntries]);

  // Get entries for a specific month
  const getEntriesForMonth = useCallback((year, month) => {
    const monthEntries = {};
    Object.entries(entries).forEach(([id, entry]) => {
        const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        if (!monthEntries[entry.date]) {
          monthEntries[entry.date] = [];
        }
        monthEntries[entry.date].push({ id, ...entry });
      }
    });
    return monthEntries;
  }, [entries]);

  // Search entries
  const searchEntries = useCallback((query) => {
    const searchTerm = query.toLowerCase();
    return Object.entries(entries)
      .filter(([id, entry]) => 
        entry.content.toLowerCase().includes(searchTerm) ||
        entry.topics.some(topic => topic.toLowerCase().includes(searchTerm)) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .map(([id, entry]) => ({ id, ...entry }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [entries]);

  // Get statistics
  const getStats = useCallback(() => {
    const totalEntries = Object.keys(entries).length;
    const totalWords = Object.values(entries).reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const averageWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    
    // Get unique dates
    const uniqueDates = new Set(Object.values(entries).map(entry => entry.date)).size;
    
    // Get total attachments
    const totalAttachments = Object.values(entries).reduce((sum, entry) => 
      sum + (entry.attachments?.length || 0), 0
    );
    
    // Get unique topics
    const allTopics = Object.values(entries).flatMap(entry => entry.topics || []);
    const uniqueTopics = [...new Set(allTopics)];

    // Get mood distribution
    const moodStats = {};
    Object.values(entries).forEach(entry => {
      if (entry.mood) {
        moodStats[entry.mood] = (moodStats[entry.mood] || 0) + 1;
      }
    });

    // Get topic distribution
    const topicStats = {};
    Object.values(entries).forEach(entry => {
      entry.topics.forEach(topic => {
        topicStats[topic] = (topicStats[topic] || 0) + 1;
      });
    });

    return {
      totalEntries,
      totalWords,
      averageWords,
      uniqueDates,
      totalAttachments,
      uniqueTopics,
      moodStats,
      topicStats
    };
  }, [entries]);

  return {
    entries,
    isLoading,
    isInitialized,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getAllEntries,
    getRecentEntries,
    getEntriesForMonth,
    searchEntries,
    getStats
  };
}; 