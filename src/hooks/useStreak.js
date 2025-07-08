import { useState, useEffect } from 'react';

export const useStreak = (messages) => {
  const [streak, setStreak] = useState(0);
  const [lastEntryDate, setLastEntryDate] = useState(null);

  useEffect(() => {
    calculateStreak();
  }, [messages]);

  const calculateStreak = () => {
    if (!messages || messages.length === 0) {
      setStreak(0);
      return;
    }

    // Get user entries (non-AI messages)
    const userEntries = messages.filter(msg => msg.role === 'user');
    
    if (userEntries.length === 0) {
      setStreak(0);
      return;
    }

    // Sort entries by timestamp
    const sortedEntries = userEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let currentDate = today;
    
    // Check if there's an entry today
    const hasEntryToday = sortedEntries.some(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === currentDate.getTime();
    });
    
    if (hasEntryToday) {
      currentStreak = 1;
      currentDate.setDate(currentDate.getDate() - 1); // Move to yesterday
    }
    
    // Count consecutive days
    for (let i = 0; i < 365; i++) { // Limit to 1 year
      const hasEntryOnDate = sortedEntries.some(entry => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === currentDate.getTime();
      });
      
      if (hasEntryOnDate) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }
    
    setStreak(currentStreak);
    
    // Set last entry date
    if (sortedEntries.length > 0) {
      setLastEntryDate(new Date(sortedEntries[0].timestamp));
    }
  };

  const addEntry = () => {
    // This would be called when a new entry is added
    // The streak will be recalculated on the next render
  };

  const getStreakMessage = () => {
    if (streak === 0) return null;
    if (streak === 1) return "Great start!";
    if (streak < 7) return `You're on a ${streak}-day streak!`;
    if (streak < 30) return `Amazing! ${streak} days in a row!`;
    if (streak < 100) return `Incredible dedication! ${streak} days!`;
    return `Legendary! ${streak} days of reflection!`;
  };

  return {
    streak,
    lastEntryDate,
    addEntry,
    getStreakMessage
  };
}; 