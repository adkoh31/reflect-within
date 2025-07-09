import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send } from 'lucide-react';

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

  // Generate contextual AI prompts based on user context
  const generateContextualPrompts = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    let basePrompts = [];
    
    // Time-based prompts
    if (timeOfDay === 'morning') {
      basePrompts.push("How do you want to approach today?");
      basePrompts.push("What's one thing you're looking forward to?");
      basePrompts.push("What's your main focus for today?");
    } else if (timeOfDay === 'evening') {
      basePrompts.push("What's one thing you learned about yourself today?");
      basePrompts.push("How are you feeling about your day?");
      basePrompts.push("What would you like to reflect on from today?");
    } else {
      basePrompts.push("How are you feeling right now?");
      basePrompts.push("What's on your mind?");
      basePrompts.push("What would you like to explore or work through?");
    }

    // Streak-based prompts
    if (streak > 0) {
      basePrompts.push(`You're on a ${streak}-day reflection streak! What's been working well for you?`);
    }

    // Workout/fitness focused prompts (since this is a fitness app)
    basePrompts.push("How did your recent workout feel?");
    basePrompts.push("What's challenging you in your fitness journey?");

    // Always include a free-form option
    basePrompts.push("Or tell me anything on your mind...");

    return basePrompts.slice(0, 4); // Limit to 4 prompts
  };

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
    
    if (streak > 0) {
      greeting += ` I see you're on a ${streak}-day reflection streak - that's wonderful!`;
    }
    
    greeting += " What would you like to reflect on today?";
    
    return greeting;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Chat Messages Area - Full Width */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                        <span className="mr-1">🌟</span>
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
                      💡 Here are some ideas to get started:
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {generateContextualPrompts().map((prompt, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          className="w-full text-left p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors duration-200 border border-slate-600/50 hover:border-cyan-500/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
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
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' 
                  ? 'text-slate-900/70' 
                  : 'text-slate-400'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-3 rounded-xl max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-slate-300">Reflecting...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Full Width with Glow */}
      <div className="px-4 pb-20">
        <div className="relative">
          {/* Input Glow Effect */}
          <div className="absolute -inset-1 rounded-2xl bg-cyan-500/30 blur-xl opacity-60"></div>
          
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
                  placeholder="Share your thoughts, feelings, or experiences..."
                  className="w-full px-4 py-3 bg-transparent border-none outline-none text-slate-200 placeholder-slate-400 font-light text-sm"
                />
              </div>
              
              {/* Voice Button */}
              <button
                onClick={onSpeechToggle}
                disabled={!browserSupportsSpeechRecognition || microphoneStatus === 'requesting'}
                className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors duration-200 border border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !browserSupportsSpeechRecognition ? 'Speech recognition not supported' : 
                  microphoneStatus === 'requesting' ? 'Requesting microphone access...' :
                  microphoneStatus === 'denied' ? 'Microphone access denied. Please allow access in browser settings.' :
                  isListening ? 'Stop listening' : 'Click to speak - I\'ll listen for up to 30 seconds'
                }
              >
                {microphoneStatus === 'requesting' ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : isListening ? (
                  <MicOff className="w-5 h-5 text-red-400" />
                ) : (
                  <Mic className="w-5 h-5 text-slate-300" />
                )}
              </button>
              
              {/* Send Button */}
              <button
                onClick={onSend}
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Listening Indicator */}
            {isListening && (
              <div className="mt-3 p-4 bg-slate-800/80 rounded-xl border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-200 font-medium">
                    Listening...
                  </p>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  {transcript || 'Start speaking...'}
                </p>
                <div className="text-xs text-slate-400">
                  💡 Speak clearly and naturally. I'll stop listening after 3 seconds of silence or 30 seconds total.
                </div>
              </div>
            )}

            {/* Microphone Access Error */}
            {microphoneStatus === 'denied' && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-xl">
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