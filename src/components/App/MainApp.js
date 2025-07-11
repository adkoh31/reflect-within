import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { retryWithBackoff } from '../../utils/errorHandler';
import { API_ENDPOINTS } from '../../config/api';

// Enhanced UI Components
import BottomNav from '../Navigation/BottomNav';
import SuccessToast from '../Feedback/SuccessToast';
import HomeTab from './HomeTab';

// Existing Components
import ChatWindow from '../Chat/ChatWindow';
import Journal from '../Journal/Journal';
import InsightsDashboard from '../Insights/InsightsDashboard';
import UserProfile from '../Auth/UserProfile';
import ErrorModal from '../ErrorModal';
import NetworkStatus from '../NetworkStatus';
import { AIThinkingIndicator } from '../ui/loading-states';

// Custom hooks
import { useErrorHandling } from '../../hooks/useErrorHandling';
import { useMessages } from '../../hooks/useMessages';
import { useInsights } from '../../hooks/useInsights';
import { useJournal } from '../../hooks/useJournal';
import { useSpeechRecognitionCustom } from '../../hooks/useSpeechRecognition';
import { useUtils } from '../../hooks/useUtils';
import { useTheme } from '../../hooks/useTheme';
import { useStreak } from '../../hooks/useStreak';
import { useSuccessFeedback } from '../../hooks/useSuccessFeedback';

