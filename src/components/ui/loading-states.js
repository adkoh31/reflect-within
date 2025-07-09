import React from 'react';
import { motion } from 'framer-motion';

export const PageLoadingState = () => (
  <div className="flex items-center justify-center">
    <motion.div
      className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export const AIThinkingIndicator = () => (
  <div className="flex items-center space-x-2 text-sm text-gray-500">
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
    />
    <span>AI is thinking...</span>
  </div>
); 