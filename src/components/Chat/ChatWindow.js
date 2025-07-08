import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';

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
  microphoneStatus
}) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  // Show voice guide on first use
  useEffect(() => {
    const hasUsedVoice = localStorage.getItem('reflectWithin_voiceUsed');
    if (!hasUsedVoice && browserSupportsSpeechRecognition) {
      setShowVoiceGuide(true);
    }
  }, [browserSupportsSpeechRecognition]);

  const handleFirstVoiceUse = () => {
    localStorage.setItem('reflectWithin_voiceUsed', 'true');
    setShowVoiceGuide(false);
    onSpeechToggle();
  };

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

  // Show AI welcome message when no messages exist
  useEffect(() => {
    if (messages.length === 0 && !showWelcomeMessage) {
      setShowWelcomeMessage(true);
    }
  }, [messages.length, showWelcomeMessage]);

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
    <div className="flex flex-col h-full">
      {/* Voice Input Guide */}
      {showVoiceGuide && (
        <motion.div 
          className="mx-4 mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary-900 mb-2">🎤 Voice Input Tips</h3>
              <ul className="text-xs text-primary-700 space-y-1 font-light">
                <li>• Speak clearly and at a normal pace</li>
                <li>• I'll listen for up to 30 seconds</li>
                <li>• I'll stop after 3 seconds of silence</li>
                <li>• Say "stop listening" to stop early</li>
              </ul>
            </div>
            <button
              onClick={() => setShowVoiceGuide(false)}
              className="ml-3 p-1 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleFirstVoiceUse}
            className="mt-3 w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-light hover:bg-primary-700 transition-colors"
          >
            Try Voice Input
          </button>
        </motion.div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {/* AI Welcome Message with Choices */}
        {showWelcomeMessage && messages.length === 0 && (
          <div className="space-y-4 flex justify-center">
            {/* AI Welcome Message */}
            <div className="max-w-md w-full">
              <div className="max-w-full px-4 py-3 rounded-2xl shadow-sm bg-muted text-foreground">
                <p className="text-sm leading-relaxed font-light mb-4 text-center">
                  {getWelcomeMessage()}
                </p>
                
                {/* Choice Cards */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-light mb-3 text-center">
                    💡 Here are some ideas to get started:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {generateContextualPrompts().map((prompt, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="w-full text-left p-3 bg-background hover:bg-accent rounded-xl transition-colors duration-200 border border-border"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-sm text-foreground font-light">{prompt}</span>
                      </motion.button>
                    ))}
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
              className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl shadow-sm ${
                message.sender === 'user'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm leading-relaxed font-light">{message.text}</p>
              <p className={`text-xs mt-2 font-light ${
                message.sender === 'user' 
                  ? 'text-background/70' 
                  : 'text-muted-foreground'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-accent px-4 py-3 rounded-xl max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-accent-foreground font-light">Reflecting...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom (Like WhatsApp) */}
      <div className="border-t border-border bg-card/95 backdrop-blur-sm p-4 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Input Field with Proper Spacing */}
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
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground font-light text-sm"
              />
            </div>
            
            {/* Voice Button - Separate and Properly Sized */}
            <button
              onClick={onSpeechToggle}
              disabled={!browserSupportsSpeechRecognition || microphoneStatus === 'requesting'}
              className="p-3 bg-muted hover:bg-accent rounded-xl transition-colors duration-200 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !browserSupportsSpeechRecognition ? 'Speech recognition not supported' : 
                microphoneStatus === 'requesting' ? 'Requesting microphone access...' :
                microphoneStatus === 'denied' ? 'Microphone access denied. Please allow access in browser settings.' :
                isListening ? 'Stop listening' : 'Click to speak - I\'ll listen for up to 30 seconds'
              }
            >
              {microphoneStatus === 'requesting' ? (
                <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : isListening ? (
                <MicOff className="w-5 h-5 text-accent-foreground" />
              ) : (
                <Mic className="w-5 h-5 text-foreground" />
              )}
            </button>
            
            {/* Send Button */}
            <button
              onClick={onSend}
              disabled={!inputText.trim() || isLoading}
              className="px-6 py-3 bg-foreground text-background rounded-xl hover:bg-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed font-light shadow-sm transition-all duration-200 min-w-[80px] text-sm"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
          
          {/* Listening Indicator */}
          {isListening && (
            <div className="mt-3 p-4 bg-accent rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-accent-foreground font-light">
                  <span className="font-medium">Listening...</span>
                </p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-sm text-accent-foreground font-light mb-2">
                {transcript || 'Start speaking...'}
              </p>
              <div className="text-xs text-accent-foreground/70 font-light">
                💡 Speak clearly and naturally. I'll stop listening after 3 seconds of silence or 30 seconds total.
              </div>
            </div>
          )}

          {/* Microphone Access Error */}
          {microphoneStatus === 'denied' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-light">
                <span className="font-medium">Microphone access denied.</span> Please allow microphone access in your browser settings to use voice input.
              </p>
            </div>
          )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Status: {microphoneStatus} | Listening: {isListening ? 'Yes' : 'No'} | Browser Support: {browserSupportsSpeechRecognition ? 'Yes' : 'No'}</p>
              {transcript && <p>Transcript: "{transcript}"</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow; 