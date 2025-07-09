import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { retryWithBackoff } from '../../utils/errorHandler';
import { API_ENDPOINTS } from '../../config/api';

// Enhanced UI Components
import BottomNav from '../Navigation/BottomNav';
import EnhancedHeader from '../Navigation/EnhancedHeader';
import OnboardingFlow from '../Onboarding/OnboardingFlow';
import SuccessToast from '../Feedback/SuccessToast';
import HomeTab from './HomeTab';

// Existing Components
import ChatWindow from '../Chat/ChatWindow';
import Journal from '../Journal/Journal';
import InsightsDashboard from '../Insights/InsightsDashboard';
import DisclaimerModal from '../DisclaimerModal';
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
import { useOnboarding } from '../../hooks/useOnboarding';
import { useStreak } from '../../hooks/useStreak';
import { useSuccessFeedback } from '../../hooks/useSuccessFeedback';

const MainApp = ({ 
  showOnboarding: propShowOnboarding, 
  onboardingData, 
  onOnboardingComplete, 
  onSkipOnboarding,
  user: propUser,
  handleLogout,
  handleProfileUpdate,
  showProfile,
  setShowProfile,
  setCurrentView,
  currentView = 'app'
}) => {
  // Local state management (without currentView)
  const [messages, setMessages] = React.useState([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDisclaimer, setShowDisclaimer] = React.useState(false);
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
  const { toast, hideToast, showMessageSent, showChatSaved, showJournalDownloaded, showOnboardingComplete } = successFeedback;

  // Messages
  const messageHandlers = useMessages(
    messages, setMessages, inputText, setInputText, isLoading, setIsLoading,
    isListening, setIsListening, resetTranscript, formatTimestamp,
    last5JournalEntries, isPremium, user, handleError, showMessageSent
  );
  const { handleSendMessage, handleClearChat, handleSaveChat, handleKeyPress } = messageHandlers;

  // Insights
  const { generateInsights } = useInsights(messages, isGeneratingInsights, setIsGeneratingInsights, setInsights, handleError);

  // Journal
  useJournal(messages, showJournalDownloaded);

  // Theme
  useTheme();

  // Onboarding
  const { showOnboarding: hookShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  
  // Use prop showOnboarding if provided, otherwise use hook showOnboarding
  const showOnboarding = propShowOnboarding !== undefined ? propShowOnboarding : hookShowOnboarding;

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
    
    const hasSeenDisclaimer = localStorage.getItem('reflectWithin_disclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, [setMessages, setShowDisclaimer]);

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
  const handleDisclaimerClose = useCallback(() => {
    setShowDisclaimer(false);
    localStorage.setItem('reflectWithin_disclaimer', 'true');
  }, [setShowDisclaimer]);

  const handleOnboardingComplete = useCallback((data) => {
    if (onOnboardingComplete) {
      onOnboardingComplete(data);
    } else {
      completeOnboarding(data);
    }
    
    // Show success feedback
    showOnboardingComplete();
    
    // Set initial tab based on user preference
    if (data.preferredMode) {
      setActiveTab(data.preferredMode);
    }
    
    // Add first reflection if provided
    if (data.firstReflection?.trim()) {
      handleSendMessage(data.firstReflection);
    }
  }, [onOnboardingComplete, completeOnboarding, showOnboardingComplete, handleSendMessage, setActiveTab]);

  const handleSkipOnboarding = useCallback(() => {
    if (onSkipOnboarding) {
      onSkipOnboarding();
    } else {
      skipOnboarding();
    }
  }, [onSkipOnboarding, skipOnboarding]);

  // Home tab action handler
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

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
        user={user}
      />
    );
  }

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-background text-foreground flex flex-col safe-area-inset-bottom">
      <NetworkStatus />

      {/* Enhanced Header */}
      <EnhancedHeader 
        user={user}
        onProfileClick={() => setShowProfile(!showProfile)}
        onSaveChat={() => handleSaveChat(showChatSaved)}
        onClearChat={handleClearChat}
        messages={messages}
        streak={streak}
        showProfile={showProfile}
      />

      {/* User Profile Panel */}
      {showProfile && (
        <motion.div 
          className="px-4 py-3 border-b border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
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
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="text-center">
                <h3 className="text-lg font-light text-foreground mb-4">Welcome to ReflectWithin</h3>
                <p className="text-muted-foreground text-sm font-light mb-6">
                  Sign in to save your reflections and access premium features.
                </p>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    // Navigate to landing page for proper auth flow
                    setCurrentView('landing');
                  }}
                  className="w-full bg-foreground text-background py-3 px-4 rounded-xl font-light hover:bg-muted-foreground transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 pb-20 sm:pb-24">
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              className="px-4 py-4 overflow-y-auto pb-6"
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

      {showDisclaimer && (
        <DisclaimerModal showDisclaimer={showDisclaimer} onClose={handleDisclaimerClose} />
      )}

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