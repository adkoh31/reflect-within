import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Share2, 
  Target,
  Brain,
  Activity,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/**
 * Interactive Goal Progress Timeline
 */
export const GoalProgressTimeline = ({ goalProgress, goals }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const timelineData = useMemo(() => {
    if (!goalProgress || !goals?.focusAreas) return [];
    
    // Use the goalProgress directly if it's already processed, otherwise use goals
    const progressData = goalProgress.goalProgress || goalProgress;
    
    return goals.focusAreas.map(goal => {
      const progress = progressData[goal];
      if (!progress) return null;
      
      return {
        goal,
        progress: progress.progress || 0,
        entries: progress.entries || 0,
        status: progress.status || 'not-started',
        streak: progress.streak || 0,
        milestones: progress.milestones || [],
        lastEntry: progress.lastEntry
      };
    }).filter(Boolean);
  }, [goalProgress, goals]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'near-completion': return 'bg-yellow-500';
      case 'in-progress': return 'bg-cyan-500';
      case 'started': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-50">Goal Progress Timeline</h3>
      </div>
      
      <div className="space-y-4">
        {timelineData.map((goalData, index) => (
          <motion.div
            key={goalData.goal}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(goalData.status)}`} />
              <h4 className="font-medium text-slate-50 text-sm">{goalData.goal}</h4>
              <div className="flex items-center gap-2 ml-auto">
                {goalData.streak > 0 && (
                  <span className="text-xs text-orange-400">🔥 {goalData.streak}</span>
                )}
                <span className="text-xs text-slate-400">{goalData.entries} entries</span>
              </div>
            </div>
            
            <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  goalData.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  goalData.status === 'near-completion' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${goalData.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-400">{Math.round(goalData.progress)}%</span>
              <span className="text-xs text-slate-400">{goalData.status.replace('-', ' ')}</span>
            </div>
            
            {/* Milestones */}
            {goalData.milestones && goalData.milestones.length > 0 && (
              <div className="mt-2 flex gap-2">
                {goalData.milestones.slice(0, 3).map((milestone, idx) => (
                  <div
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${
                      milestone.achieved 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {milestone.type}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Mood Trend Analysis Chart
 */
export const MoodTrendAnalysis = ({ journalEntries }) => {
  const [timeRange, setTimeRange] = useState('week'); // week, month, all
  
  const moodData = useMemo(() => {
    if (!journalEntries) return [];
    
    const entriesArray = Object.values(journalEntries).flat();
    const entriesWithMood = entriesArray.filter(entry => entry.mood || entry.energy);
    
    if (entriesWithMood.length === 0) return [];
    
    // Group by time range
    const now = new Date();
    const filteredEntries = entriesWithMood.filter(entry => {
      const entryDate = new Date(entry.createdAt || entry.timestamp);
      const daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24);
      
      switch (timeRange) {
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        default: return true;
      }
    });
    
    // Sort by date and calculate trends
    return filteredEntries
      .sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp))
      .map(entry => ({
        date: new Date(entry.createdAt || entry.timestamp).toLocaleDateString(),
        mood: entry.mood || entry.energy || 5,
        content: entry.content?.substring(0, 50) + '...'
      }));
  }, [journalEntries, timeRange]);

  const averageMood = moodData.length > 0 
    ? moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length 
    : 0;

  const getMoodColor = (mood) => {
    if (mood >= 8) return 'text-green-400';
    if (mood >= 6) return 'text-yellow-400';
    if (mood >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-slate-50">Mood Trends</h3>
        </div>
        
        <div className="flex gap-1">
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {moodData.length > 0 ? (
        <div className="space-y-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-slate-50">{Math.round(averageMood * 10) / 10}</div>
            <div className="text-sm text-slate-400">Average Mood</div>
          </div>
          
          <div className="space-y-2">
            {moodData.slice(-5).map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-2 bg-slate-700/20 rounded-lg"
              >
                <div className={`text-lg ${getMoodColor(entry.mood)}`}>
                  {entry.mood >= 8 ? '😊' : entry.mood >= 6 ? '🙂' : entry.mood >= 4 ? '😐' : '😔'}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-300">{entry.date}</div>
                  <div className="text-xs text-slate-400">{entry.content}</div>
                </div>
                <div className={`font-bold ${getMoodColor(entry.mood)}`}>
                  {entry.mood}/10
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">No mood data available</div>
          <div className="text-xs text-slate-500">Start tracking your mood in journal entries</div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Writing Pattern Analysis
 */
export const WritingPatternAnalysis = ({ journalEntries }) => {
  const patternData = useMemo(() => {
    if (!journalEntries) return null;
    
    const entriesArray = Object.values(journalEntries).flat();
    
    if (entriesArray.length === 0) return null;
    
    // Analyze writing patterns
    const totalEntries = entriesArray.length;
    const totalWords = entriesArray.reduce((sum, entry) => 
      sum + (entry.content?.split(' ').length || 0), 0
    );
    const avgWordsPerEntry = Math.round(totalWords / totalEntries);
    
    // Find most active days
    const dayCounts = {};
    entriesArray.forEach(entry => {
      const date = new Date(entry.createdAt || entry.timestamp);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Find longest entry
    const longestEntry = entriesArray.reduce((longest, entry) => 
      (entry.content?.length || 0) > (longest.content?.length || 0) ? entry : longest
    );
    
    return {
      totalEntries,
      totalWords,
      avgWordsPerEntry,
      mostActiveDay: mostActiveDay ? { day: mostActiveDay[0], count: mostActiveDay[1] } : null,
      longestEntry: longestEntry ? {
        content: longestEntry.content?.substring(0, 100) + '...',
        length: longestEntry.content?.length || 0,
        date: new Date(longestEntry.createdAt || longestEntry.timestamp).toLocaleDateString()
      } : null
    };
  }, [journalEntries]);

  if (!patternData) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">No writing data available</div>
        <div className="text-xs text-slate-500">Start journaling to see your writing patterns</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
          <div className="text-2xl font-bold text-slate-50">{patternData.totalEntries}</div>
          <div className="text-sm text-slate-300">Total Entries</div>
        </div>
        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
          <div className="text-2xl font-bold text-slate-50">{patternData.avgWordsPerEntry}</div>
          <div className="text-sm text-slate-300">Avg Words</div>
        </div>
      </div>
      
      {patternData.mostActiveDay && (
        <div className="mb-4 p-3 bg-slate-700/20 rounded-lg">
          <div className="text-sm text-slate-300 mb-1">Most Active Day</div>
          <div className="font-medium text-slate-50">
            {patternData.mostActiveDay.day} ({patternData.mostActiveDay.count} entries)
          </div>
        </div>
      )}
      
      {patternData.longestEntry && (
        <div className="p-3 bg-slate-700/20 rounded-lg">
          <div className="text-sm text-slate-300 mb-1">Longest Entry</div>
          <div className="text-xs text-slate-400 mb-2">{patternData.longestEntry.date}</div>
          <div className="text-sm text-slate-300">{patternData.longestEntry.content}</div>
          <div className="text-xs text-slate-400 mt-1">{patternData.longestEntry.length} characters</div>
        </div>
      )}
    </div>
  );
};

/**
 * Export & Share Component
 */
export const ExportAndShare = ({ goalProgress, journalEntries, insights }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const exportData = async (format) => {
    setIsExporting(true);
    try {
      // Handle different goalProgress data structures
      const progressData = goalProgress?.goalProgress || goalProgress || {};
      
      const data = {
        goalProgress: progressData,
        journalEntries,
        insights,
        exportDate: new Date().toISOString(),
        summary: {
          totalEntries: journalEntries ? Object.values(journalEntries).flat().length : 0,
          totalGoals: progressData ? Object.keys(progressData).length : 0,
          completedGoals: progressData ? Object.values(progressData).filter(g => g.progress >= 100).length : 0
        }
      };
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myra-insights-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvData = [
          ['Date', 'Goal', 'Progress', 'Status', 'Entries'],
          ...Object.entries(progressData || {}).map(([goal, data]) => [
            new Date().toLocaleDateString(),
            goal,
            data.progress || 0,
            data.status || 'not-started',
            data.entries || 0
          ])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myra-goals-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <Download className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-slate-50">Export & Share</h3>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => exportData('json')}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 py-3 px-4 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Full Data (JSON)'}
        </button>
        
        <button
          onClick={() => exportData('csv')}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 bg-green-500/20 text-green-400 py-3 px-4 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Goals (CSV)'}
        </button>
        
        <button
          onClick={() => {
            // Share functionality (could integrate with native sharing)
            if (navigator.share) {
              navigator.share({
                title: 'My Myra Insights',
                text: 'Check out my progress and insights from Myra!',
                url: window.location.href
              });
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText('Check out my progress and insights from Myra!');
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-purple-500/20 text-purple-400 py-3 px-4 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Progress
        </button>
      </div>
    </motion.div>
  );
}; 