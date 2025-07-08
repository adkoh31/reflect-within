import React from 'react';

// Skeleton loading for chat messages
export const MessageSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Skeleton loading for journal entries
export const JournalEntrySkeleton = () => (
  <div className="animate-pulse bg-white rounded-xl p-4 mb-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 bg-gray-300 rounded w-24"></div>
      <div className="h-4 bg-gray-300 rounded w-16"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
  </div>
);

// Skeleton loading for insights
export const InsightsSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
      <div className="h-32 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Context-aware loading message
export const LoadingMessage = ({ context = 'general' }) => {
  const messages = {
    general: 'Loading...',
    reflection: 'Thinking about your reflection...',
    insights: 'Analyzing your patterns...',
    auth: 'Signing you in...',
    save: 'Saving your thoughts...',
    generate: 'Generating insights...',
    download: 'Preparing your journal...'
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3">
        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-600 font-medium">{messages[context] || messages.general}</span>
      </div>
    </div>
  );
};

// Progress indicator for long operations
export const ProgressIndicator = ({ progress, message, showPercentage = true }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-700">{message}</span>
      {showPercentage && (
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

// AI thinking indicator
export const AIThinkingIndicator = () => (
  <div className="flex items-start space-x-3 mb-4">
    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl px-4 py-3 max-w-xs">
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-white text-sm ml-2">Thinking...</span>
      </div>
    </div>
  </div>
);

// Full screen loading overlay
export const FullScreenLoader = ({ message = 'Loading...', showSpinner = true }) => (
  <div className="fixed inset-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center">
    <div className="text-center">
      {showSpinner && (
        <div className="mb-4">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
); 