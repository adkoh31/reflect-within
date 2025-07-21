import React from 'react';
import { motion } from 'framer-motion';

// Typing indicator with animated dots
export const TypingIndicator = ({ 
  message = "AI is thinking...",
  className = "",
  ...props 
}) => {
  return (
    <motion.div
      className={`flex items-center space-x-3 p-4 bg-slate-800/80 border border-slate-700/50 rounded-xl max-w-[85%] ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      {...props}
    >
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
      
      {/* Message */}
      <span className="text-sm text-slate-300 font-medium">
        {message}
      </span>
    </motion.div>
  );
};

// Enhanced typing indicator with different states
export const EnhancedTypingIndicator = ({ 
  state = 'thinking', // 'thinking', 'processing', 'generating', 'almost-done'
  className = "",
  ...props 
}) => {
  const getStateConfig = () => {
    switch (state) {
      case 'processing':
        return {
          message: 'Processing your reflection...',
          icon: '⚡',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20'
        };
      case 'generating':
        return {
          message: 'Generating thoughtful response...',
          icon: '💭',
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/20'
        };
      case 'almost-done':
        return {
          message: 'Almost ready...',
          icon: '✨',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20'
        };
      default:
        return {
          message: 'AI is thinking...',
          icon: '🤔',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-400/20'
        };
    }
  };

  const config = getStateConfig();

  return (
    <motion.div
      className={`flex items-center space-x-3 p-4 rounded-xl border ${config.bgColor} border-slate-700/50 max-w-[85%] ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      {...props}
    >
      {/* Icon */}
      <motion.span
        className="text-xl"
        animate={state === 'almost-done' ? {
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 0.6, repeat: state === 'almost-done' ? Infinity : 0 }}
      >
        {config.icon}
      </motion.span>
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
      
      {/* Message */}
      <span className={`text-sm font-medium ${config.color}`}>
        {config.message}
      </span>
    </motion.div>
  );
};

// Progress-based typing indicator
export const ProgressTypingIndicator = ({ 
  progress = 0, // 0-100
  message = "AI is thinking...",
  className = "",
  ...props 
}) => {
  return (
    <motion.div
      className={`p-4 bg-slate-800/80 border border-slate-700/50 rounded-xl max-w-[85%] ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      {...props}
    >
      {/* Message */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-300 font-medium">
          {message}
        </span>
        <span className="text-xs text-slate-400">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      
      {/* Animated dots */}
      <div className="flex justify-center space-x-1 mt-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Wave typing indicator
export const WaveTypingIndicator = ({ 
  message = "AI is thinking...",
  className = "",
  ...props 
}) => {
  return (
    <motion.div
      className={`flex items-center space-x-3 p-4 bg-slate-800/80 border border-slate-700/50 rounded-xl max-w-[85%] ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      {...props}
    >
      {/* Wave animation */}
      <div className="flex items-end space-x-1 h-6">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className="w-1 bg-cyan-400 rounded-full"
            animate={{
              height: [4, 20, 4],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
      
      {/* Message */}
      <span className="text-sm text-slate-300 font-medium">
        {message}
      </span>
    </motion.div>
  );
}; 