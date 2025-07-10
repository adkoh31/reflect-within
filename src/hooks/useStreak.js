import { useState, useEffect, useCallback } from 'react';

export const useStreak = (messages) => {
  const [streak, setStreak] = useState(0);
  const [lastEntryDate, setLastEntryDate] = useState(null);

  const calculateStreak = useCallback(() => {
    if (!messages || messages.length === 0) {
      setStreak(0);
      setLastEntryDate(null);
      return 0;
    }

    // Filter user messages and sort by timestamp
    const userMessages = messages
      .filter(msg => msg.sender === 'user')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (userMessages.length === 0) {
      setStreak(0);
      setLastEntryDate(null);
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntry = new Date(userMessages[0].timestamp);
    lastEntry.setHours(0, 0, 0, 0);

    // If last entry is not today, streak is 0
    if (lastEntry.getTime() !== today.getTime()) {
      setStreak(0);
      setLastEntryDate(lastEntry);
      return 0;
    }

    let currentStreak = 1;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);

    // Check consecutive days backwards
    for (let i = 1; i < userMessages.length; i++) {
      const messageDate = new Date(userMessages[i].timestamp);
      messageDate.setHours(0, 0, 0, 0);

      if (messageDate.getTime() === currentDate.getTime()) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (messageDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    setStreak(currentStreak);
    setLastEntryDate(lastEntry);
    return currentStreak;
  }, [messages]);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  return { streak, lastEntryDate };
}; 