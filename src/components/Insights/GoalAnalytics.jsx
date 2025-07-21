import { useState, useEffect, useMemo } from 'react';
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
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { useGoalAnalytics } from '../../hooks/useGoalAnalytics';

const GoalAnalytics = ({ goals, journalEntries, messages }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use the hook directly
  const analytics = useGoalAnalytics(goals, journalEntries);

  // Calculate progress summary from analytics
  const totalGoals = Object.keys(analytics.goalProgress).length || 1;
  const goalsMet = Object.values(analytics.goalProgress).filter(g => g.progress >= 100).length;
  const activeGoals = Object.values(analytics.goalProgress).filter(g => g.progress > 0 && g.progress < 100).length;
  
  const progressSummary = {
    totalProgress: totalGoals > 0 ? Math.round((goalsMet / totalGoals) * 100) : 0,
    goalsMet,
    totalGoals,
    activeGoals,
    completionRate: totalGoals > 0 ? Math.round((goalsMet / totalGoals) * 100) : 0
  };

  // Use insights from analytics
  const insights = analytics.insights || [];

  // Calculate journaling analysis
  const totalEntries = journalEntries ? Object.values(journalEntries).flat().length : 0;
  const currentStreak = analytics.journalingFrequency;
  
  // Calculate consistency score (entries per week)
  const entriesArray = journalEntries ? Object.values(journalEntries).flat() : [];
  const recentEntries = entriesArray.slice(-7); // Last 7 entries
  const consistencyScore = Math.min((recentEntries.length / 7) * 100, 100);
  
  const journalingAnalysis = {
    currentStreak,
    totalEntries,
    consistencyScore,
    averageEntriesPerWeek: totalEntries > 0 ? Math.round(totalEntries / Math.max(currentStreak / 7, 1)) : 0,
    isConsistent: consistencyScore >= 70
  };

  // Calculate mood analysis from actual data
  const entriesWithMood = entriesArray.filter(entry => entry.mood || entry.energy);
  
  let moodAnalysis = {
    averageMood: 7,
    trend: 'stable',
    bestDay: 'Today',
    hasData: entriesWithMood.length > 0
  };
  
  if (entriesWithMood.length > 0) {
    // Calculate average mood from entries
    const moods = entriesWithMood.map(entry => entry.mood || entry.energy || 5);
    const averageMood = Math.round(moods.reduce((sum, mood) => sum + mood, 0) / moods.length);
    
    // Determine trend (simplified)
    const recentMoods = moods.slice(-3);
    const olderMoods = moods.slice(-6, -3);
    const recentAvg = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
    const olderAvg = olderMoods.length > 0 ? olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length : recentAvg;
    
    let trend = 'stable';
    if (recentAvg > olderAvg + 1) trend = 'improving';
    else if (recentAvg < olderAvg - 1) trend = 'declining';
    
    // Find best day
    const bestEntry = entriesWithMood.reduce((best, entry) => {
      const currentMood = entry.mood || entry.energy || 5;
      const bestMood = best.mood || best.energy || 5;
      return currentMood > bestMood ? entry : best;
    });
    
    const bestDay = bestEntry ? new Date(bestEntry.createdAt || bestEntry.timestamp).toLocaleDateString() : 'Today';
    
    moodAnalysis = {
      averageMood,
      trend,
      bestDay,
      hasData: true,
      totalMoodEntries: entriesWithMood.length
    };
  }

  if (!goals) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Goals Set</h3>
        <p className="text-slate-500">Set your goals in your profile to see personalized analytics</p>
      </div>
    );
  }

  // Handle case where there are no journal entries
  if (!journalEntries || Object.keys(journalEntries).length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Journal Entries</h3>
        <p className="text-slate-500">Start journaling to see your goal progress analytics</p>
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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-2">Goal Progress</h2>
        <p className="text-slate-300 text-sm sm:text-base">Track your progress against your personal goals</p>
      </div>

      {/* Overall Progress Card */}
      {progressSummary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-50">Goal Progress</h3>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Total Progress</span>
              <span className="text-lg font-bold text-slate-50">{progressSummary.totalProgress}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <motion.div 
                className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressSummary.totalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{progressSummary.goalsMet}</div>
              <div className="text-sm text-slate-300">Completed</div>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{progressSummary.activeGoals}</div>
              <div className="text-sm text-slate-300">In Progress</div>
            </div>
          </div>
          
          {/* Smart Goal Details */}
          {Object.entries(analytics.goalProgress).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Goal Details</h4>
              {Object.entries(analytics.goalProgress).map(([goal, data]) => (
                <motion.div
                  key={goal}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-700/20 rounded-lg p-3 border border-slate-600/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-slate-50 text-sm">{goal}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        data.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        data.status === 'near-completion' ? 'bg-yellow-500/20 text-yellow-400' :
                        data.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {data.status.replace('-', ' ')}
                      </span>
                      {data.streak > 0 && (
                        <span className="text-xs text-orange-400">🔥 {data.streak}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300">{Math.round(data.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                      <motion.div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-slate-300 font-medium">{data.entries}</div>
                        <div className="text-slate-500">Entries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300 font-medium">{Math.round(data.quality)}%</div>
                        <div className="text-slate-500">Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-300 font-medium">{Math.round(data.consistency)}%</div>
                        <div className="text-slate-500">Consistency</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {progressSummary.completionRate > 0 && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-green-400 font-medium">🎉 Achievement Rate</div>
                <div className="text-2xl font-bold text-green-400">{progressSummary.completionRate}%</div>
                <div className="text-xs text-slate-400">of your goals completed</div>
              </div>
            </div>
          )}
          
          {/* Milestone Celebrations */}
          {Object.entries(analytics.goalProgress).some(([goal, data]) => 
            data.milestones && data.milestones.some(m => m.achieved && m.type === 'expert')
          ) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm text-yellow-400 font-medium">Expert Level Achieved!</div>
                <div className="text-xs text-slate-300 mt-1">
                  You've reached expert level with at least one goal. Incredible dedication!
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Mobile-optimized sections instead of tabs */}
      <div className="space-y-6">
        {/* Overview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Overview
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Journaling Consistency */}
            {journalingAnalysis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-semibold text-slate-50">Journaling Consistency</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Current Streak</span>
                    <span className="font-bold text-slate-50">{journalingAnalysis.currentStreak} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Total Entries</span>
                    <span className="font-bold text-slate-50">{journalingAnalysis.totalEntries}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Weekly Average</span>
                    <span className="font-bold text-slate-50">{journalingAnalysis.averageEntriesPerWeek} entries</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Consistency</span>
                    <span className={`font-bold ${journalingAnalysis.isConsistent ? 'text-green-400' : 'text-yellow-400'}`}>
                      {journalingAnalysis.isConsistent ? 'Consistent' : 'Building'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        journalingAnalysis.isConsistent 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${journalingAnalysis.consistencyScore}%` }}
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
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-slate-50">Mood Trends</h4>
                </div>
                
                <div className="space-y-3">
                  {moodAnalysis.hasData ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Average Mood</span>
                        <span className="font-bold text-slate-50">{moodAnalysis.averageMood}/10</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Trend</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(moodAnalysis.trend)}
                          <span className={`text-sm ${
                            moodAnalysis.trend === 'improving' ? 'text-green-400' :
                            moodAnalysis.trend === 'declining' ? 'text-red-400' :
                            'text-slate-50'
                          }`}>
                            {moodAnalysis.trend}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Best Day</span>
                        <span className="font-bold text-slate-50">{moodAnalysis.bestDay}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Mood Entries</span>
                        <span className="font-bold text-slate-50">{moodAnalysis.totalMoodEntries}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-sm text-slate-400 mb-2">No mood data yet</div>
                      <div className="text-xs text-slate-500">Start tracking your mood in journal entries</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Insights Section */}
        {insights && insights.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Key Insights
            </h3>
            
            {/* Smart Recommendations */}
            {Object.entries(analytics.goalProgress).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h4 className="font-medium text-slate-50">Smart Recommendations</h4>
                </div>
                
                <div className="space-y-2">
                  {(() => {
                    const recommendations = [];
                    const activeGoals = Object.entries(analytics.goalProgress).filter(([goal, data]) => data.entries > 0);
                    
                    // Find goals that need attention
                    const lowConsistencyGoals = activeGoals.filter(([goal, data]) => data.consistency < 50);
                    if (lowConsistencyGoals.length > 0) {
                      recommendations.push({
                        type: 'consistency',
                        text: `Focus on "${lowConsistencyGoals[0][0]}" - try writing about it more regularly`,
                        priority: 'high'
                      });
                    }
                    
                    // Find goals with high potential
                    const highQualityGoals = activeGoals.filter(([goal, data]) => data.quality >= 80 && data.entries < 5);
                    if (highQualityGoals.length > 0) {
                      recommendations.push({
                        type: 'quality',
                        text: `Your "${highQualityGoals[0][0]}" entries are excellent - consider expanding on this goal`,
                        priority: 'medium'
                      });
                    }
                    
                    // Suggest new goals based on patterns
                    if (activeGoals.length >= 2) {
                      const mostConsistent = activeGoals.reduce((best, current) => 
                        current[1].consistency > best[1].consistency ? current : best
                      );
                      recommendations.push({
                        type: 'pattern',
                        text: `You're consistent with "${mostConsistent[0]}". Consider setting a related goal.`,
                        priority: 'low'
                      });
                    }
                    
                    return recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          rec.priority === 'high' ? 'bg-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`} />
                        <p className="text-sm text-slate-300">{rec.text}</p>
                      </div>
                    ));
                  })()}
                </div>
              </motion.div>
            )}
            
            <div className="space-y-3">
              {insights
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .slice(0, 3)
                .map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border ${
                    insight.priority === 'high' 
                      ? 'border-yellow-500/30 bg-yellow-500/5' 
                      : insight.priority === 'medium'
                      ? 'border-cyan-500/30 bg-cyan-500/5'
                      : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-50 mb-1">{insight.title}</h4>
                      <p className="text-sm text-slate-300">{insight.description}</p>
                      {insight.actionable && (
                        <div className="mt-2">
                          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
                            Actionable
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalAnalytics; 