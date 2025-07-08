import React from 'react';
import { motion } from 'framer-motion';

const FloatingActionButton = ({ 
  onToggle, 
  isListening,
  className = "" 
}) => {
  const getIcon = () => {
    if (isListening) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    );
  };

  const getLabel = () => {
    if (isListening) return "Stop recording";
    return "Start voice input";
  };

  return (
    <motion.button
      onClick={onToggle}
      className={`fixed bottom-20 right-4 z-40 w-14 h-14 bg-foreground hover:bg-muted-foreground text-background rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 safe-area-inset-bottom ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={getLabel()}
      title={getLabel()}
    >
      <motion.div
        animate={isListening ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
      >
        {getIcon()}
      </motion.div>
      
      {/* Pulse ring when listening */}
      {isListening && (
        <motion.div
          className="absolute inset-0 border-2 border-foreground rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default FloatingActionButton; 