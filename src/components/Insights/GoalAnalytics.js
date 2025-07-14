import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Brain,
  Zap,
  Focus,
  BarChart3,
  Trophy,
  Lightbulb
} from 'lucide-react';
import { useGoalAnalytics } from '../../hooks/useGoalAnalytics';

const GoalAnalytics = ({ goals, journalEntries, messages }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use the hook directly
  const {
    analyzeJournalingConsistency,
    analyzeMoodTrends,
    analyzeEnergyPatterns,
    analyzeTopicAlignment,
    generateGoalInsights,
    getGoalProgressSummary
  } = useGoalAnalytics(goals, journalEntries, messages);

  const progressSummary = getGoalProgressSummary();
  const insights = generateGoalInsights();
  const journalingAnalysis = analyzeJournalingConsistency();
  const moodAnalysis = analyzeMoodTrends();
  const energyAnalysis = analyzeEnergyPatterns();
  const topicAnalysis = analyzeTopicAlignment();

  if (!goals) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Goals Set</h3>
        <p className="text-slate-500">Set your goals in your profile to see personalized analytics</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'from-green-500 to-emerald-500';
      case 'good': return 'from-blue-500 to-cyan-500';
      case 'fair': return 'from-yellow-500 to-orange-500';
      case 'needs_improvement': return 'from-red-500 to-pink-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-slate-500" />;
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'correlation': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'suggestion': return <Info className="w-5 h-5 text-cyan-500" />;
      default: return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Goal Progress</h2>
        <p className="text-slate-600">Track your progress against your personal goals</p>
      </div>

      {/* Overall Progress Card */}
      {progressSummary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Overall Progress</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(progressSummary.overallStatus)} text-white`}>
              {progressSummary.overallStatus.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Progress</span>
              <span className="text-lg font-bold text-slate-800">{progressSummary.totalProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div 
                className={`h-3 rounded-full bg-gradient-to-r ${getStatusColor(progressSummary.overallStatus)}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressSummary.totalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progressSummary.goalsMet}</div>
              <div className="text-sm text-slate-600">Goals Met</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{progressSummary.totalGoals}</div>
              <div className="text-sm text-slate-600">Total Goals</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'insights', label: 'Insights', icon: Lightbulb },
          { id: 'details', label: 'Details', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Journaling Consistency */}
            {journalingAnalysis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <h4 className="font-semibold text-slate-800">Journaling Consistency</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Current Streak</span>
                    <span className="font-bold text-slate-800">{journalingAnalysis.currentStreak} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Entries</span>
                    <span className="font-bold text-slate-800">{journalingAnalysis.totalEntries}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="font-bold text-slate-800">{Math.round(journalingAnalysis.progressPercentage)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${journalingAnalysis.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mood Trends */}
            {moodAnalysis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <h4 className="font-semibold text-slate-800">Mental Wellness</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Average Mood</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{moodAnalysis.averageMood.toFixed(1)}/7</span>
                      {getTrendIcon(moodAnalysis.moodTrend)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Most Common</span>
                    <span className="font-bold text-slate-800 capitalize">{moodAnalysis.mostCommonMood}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="font-bold text-slate-800">{Math.round(moodAnalysis.progressPercentage)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${moodAnalysis.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Energy Patterns */}
            {energyAnalysis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <h4 className="font-semibold text-slate-800">Physical Energy</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Average Energy</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{energyAnalysis.averageEnergy.toFixed(1)}/5</span>
                      {getTrendIcon(energyAnalysis.energyTrend)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Workout Days</span>
                    <span className="font-bold text-slate-800">{energyAnalysis.workoutDays}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="font-bold text-slate-800">{Math.round(energyAnalysis.progressPercentage)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      style={{ width: `${energyAnalysis.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Topic Alignment */}
            {topicAnalysis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Focus className="w-6 h-6 text-green-500" />
                  <h4 className="font-semibold text-slate-800">Goal Alignment</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Alignment</span>
                    <span className="font-bold text-slate-800">{topicAnalysis.alignmentPercentage}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Focused On</span>
                    <span className="font-bold text-slate-800 capitalize">{topicAnalysis.mostFocusedCategory || 'None'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Relevant Entries</span>
                    <span className="font-bold text-slate-800">{topicAnalysis.totalRelevantEntries}/{topicAnalysis.totalEntries}</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${topicAnalysis.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No Insights Yet</h3>
                <p className="text-slate-500">Keep journaling to unlock personalized insights</p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1">{insight.title}</h4>
                      <p className="text-slate-600 text-sm">{insight.message}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-slate-500 capitalize">{insight.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 capitalize">{insight.priority} priority</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Goal Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Goals</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {goals.categories?.map((category, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {category.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Selected Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(goals.metrics || {}).map(([category, metrics]) => (
                      <div key={category}>
                        <h5 className="text-sm font-medium text-slate-600 capitalize mb-1">{category}</h5>
                        <div className="flex flex-wrap gap-1">
                          {metrics.map((metric, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {goals.goals && goals.goals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Personal Goals</h4>
                    <div className="space-y-2">
                      {goals.goals.map((goal, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <h5 className="font-medium text-slate-800">{goal.title}</h5>
                          <p className="text-sm text-slate-600">{goal.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalAnalytics; 