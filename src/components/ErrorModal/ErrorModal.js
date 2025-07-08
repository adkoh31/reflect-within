import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorModal = ({ 
  error, 
  isOpen, 
  onClose, 
  onRetry, 
  onAction 
}) => {
  if (!error) return null;

  const getErrorDetails = (error) => {
    // Categorize errors for better user experience
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      return {
        title: "API Key Required",
        message: "Your OpenAI API key is missing or invalid. This is needed for AI conversations.",
        icon: "🔑",
        severity: "warning",
        actions: [
          { label: "Add API Key", action: "setup" },
          { label: "Learn More", action: "help" }
        ],
        helpText: "You can get a free API key from OpenAI.com. Add it to your environment variables or settings."
      };
    }
    
    if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('connection')) {
      return {
        title: "Connection Issue",
        message: "Unable to connect to our services. Please check your internet connection.",
        icon: "🌐",
        severity: "error",
        actions: [
          { label: "Try Again", action: "retry" },
          { label: "Check Connection", action: "network" }
        ],
        helpText: "Make sure you have a stable internet connection and try again."
      };
    }
    
    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return {
        title: "Rate Limit Reached",
        message: "You've reached the limit for AI requests. Please wait a moment before trying again.",
        icon: "⏱️",
        severity: "warning",
        actions: [
          { label: "Wait & Retry", action: "retry" },
          { label: "Upgrade Plan", action: "upgrade" }
        ],
        helpText: "Free API keys have usage limits. Consider upgrading for unlimited access."
      };
    }
    
    if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
      return {
        title: "Authentication Error",
        message: "There was an issue with your account authentication.",
        icon: "🔐",
        severity: "error",
        actions: [
          { label: "Sign In Again", action: "auth" },
          { label: "Contact Support", action: "support" }
        ],
        helpText: "Please try signing out and back in, or contact support if the issue persists."
      };
    }
    
    if (error.message?.includes('storage') || error.message?.includes('localStorage')) {
      return {
        title: "Storage Issue",
        message: "Unable to save your data locally. Your browser may have storage restrictions.",
        icon: "💾",
        severity: "warning",
        actions: [
          { label: "Clear Cache", action: "clear" },
          { label: "Try Again", action: "retry" }
        ],
        helpText: "Try clearing your browser cache or using a different browser."
      };
    }
    
    // Default error
    return {
      title: "Something went wrong",
      message: error.message || "An unexpected error occurred. Please try again.",
      icon: "❌",
      severity: "error",
      actions: [
        { label: "Try Again", action: "retry" },
        { label: "Report Issue", action: "report" }
      ],
      helpText: "If this problem continues, please report it to our support team."
    };
  };

  const errorDetails = getErrorDetails(error);

  const handleAction = (action) => {
    switch (action) {
      case 'retry':
        if (onRetry) onRetry();
        break;
      case 'setup':
        // Could open settings modal or redirect to setup
        window.open('https://platform.openai.com/api-keys', '_blank');
        break;
      case 'help':
        // Could show help modal or redirect to docs
        window.open('https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key', '_blank');
        break;
      case 'network':
        // Could run network diagnostic
        window.open('https://www.speedtest.net/', '_blank');
        break;
      case 'upgrade':
        // Could open upgrade modal
        console.log('Open upgrade modal');
        break;
      case 'auth':
        // Could trigger re-authentication
        if (onAction) onAction('auth');
        break;
      case 'support':
        // Could open support contact
        window.open('mailto:support@reflectwithin.com', '_blank');
        break;
      case 'clear':
        // Could clear localStorage
        localStorage.clear();
        window.location.reload();
        break;
      case 'report':
        // Could open bug report form
        window.open('https://github.com/your-repo/issues', '_blank');
        break;
      default:
        if (onAction) onAction(action);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className={`text-3xl mr-3 ${
                errorDetails.severity === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {errorDetails.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {errorDetails.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {errorDetails.severity === 'error' ? 'Error' : 'Warning'}
                </p>
              </div>
            </div>
            
            {/* Message */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {errorDetails.message}
            </p>
            
            {/* Help Text */}
            {errorDetails.helpText && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  💡 {errorDetails.helpText}
                </p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              {errorDetails.actions.map((action, index) => (
                <motion.button
                  key={action.action}
                  onClick={() => handleAction(action.action)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    index === 0 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {action.label}
                </motion.button>
              ))}
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal; 