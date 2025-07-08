import { useState, useEffect, useCallback, useMemo } from 'react';

export const useJournalEntries = () => {
  const [entries, setEntries] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load entries from localStorage
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
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

  // Save entry
  const saveEntry = useCallback(async (date, content, topic = '') => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const entryId = timestamp; // Use timestamp as unique ID
      
      setEntries(prev => ({
        ...prev,
        [entryId]: {
          date: date.toISOString().split('T')[0], // Store date for filtering
          content,
          topic,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Error saving entry:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete entry
  const deleteEntry = useCallback(async (entryId) => {
    setIsLoading(true);
    try {
      setEntries(prev => {
        const newEntries = { ...prev };
        delete newEntries[entryId];
        return newEntries;
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getAllEntries,
    getRecentEntries
  };
}; 