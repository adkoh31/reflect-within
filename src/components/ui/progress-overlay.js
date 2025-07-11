import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from './loading-states';

// Progress overlay for long operations
export const ProgressOverlay = ({ 
  isVisible = false,
  progress = 0,
  title = "Processing...",
  subtitle = "Please wait while we process your request",
  showCancel = false,
  onCancel,
  className = "",
  ...props 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...props}
        >
          <motion.div
            className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 max-w-sm w-full mx-4 text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Progress Icon */}
            <motion.div
              className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
            </motion.div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-50 mb-2">
              {title}
            </h3>
            
            {/* Subtitle */}
            <p className="text-slate-300 text-sm mb-6">
              {subtitle}
            </p>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <ProgressBar progress={progress} className="mb-2" />
              <span className="text-xs text-slate-400">
                {Math.round(progress)}% complete
              </span>
            </div>
            
            {/* Cancel Button */}
            {showCancel && (
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Multi-step progress overlay
export const MultiStepProgressOverlay = ({ 
  isVisible = false,
  currentStep = 0,
  steps = [],
  onCancel,
  className = "",
  ...props 
}) => {
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const currentStepData = steps[currentStep] || {};

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...props}
        >
          <motion.div
            className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-2">
                {currentStepData.title || "Processing..."}
              </h3>
              <p className="text-slate-300 text-sm">
                {currentStepData.description || "Please wait..."}
              </p>
            </div>
            
            {/* Steps */}
            <div className="space-y-3 mb-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    index === currentStep
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : index < currentStep
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  {/* Step Icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentStep
                      ? 'bg-cyan-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-600 text-slate-300'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  
                  {/* Step Text */}
                  <span className={`text-sm font-medium ${
                    index === currentStep
                      ? 'text-cyan-400'
                      : index < currentStep
                      ? 'text-green-400'
                      : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                  
                  {/* Current Step Indicator */}
                  {index === currentStep && (
                    <motion.div
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <ProgressBar progress={progress} />
            </div>
            
            {/* Cancel Button */}
            <div className="text-center">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Upload progress overlay
export const UploadProgressOverlay = ({ 
  isVisible = false,
  progress = 0,
  fileName = "",
  fileSize = 0,
  onCancel,
  className = "",
  ...props 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...props}
        >
          <motion.div
            className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Upload Icon */}
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            {/* File Info */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-slate-50 mb-1">
                Uploading File
              </h3>
              <p className="text-slate-300 text-sm mb-1 truncate">
                {fileName}
              </p>
              <p className="text-slate-400 text-xs">
                {formatFileSize(fileSize)}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <ProgressBar progress={progress} />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{Math.round(progress)}%</span>
                <span>Uploading...</span>
              </div>
            </div>
            
            {/* Cancel Button */}
            <div className="text-center">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel Upload
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 