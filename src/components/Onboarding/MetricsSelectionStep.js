import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Activity, Heart, Brain, Target, Clock } from 'lucide-react';

const MetricsSelectionStep = ({ onDataUpdate, user, initialData = {} }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(initialData.selectedMetrics || {});

  const metricsByCategory = {
    physical: [
      { id: 'weight', label: 'Weight', icon: Scale, description: 'Track your body weight' },
      { id: 'workouts', label: 'Workouts', icon: Activity, description: 'Log your exercise sessions' },
      { id: 'sleep', label: 'Sleep', icon: Clock, description: 'Monitor your sleep quality' },
      { id: 'nutrition', label: 'Nutrition', icon: Heart, description: 'Track your eating habits' }
    ],
    mental: [
      { id: 'mood', label: 'Mood', icon: Heart, description: 'Track your daily mood' },
      { id: 'stress', label: 'Stress', icon: Brain, description: 'Monitor stress levels' },
      { id: 'energy', label: 'Energy', icon: Activity, description: 'Track your energy levels' },
      { id: 'meditation', label: 'Meditation', icon: Brain, description: 'Log mindfulness practice' }
    ],
    growth: [
      { id: 'goals', label: 'Goals', icon: Target, description: 'Track progress toward goals' },
      { id: 'habits', label: 'Habits', icon: Clock, description: 'Monitor daily habits' },
      { id: 'learning', label: 'Learning', icon: Brain, description: 'Track new skills/knowledge' },
      { id: 'productivity', label: 'Productivity', icon: Activity, description: 'Monitor daily productivity' }
    ],
    lifestyle: [
      { id: 'routine', label: 'Routine', icon: Clock, description: 'Track daily routines' },
      { id: 'social', label: 'Social', icon: Heart, description: 'Monitor social interactions' },
      { id: 'creative', label: 'Creative', icon: Brain, description: 'Track creative activities' },
      { id: 'balance', label: 'Balance', icon: Scale, description: 'Monitor work-life balance' }
    ]
  };

  // Get selected focus areas from initial data
  const selectedFocusAreas = initialData.focusAreas || [];

  // Only show metrics for selected focus areas
  const relevantMetrics = Object.entries(metricsByCategory).filter(([category]) => 
    selectedFocusAreas.includes(category)
  );

  const handleMetricToggle = (category, metricId) => {
    const newSelectedMetrics = {
      ...selectedMetrics,
      [category]: selectedMetrics[category] 
        ? selectedMetrics[category].includes(metricId)
          ? selectedMetrics[category].filter(id => id !== metricId)
          : [...selectedMetrics[category], metricId]
        : [metricId]
    };
    
    setSelectedMetrics(newSelectedMetrics);
    
    // Update parent form data
    onDataUpdate({ selectedMetrics: newSelectedMetrics });
  };

  const getCategoryTitle = (category) => {
    const titles = {
      physical: 'Physical Health',
      mental: 'Mental Wellness',
      growth: 'Personal Growth',
      lifestyle: 'Lifestyle & Habits'
    };
    return titles[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      physical: Activity,
      mental: Brain,
      growth: Target,
      lifestyle: Clock
    };
    return icons[category] || Activity;
  };

  const getCategoryColor = (category) => {
    const colors = {
      physical: 'from-blue-500 to-cyan-500',
      mental: 'from-purple-500 to-pink-500',
      growth: 'from-green-500 to-emerald-500',
      lifestyle: 'from-orange-500 to-red-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const totalSelected = Object.values(selectedMetrics).flat().length;

  // If no focus areas selected, show a message
  if (selectedFocusAreas.length === 0) {
    return (
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Focus Areas Selected</h3>
            <p className="text-white/60 text-sm">
              Please go back and select at least one focus area to see relevant metrics.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Contextual Header */}
        <div className="mb-6">
          <p className="text-white/70 text-sm">
            Based on your focus areas, here are the metrics you can track:
          </p>
        </div>

        {/* Metrics by Category */}
        <div className="space-y-6 max-w-3xl mx-auto mb-8">
          {relevantMetrics.map(([category, metrics]) => {
            const Icon = getCategoryIcon(category);
            const categorySelected = selectedMetrics[category] || [];
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{getCategoryTitle(category)}</h3>
                    <p className="text-white/60 text-sm">
                      {categorySelected.length} of {metrics.length} selected
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {metrics.map((metric) => {
                    const MetricIcon = metric.icon;
                    const isSelected = categorySelected.includes(metric.id);
                    
                    return (
                      <motion.button
                        key={metric.id}
                        onClick={() => handleMetricToggle(category, metric.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400/10'
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400'
                            : 'border-white/40'
                        }`}>
                          {isSelected && (
                            <motion.svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </motion.svg>
                          )}
                        </div>

                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <MetricIcon className="w-4 h-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{metric.label}</div>
                          <div className="text-white/60 text-sm">{metric.description}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Helper Text */}
        <p className="text-white/50 text-sm mb-6">
          {totalSelected === 0 
            ? "Select at least one metric to continue"
            : `${totalSelected} metric${totalSelected !== 1 ? 's' : ''} selected`
          }
        </p>
      </motion.div>
    </div>
  );
};

export default MetricsSelectionStep; 