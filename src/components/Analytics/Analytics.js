import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Activity,
  Loader2
} from 'lucide-react';

// Lazy load Chart.js components
const Chart = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Chart })));
const { Bar, Line, Doughnut } = lazy(() => import('react-chartjs-2'));

// Loading component for charts
const ChartLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      <span className="text-sm text-slate-400">Loading analytics...</span>
    </div>
  </div>
);

const Analytics = ({ entries = [], isPremium = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isPremium) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Premium Feature</h3>
          <p className="text-slate-400">Upgrade to premium to access detailed analytics</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <ChartLoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-slate-700">
        {['overview', 'mood', 'topics', 'writing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-cyan-500 text-slate-900'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <Suspense fallback={<ChartLoadingSpinner />}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Writing Streak</h3>
              <div className="text-3xl font-bold text-cyan-400">
                {entries.length > 0 ? Math.min(entries.length, 30) : 0}
              </div>
              <p className="text-slate-400 text-sm">days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Total Words</h3>
              <div className="text-3xl font-bold text-cyan-400">
                {entries.reduce((total, entry) => total + (entry.wordCount || 0), 0)}
              </div>
              <p className="text-slate-400 text-sm">words written</p>
            </motion.div>
          </div>
        )}

        {activeTab === 'mood' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Mood Tracking</h3>
            <div className="text-center text-slate-400">
              Mood tracking coming soon...
            </div>
          </motion.div>
        )}

        {activeTab === 'topics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Popular Topics</h3>
            <div className="text-center text-slate-400">
              Topic analysis coming soon...
            </div>
          </motion.div>
        )}

        {activeTab === 'writing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Writing Patterns</h3>
            <div className="text-center text-slate-400">
              Writing pattern analysis coming soon...
            </div>
          </motion.div>
        )}
      </Suspense>
    </div>
  );
};

export default Analytics; 