const MainApp = ({ 
  user: propUser,
  handleLogout,
  handleProfileUpdate,
  showProfile,
  setShowProfile,
  setCurrentView,
  currentView = 'app',
  showOnboarding,
  onboardingData,
  onOnboardingComplete,
  onSkipOnboarding
}) => {
  // Local state management (without currentView)
  const [messages, setMessages] = React.useState([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [isPremium, setIsPremium] = React.useState(false);
  const [insights, setInsights] = React.useState({ themes: [], moods: [] });
  const [isGeneratingInsights, setIsGeneratingInsights] = React.useState(false);
  const chatEndRef = React.useRef(null);
  const inputRef = React.useRef(null);

  // Utils
  const { formatTimestamp, last5JournalEntries } = useUtils(messages);

  // Auth - All auth functions passed as props from parent
  // Use prop user (passed from App.js)
  const user = propUser;

  // Error handling
  const errorHandling = useErrorHandling(activeTab, handleLogout);
  const { error, showErrorModal, setShowErrorModal, handleError, handleErrorAction } = errorHandling;

  // Speech recognition
  const speech = useSpeechRecognitionCustom(isListening, setIsListening, handleError);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition, handleSpeechToggle, microphoneStatus } = speech;

  // Success feedback - MUST come before useMessages
  const successFeedback = useSuccessFeedback();
  const { toast, hideToast, showMessageSent } = successFeedback;

  // Messages
  const messageHandlers = useMessages(
    messages, setMessages, inputText, setInputText, isLoading, setIsLoading,
    isListening, setIsListening, resetTranscript, formatTimestamp,
    last5JournalEntries, isPremium, user, handleError, showMessageSent
  );
  const { handleSendMessage, handleKeyPress } = messageHandlers;

  // Insights
  const { generateInsights } = useInsights(messages, isGeneratingInsights, setIsGeneratingInsights, setInsights, handleError);

  // Journal
  useJournal(messages);

  // Theme
  useTheme();

  console.log('🔍 MainApp Debug:', {
    user: user?.email,
    showOnboarding
  });

  // Streak tracking
  const { streak } = useStreak(messages);

  // Effects
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript, setInputText]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('reflectWithin_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading saved messages:', error);
        localStorage.removeItem('reflectWithin_messages');
      }
    }
  }, [setMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('reflectWithin_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatEndRef]);

  useEffect(() => {
    if (messages.length > 0 && activeTab === 'insights') {
      generateInsights();
    }
  }, [messages, activeTab, generateInsights]);

  // Handlers
  const handleHomeAction = useCallback((action) => {
    if (action === 'voice') {
      setActiveTab('chat');
      // Don't auto-trigger voice - let user click the voice button
    } else if (action === 'journal') {
      setActiveTab('journal');
    }
  }, [setActiveTab]);

  // Handle sending prompts directly
  const handleSendPrompt = useCallback(async (prompt) => {
    // First, add the user's prompt as a message
    const userMessage = {
      id: Date.now(),
      text: prompt,
      sender: 'user',
      timestamp: formatTimestamp()
    };

    setMessages(prev => [...prev, userMessage]);

    // Set loading for AI response
    setIsLoading(true);

    try {
      const response = await retryWithBackoff(async () => {
        return await axios.post(API_ENDPOINTS.REFLECT, {
          message: prompt,
          pastEntries: last5JournalEntries,
          isPremium: isPremium
        });
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.question,
        sender: 'ai',
        timestamp: formatTimestamp()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show success feedback
      showMessageSent();

      if (isPremium && user) {
        try {
          await axios.post(API_ENDPOINTS.SAVE_REFLECTION, {
            userInput: prompt,
            aiQuestion: response.data.question
          });
        } catch (error) {
          console.error('Failed to save to MongoDB:', error);
        }
      }
    } catch (error) {
      console.error('AI response failed:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now, but I've saved your reflection. You can continue journaling and I'll respond when I'm back online.",
        sender: 'ai',
        timestamp: formatTimestamp()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [setMessages, formatTimestamp, setIsLoading, last5JournalEntries, isPremium, user, showMessageSent]);

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-900 text-slate-50 flex flex-col safe-area-inset-bottom">
      <NetworkStatus />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 pb-20 sm:pb-24">
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HomeTab 
                user={user}
                streak={streak}
                last5JournalEntries={last5JournalEntries}
                onAction={handleHomeAction}
              />
            </motion.div>
          )}
          
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatWindow 
                messages={messages}
                inputText={inputText}
                onInputChange={(e) => setInputText(e.target.value)}
                onSend={handleSendMessage}
                onSendPrompt={handleSendPrompt}
                onSpeechToggle={handleSpeechToggle}
                isListening={isListening}
                isLoading={isLoading}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                transcript={transcript}
                inputRef={inputRef}
                chatEndRef={chatEndRef}
                handleKeyPress={handleKeyPress}
                user={user}
                streak={streak}
                microphoneStatus={microphoneStatus}
                isPremium={isPremium}
              />
            </motion.div>
          )}
          
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              className="px-4 py-4 overflow-y-auto pb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Journal 
                onSpeechToggle={handleSpeechToggle}
                isListening={isListening}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                transcript={transcript}
                microphoneStatus={microphoneStatus}
                isPremium={isPremium}
                user={user}
                messages={messages}
              />
            </motion.div>
          )}
          
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              className="px-4 py-4 overflow-y-auto pb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InsightsDashboard 
                insights={insights}
                isGeneratingInsights={isGeneratingInsights}
                isPremium={isPremium}
                onPremiumToggle={() => setIsPremium(!isPremium)}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              className="px-4 py-4 overflow-y-auto pb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {user ? (
                <UserProfile 
                  user={user}
                  onLogout={handleLogout}
                  onUpdateProfile={handleProfileUpdate}
                  isPremium={isPremium}
                  onPremiumToggle={() => setIsPremium(!isPremium)}
                />
              ) : (
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-light text-slate-50 mb-4">Welcome to ReflectWithin</h3>
                    <p className="text-slate-400 text-sm font-light mb-6">
                      Sign in to save your reflections and access premium features.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentView('landing');
                      }}
                      className="w-full bg-cyan-500 text-slate-900 py-3 px-4 rounded-xl font-medium hover:bg-cyan-400 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* AI Thinking Indicator */}
      {isLoading && <AIThinkingIndicator />}

      {/* Modals */}
      <ErrorModal 
        error={error}
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => setShowErrorModal(false)}
        onAction={handleErrorAction}
      />

      {/* Success Toast */}
      <SuccessToast 
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        duration={toast.duration}
      />
    </div>
  );
};

export default MainApp; 