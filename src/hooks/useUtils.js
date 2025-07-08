import { useCallback, useMemo } from 'react';

export const useUtils = (messages) => {
  const formatTimestamp = useCallback(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const formatDateCallback = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Memoized journal entries to prevent recalculation
  const journalEntries = useMemo(() => {
    const entries = [];
    for (let i = 0; i < messages.length; i += 2) {
      if (messages[i] && messages[i + 1] && 
          messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
        entries.push({
          id: messages[i].id,
          userInput: messages[i].text,
          aiQuestion: messages[i + 1].text,
          timestamp: messages[i].timestamp
        });
      }
    }
    return entries.reverse();
  }, [messages]);

  // Memoized last 5 entries for AI context
  const last5JournalEntries = useMemo(() => {
    const entries = [];
    for (let i = 0; i < messages.length; i += 2) {
      if (messages[i] && messages[i + 1] && 
          messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
        entries.push({
          date: formatDateCallback(messages[i].timestamp),
          input: messages[i].text,
          question: messages[i + 1].text
        });
      }
    }
    return entries.slice(-5);
  }, [messages, formatDateCallback]);

  return {
    formatTimestamp,
    formatDate: formatDateCallback,
    journalEntries,
    last5JournalEntries
  };
}; 