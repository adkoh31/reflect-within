import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Plus, 
  MessageSquare, 
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  ChevronDown,
  Brain,
  X,
  Repeat,
  Sparkles
} from 'lucide-react';
import { MyraLogo } from '../ui/MyraLogo.jsx';

// Enhanced UI components
import { GestureButton } from '../ui/gesture-feedback';
import { VoiceVisualizer, VoiceStatusIndicator } from '../ui/voice-visualizer';
import { EnhancedTypingIndicator } from '../ui/typing-indicator';
import { PulsingButton } from '../ui/loading-states';
import { LoadingButton } from '../ui/LoadingButton.jsx';
import { useMobileGestures } from '../../hooks/useMobileGestures.js';
import SmartStarters from './SmartStarters.jsx';

// Utility function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Memory Insights Component
const MemoryInsights = ({ memoryInsights, isVisible, onToggle }) => {
  if (!memoryInsights) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-50 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              Conversation Insights
            </h4>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Engagement Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Engagement Score</span>
                <span className="text-cyan-400 font-medium">
                  {memoryInsights.engagementMetrics?.engagementScore || 0}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Message Length</span>
                <span className="text-slate-300">
                  {memoryInsights.engagementMetrics?.averageMessageLength || 0} chars
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peak Time</span>
                <span className="text-slate-300">
                  {memoryInsights.engagementMetrics?.peakEngagementTimes?.[0] || 'N/A'}
                </span>
              </div>
            </div>

            {/* Emotional Trends */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Emotional Trend</span>
                <span className={`font-medium ${
                  memoryInsights.emotionalTrends?.overallSentiment === 'positive' ? 'text-green-400' :
                  memoryInsights.emotionalTrends?.overallSentiment === 'negative' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {memoryInsights.emotionalTrends?.overallSentiment || 'neutral'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stability</span>
                <span className="text-slate-300">
                  {Math.round((memoryInsights.emotionalTrends?.emotionalStability || 0) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Top Topics</span>
                <span className="text-slate-300 truncate max-w-20">
                  {memoryInsights.topicEvolution?.primaryTopics?.slice(0, 2).join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recurring Themes */}
          {memoryInsights.longTermPatterns?.recurringThemes?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-slate-400">Recurring Themes</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {memoryInsights.longTermPatterns.recurringThemes.slice(0, 3).map((theme, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Conversation Header Component
const ConversationHeader = ({ 
  conversationPersistence, 
  onNewConversation, 
  onSwitchConversation,
  deleteConversation
}) => {
  const [showConversationList, setShowConversationList] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const currentConversation = conversationPersistence?.currentConversation;
  const conversations = conversationPersistence?.conversations || [];

  const handleTitleEdit = () => {
    if (currentConversation) {
      setNewTitle(currentConversation.title);
      setEditingTitle(true);
    }
  };

  const handleTitleSave = async () => {
    if (currentConversation && newTitle.trim()) {
      await conversationPersistence.updateConversationTitle(currentConversation.id, newTitle.trim());
      setEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
    setNewTitle('');
  };

  const handleDeleteConversation = async () => {
    if (currentConversation && window.confirm('Are you sure you want to delete this conversation?')) {
      if (deleteConversation) {
        await deleteConversation(currentConversation.id);
      } else {
        await conversationPersistence.deleteConversation(currentConversation.id);
      }
    }
  };

  return (
    <div className="relative">
      {/* Conversation Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <MyraLogo size="sm" animated={false} />
          
          {editingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                onBlur={handleTitleSave}
                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                autoFocus
              />
              <button
                onClick={handleTitleSave}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Save
              </button>
              <button
                onClick={handleTitleCancel}
                className="text-slate-400 hover:text-slate-300 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConversationList(!showConversationList)}
                className="flex items-center space-x-2 text-slate-50 hover:text-cyan-400 transition-colors"
              >
                <span className="font-medium text-sm">
                  {currentConversation?.title || 'New Conversation'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showConversationList ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleTitleEdit}
                  className="p-1 text-slate-400 hover:text-slate-300 transition-colors"
                  title="Edit title"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDeleteConversation}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onNewConversation}
          className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* Conversation List Dropdown */}
      <AnimatePresence>
        {showConversationList && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
          >
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="py-2">
                {conversations
                  .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
                  .map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        onSwitchConversation(conversation.id);
                        setShowConversationList(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors ${
                        conversation.id === currentConversation?.id ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-50 text-sm truncate">
                            {conversation.title}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {conversation.messages.length} messages • {new Date(conversation.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                        {conversation.metadata.topics.length > 0 && (
                          <div className="flex space-x-1 ml-2">
                            {conversation.metadata.topics.slice(0, 2).map((topic, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Memoized message component
const MessageItem = memo(({ message, isLast }) => {
  const formattedTime = useMemo(() => 
    formatTimestamp(message.timestamp), 
    [message.timestamp]
  );

  return (
    <motion.div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-lg px-6 py-4 rounded-2xl shadow-md ${
          message.sender === 'user'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : 'bg-slate-800 text-slate-100 border border-slate-700'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-1 ${
          message.sender === 'user' ? 'text-cyan-100' : 'text-slate-400'
        }`}>
          {formattedTime}
        </p>
      </div>
    </motion.div>
  );
});

