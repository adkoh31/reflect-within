import React from 'react';
import { motion } from 'framer-motion';

// AI Thinking Indicator
export const AIThinkingIndicator = () => (
  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
    <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700/50 px-4 py-3 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-slate-300 font-medium">AI is thinking...</span>
      </div>
    </div>
  </div>
);

// Skeleton Loading Component
export const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-slate-700/50 rounded ${className}`}
    {...props}
  />
);

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  </div>
);

// Message Skeleton
export const MessageSkeleton = ({ isUser = false }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] px-4 py-3 rounded-2xl ${
      isUser ? 'bg-slate-700/50' : 'bg-slate-800/50'
    }`}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton = () => (
  <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
    <Skeleton className="h-6 w-1/2 mb-4" />
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);

// Home Tab Skeleton
export const HomeTabSkeleton = () => (
  <div className="bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      <div className="mt-6 sm:mt-8">
        <CardSkeleton />
      </div>
    </div>
  </div>
);

// Insights Skeleton
export const InsightsSkeleton = () => (
  <div className="bg-slate-950 min-h-screen">
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  </div>
);

// Journal Skeleton
export const JournalSkeleton = () => (
  <div className="bg-slate-950 min-h-screen">
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-20">
      <CardSkeleton />
      <div className="mt-4 sm:mt-6">
        <CardSkeleton />
      </div>
      <div className="mt-4 sm:mt-6">
        <CardSkeleton />
      </div>
    </div>
  </div>
);

// Pulse Animation
export const Pulse = ({ children, className = "" }) => (
  <motion.div
    className={className}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    {children}
  </motion.div>
);

// Shimmer Effect
export const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
); 

// Progress Bar for Long Operations
export const ProgressBar = ({ progress = 0, className = "", ...props }) => (
  <div className={`w-full bg-slate-700/50 rounded-full h-2 ${className}`} {...props}>
    <motion.div
      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
  </div>
);

// Content Shimmer Effect
export const ContentShimmer = ({ className = "", ...props }) => (
  <div className={`relative overflow-hidden ${className}`} {...props}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="h-full bg-slate-700/50 rounded" />
  </div>
);

// Pulsing Button State
export const PulsingButton = ({ children, isActive = false, className = "", ...props }) => (
  <motion.button
    className={`relative ${className}`}
    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
    {...props}
  >
    {children}
    {isActive && (
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-400"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </motion.button>
); 