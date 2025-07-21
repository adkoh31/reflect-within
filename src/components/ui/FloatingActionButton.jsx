import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, PenTool, X } from 'lucide-react';
import { GestureButton } from './gesture-feedback';

const FloatingActionButton = ({ 
  onPrimaryAction, 
  onSecondaryAction, 
  onTertiaryAction,
  primaryIcon = <Plus />,
  secondaryIcon = <Mic />,
  tertiaryIcon = <PenTool />,
  primaryLabel = "New",
  secondaryLabel = "Voice",
  tertiaryLabel = "Write",
  className = "",
  position = "bottom-right"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePrimaryClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
    onPrimaryAction?.();
  };

  const handleSecondaryClick = () => {
    setIsExpanded(false);
    onSecondaryAction?.();
  };

  const handleTertiaryClick = () => {
    setIsExpanded(false);
    onTertiaryAction?.();
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'center': 'bottom-1/2 right-6 transform translate-y-1/2'
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} safe-area-inset-bottom`}>
      <AnimatePresence>
        {/* Secondary Action */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="mb-3"
          >
            <GestureButton
              onClick={handleSecondaryClick}
              hapticType="light"
              className="w-14 h-14 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
              style={{ minWidth: '56px', minHeight: '56px' }}
            >
              {secondaryIcon}
            </GestureButton>
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {secondaryLabel}
            </div>
          </motion.div>
        )}

        {/* Tertiary Action */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="mb-3"
          >
            <GestureButton
              onClick={handleTertiaryClick}
              hapticType="light"
              className="w-14 h-14 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
              style={{ minWidth: '56px', minHeight: '56px' }}
            >
              {tertiaryIcon}
            </GestureButton>
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {tertiaryLabel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Action */}
      <GestureButton
        onClick={handlePrimaryClick}
        hapticType="medium"
        className={`w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full shadow-xl flex items-center justify-center touch-manipulation transition-all duration-200 ${className}`}
        style={{ minWidth: '64px', minHeight: '64px' }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? <X size={24} /> : primaryIcon}
        </motion.div>
      </GestureButton>
    </div>
  );
};

export default FloatingActionButton; 