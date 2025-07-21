import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Target, 
  Brain, 
  TrendingUp, 
  Calendar, 
  Award,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  Heart,
  Activity,
  Flame
} from 'lucide-react';
import { Typography } from '../Typography/Typography';
import { ComponentErrorBoundary } from '../ui/ComponentErrorBoundary.jsx';
import { InsightsSkeleton } from '../ui/loading-states';
import { MyraLogo } from '../ui/MyraLogo.jsx';
import { useGoalAnalytics } from '../../hooks/useGoalAnalytics';

// Mini Sparkline Chart Component
const SparklineChart = ({ data, color = "from-cyan-500 to-blue-500", height = 20 }) => {
  if (!data || data.length < 2) return null;
  
  // Filter out invalid data
  const validData = data.filter(value => !isNaN(value) && isFinite(value));
  if (validData.length < 2) return null;
  
  const max = Math.max(...validData);
  const min = Math.min(...validData);
  const range = max - min || 1;
  
  const points = validData.map((value, index) => {
    const x = (index / (validData.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    // Ensure valid coordinates
    const validX = isNaN(x) ? 0 : Math.max(0, Math.min(100, x));
    const validY = isNaN(y) ? 50 : Math.max(0, Math.min(100, y));
    return `${validX} ${validY}`;
  }).join(', ');
  
  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={`url(#${color.replace(/\s+/g, '-')})`}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <linearGradient id={color.replace(/\s+/g, '-')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.includes('cyan') ? '#06b6d4' : '#8b5cf6'} />
            <stop offset="100%" stopColor={color.includes('cyan') ? '#3b82f6' : '#ec4899'} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Weekly Activity Heatmap Component
const WeeklyHeatmap = ({ dayCounts, maxCount }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = maxCount && !isNaN(maxCount) ? maxCount : Math.max(...Object.values(dayCounts)) || 1;
  
  const getIntensity = (count) => {
    if (!count || count === 0) return 'bg-slate-800/30';
    const intensity = count / max;
    if (intensity === 0) return 'bg-slate-800/30';
    if (intensity < 0.25) return 'bg-cyan-500/20';
    if (intensity < 0.5) return 'bg-cyan-500/40';
    if (intensity < 0.75) return 'bg-cyan-500/60';
    return 'bg-cyan-500/80';
  };
  
  return (
    <div className="flex space-x-1">
      {days.map(day => {
        const count = dayCounts[day] || 0;
        return (
          <div key={day} className="flex flex-col items-center space-y-1">
            <div className={`w-6 h-6 rounded-sm ${getIntensity(count)} border border-slate-600/30`} />
            <span className="text-xs text-slate-400">{day}</span>
            <span className="text-xs text-slate-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

// Radial Progress Ring Component
const RadialProgress = ({ progress, size = 60, strokeWidth = 4, color = "from-cyan-500 to-blue-500" }) => {
  // Ensure progress is a valid number
  const validProgress = isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (validProgress / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(71, 85, 105, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${color.replace(/\s+/g, '-')})`}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id={color.replace(/\s+/g, '-')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.includes('cyan') ? '#06b6d4' : '#10b981'} />
            <stop offset="100%" stopColor={color.includes('cyan') ? '#3b82f6' : '#059669'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-bold text-slate-50">{Math.round(validProgress)}%</div>
      </div>
    </div>
  );
};

// Mood Line Chart Component
const MoodLineChart = ({ entries }) => {
  if (!entries || entries.length < 2) return null;
  
  const chartData = entries
    .sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp))
    .slice(-7) // Last 7 entries
    .map(entry => entry.mood || entry.energy || 5);
  
  // Filter out invalid data
  const validChartData = chartData.filter(value => !isNaN(value) && isFinite(value));
  if (validChartData.length < 2) return null;
  
  const max = Math.max(...validChartData);
  const min = Math.min(...validChartData);
  const range = max - min || 1;
  
  const points = validChartData.map((value, index) => {
    const x = (index / (validChartData.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    // Ensure valid coordinates
    const validX = isNaN(x) ? 0 : Math.max(0, Math.min(100, x));
    const validY = isNaN(y) ? 50 : Math.max(0, Math.min(100, y));
    return `${validX} ${validY}`;
  }).join(', ');
  
  const getMoodColor = (mood) => {
    if (mood >= 8) return '#10b981';
    if (mood >= 6) return '#f59e0b';
    if (mood >= 4) return '#f97316';
    return '#ef4444';
  };
  
  return (
    <div className="relative h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(71, 85, 105, 0.2)"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Mood line */}
        <polyline
          fill="none"
          stroke="url(#mood-gradient)"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Data points */}
        {validChartData.map((value, index) => {
          const x = (index / (validChartData.length - 1)) * 100;
          const y = 100 - ((value - min) / range) * 100;
          const validX = isNaN(x) ? 0 : Math.max(0, Math.min(100, x));
          const validY = isNaN(y) ? 50 : Math.max(0, Math.min(100, y));
          return (
            <circle
              key={index}
              cx={validX}
              cy={validY}
              r="2"
              fill={getMoodColor(value)}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
        
        <defs>
          <linearGradient id="mood-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400">
        <span>10</span>
        <span>7.5</span>
        <span>5</span>
        <span>2.5</span>
        <span>0</span>
      </div>
    </div>
  );
};

// Streak Visualization Component
const StreakVisualization = ({ currentStreak, maxStreak = 100 }) => {
  const milestones = [7, 14, 30, 60, 100];
  const currentMilestone = milestones.find(m => currentStreak < m) || 100;
  
  return (
    <div className="space-y-4">
      {/* Current streak display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {Array.from({ length: Math.min(currentStreak, 10) }, (_, i) => (
            <Flame key={i} className="w-6 h-6 text-orange-400" />
          ))}
          {currentStreak > 10 && (
            <span className="text-orange-400 font-bold">+{currentStreak - 10}</span>
          )}
        </div>
        <div className="text-2xl font-bold text-orange-400">{currentStreak}</div>
        <div className="text-sm text-slate-300">days in a row</div>
      </div>
      
      {/* Milestone progress */}
      <div className="space-y-2">
        {milestones.map(milestone => (
          <div key={milestone} className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{milestone} days</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-slate-700/50 rounded-full h-2">
                <motion.div 
                  className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((currentStreak / milestone) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                currentStreak >= milestone 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-slate-700/50 text-slate-400'
              }`}>
                {currentStreak >= milestone ? '✓' : `${milestone - currentStreak}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  color, 
  progress, 
  expanded, 
  onToggle, 
  children,
  sparklineData
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden"
    >
      {/* Card Header */}
      <div 
        className="p-4 sm:p-6 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
              <p className="text-sm text-slate-300">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {sparklineData && (
              <div className="w-16 h-8">
                <SparklineChart data={sparklineData} color={color} height={32} />
              </div>
            )}
            
            {progress !== undefined && (
              <div className="text-right">
                <div className="text-lg font-bold text-slate-50">{progress}%</div>
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-slate-700/50"
          >
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InsightsDashboard = ({ 
  insights = { themes: [], moods: [] }, 
  isGeneratingInsights, 
  isPremium, 
  onPremiumToggle, 
  messages = [], 
  onAction,
  goals = null,
  journalEntries = {}
}) => {
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  // Use goal analytics hook
  const analytics = useGoalAnalytics(goals, journalEntries);
  
  // Calculate real data
  const entriesArray = journalEntries ? Object.values(journalEntries).flat() : [];
  const totalEntries = entriesArray.length;
  const currentStreak = analytics.journalingFrequency || 0;
  
  // Calculate mood data
  const entriesWithMood = entriesArray.filter(entry => entry.mood || entry.energy);
  const averageMood = entriesWithMood.length > 0 
    ? Math.round(entriesWithMood.reduce((sum, entry) => {
        const moodValue = entry.mood || entry.energy || 5;
        return sum + (isNaN(moodValue) ? 5 : moodValue);
      }, 0) / entriesWithMood.length)
    : 0;
  
  // Calculate goal progress
  const goalProgress = analytics.goalProgress || {};
  const totalGoals = Object.keys(goalProgress).length;
  const completedGoals = Object.values(goalProgress).filter(g => g.progress >= 100).length;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  
  // Calculate writing patterns
  const recentEntries = entriesArray.slice(-7);
  const consistencyScore = Math.min((recentEntries.length / 7) * 100, 100);
  
  // Find most active day
  const dayCounts = {};
  entriesArray.forEach(entry => {
    const day = new Date(entry.createdAt || entry.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCounts).sort(([,a], [,b]) => b - a)[0];
  
  // Generate sparkline data for cards
  const goalSparklineData = Object.values(goalProgress).map(g => g.progress || 0);
  const moodSparklineData = entriesWithMood.slice(-7).map(entry => entry.mood || entry.energy || 5);
  const consistencySparklineData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const dayKey = day.toLocaleDateString('en-US', { weekday: 'short' });
    return dayCounts[dayKey] || 0;
  });
  
  const toggleCard = (cardId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  if (!isPremium) {
    return (
      <ComponentErrorBoundary>
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-light text-slate-50 mb-2">Premium Insights Dashboard</h2>
          <p className="text-slate-300 font-light">
            Unlock personalized insights about your fitness and mental well-being patterns
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="text-sm text-slate-50 font-light">Track your goal progress with smart analytics</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="text-sm text-slate-50 font-light">Discover your mood and writing patterns</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="text-sm text-slate-50 font-light">Get personalized insights and recommendations</span>
          </div>
        </div>
        
        <button
          onClick={onPremiumToggle}
          className="w-full bg-cyan-500 text-slate-900 py-3 px-6 rounded-xl font-medium hover:bg-cyan-400 transition-colors shadow-md"
        >
          Enable Premium Features
        </button>
      </div>
      </ComponentErrorBoundary>
    );
  }

  if (isGeneratingInsights) {
    return (
      <div aria-busy="true">
        <InsightsSkeleton />
      </div>
    );
  }

  // Check if we have any data
  const hasGoals = goals && Object.keys(goals).length > 0;
  const hasJournalEntries = journalEntries && Object.keys(journalEntries).length > 0;

  return (
    <ComponentErrorBoundary>
      <div className="bg-slate-950 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-20">
          {/* Header */}
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <MyraLogo size="md" animated={false} />
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-50">Your Insights</h1>
                  <span className="px-2 bg-cyan-500 text-slate-900 text-xs rounded-full font-medium">
                    Premium
                  </span>
                </div>
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <Typography variant="body" color="muted" weight="normal" className="text-slate-300 text-sm sm:text-base">
                Discover patterns and trends in your reflection journey
              </Typography>
            </div>
          </motion.div>

          {/* Summary Stats */}
          {hasJournalEntries && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">{totalEntries}</div>
                <div className="text-xs text-slate-300">Total Entries</div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 text-center">
                <div className="text-lg font-bold text-green-400">{currentStreak}</div>
                <div className="text-xs text-slate-300">Day Streak</div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 text-center">
                <div className="text-lg font-bold text-purple-400">
                  {isNaN(averageMood) ? 'N/A' : averageMood}
                </div>
                <div className="text-xs text-slate-300">Avg Mood</div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 text-center">
                <div className="text-lg font-bold text-orange-400">{Math.round(consistencyScore)}%</div>
                <div className="text-xs text-slate-300">Consistency</div>
              </div>
            </motion.div>
          )}

          {/* Insight Cards */}
          <div className="space-y-4">
            {/* Goal Progress Card */}
            {hasGoals && (
              <InsightCard
                title="Goal Progress"
                subtitle={`${completedGoals} of ${totalGoals} goals completed`}
                icon={Target}
                color="from-green-500 to-emerald-500"
                progress={overallProgress}
                expanded={expandedCards.has('goals')}
                onToggle={() => toggleCard('goals')}
                sparklineData={goalSparklineData}
              >
                <div className="space-y-4">
                  {Object.entries(goalProgress).map(([goal, data]) => (
                    <div key={goal} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-50 capitalize">{goal}</h4>
                        <RadialProgress 
                          progress={data.progress || 0} 
                          size={50} 
                          color="from-cyan-500 to-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-slate-300">{Math.round(data.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <motion.div 
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${data.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{data.entries} entries</span>
                          {data.streak > 0 && <span>🔥 {data.streak} day streak</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {analytics.insights && analytics.insights.length > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <h4 className="font-medium text-slate-50 mb-2">💡 Insights</h4>
                      <div className="space-y-2">
                        {analytics.insights.slice(0, 2).map((insight, index) => (
                          <div key={index} className="text-sm text-slate-300">
                            {insight.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InsightCard>
            )}

            {/* Mood Trends Card */}
            {hasJournalEntries && entriesWithMood.length > 0 && (
              <InsightCard
                title="Mood Trends"
                subtitle={`Average mood: ${isNaN(averageMood) ? 'N/A' : averageMood}/10 over ${entriesWithMood.length} entries`}
                icon={Brain}
                color="from-purple-500 to-pink-500"
                expanded={expandedCards.has('mood')}
                onToggle={() => toggleCard('mood')}
                sparklineData={moodSparklineData}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {isNaN(averageMood) ? 'N/A' : averageMood}
                      </div>
                      <div className="text-xs text-slate-300">Average Mood</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-pink-400">{entriesWithMood.length}</div>
                      <div className="text-xs text-slate-300">Mood Entries</div>
                    </div>
                  </div>
                  
                  {/* Mood Line Chart */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h4 className="font-medium text-slate-50 mb-3">Mood Over Time</h4>
                    <MoodLineChart entries={entriesWithMood.slice(-7)} />
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h4 className="font-medium text-slate-50 mb-2">Recent Mood Entries</h4>
                    <div className="space-y-2">
                      {entriesWithMood.slice(-3).reverse().map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">
                            {new Date(entry.createdAt || entry.timestamp).toLocaleDateString()}
                          </span>
                          <span className={`font-medium ${
                            (entry.mood || entry.energy) >= 8 ? 'text-green-400' :
                            (entry.mood || entry.energy) >= 6 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {(entry.mood || entry.energy)}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </InsightCard>
            )}

            {/* Writing Patterns Card */}
            {hasJournalEntries && (
              <InsightCard
                title="Writing Patterns"
                subtitle={`${Math.round(consistencyScore)}% consistency this week`}
                icon={BookOpen}
                color="from-blue-500 to-cyan-500"
                progress={Math.round(consistencyScore)}
                expanded={expandedCards.has('writing')}
                onToggle={() => toggleCard('writing')}
                sparklineData={consistencySparklineData}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">{recentEntries.length}</div>
                      <div className="text-xs text-slate-300">This Week</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {mostActiveDay ? mostActiveDay[0] : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-300">Most Active Day</div>
                    </div>
                  </div>
                  
                  {/* Weekly Activity Heatmap */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h4 className="font-medium text-slate-50 mb-3">Weekly Activity</h4>
                    <WeeklyHeatmap dayCounts={dayCounts} maxCount={Math.max(...Object.values(dayCounts))} />
                  </div>
                  
                  {consistencyScore < 70 && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <h4 className="font-medium text-slate-50 mb-2">💡 Tip</h4>
                      <p className="text-sm text-slate-300">
                        Try journaling at the same time each day to build consistency. 
                        Even a few minutes of reflection can make a difference.
                      </p>
                    </div>
                  )}
                </div>
              </InsightCard>
            )}

            {/* Journaling Streak Card */}
            {hasJournalEntries && currentStreak > 0 && (
              <InsightCard
                title="Journaling Streak"
                subtitle={`${currentStreak} days of consistent journaling`}
                icon={Award}
                color="from-orange-500 to-red-500"
                expanded={expandedCards.has('streak')}
                onToggle={() => toggleCard('streak')}
              >
                <StreakVisualization currentStreak={currentStreak} />
              </InsightCard>
            )}
          </div>

          {/* Empty State */}
          {!hasGoals && !hasJournalEntries && (
            <motion.div
              className="relative mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
              
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
    </ComponentErrorBoundary>
  );
};

export default InsightsDashboard; 