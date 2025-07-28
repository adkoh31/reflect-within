import React from 'react';
import { motion } from 'framer-motion';
import { Play, X, Info } from 'lucide-react';

const DemoModeIndicator = ({ isDemoMode, demoUsage, onExitDemo }) => {
  if (!isDemoMode) return null;

  const { conversations, journalEntries, limits } = demoUsage;
  const conversationProgress = (conversations / limits.conversations) * 100;
  const journalProgress = (journalEntries / limits.journalEntries) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg border border-cyan-400/30"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span className="font-semibold text-sm">Demo Mode</span>
            <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
              Sample Data
            </div>
          </div>
          <button
            onClick={onExitDemo}
            className="text-white/80 hover:text-white transition-colors p-1"
            title="Exit Demo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Usage Progress */}
          <div className="flex items-center justify-between text-xs">
            <span>AI Conversations</span>
            <span>{conversations}/{limits.conversations}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(conversationProgress, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span>Journal Entries</span>
            <span>{journalEntries}/{limits.journalEntries}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(journalProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Upgrade Prompt */}
        {(conversationProgress > 80 || journalProgress > 80) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-2 bg-white/10 rounded-lg border border-white/20"
          >
            <div className="flex items-center gap-2 text-xs">
              <Info className="w-3 h-3" />
              <span>Create an account to continue with unlimited access!</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DemoModeIndicator; 