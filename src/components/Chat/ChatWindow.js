import React, { useState, useEffect, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

// Enhanced UI components
import { GestureButton } from '../ui/gesture-feedback';
import { VoiceVisualizer, VoiceStatusIndicator } from '../ui/voice-visualizer';
import { EnhancedTypingIndicator } from '../ui/typing-indicator';
import { PulsingButton } from '../ui/loading-states';

const ChatWindow = memo(({ 
  messages,
  inputText,
  onInputChange,
  onSend,
  onSendPrompt,
  onSpeechToggle,
  isListening,
  isLoading,
  browserSupportsSpeechRecognition,
  transcript,
  inputRef,
  chatEndRef,
  handleKeyPress,
  user,
  streak = 0,
  microphoneStatus,
  isPremium = false
}) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Show AI welcome message when no messages exist
  useEffect(() => {
    if (messages.length === 0 && !showWelcomeMessage) {
      setShowWelcomeMessage(true);
    }
  }, [messages.length, showWelcomeMessage]);

  // Memoize contextual prompts to prevent infinite re-rendering
  const contextualPrompts = useMemo(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    let basePrompts = [];
    
    // Time-based prompts with emotional intelligence
    if (timeOfDay === 'morning') {
      basePrompts.push("I want to set intentions for today");
      basePrompts.push("I'd like to share what I'm looking forward to");
      basePrompts.push("I want to discuss my main focus for today");
      basePrompts.push("I want to check in with how I'm feeling this morning");
    } else if (timeOfDay === 'evening') {
      basePrompts.push("I want to reflect on what I learned today");
      basePrompts.push("I'd like to share how my day went");
      basePrompts.push("I want to process my thoughts from today");
      basePrompts.push("I want to unwind and reflect on my day");
    } else {
      basePrompts.push("I want to check in with how I'm feeling");
      basePrompts.push("I'd like to share what's on my mind");
      basePrompts.push("I want to explore something I'm working through");
      basePrompts.push("I want to take a moment to reflect");
    }

    // Streak-based prompts with encouragement
    if (streak > 0) {
      if (streak >= 7) {
        basePrompts.push(`I want to celebrate my ${streak}-day reflection streak and what's working`);
      } else if (streak >= 3) {
        basePrompts.push(`I want to reflect on my ${streak}-day streak and build momentum`);
      } else {
        basePrompts.push(`I want to reflect on my ${streak}-day streak and what's working`);
      }
    }

    // Workout/fitness focused prompts with emotional context
    basePrompts.push("I want to discuss my recent workout experience");
    basePrompts.push("I'd like to talk about challenges in my fitness journey");
    basePrompts.push("I want to share how movement is affecting my mental state");
    basePrompts.push("I want to explore my relationship with exercise and recovery");

    // Emotional well-being prompts
    basePrompts.push("I want to process some emotions I'm working through");
    basePrompts.push("I'd like to explore what's causing me stress or anxiety");
    basePrompts.push("I want to celebrate a win or achievement");
    basePrompts.push("I want to work through a challenge I'm facing");

    // Personal development prompts
    basePrompts.push("I want to reflect on my personal growth and goals");
    basePrompts.push("I'd like to explore what I'm learning about myself");
    basePrompts.push("I want to discuss my relationships and connections");
    basePrompts.push("I want to reflect on my values and what matters to me");

    // Always include a free-form option
    basePrompts.push("I want to share something else on my mind...");

    // Shuffle and limit to 4 prompts for better variety
    // Use a stable seed based on time of day and streak to prevent infinite re-renders
    const seed = hour + (streak * 10);
    const shuffled = [...basePrompts].sort((a, b) => {
      const hashA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hashA + seed) % basePrompts.length - (hashB + seed) % basePrompts.length;
    });
    return shuffled.slice(0, 4);
  }, [streak]); // Only recalculate when streak changes

  const handlePromptClick = (prompt) => {
    // Send the prompt immediately
    if (onSendPrompt) {
      onSendPrompt(prompt);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const userName = user?.name?.split(' ')[0] || 'there';
    
    let greeting = `Good ${timeOfDay}, ${userName}!`;
    
    // Add streak-based encouragement
    if (streak > 0) {
      if (streak >= 7) {
        greeting += ` I see you're on an amazing ${streak}-day reflection streak - that's incredible consistency!`;
      } else if (streak >= 3) {
        greeting += ` I see you're building momentum with a ${streak}-day reflection streak - keep it up!`;
      } else {
        greeting += ` I see you're on a ${streak}-day reflection streak - that's wonderful!`;
      }
    }
    
    // Add time-appropriate encouragement
    if (timeOfDay === 'morning') {
      greeting += " How are you feeling as you start your day?";
    } else if (timeOfDay === 'evening') {
      greeting += " How has your day been?";
    } else {
      greeting += " How are you doing today?";
    }
    
    return greeting;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950" role="main" aria-label="AI Chat Interface">
      {/* Chat Messages Area - Full Width */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* AI Welcome Message with Choices */}
        {showWelcomeMessage && messages.length === 0 && (
          <div className="flex justify-center">
            <div className="max-w-2xl w-full">
              <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
                
                <div className="relative z-10">
                  {/* Premium Indicator */}
                  {isPremium && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                        <span className="mr-1" aria-hidden="true">🌟</span>
                        Premium Coach Mode
                      </div>
                    </div>
                  )}
                  
                  <p className="text-slate-50 text-center mb-6 leading-relaxed">
                    {getWelcomeMessage()}
                  </p>
                  
                  {/* Choice Cards */}
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 text-center mb-4">
                      <span aria-hidden="true">💡</span> Here are some ideas to get started:
                    </p>
                    <div className="grid grid-cols-1 gap-3" role="group" aria-label="Quick start options">
                      {contextualPrompts.map((prompt, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          className="w-full text-left p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors duration-200 border border-slate-600/50 hover:border-cyan-500/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={`Start with: ${prompt}`}
                        >
                          <span className="text-sm text-slate-200">{prompt}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            role="article"
            aria-label={`${message.sender === 'user' ? 'Your message' : 'AI response'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-[#048A81] text-white'
                  : 'bg-slate-800/80 border border-slate-700/50 text-white'
              }`}
            >
              <p className="text-sm leading-relaxed text-white">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' 
                  ? 'text-white/80' 
                  : 'text-white/70'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start" role="status" aria-live="polite">
            <EnhancedTypingIndicator 
              state="generating"
              message="Crafting a thoughtful response..."
            />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Full Width with Glow */}
      <div className="px-4 pb-20" role="form" aria-label="Message input">
        <div className="relative">
          {/* Input Glow Effect */}
          <div className="absolute -inset-1 rounded-2xl bg-cyan-500/30 blur-xl opacity-60" aria-hidden="true"></div>
          
          {/* Input Container */}
          <div className="relative bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              {/* Input Field */}
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={onInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your reflection..."
                  className="w-full px-4 py-3 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 bg-slate-800/50 text-white placeholder-slate-400 font-normal text-sm sm:text-base min-h-[44px]"
                  aria-label="Type your reflection"
                  aria-describedby="input-help"
                />
              </div>
              
              {/* Voice Input Button */}
              <GestureButton
                onPress={onSpeechToggle}
                hapticType="medium"
                disabled={!browserSupportsSpeechRecognition || microphoneStatus === 'requesting'}
                className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={
                  !browserSupportsSpeechRecognition ? 'Speech recognition not supported' : 
                  microphoneStatus === 'requesting' ? 'Requesting microphone access...' :
                  microphoneStatus === 'denied' ? 'Microphone access denied. Please allow access in browser settings.' :
                  isListening ? 'Stop listening' : 'Click to speak - I\'ll listen for up to 30 seconds'
                }
              >
                {microphoneStatus === 'requesting' ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                ) : isListening ? (
                  <MicOff className="w-5 h-5 text-slate-300" aria-hidden="true" />
                ) : (
                  <Mic className="w-5 h-5 text-slate-300" aria-hidden="true" />
                )}
              </GestureButton>
              
              {/* Send Button */}
              <PulsingButton
                onClick={onSend}
                isActive={isLoading}
                disabled={!inputText.trim() || isLoading}
                className="px-6 py-3 bg-cyan-500 text-slate-900 rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all duration-200 min-w-[80px] text-sm sm:text-base min-h-[44px]"
                aria-label="Send message"
              >
                {isLoading ? '...' : 'Send'}
              </PulsingButton>
            </div>
            
            {/* Input Help Text */}
            <div id="input-help" className="sr-only">
              Press Enter to send your message, or use the voice button to speak your reflection.
            </div>
            
            {/* Enhanced Listening Indicator */}
            {isListening && (
              <div className="mt-3 p-4 bg-slate-800/80 rounded-xl border border-slate-600/50" role="status" aria-live="polite">
                <div className="flex items-center justify-between mb-3">
                  <VoiceStatusIndicator status="listening" />
                </div>
                
                {/* Voice Visualizer */}
                <div className="mb-3">
                  <VoiceVisualizer isListening={isListening} barCount={15} />
                </div>
                
                <p className="text-sm text-slate-300 mb-2">
                  {transcript || 'Start speaking...'}
                </p>
                <div className="text-xs text-slate-400">
                  <span aria-hidden="true">💡</span> Speak clearly and naturally. I'll stop listening after 3 seconds of silence or 30 seconds total.
                </div>
              </div>
            )}

            {/* Microphone Access Error */}
            {microphoneStatus === 'denied' && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-xl" role="alert">
                <p className="text-sm text-red-300">
                  <span className="font-medium">Microphone access denied.</span> Please allow microphone access in your browser settings to use voice input.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow; 