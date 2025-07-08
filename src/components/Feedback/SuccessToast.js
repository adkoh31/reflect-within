import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessToast = ({ 
  message, 
  isVisible, 
  onClose, 
  type = 'success',
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: "✅",
          bgColor: "bg-green-500",
          textColor: "text-white",
          borderColor: "border-green-600"
        };
      case 'info':
        return {
          icon: "ℹ️",
          bgColor: "bg-blue-500",
          textColor: "text-white",
          borderColor: "border-blue-600"
        };
      case 'warning':
        return {
          icon: "⚠️",
          bgColor: "bg-yellow-500",
          textColor: "text-white",
          borderColor: "border-yellow-600"
        };
      case 'saved':
        return {
          icon: "💾",
          bgColor: "bg-green-500",
          textColor: "text-white",
          borderColor: "border-green-600"
        };
      case 'sent':
        return {
          icon: "📤",
          bgColor: "bg-blue-500",
          textColor: "text-white",
          borderColor: "border-blue-600"
        };
      case 'downloaded':
        return {
          icon: "📥",
          bgColor: "bg-purple-500",
          textColor: "text-white",
          borderColor: "border-purple-600"
        };
      default:
        return {
          icon: "✅",
          bgColor: "bg-green-500",
          textColor: "text-white",
          borderColor: "border-green-600"
        };
    }
  };

  const config = getToastConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className={`${config.bgColor} ${config.textColor} rounded-lg shadow-lg border ${config.borderColor} p-4`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">{config.icon}</span>
              <p className="flex-1 text-sm font-medium">{message}</p>
              <button
                onClick={onClose}
                className="ml-3 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessToast; 