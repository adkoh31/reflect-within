import { useState, useRef } from 'react';

export const useAppState = () => {
  // App state management - Start with landing page for better user flow
  const [currentView, setCurrentView] = useState('landing');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isPremium, setIsPremium] = useState(false);
  const [insights, setInsights] = useState({ themes: [], moods: [] });
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isJournaling, setIsJournaling] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  return {
    // State
    currentView,
    setCurrentView,
    messages,
    setMessages,
    inputText,
    setInputText,
    isLoading,
    setIsLoading,
    showDisclaimer,
    setShowDisclaimer,
    isListening,
    setIsListening,
    activeTab,
    setActiveTab,
    isPremium,
    setIsPremium,
    insights,
    setInsights,
    isGeneratingInsights,
    setIsGeneratingInsights,
    isJournaling,
    setIsJournaling,
    // Refs
    chatEndRef,
    inputRef
  };
}; 