import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_INPUT_TEXT: 'SET_INPUT_TEXT',
  SET_LOADING: 'SET_LOADING',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_PREMIUM: 'SET_PREMIUM',
  SET_INSIGHTS: 'SET_INSIGHTS',
  SET_JOURNALING: 'SET_JOURNALING',
  SET_LISTENING: 'SET_LISTENING',
  CLEAR_CHAT: 'CLEAR_CHAT',
  RESET_STATE: 'RESET_STATE'
};

// Initial state
const initialState = {
  messages: [],
  inputText: '',
  isLoading: false,
  activeTab: 'chat',
  isPremium: false,
  insights: { themes: [], moods: [] },
  isJournaling: false,
  isListening: false,
  showDisclaimer: false
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
    
    case ACTIONS.SET_INPUT_TEXT:
      return { ...state, inputText: action.payload };
    
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
    case ACTIONS.SET_PREMIUM:
      return { ...state, isPremium: action.payload };
    
    case ACTIONS.SET_INSIGHTS:
      return { ...state, insights: action.payload };
    
    case ACTIONS.SET_JOURNALING:
      return { ...state, isJournaling: action.payload };
    
    case ACTIONS.SET_LISTENING:
      return { ...state, isListening: action.payload };
    
    case ACTIONS.CLEAR_CHAT:
      return { ...state, messages: [] };
    
    case ACTIONS.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const setMessages = useCallback((messages) => {
    dispatch({ type: ACTIONS.SET_MESSAGES, payload: messages });
  }, []);

  const addMessage = useCallback((message) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  }, []);

  const setInputText = useCallback((text) => {
    dispatch({ type: ACTIONS.SET_INPUT_TEXT, payload: text });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setActiveTab = useCallback((tab) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab });
  }, []);

  const setPremium = useCallback((premium) => {
    dispatch({ type: ACTIONS.SET_PREMIUM, payload: premium });
  }, []);

  const setInsights = useCallback((insights) => {
    dispatch({ type: ACTIONS.SET_INSIGHTS, payload: insights });
  }, []);

  const setJournaling = useCallback((journaling) => {
    dispatch({ type: ACTIONS.SET_JOURNALING, payload: journaling });
  }, []);

  const setListening = useCallback((listening) => {
    dispatch({ type: ACTIONS.SET_LISTENING, payload: listening });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CHAT });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_STATE });
  }, []);

  // Computed values
  const hasMessages = state.messages.length > 0;
  const messageCount = state.messages.length;
  const userMessageCount = state.messages.filter(m => m.sender === 'user').length;

  const value = {
    // State
    ...state,
    
    // Actions
    setMessages,
    addMessage,
    setInputText,
    setLoading,
    setActiveTab,
    setPremium,
    setInsights,
    setJournaling,
    setListening,
    clearChat,
    resetState,
    
    // Computed values
    hasMessages,
    messageCount,
    userMessageCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 