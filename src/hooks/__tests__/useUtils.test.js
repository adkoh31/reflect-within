import { renderHook } from '@testing-library/react';
import { useUtils } from '../useUtils';
import { mockMessages } from '../../utils/testUtils';

describe('useUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with utility functions', () => {
    const { result } = renderHook(() => useUtils([]));

    expect(result.current.formatTimestamp).toBeDefined();
    expect(result.current.formatDate).toBeDefined();
    expect(result.current.journalEntries).toEqual([]);
    expect(result.current.last5JournalEntries).toEqual([]);
  });

  it('should format timestamp correctly', () => {
    const { result } = renderHook(() => useUtils([]));
    
    // Mock Date.now() to return a fixed timestamp
    const mockDate = new Date('2024-01-01T10:30:00');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const timestamp = result.current.formatTimestamp();
    
    // Reset the mock
    global.Date.mockRestore();
    
    expect(typeof timestamp).toBe('string');
    expect(timestamp).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/);
  });

  it('should format date correctly', () => {
    const { result } = renderHook(() => useUtils([]));
    const testTimestamp = '2024-01-01T10:30:00';
    
    const formattedDate = result.current.formatDate(testTimestamp);
    
    expect(typeof formattedDate).toBe('string');
    expect(formattedDate).toContain('January 1, 2024');
  });

  it('should extract journal entries from messages', () => {
    const { result } = renderHook(() => useUtils(mockMessages));

    expect(result.current.journalEntries).toHaveLength(2);
    // Note: entries are reversed, so the first entry should be the last message pair
    expect(result.current.journalEntries[0]).toEqual({
      id: 3,
      userInput: 'I\'m feeling stressed about work',
      aiQuestion: 'Work stress is common. Can you tell me more about what\'s causing this stress?',
      timestamp: '10:02 AM'
    });
    expect(result.current.journalEntries[1]).toEqual({
      id: 1,
      userInput: 'Hello, I need some reflection help',
      aiQuestion: 'I\'d be happy to help you reflect. What\'s on your mind today?',
      timestamp: '10:00 AM'
    });
  });

  it('should extract last 5 journal entries for AI context', () => {
    const { result } = renderHook(() => useUtils(mockMessages));

    expect(result.current.last5JournalEntries).toHaveLength(2);
    expect(result.current.last5JournalEntries[0]).toEqual({
      date: expect.any(String),
      input: 'Hello, I need some reflection help',
      question: 'I\'d be happy to help you reflect. What\'s on your mind today?'
    });
    expect(result.current.last5JournalEntries[1]).toEqual({
      date: expect.any(String),
      input: 'I\'m feeling stressed about work',
      question: 'Work stress is common. Can you tell me more about what\'s causing this stress?'
    });
  });

  it('should handle empty messages array', () => {
    const { result } = renderHook(() => useUtils([]));

    expect(result.current.journalEntries).toEqual([]);
    expect(result.current.last5JournalEntries).toEqual([]);
  });

  it('should handle messages with incomplete pairs', () => {
    const incompleteMessages = [
      { id: 1, text: 'User message only', sender: 'user', timestamp: '10:00 AM' },
      { id: 2, text: 'AI response', sender: 'ai', timestamp: '10:01 AM' },
      { id: 3, text: 'Another user message', sender: 'user', timestamp: '10:02 AM' }
    ];

    const { result } = renderHook(() => useUtils(incompleteMessages));

    expect(result.current.journalEntries).toHaveLength(1);
    expect(result.current.last5JournalEntries).toHaveLength(1);
  });

  it('should handle messages with wrong order', () => {
    const wrongOrderMessages = [
      { id: 1, text: 'AI response first', sender: 'ai', timestamp: '10:00 AM' },
      { id: 2, text: 'User message second', sender: 'user', timestamp: '10:01 AM' }
    ];

    const { result } = renderHook(() => useUtils(wrongOrderMessages));

    expect(result.current.journalEntries).toHaveLength(0);
    expect(result.current.last5JournalEntries).toHaveLength(0);
  });

  it('should limit last5JournalEntries to 5 entries', () => {
    // Create more than 5 message pairs
    const manyMessages = [];
    for (let i = 0; i < 10; i++) {
      manyMessages.push(
        { id: i * 2, text: `User message ${i}`, sender: 'user', timestamp: `${10 + i}:00 AM` },
        { id: i * 2 + 1, text: `AI response ${i}`, sender: 'ai', timestamp: `${10 + i}:01 AM` }
      );
    }

    const { result } = renderHook(() => useUtils(manyMessages));

    expect(result.current.journalEntries).toHaveLength(10);
    expect(result.current.last5JournalEntries).toHaveLength(5);
  });

  it('should reverse journal entries order', () => {
    const { result } = renderHook(() => useUtils(mockMessages));

    // The entries should be in reverse chronological order
    expect(result.current.journalEntries[0].id).toBe(3);
    expect(result.current.journalEntries[1].id).toBe(1);
  });

  it('should maintain memoization for same messages', () => {
    const { result, rerender } = renderHook(() => useUtils(mockMessages));

    const firstJournalEntries = result.current.journalEntries;
    const firstLast5Entries = result.current.last5JournalEntries;

    rerender();

    expect(result.current.journalEntries).toBe(firstJournalEntries);
    expect(result.current.last5JournalEntries).toBe(firstLast5Entries);
  });

  it('should update when messages change', () => {
    const { result, rerender } = renderHook(({ messages }) => useUtils(messages), {
      initialProps: { messages: mockMessages }
    });

    const initialJournalEntries = result.current.journalEntries;

    const newMessages = [
      ...mockMessages,
      { id: 5, text: 'New user message', sender: 'user', timestamp: '10:04 AM' },
      { id: 6, text: 'New AI response', sender: 'ai', timestamp: '10:05 AM' }
    ];

    rerender({ messages: newMessages });

    expect(result.current.journalEntries).not.toBe(initialJournalEntries);
    expect(result.current.journalEntries).toHaveLength(3);
  });

  it('should handle malformed timestamps', () => {
    const { result } = renderHook(() => useUtils([]));
    
    const formattedDate = result.current.formatDate('invalid-timestamp');
    
    expect(typeof formattedDate).toBe('string');
    expect(formattedDate).toContain('Invalid Date');
  });
}); 