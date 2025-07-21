import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUnifiedData } from './useUnifiedData.js';
import { safeCreateDate, safeGetDateKey } from '../utils/dateUtils';

export const useJournalEntries = (isPremium = false, user = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the unified data system
  const {
    getJournalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getJournalEntriesByDateRange,
    getRecentJournalEntries
  } = useUnifiedData(user, isPremium);

  // Convert array format to object format for compatibility
  const entries = useMemo(() => {
    const journalEntriesArray = getJournalEntries();
    const entriesObject = {};
    
    journalEntriesArray.forEach(entry => {
      entriesObject[entry.id] = {
        id: entry.id,
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
    
    return entriesObject;
  }, [getJournalEntries]);

  // Get entries for a specific date
  const getEntriesForDate = useCallback((date) => {
    const dateStr = safeGetDateKey(date);
    if (!dateStr) return [];
    
    const journalEntriesArray = getJournalEntries();
    
    return journalEntriesArray.filter(entry => {
      const entryDate = safeCreateDate(entry.date);
      if (!entryDate) return false;
      
      const entryDateStr = safeGetDateKey(entryDate);
      return entryDateStr === dateStr;
    });
  }, [getJournalEntries]);

  // Get recent entries
  const getRecentEntries = useCallback(() => {
    return getRecentJournalEntries(10);
  }, [getRecentJournalEntries]);

  // Save entry
  const saveEntry = useCallback(async (date, content, topics = [], options = {}) => {
    setIsLoading(true);
    try {
      const entryData = {
        date: date instanceof Date ? date : new Date(date),
        content,
        topics,
        ...options
      };
      
      const result = addJournalEntry(entryData);
      return { success: true, entry: result };
    } catch (error) {
      console.error('Error saving entry:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [addJournalEntry]);

  // Delete entry
  const deleteEntry = useCallback(async (entryId) => {
    setIsLoading(true);
    try {
      deleteJournalEntry(entryId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting entry:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [deleteJournalEntry]);

  // Get stats
  const getStats = useMemo(() => {
    const journalEntriesArray = getJournalEntries();
    
    const totalEntries = journalEntriesArray.length;
    const totalWords = journalEntriesArray.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const totalAttachments = journalEntriesArray.reduce((sum, entry) => sum + (entry.attachments?.length || 0), 0);
    
    const allTopics = journalEntriesArray.flatMap(entry => entry.topics || []);
    const uniqueTopics = [...new Set(allTopics)];
    
    return {
      totalEntries,
      totalWords,
      totalAttachments,
      uniqueTopics
    };
  }, [getJournalEntries]);

  // Initialize
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getRecentEntries,
    getStats
  };
}; 