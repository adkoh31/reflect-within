import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useUnifiedData } from './hooks/useUnifiedData.js';
import { useInsights } from './hooks/useInsights.js';
import { useWorkerManager } from './hooks/useWorkerManager.js';
import { useConversationPersistence } from './hooks/useConversationPersistence.js';
import { useEnhancedAI } from './hooks/useEnhancedAI.js';
import LandingPage from './components/Landing/LandingPage.jsx';
import AuthPage from './components/Auth/AuthPage.jsx';
import OnboardingFlow from './components/Onboarding/OnboardingFlow.jsx';
import Journal from './components/Journal/Journal.jsx';
import InsightsDashboard from './components/Insights/InsightsDashboard.jsx';
import ChatWindow from './components/Chat/ChatWindow.jsx';
import UserProfile from './components/Auth/UserProfile.jsx';
import BottomNav from './components/Navigation/BottomNav.jsx';
import NetworkStatus from './components/NetworkStatus.jsx';
import HomeTab from './components/App/HomeTab.jsx';
import OfflineSyncProgress from './components/ui/offline-sync-progress.jsx';
import SimpleTestPanel from './components/ui/SimpleTestPanel.jsx';
import { LoadingSpinner } from './components/ui/LoadingSpinner.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { AIThinkingIndicator } from './components/ui/loading-states.jsx';
import ErrorModal from './components/ErrorModal/ErrorModal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyraLogo } from './components/ui/MyraLogo.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';

// Custom hooks
import { useErrorHandling } from './hooks/useErrorHandling.js';
import { useMessages } from './hooks/useMessages.js';
import { useSpeechRecognitionCustom } from './hooks/useSpeechRecognition.js';
import { useUtils } from './hooks/useUtils.js';
import { useTheme } from './hooks/useTheme.js';
import { useStreak } from './hooks/useStreak.js';
import { useSuccessFeedback } from './hooks/useSuccessFeedback.js';
import { useOfflineSync } from './hooks/useOfflineSync.js';
import { OfflineTestUtils } from './utils/offlineTestUtils.js';
import { QuickTest } from './utils/quickTest.js';
import { SimpleOfflineTest } from './utils/simpleOfflineTest.js';


