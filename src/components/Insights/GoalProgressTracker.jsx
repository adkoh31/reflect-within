import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, CheckCircle, Clock, Zap, Award } from 'lucide-react';

const GoalProgressTracker = ({ userData, onGoalUpdate }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newValue, setNewValue] = useState('');

  // Analyze goal progress
  const goalAnalysis = useMemo(() => {
    if (!userData?.metricGoals) {
      return { hasGoals: false, goals: [], progress: null };
    }

    const goals = [];
    const progress = {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      approachingMilestones: [],
      recentProgress: []
    };

    Object.entries(userData.metricGoals).forEach(([metricId, goalData]) => {
      if (!goalData.hasGoal) return;

      const currentValue = userData.metricValues?.[metricId];
      const goal = {
        id: metricId,
        target: goalData.target,
        current: currentValue || 0,
        timeline: goalData.timeline,
        description: goalData.description,
        progress: calculateGoalProgress(currentValue, goalData.target, metricId),
        status: determineGoalStatus(currentValue, goalData.target, metricId),
        category: getGoalCategory(metricId),
        unit: getGoalUnit(metricId)
      };

      goals.push(goal);
      progress.totalGoals++;

      if (goal.status === 'active') {
        progress.activeGoals++;
      } else if (goal.status === 'completed') {
        progress.completedGoals++;
      }

      // Check for approaching milestones
      if (goal.progress >= 80 && goal.progress < 100) {
        progress.approachingMilestones.push(goal);
      }

      // Check for recent progress
      if (goal.progress > 0) {
        progress.recentProgress.push(goal);
      }
    });

    return {
      hasGoals: goals.length > 0,
      goals,
      progress
    };
  }, [userData]);

  const calculateGoalProgress = (current, target, metricId) => {
    if (!current || !target) return 0;
    
    // For weight loss (lower is better)
    if (metricId === 'weight' && target < current) {
      const totalToLose = current - target;
      const lost = current - target;
      return Math.min((lost / totalToLose) * 100, 100);
    }
    
    // For other metrics (higher is better)
    return Math.min((current / target) * 100, 100);
  };

  const determineGoalStatus = (current, target, metricId) => {
    const progress = calculateGoalProgress(current, target, metricId);
    
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'active';
    return 'not_started';
  };

  const getGoalCategory = (metricId) => {
    const categories = {
      weight: 'weight',
      workouts: 'workouts',
      sleep: 'sleep',
      mood: 'mood',
      stress: 'stress',
      energy: 'mood',
      meditation: 'mood'
    };
    return categories[metricId] || 'general';
  };

  const getGoalUnit = (metricId) => {
    const units = {
      weight: 'lbs',
      workouts: 'sessions/week',
      sleep: 'hours/night',
      mood: 'rating',
      stress: 'rating',
      energy: 'rating',
      meditation: 'minutes/day'
    };
    return units[metricId] || 'units';
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'text-green-400';
    if (progress >= 80) return 'text-yellow-400';
    if (progress >= 50) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getGoalIcon = (category) => {
    switch (category) {
      case 'weight': return <Target className="w-5 h-5" />;
      case 'workouts': return <Zap className="w-5 h-5" />;
      case 'sleep': return <Clock className="w-5 h-5" />;
      case 'mood': return <TrendingUp className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const handleGoalUpdate = () => {
    if (!selectedGoal || !newValue.trim()) return;

    const updatedValues = {
      ...userData.metricValues,
      [selectedGoal.id]: parseFloat(newValue) || 0
    };

    onGoalUpdate(updatedValues);
    setShowUpdateModal(false);
    setSelectedGoal(null);
    setNewValue('');
  };

  if (!goalAnalysis.hasGoals) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="text-center">
          <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Goals Set</h3>
          <p className="text-white/60 text-sm">
            Set goals during onboarding to track your progress and get personalized AI support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goal Progress Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Goal Progress</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-white/60">
              {goalAnalysis.progress.activeGoals} Active
            </span>
            <span className="text-green-400">
              {goalAnalysis.progress.completedGoals} Completed
            </span>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goalAnalysis.goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    {getGoalIcon(goal.category)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{goal.description}</h4>
                    <p className="text-white/60 text-sm">
                      {goal.current} → {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getProgressColor(goal.progress)}`}>
                    {Math.round(goal.progress)}%
                  </div>
                  <div className="text-white/40 text-xs">
                    {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                <motion.div
                  className={`h-2 rounded-full ${getProgressBarColor(goal.progress)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(goal.progress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="text-white/60 text-sm">
                  {goal.timeline === 'ongoing' ? 'Ongoing' : 
                   goal.timeline === '1_month' ? '1 Month' :
                   goal.timeline === '2_months' ? '2 Months' :
                   goal.timeline === '3_months' ? '3 Months' : goal.timeline}
                </div>
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setNewValue(goal.current.toString());
                    setShowUpdateModal(true);
                  }}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                >
                  Update Progress
                </button>
              </div>

              {/* Milestone Indicators */}
              {goal.progress >= 80 && goal.progress < 100 && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">
                      Approaching milestone!
                    </span>
                  </div>
                </div>
              )}

              {goal.status === 'completed' && (
                <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      Goal achieved! 🎉
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Update Progress Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-white font-semibold mb-4">
                Update {selectedGoal.description} Progress
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Current Value
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder={`Enter current ${selectedGoal.unit}`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                      {selectedGoal.unit}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGoalUpdate}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalProgressTracker; 