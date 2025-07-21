import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateContextualResponse, generateFollowUpQuestions, generatePersonalizedPrompts } from '../../utils/contextualAI.js';
import { useInsights } from '../../hooks/useInsights.js';
import { useUnifiedData } from '../../hooks/useUnifiedData.js';

/**
 * Smart AI Assistant Component
 * Provides contextual, personalized AI interactions
 */
export const SmartAIAssistant = ({ onMessageSend, onInsightGenerated }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [activeMode, setActiveMode] = useState('chat'); // chat, coach, reflect, journal
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [userContext, setUserContext] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Create a default user object for now - this should be replaced with actual auth
  const defaultUser = { id: 'default-user', email: 'user@example.com', name: 'User' };
  const { userData, updateProfile, addChatMessage, addTrackingData } = useUnifiedData(defaultUser);
  const { generateUserAdvancedInsights, advancedAnalytics } = useInsights();

  // Initialize AI assistant
  useEffect(() => {
    initializeAssistant();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate contextual response
  const generateResponse = useCallback(async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Generate contextual response
      const { response, context } = generateContextualResponse(
        userMessage, 
        userData, 
        advancedAnalytics
      );

      // Update user context
      setUserContext(context);

      // Generate follow-up questions
      const followUpQuestions = generateFollowUpQuestions(userMessage, context);

      // Create AI response message
      const aiMessage = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        context,
        followUpQuestions,
        type: 'ai_response'
      };

      // Add to messages
      setMessages(prev => [...prev, aiMessage]);

      // Update user data with new interaction
      const updatedUserData = {
        ...userData,
        chatMessages: [...(userData.chatMessages || []), {
          id: Date.now().toString(),
          content: userMessage,
          role: 'user',
          timestamp: new Date().toISOString()
        }, aiMessage]
      };

      await updateProfile(updatedUserData);

      // Generate insights if needed
      if (messages.length % 5 === 0) { // Every 5 messages
        generateUserAdvancedInsights(updatedUserData);
      }

      // Callback for parent component
      onMessageSend?.(aiMessage);
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now().toString(),
        content: "I'm here to support you. What would you like to explore today?",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'ai_response'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [userData, advancedAnalytics, messages.length, generateUserAdvancedInsights, updateProfile, onMessageSend]);

  // Initialize assistant with welcome message
  const initializeAssistant = useCallback(async () => {
    const welcomeMessage = {
      id: 'welcome',
      content: "Hello! I'm your personal AI assistant. I'm here to support your reflection journey, help you track your goals, and provide personalized insights. How can I help you today?",
      role: 'assistant',
      timestamp: new Date().toISOString(),
      type: 'welcome'
    };

    setMessages([welcomeMessage]);
    
    // Generate personalized prompts
    if (userData) {
      const prompts = generatePersonalizedPrompts({
        recentSentiment: 'neutral',
        primaryTopics: [],
        goalProgress: null,
        writingPatterns: null,
        streak: 0
      });
      setSuggestedPrompts(prompts);
    }
  }, [userData]);

  // Handle user message submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Create user message
    const userMsg = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
      mood: currentMood,
      type: 'user_message'
    };

    // Add to messages
    setMessages(prev => [...prev, userMsg]);

    // Generate AI response
    await generateResponse(userMessage);

    // Clear mood after sending
    setCurrentMood(null);
  }, [inputValue, isTyping, currentMood, generateResponse]);

  // Handle prompt selection
  const handlePromptSelect = useCallback((prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  }, []);

  // Handle follow-up question selection
  const handleFollowUpSelect = useCallback(async (question) => {
    const userMsg = {
      id: Date.now().toString(),
      content: question,
      role: 'user',
      timestamp: new Date().toISOString(),
      type: 'user_message'
    };

    setMessages(prev => [...prev, userMsg]);
    await generateResponse(question);
  }, [generateResponse]);

  // Handle mood selection
  const handleMoodSelect = useCallback((mood) => {
    setCurrentMood(mood);
    
    // Add mood tracking data
    const moodData = {
      id: Date.now().toString(),
      type: 'mood',
      value: mood,
      timestamp: new Date().toISOString(),
      metadata: { source: 'ai_assistant' }
    };

    addTrackingData(moodData);
  }, [addTrackingData]);

  // Handle mode change
  const handleModeChange = useCallback((mode) => {
    setActiveMode(mode);
    
    // Generate mode-specific prompts
    let modePrompts = [];
    switch (mode) {
      case 'coach':
        modePrompts = [
          "What's your biggest challenge right now?",
          "What goal would you like to work on today?",
          "What's one step you can take toward your goals?"
        ];
        break;
      case 'reflect':
        modePrompts = [
          "What's been on your mind lately?",
          "What have you learned about yourself recently?",
          "What patterns are you noticing in your life?"
        ];
        break;
      case 'journal':
        modePrompts = [
          "How are you feeling today?",
          "What's something you're grateful for?",
          "What would you like to explore in your journal?"
        ];
        break;
      default:
        modePrompts = suggestedPrompts;
    }
    
    setSuggestedPrompts(modePrompts);
  }, [suggestedPrompts]);

  // Get mode-specific styling
  const getModeStyles = useCallback((mode) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
    
    switch (mode) {
      case 'chat':
        return `${baseStyles} ${activeMode === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
      case 'coach':
        return `${baseStyles} ${activeMode === 'coach' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
      case 'reflect':
        return `${baseStyles} ${activeMode === 'reflect' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
      case 'journal':
        return `${baseStyles} ${activeMode === 'journal' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
      default:
        return baseStyles;
    }
  }, [activeMode]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="currentColor" opacity="0.2"/>
              <text x="12" y="14" textAnchor="middle" className="text-xs font-bold fill-current">AI</text>
              <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" opacity="0.3"/>
              <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" opacity="0.3"/>
              <line x1="4" y1="16" x2="20" y2="16" stroke="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">AI Assistant</h3>
            <p className="text-sm text-gray-500">Your personal reflection companion</p>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="flex space-x-2">
          {['chat', 'coach', 'reflect', 'journal'].map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={getModeStyles(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              
              {/* Follow-up questions */}
              {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-500">Quick questions:</p>
                  {message.followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleFollowUpSelect(question)}
                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Mood Tracker */}
      {currentMood && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            Current mood: <span className="font-medium">{currentMood}</span>
          </p>
        </div>
      )}

      {/* Suggested Prompts */}
      {suggestedPrompts.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Suggested prompts:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptSelect(prompt)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mood Selector */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">How are you feeling?</p>
        <div className="flex space-x-2">
          {['Happy', 'Sad', 'Frustrated', 'Calm', 'Anxious', 'Excited'].map((mood) => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                currentMood === mood
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * AI Coach Component
 * Specialized coaching mode for goal achievement
 */
export const AICoach = ({ userData, onGoalUpdate }) => {
  const [currentGoal, setCurrentGoal] = useState(null);
  const [coachingSession, setCoachingSession] = useState([]);
  const [sessionType, setSessionType] = useState('goal_review'); // goal_review, progress_check, obstacle_removal

  const sessionTypes = [
    { id: 'goal_review', label: 'Goal Review', icon: '🎯' },
    { id: 'progress_check', label: 'Progress Check', icon: '📊' },
    { id: 'obstacle_removal', label: 'Overcome Obstacles', icon: '🚧' }
  ];

  const startCoachingSession = useCallback((goal, type) => {
    setCurrentGoal(goal);
    setSessionType(type);
    
    const sessionStart = {
      id: 'session_start',
      content: `Let's work on your goal: "${goal.title}". What would you like to focus on today?`,
      role: 'coach',
      timestamp: new Date().toISOString()
    };
    
    setCoachingSession([sessionStart]);
  }, []);

  const generateCoachingResponse = useCallback(async (userInput) => {
    // Generate coaching-specific response
    const coachingPrompts = {
      goal_review: [
        "What's working well with this goal?",
        "What challenges are you facing?",
        "How can we break this down into smaller steps?"
      ],
      progress_check: [
        "What progress have you made so far?",
        "What's your biggest win this week?",
        "What's the next milestone you're working toward?"
      ],
      obstacle_removal: [
        "What's the biggest obstacle you're facing?",
        "What resources do you need to overcome this?",
        "What's one small step you can take today?"
      ]
    };

    const prompts = coachingPrompts[sessionType];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    return {
      id: Date.now().toString(),
      content: randomPrompt,
      role: 'coach',
      timestamp: new Date().toISOString()
    };
  }, [sessionType]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">AI Coach</h3>
        <div className="flex space-x-2">
          {sessionTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSessionType(type.id)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                sessionType === type.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Selection */}
      {!currentGoal && userData?.goals?.personalGoals && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3">Select a goal to work on:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.goals.personalGoals.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">{goal.title}</h5>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="flex space-x-2">
                  {sessionTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => startCoachingSession(goal, type.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Session */}
      {currentGoal && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Current Session</h4>
            <p className="text-sm text-green-700">
              Goal: <span className="font-medium">{currentGoal.title}</span>
            </p>
            <p className="text-sm text-green-700">
              Focus: <span className="font-medium">
                {sessionTypes.find(t => t.id === sessionType)?.label}
              </span>
            </p>
          </div>

          {/* Session Messages */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {coachingSession.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 