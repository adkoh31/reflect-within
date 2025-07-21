import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PageTransition = ({ children, isVisible }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LampTransition = ({ children, isVisible }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0,
            filter: 'brightness(0)'
          }}
          animate={{ 
            opacity: 1,
            filter: 'brightness(1)'
          }}
          exit={{ 
            opacity: 0,
            filter: 'brightness(0)'
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 