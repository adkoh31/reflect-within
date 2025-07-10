import { useState, useEffect, useCallback, useMemo } from 'react';

export const useJournalEntries = () => {
  const [entries, setEntries] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load entries from localStorage with migration
  useEffect(() => {
    try {
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
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reflectWithin_journal_entries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  }, [entries]);

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
      const entryId = options.entryId || timestamp; // Use provided ID or timestamp
      
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
      
      setEntries(prev => ({
        ...prev,
        [entryId]: newEntry
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, entryId };
    } catch (error) {
      console.error('Error saving entry:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [entries]);

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
  }, [entries]);

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

  // Search entries
  const searchEntries = useCallback((query, filters = {}) => {
    return getAllEntries.filter(entry => {
      // Text search
      const matchesSearch = !query || 
        entry.content.toLowerCase().includes(query.toLowerCase()) ||
        entry.topics?.some(topic => 
          topic.toLowerCase().includes(query.toLowerCase())
        ) ||
        entry.tags?.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        );

      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange && filters.dateRange !== 'all') {
        const entryDate = new Date(entry.date);
        const today = new Date();
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            matchesDateRange = daysDiff === 0;
            break;
          case 'week':
            matchesDateRange = daysDiff <= 7;
            break;
          case 'month':
            matchesDateRange = daysDiff <= 30;
            break;
          case 'custom':
            if (filters.dateFrom && filters.dateTo) {
              const fromDate = new Date(filters.dateFrom);
              const toDate = new Date(filters.dateTo);
              matchesDateRange = entryDate >= fromDate && entryDate <= toDate;
            }
            break;
          default:
            matchesDateRange = true;
            break;
        }
      }

      // Topics filter
      const matchesTopics = !filters.topics || filters.topics.length === 0 ||
        filters.topics.some(topic => 
          entry.topics?.includes(topic)
        );

      // Attachments filter
      const matchesAttachments = !filters.hasAttachments ||
        (entry.attachments && entry.attachments.length > 0);

      // Mood filter
      const matchesMood = !filters.mood || entry.mood === filters.mood;

      // Template filter
      const matchesTemplate = !filters.template || entry.template === filters.template;

      return matchesSearch && matchesDateRange && matchesTopics && matchesAttachments && matchesMood && matchesTemplate;
    });
  }, [getAllEntries]);

  // Get statistics
  const getStats = useMemo(() => {
    const totalEntries = getAllEntries.length;
    const totalWords = getAllEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const totalAttachments = getAllEntries.reduce((sum, entry) => sum + (entry.attachments?.length || 0), 0);
    
    // Get unique topics
    const allTopics = new Set();
    getAllEntries.forEach(entry => {
      if (entry.topics) {
        entry.topics.forEach(topic => allTopics.add(topic));
      }
    });

    // Get mood distribution
    const moodCounts = {};
    getAllEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    // Get most used templates
    const templateCounts = {};
    getAllEntries.forEach(entry => {
      if (entry.template) {
        templateCounts[entry.template] = (templateCounts[entry.template] || 0) + 1;
      }
    });

    return {
      totalEntries,
      totalWords,
      totalAttachments,
      uniqueTopics: Array.from(allTopics),
      moodDistribution: moodCounts,
      templateUsage: templateCounts,
      averageWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0
    };
  }, [getAllEntries]);

  // Get entries with attachments
  const getEntriesWithAttachments = useMemo(() => {
    return getAllEntries.filter(entry => entry.attachments && entry.attachments.length > 0);
  }, [getAllEntries]);

  // Get entries by template
  const getEntriesByTemplate = useCallback((template) => {
    return getAllEntries.filter(entry => entry.template === template);
  }, [getAllEntries]);

  // Get entries by mood
  const getEntriesByMood = useCallback((mood) => {
    return getAllEntries.filter(entry => entry.mood === mood);
  }, [getAllEntries]);

  return {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getAllEntries,
    getRecentEntries,
    searchEntries,
    getStats,
    getEntriesWithAttachments,
    getEntriesByTemplate,
    getEntriesByMood
  };
}; 