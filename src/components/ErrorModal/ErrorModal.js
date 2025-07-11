import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getErrorInfo, isRetryableError } from '../../utils/errorHandler';
import { RefreshCw, AlertCircle, Wifi, WifiOff, Settings, HelpCircle } from 'lucide-react';

const ErrorModal = ({ 
  error, 
  isOpen, 
  onClose, 
  onRetry, 
  onAction 
}) => {
  if (!isOpen || !error) return null;

  const errorInfo = getErrorInfo(error);

  const handleAction = () => {
    if (onAction) {
      onAction(errorInfo.type);
    } else if (onRetry && errorInfo.isRetryable) {
      onRetry();
    }
    onClose();
  };

  const getIcon = (type) => {
    const iconClass = "w-8 h-8";
    switch (type) {
      case 'NETWORK':
        return <Wifi className={`${iconClass} text-orange-500`} />;
      case 'OFFLINE':
        return <WifiOff className={`${iconClass} text-blue-500`} />;
      case 'AUTHENTICATION':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'SERVER':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'VALIDATION':
        return <AlertCircle className={`${iconClass} text-yellow-500`} />;
      case 'STORAGE':
        return <Settings className={`${iconClass} text-yellow-500`} />;
      case 'AI_SERVICE':
        return <HelpCircle className={`${iconClass} text-purple-500`} />;
      default:
        return <AlertCircle className={`${iconClass} text-red-500`} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/10';
      default:
        return 'border-slate-500/20 bg-slate-500/10';
    }
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            {/* Header */}
              <div className="flex items-center justify-center mb-4">
                <div className={`p-3 rounded-xl border ${getSeverityColor(errorInfo.severity)}`}>
                  {getIcon(errorInfo.type)}
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  {errorInfo.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {errorInfo.message}
                </p>
            </div>
            
              {/* Suggested Actions */}
              {errorInfo.suggestedActions && errorInfo.suggestedActions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">What you can try:</h4>
                  <ul className="space-y-1">
                    {errorInfo.suggestedActions.map((action, index) => (
                      <li key={index} className="text-xs text-slate-500 flex items-center">
                        <span className="w-1 h-1 bg-slate-500 rounded-full mr-2" />
                        {action}
                      </li>
                    ))}
                  </ul>
              </div>
            )}
            
              {/* Action Buttons */}
              <div className="space-y-3">
                {errorInfo.isRetryable && onRetry && (
                  <button
                    onClick={handleAction}
                    className="w-full bg-cyan-500 text-slate-900 py-3 px-4 rounded-xl font-medium hover:bg-cyan-400 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{errorInfo.action}</span>
                  </button>
                )}
                
                {!errorInfo.isRetryable && (
                  <button
                    onClick={handleAction}
                    className="w-full bg-slate-800/80 text-slate-300 py-3 px-4 rounded-xl font-medium hover:bg-slate-700/80 transition-all duration-200"
                  >
                    {errorInfo.action}
                  </button>
                )}
              
              <button
                onClick={onClose}
                  className="w-full px-4 py-3 text-slate-400 hover:text-slate-300 font-medium transition-colors"
              >
                Close
              </button>
              </div>

              {/* Technical details for debugging (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400 font-mono">
                    <div><strong>Type:</strong> {errorInfo.type}</div>
                    <div><strong>Message:</strong> {errorInfo.technicalMessage}</div>
                    <div><strong>Time:</strong> {new Date(errorInfo.timestamp).toLocaleString()}</div>
                    <div><strong>Retryable:</strong> {errorInfo.isRetryable ? 'Yes' : 'No'}</div>
                  </div>
                </details>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal; 