function App() {
  // App state
  const [currentView, setCurrentView] = useState('landing'); // landing, auth, onboarding, main
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isPremium, setIsPremium] = useState(() => {
    // Initialize premium state from localStorage
    return localStorage.getItem('reflectWithin_isPremium') === 'true';
  });
  const [user, setUser] = useState(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  // Create a stable user object using useMemo
  const stableUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id || user.email,
      email: user.email,
      name: user.name
    };
  }, [user?.id, user?.email, user?.name]);
  
  const { userData, isLoading: isDataLoaded, updateProfile, updateGoals } = useUnifiedData(stableUser);
  const { isReady: isWorkerManagerReady } = useWorkerManager();

  // Chat and messaging state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [insights, setInsights] = useState({ themes: [], moods: [] });
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Conversation persistence
  const conversationPersistence = useConversationPersistence(stableUser, isPremium);

  // Enhanced AI with memory
  const enhancedAI = useEnhancedAI(userData, conversationPersistence, isPremium);
  const { generateResponse: generateEnhancedResponse, isLoading: isEnhancedAILoading } = enhancedAI;

  // Utils
  const { formatTimestamp, last5JournalEntries } = useUtils(messages);

  // Error handling
  const handleLogout = useCallback(() => {
    // Clear user data
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('reflectWithin_token');
    localStorage.removeItem('reflectWithin_user');
    localStorage.removeItem('reflectWithin_isPremium');
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('reflectWithin_lastTab');
    // Clear axios authorization header
    delete axios.defaults.headers.common['Authorization'];
    // Redirect to landing page
    setCurrentView('landing');
    setActiveTab('home');
    // Clear all app state
    setMessages([]);
    setInputText('');
    setInsights({ themes: [], moods: [] });
    console.log('✅ User logged out successfully');
  }, []);

  const errorHandling = useErrorHandling(currentView, activeTab, handleLogout);
  const { error: appError, showErrorModal, setShowErrorModal, handleError, handleErrorAction } = errorHandling;

  // Speech recognition
  const speech = useSpeechRecognitionCustom(isListening, setIsListening, handleError);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition, handleSpeechToggle, microphoneStatus } = speech;

  // Success feedback
  const successFeedback = useSuccessFeedback();
  const { toast: successToast, hideToast, showMessageSent } = successFeedback;

  // Messages
  const messageHandlers = useMessages(
    messages, setMessages, inputText, setInputText, isChatLoading, setIsChatLoading,
    isListening, setIsListening, resetTranscript, formatTimestamp,
    last5JournalEntries, isPremium, stableUser, handleError, showMessageSent,
    conversationPersistence, generateEnhancedResponse
  );
  const { 
    handleSendMessage, 
    handleKeyDown, 
    loadConversationMessages, 
    createNewConversation, 
    switchToConversation, 
    deleteConversation 
  } = messageHandlers;

  // Insights - Single call to useInsights
  const { 
    generateInsights, 
    generateUserAdvancedInsights, 
    advancedAnalytics, 
    isWorkerReady 
  } = useInsights(userData?.journalEntries || [], isGeneratingInsights, setIsGeneratingInsights, setInsights, handleError);

  // Theme
  useTheme();

  // Streak tracking
  const { streak } = useStreak(messages);

  // Offline sync
  const { 
    isOnline, 
    pendingOperations, 
    syncStatus, 
    syncProgress,
    aiOfflineMode,
    addPendingOperation, 
    handleSync, 
    retryFailedOperations 
  } = useOfflineSync();

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Load conversation messages when current conversation changes
  useEffect(() => {
    if (conversationPersistence?.currentConversationId && isDataLoaded) {
      loadConversationMessages(conversationPersistence.currentConversationId);
    }
  }, [conversationPersistence?.currentConversationId, isDataLoaded, loadConversationMessages]);

  // Make test utilities available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.OfflineTestUtils = OfflineTestUtils;
      window.QuickTest = QuickTest;
      window.SimpleOfflineTest = SimpleOfflineTest;
      console.log('🧪 Test utilities loaded!');
      console.log('📝 Try: window.SimpleOfflineTest.runSimpleTests()');
      console.log('🔧 Or: window.QuickTest.quickOfflineTest()');
      console.log('🔧 Or: window.OfflineTestUtils.runComprehensiveTest()');
    }
  }, []);

  // Generate advanced insights when data is loaded
  useEffect(() => {
    if (isDataLoaded && userData && isWorkerManagerReady) {
      generateUserAdvancedInsights(userData);
    }
  }, [isDataLoaded, userData, isWorkerManagerReady]);

  // Effects for chat functionality
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (userData?.journalEntries && Object.keys(userData.journalEntries).length > 0 && activeTab === 'insights') {
      generateInsights();
    }
  }, [userData?.journalEntries, activeTab]);

  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if user is already authenticated
      const token = localStorage.getItem('reflectWithin_token');
      const savedUser = localStorage.getItem('reflectWithin_user');
      const lastActiveTab = localStorage.getItem('reflectWithin_lastTab');
      
      if (token && savedUser) {
        // User is authenticated, set user data
        const user = JSON.parse(savedUser);
        setUser(user);
        
        // Check onboarding status
        const onboardingStatus = localStorage.getItem('onboardingComplete');
        if (onboardingStatus === 'true') {
          // User is fully set up, go directly to main app
          setCurrentView('main');
          
          // Restore last active tab if available
          if (lastActiveTab && ['home', 'chat', 'journal', 'insights', 'profile'].includes(lastActiveTab)) {
            setActiveTab(lastActiveTab);
          }
        } else {
          // User needs onboarding
          setCurrentView('onboarding');
        }
      } else {
        // No authentication, show landing page
        setCurrentView('landing');
      }
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('App initialization error:', error);
      setError('Failed to initialize app');
      toast.error('Failed to initialize app. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGetStarted = useCallback(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('reflectWithin_token');
    const savedUser = localStorage.getItem('reflectWithin_user');
    
    if (token && savedUser) {
      // User is authenticated, check onboarding status
      const onboardingStatus = localStorage.getItem('onboardingComplete');
      if (onboardingStatus === 'true') {
        setCurrentView('main');
      } else {
        setCurrentView('onboarding');
      }
    } else {
      // No authentication, show auth page
      setCurrentView('auth');
    }
  }, []);

  const handleAuthSuccess = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem('reflectWithin_token', token);
    localStorage.setItem('reflectWithin_user', JSON.stringify(userData));
    
    // Check if onboarding is needed
    const onboardingStatus = localStorage.getItem('onboardingComplete');
    if (onboardingStatus === 'true') {
      setCurrentView('main');
    } else {
      setCurrentView('onboarding');
    }
  }, []);

  const handleOnboardingComplete = useCallback(async (onboardingData) => {
    try {
      // Update user data with onboarding information
      const updatedUserData = {
        ...userData,
        profile: {
          ...userData?.profile,
          onboardingComplete: true
        },
        goals: {
          categories: onboardingData.focusAreas || [],
          metrics: onboardingData.selectedMetrics || {},
          preferences: {
            journalingGoal: 'daily',
            reminders: ['daily'],
            aiFeatures: ['insights', 'questions']
          }
        }
      };

      await updateProfile(updatedUserData);
      
      // Mark onboarding as complete
      localStorage.setItem('onboardingComplete', 'true');
      setCurrentView('main');
      
      toast.success('Welcome to Myra! Your journey begins now.');
      
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  }, [userData, updateProfile]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    // Save current tab to localStorage for restoration on refresh
    localStorage.setItem('reflectWithin_lastTab', tab);
  }, []);

  const handlePremiumToggle = useCallback((newValue) => {
    setIsPremium(newValue);
    // Persist premium state to localStorage
    localStorage.setItem('reflectWithin_isPremium', newValue.toString());
  }, []);

  const handleHomeAction = useCallback((action) => {
    if (action === 'voice') {
      setActiveTab('chat');
      localStorage.setItem('reflectWithin_lastTab', 'chat');
    } else if (action === 'journal') {
      setActiveTab('journal');
      localStorage.setItem('reflectWithin_lastTab', 'journal');
    } else if (action === 'insights') {
      setActiveTab('insights');
      localStorage.setItem('reflectWithin_lastTab', 'insights');
    }
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h2 className="text-xl font-semibold text-gray-800 mt-4">Loading Myra...</h2>
          <p className="text-gray-600 mt-2">Preparing your personal reflection space</p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show landing page
  if (currentView === 'landing') {
    return (
      <div className="relative">
        <LandingPage onGetStarted={handleGetStarted} />
        {showTestPanel && (
          <SimpleTestPanel
            isVisible={showTestPanel}
            onToggle={() => setShowTestPanel(!showTestPanel)}
          />
        )}
      </div>
    );
  }

  // Show auth page
  if (currentView === 'auth') {
    return (
      <div className="relative">
        <AuthPage onAuthSuccess={handleAuthSuccess} onBack={() => setCurrentView('landing')} />
        {showTestPanel && (
          <SimpleTestPanel
            isVisible={showTestPanel}
            onToggle={() => setShowTestPanel(!showTestPanel)}
          />
        )}
      </div>
    );
  }

  // Show onboarding if not complete
  if (currentView === 'onboarding') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <OnboardingFlow 
          onComplete={handleOnboardingComplete} 
          onSkip={() => {
            localStorage.setItem('onboardingComplete', 'true');
            setCurrentView('main');
          }}
          user={user} 
        />
        {showTestPanel && (
          <SimpleTestPanel
            isVisible={showTestPanel}
            onToggle={() => setShowTestPanel(!showTestPanel)}
          />
        )}
      </div>
    );
  }

  return (
      <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-slate-50">
        {/* Network Status */}
        <NetworkStatus 
          isOnline={isOnline}
          pendingOperations={pendingOperations}
          syncStatus={syncStatus}
          onRetrySync={retryFailedOperations}
          onManualSync={handleSync}
        />

        {/* Offline Sync Progress */}
        <OfflineSyncProgress
          syncStatus={syncStatus}
          syncProgress={syncProgress}
          pendingOperations={pendingOperations}
          onRetry={retryFailedOperations}
        />

        {/* Offline Test Panel */}
        <SimpleTestPanel
          isVisible={showTestPanel}
          onToggle={() => setShowTestPanel(!showTestPanel)}
        />
        
        {/* Header removed for headerless design across all tabs */}

        {/* Floating Test Panel Toggle (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="fixed top-4 right-4 z-50 p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg transition-colors"
            title="Toggle Test Panel (Dev Mode)"
          >
            🧪
          </button>
        )}

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
                  onAction={handleHomeAction}
                  streak={streak}
                  user={stableUser}
                  last5JournalEntries={last5JournalEntries}
                />
              </motion.div>
            )}
            
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                className="flex-1 flex flex-col min-h-0 pt-4"
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

                  onSpeechToggle={handleSpeechToggle}
                  isListening={isListening}
                  isLoading={isChatLoading}
                  browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                  transcript={transcript}
                  inputRef={inputRef}
                  chatEndRef={chatEndRef}
                  onKeyDown={handleKeyDown}
                  user={stableUser}
                  streak={streak}
                  microphoneStatus={microphoneStatus}
                  isPremium={isPremium}
                  isOffline={!isOnline}
                  conversationPersistence={conversationPersistence}
                  createNewConversation={createNewConversation}
                  switchToConversation={switchToConversation}
                  deleteConversation={deleteConversation}
                />
              </motion.div>
            )}
            
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                className="px-4 py-6 overflow-y-auto pb-6"
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
                  user={stableUser}
                  messages={messages}
                  isOffline={!isOnline}
                />
              </motion.div>
            )}
            
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                className="px-4 py-6 overflow-y-auto pb-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InsightsDashboard 
                  insights={insights}
                  isGeneratingInsights={isGeneratingInsights}
                  isPremium={isPremium}
                  onPremiumToggle={() => handlePremiumToggle(!isPremium)}
                  goals={userData?.goals}
                  journalEntries={userData?.journalEntries}
                  messages={messages}
                  onAction={handleHomeAction}
                  isOffline={!isOnline}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                className="px-4 py-6 overflow-y-auto pb-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfile 
                  user={stableUser}
                  onLogout={handleLogout}
                  onUpdateProfile={updateProfile}
                  isPremium={isPremium}
                  onPremiumToggle={() => handlePremiumToggle(!isPremium)}
                />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* AI Thinking Indicator */}
        {isChatLoading && <AIThinkingIndicator />}

        {/* Error Modal */}
        <ErrorModal
          error={appError}
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          onRetry={() => {
            setShowErrorModal(false);
            // Add retry logic here if needed
          }}
          onAction={handleErrorAction}
        />

          {/* Toast Notifications */}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          theme="dark"
          />
        </div>
      </ErrorBoundary>
  );
}

export default App;