MessageItem.displayName = 'MessageItem';

const ChatWindow = memo(({ 
  messages, 
  inputText, 
  onInputChange, 
  onSend, 
  onKeyPress, 
  isLoading, 
  isListening, 
  onSpeechToggle, 
  transcript, 
  streak, 
  browserSupportsSpeechRecognition, 
  microphoneStatus,
  conversationPersistence,
  createNewConversation,
  switchToConversation,
  deleteConversation
}) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showMemoryInsights, setShowMemoryInsights] = useState(false);
  const [showSmartStarters, setShowSmartStarters] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get memory insights
  const memoryInsights = conversationPersistence?.getMemoryInsightsForAI?.();

  // Mobile gesture handling
  const { gestureHandlers, triggerHaptic } = useMobileGestures({
    onSwipeLeft: () => {
      // Could be used for navigation or actions
      triggerHaptic('light');
    },
    onSwipeRight: () => {
      // Could be used for navigation or actions
      triggerHaptic('light');
    },
    onLongPress: () => {
      // Long press on messages could show options
      triggerHaptic('heavy');
    }
  });

  // Show AI welcome message when no messages exist
  useEffect(() => {
    if (messages.length === 0 && !showWelcomeMessage) {
      setShowWelcomeMessage(true);
    }
  }, [messages.length, showWelcomeMessage]);

  // Hide welcome message when messages are added
  useEffect(() => {
    if (messages.length > 0 && showWelcomeMessage) {
      setShowWelcomeMessage(false);
    }
  }, [messages.length, showWelcomeMessage]);

  // Show smart starters when appropriate
  useEffect(() => {
    if (conversationPersistence && messages.length === 0) {
      // Show starters for new conversations
      setShowSmartStarters(true);
    } else if (messages.length > 0 && messages.length < 3) {
      // Show starters for short conversations that might need direction
      setShowSmartStarters(true);
    } else {
      setShowSmartStarters(false);
    }
  }, [conversationPersistence, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mobile when keyboard appears
  useEffect(() => {
    const handleFocus = () => {
      // Small delay to ensure keyboard is fully shown
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      return () => input.removeEventListener('focus', handleFocus);
    }
  }, []);

  // Handle mobile keyboard visibility
  const handleInputFocus = () => {
    // Trigger haptic feedback on mobile
    triggerHaptic('light');
  };

  // Enhanced mobile input handling
  const handleInputChange = (e) => {
    onInputChange(e);
    
    // Auto-resize textarea on mobile
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Mobile-optimized send handler
  const handleSend = () => {
    if (inputText.trim()) {
      // Trigger haptic feedback
      triggerHaptic('success');
      onSend();
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = '44px';
      }
    }
  };

  // Memoize processed messages to prevent recalculation
  const processedMessages = useMemo(() => 
    messages.map(msg => ({
      ...msg,
      formattedTime: formatTimestamp(msg.timestamp)
    })), [messages]
  );

  // Memoize streak display
  const streakDisplay = useMemo(() => {
    if (streak === 0) return null;
    return (
      <div className="flex items-center space-x-2 text-cyan-400 text-sm">
        <span className="font-semibold">{streak} day{streak !== 1 ? 's' : ''} streak</span>
      </div>
    );
  }, [streak]);

  // Memoize microphone status
  const microphoneDisplay = useMemo(() => {
    if (!browserSupportsSpeechRecognition) {
      return (
        <div className="text-red-400 text-xs">
          Voice input not supported in this browser
        </div>
      );
    }
    return null;
  }, [browserSupportsSpeechRecognition]);

  // Handle new conversation
  const handleNewConversation = async () => {
    if (createNewConversation) {
      await createNewConversation();
      setShowWelcomeMessage(true);
    }
  };

  // Handle conversation switch
  const handleSwitchConversation = async (conversationId) => {
    if (switchToConversation) {
      await switchToConversation(conversationId);
      setShowWelcomeMessage(false);
    }
  };

  // Handle smart starter selection
  const handleStarterSelect = (starterText) => {
    // Set the starter text as input
    onInputChange({ target: { value: starterText } });
    // Focus the input
    inputRef.current?.focus();
  };

  return (
    <div 
      className="flex flex-col h-full"
      {...gestureHandlers}
    >
      {/* Conversation Header */}
      {conversationPersistence && (
        <ConversationHeader
          conversationPersistence={conversationPersistence}
          onNewConversation={handleNewConversation}
          onSwitchConversation={handleSwitchConversation}
          deleteConversation={deleteConversation}
        />
      )}

      {/* Memory Insights Toggle */}
      {memoryInsights && (
        <div className="px-4 py-2 border-b border-slate-700/50">
          <button
            onClick={() => setShowMemoryInsights(!showMemoryInsights)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            <span>View Conversation Insights</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showMemoryInsights ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Memory Insights Display */}
      {memoryInsights && (
        <MemoryInsights
          memoryInsights={memoryInsights}
          isVisible={showMemoryInsights}
          onToggle={() => setShowMemoryInsights(false)}
        />
      )}

      {/* Smart Starters */}
      {conversationPersistence && (
        <SmartStarters
          isVisible={showSmartStarters}
          onStarterSelect={handleStarterSelect}
          onClose={() => setShowSmartStarters(false)}
          conversationPersistence={conversationPersistence}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showWelcomeMessage && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <MyraLogo size="lg" animated={true} />
            </div>
            <h3 className="text-xl font-semibold text-slate-50 mb-2">
              Welcome to Myra
            </h3>
            <p className="text-slate-400 mb-6">
              I'm here to help you explore your thoughts and feelings through meaningful conversations.
            </p>
            {memoryInsights && (
              <div className="text-xs text-slate-500">
                I remember our previous conversations and can provide personalized insights.
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {processedMessages.map((message, index) => (
          <MessageItem
            key={message.id || index}
            message={message}
            isLast={index === processedMessages.length - 1}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2">
              <EnhancedTypingIndicator />
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 safe-area-inset-bottom">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={onKeyPress}
              onFocus={handleInputFocus}
              placeholder="Share your thoughts..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base leading-relaxed"
              rows={1}
              style={{ 
                minHeight: '44px', 
                maxHeight: '120px',
                fontSize: '16px' // Prevent zoom on iOS
              }}
            />
            
            {/* Smart Starters Trigger Button */}
            {conversationPersistence && !showSmartStarters && (
              <button
                onClick={() => setShowSmartStarters(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                title="Get conversation suggestions"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <GestureButton
              onClick={onSpeechToggle}
              disabled={!browserSupportsSpeechRecognition || isLoading}
              hapticType="light"
              className={`p-4 rounded-full transition-all duration-200 touch-manipulation ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ minWidth: '56px', minHeight: '56px' }}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </GestureButton>
            
            <LoadingButton
              onClick={handleSend}
              disabled={!inputText.trim()}
              loading={isLoading}
              loadingText=""
              variant="primary"
              size="small"
              className="p-4 rounded-full touch-manipulation"
              style={{ minWidth: '56px', minHeight: '56px' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </LoadingButton>
          </div>
        </div>

        {/* Voice Visualizer */}
        {isListening && (
          <div className="mt-3">
            <VoiceVisualizer isListening={isListening} />
            <VoiceStatusIndicator status={microphoneStatus} />
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm">
              <span className="text-cyan-400">Transcript:</span> {transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.messages.length === nextProps.messages.length &&
    prevProps.inputText === nextProps.inputText &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isListening === nextProps.isListening &&
    prevProps.transcript === nextProps.transcript &&
    prevProps.streak === nextProps.streak &&
    prevProps.microphoneStatus === nextProps.microphoneStatus &&
    prevProps.conversationPersistence?.currentConversationId === nextProps.conversationPersistence?.currentConversationId
  );
});

export default ChatWindow; 