import React from 'react';
import { motion } from 'framer-motion';
import ThemeChart from './ThemeChart';
import MoodChart from './MoodChart';
import GoalAnalytics from './GoalAnalytics';
import { BarChart3 } from 'lucide-react';
import { Typography } from '../Typography/Typography';

const InsightsDashboard = ({ 
  insights, 
  isGeneratingInsights, 
  isPremium, 
  onPremiumToggle, 
  messages = [], 
  onAction,
  goals = null,
  journalEntries = {}
}) => {
  if (!isPremium) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-light text-foreground mb-2">Premium Insights Dashboard</h2>
          <p className="text-muted-foreground font-light">
            Unlock personalized insights about your fitness and mental well-being patterns
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Discover recurring themes in your reflections</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Track your mood and emotional patterns</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Visualize your personal growth journey</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Track progress against your personal goals</span>
          </div>
        </div>
        
        <button
          onClick={onPremiumToggle}
          className="w-full bg-foreground text-background py-3 px-6 rounded-xl font-light hover:bg-muted-foreground transition-colors shadow-md"
        >
          Enable Premium Features
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 pb-20">
        {/* Header */}
        <motion.div
          className="relative mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Header Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-50">Insights Dashboard</h1>
            </div>
            <Typography variant="body" color="muted" weight="normal" className="text-slate-300 text-sm sm:text-base">
              Discover patterns and trends in your reflection journey
            </Typography>
          </div>
        </motion.div>

        {/* Goal Analytics Section */}
        {goals && (
          <motion.div
            className="relative mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Goal Analytics Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-green-500/20 blur-xl opacity-50"></div>
            
            {/* Goal Analytics Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <GoalAnalytics 
                goals={goals} 
                journalEntries={journalEntries} 
                messages={messages} 
              />
            </div>
          </motion.div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Theme Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: goals ? 0.2 : 0.1 }}
          >
            <ThemeChart insights={insights} />
          </motion.div>

          {/* Mood Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: goals ? 0.3 : 0.2 }}
          >
            <MoodChart insights={insights} />
          </motion.div>
        </div>

        {/* Empty State */}
        {(!insights || Object.keys(insights).length === 0) && !goals && (
          <motion.div
            className="relative mt-6 sm:mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Empty State Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Empty State Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
            </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-50 mb-2 sm:mb-3">
                    No Insights Yet
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                    Start journaling to unlock personalized insights about your fitness journey, mood patterns, and personal growth.
            </p>
          </div>
                <button
                  onClick={() => onAction('journal')}
                  className="bg-cyan-500 text-slate-900 py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-medium hover:bg-cyan-400 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-cyan-500/50 shadow-lg shadow-cyan-500/25 text-sm sm:text-base min-h-[44px]"
                >
                  Start Journaling
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsightsDashboard; 