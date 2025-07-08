import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../useAppState';

describe('useAppState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAppState());

    expect(result.current.currentView).toBe('landing');
    expect(result.current.messages).toEqual([]);
    expect(result.current.inputText).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.showDisclaimer).toBe(false);
    expect(result.current.isListening).toBe(false);
    expect(result.current.activeTab).toBe('chat');
    expect(result.current.isPremium).toBe(false);
    expect(result.current.insights).toEqual({ themes: [], moods: [] });
    expect(result.current.isGeneratingInsights).toBe(false);
    expect(result.current.isJournaling).toBe(false);
    expect(result.current.chatEndRef).toBeDefined();
    expect(result.current.inputRef).toBeDefined();
  });

  it('should update currentView', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setCurrentView('auth');
    });

    expect(result.current.currentView).toBe('auth');
  });

  it('should update messages', () => {
    const { result } = renderHook(() => useAppState());
    const newMessage = { id: 1, text: 'Test message', sender: 'user', timestamp: '10:00 AM' };

    act(() => {
      result.current.setMessages([newMessage]);
    });

    expect(result.current.messages).toEqual([newMessage]);
  });

  it('should update inputText', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setInputText('Hello world');
    });

    expect(result.current.inputText).toBe('Hello world');
  });

  it('should update isLoading', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should update showDisclaimer', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setShowDisclaimer(true);
    });

    expect(result.current.showDisclaimer).toBe(true);
  });

  it('should update isListening', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setIsListening(true);
    });

    expect(result.current.isListening).toBe(true);
  });

  it('should update activeTab', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setActiveTab('journal');
    });

    expect(result.current.activeTab).toBe('journal');
  });

  it('should update isPremium', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setIsPremium(true);
    });

    expect(result.current.isPremium).toBe(true);
  });

  it('should update insights', () => {
    const { result } = renderHook(() => useAppState());
    const newInsights = { themes: [{ name: 'Test', count: 1 }], moods: [] };

    act(() => {
      result.current.setInsights(newInsights);
    });

    expect(result.current.insights).toEqual(newInsights);
  });

  it('should update isGeneratingInsights', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setIsGeneratingInsights(true);
    });

    expect(result.current.isGeneratingInsights).toBe(true);
  });

  it('should update isJournaling', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setIsJournaling(true);
    });

    expect(result.current.isJournaling).toBe(true);
  });

  it('should maintain refs across re-renders', () => {
    const { result, rerender } = renderHook(() => useAppState());

    const initialChatEndRef = result.current.chatEndRef;
    const initialInputRef = result.current.inputRef;

    rerender();

    expect(result.current.chatEndRef).toBe(initialChatEndRef);
    expect(result.current.inputRef).toBe(initialInputRef);
  });

  it('should handle multiple state updates', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.setCurrentView('app');
      result.current.setActiveTab('insights');
      result.current.setIsPremium(true);
      result.current.setInputText('Test input');
    });

    expect(result.current.currentView).toBe('app');
    expect(result.current.activeTab).toBe('insights');
    expect(result.current.isPremium).toBe(true);
    expect(result.current.inputText).toBe('Test input');
  });
}); 