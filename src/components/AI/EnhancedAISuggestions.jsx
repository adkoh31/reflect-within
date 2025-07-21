import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Target, 
  Heart, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ChevronRight,
  X,
  Brain,
  Calendar,
  Activity
} from 'lucide-react';

/**
 * Enhanced AI Suggestions Component
 * Provides intelligent, contextual suggestions based on user patterns and conversation state
 */
const EnhancedAISuggestions = ({ 
  userData, 
  conversationContext, 
  memoryInsights, 
  onSuggestionSelect, 
  isVisible, 
  onClose,
  currentMood,
  timeOfDay
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Generate suggestions when component mounts or when context changes
  useEffect(() => {
    if (isVisible && userData) {
      generateSuggestions();
    }
  }, [isVisible, userData, conversationContext, memoryInsights, currentMood, timeOfDay]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const enhancedSuggestions = await createEnhancedSuggestions();
      setSuggestions(enhancedSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const createEnhancedSuggestions = async () => {
    const allSuggestions = [];

    // 1. Time-based suggestions
    const timeSuggestions = generateTimeBasedSuggestions();
    allSuggestions.push(...timeSuggestions);

    // 2. Pattern-based suggestions
    const patternSuggestions = generatePatternBasedSuggestions();
    allSuggestions.push(...patternSuggestions);

    // 3. Mood-based suggestions
    const moodSuggestions = generateMoodBasedSuggestions();
    allSuggestions.push(...moodSuggestions);

    // 4. Goal-based suggestions
    const goalSuggestions = generateGoalBasedSuggestions();
    allSuggestions.push(...goalSuggestions);

    // 5. Proactive support suggestions
    const proactiveSuggestions = generateProactiveSuggestions();
    allSuggestions.push(...proactiveSuggestions);

    // 6. Engagement suggestions
    const engagementSuggestions = generateEngagementSuggestions();
    allSuggestions.push(...engagementSuggestions);

    // Sort by relevance and priority
    return allSuggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8); // Limit to 8 suggestions
  };

  const generateTimeBasedSuggestions = () => {
    const suggestions = [];
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Morning suggestions (6-10 AM)
    if (hour >= 6 && hour <= 10) {
      suggestions.push({
        id: 'morning_energy',
        text: "How are you feeling this morning? What's your energy level like?",
        category: 'time-based',
        icon: '🌅',
        priority: 3,
        type: 'energy_check'
      });

      suggestions.push({
        id: 'morning_intention',
        text: "What's your intention for today? What would make today feel meaningful?",
        category: 'time-based',
        icon: '🎯',
        priority: 2,
        type: 'intention_setting'
      });
    }

    // Afternoon suggestions (12-4 PM)
    if (hour >= 12 && hour <= 16) {
      suggestions.push({
        id: 'afternoon_checkin',
        text: "How's your day going so far? What's been the highlight?",
        category: 'time-based',
        icon: '☀️',
        priority: 2,
        type: 'midday_reflection'
      });
    }

    // Evening suggestions (6-10 PM)
    if (hour >= 18 && hour <= 22) {
      suggestions.push({
        id: 'evening_winddown',
        text: "How are you feeling as you wind down? What's on your mind?",
        category: 'time-based',
        icon: '🌙',
        priority: 3,
        type: 'evening_reflection'
      });

      suggestions.push({
        id: 'gratitude_check',
        text: "What's something you're grateful for today?",
        category: 'time-based',
        icon: '🙏',
        priority: 2,
        type: 'gratitude'
      });
    }

    // Weekend vs weekday suggestions
    if (isWeekend) {
      suggestions.push({
        id: 'weekend_reflection',
        text: "Weekends can be a great time for deeper reflection. What's been on your mind lately?",
        category: 'time-based',
        icon: '📅',
        priority: 2,
        type: 'weekend_reflection'
      });
    } else {
      suggestions.push({
        id: 'weekday_balance',
        text: "How are you balancing work and wellness this week?",
        category: 'time-based',
        icon: '⚖️',
        priority: 2,
        type: 'work_life_balance'
      });
    }

    return suggestions;
  };

  const generatePatternBasedSuggestions = () => {
    const suggestions = [];

    if (!memoryInsights) return suggestions;

    // Recurring themes
    if (memoryInsights.longTermPatterns?.recurringThemes?.length > 0) {
      const recentTheme = memoryInsights.longTermPatterns.recurringThemes[0];
      suggestions.push({
        id: 'recurring_theme',
        text: `I've noticed ${recentTheme} has been coming up a lot. How are you feeling about this?`,
        category: 'pattern-based',
        icon: '🔄',
        priority: 4,
        type: 'theme_exploration'
      });
    }

    // Emotional patterns
    if (memoryInsights.emotionalTrends?.emotionalTriggers?.length > 0) {
      const trigger = memoryInsights.emotionalTrends.emotionalTriggers[0];
      suggestions.push({
        id: 'emotional_trigger',
        text: `I've noticed ${trigger} tends to affect your mood. How are you feeling about this pattern?`,
        category: 'pattern-based',
        icon: '💭',
        priority: 3,
        type: 'emotional_pattern'
      });
    }

    // Peak engagement times
    if (memoryInsights.engagementMetrics?.peakEngagementTimes?.length > 0) {
      const peakTime = memoryInsights.engagementMetrics.peakEngagementTimes[0];
      suggestions.push({
        id: 'peak_time',
        text: `You're most reflective around ${peakTime}. What's on your mind during this time?`,
        category: 'pattern-based',
        icon: '⏰',
        priority: 2,
        type: 'peak_time_reflection'
      });
    }

    return suggestions;
  };

  const generateMoodBasedSuggestions = () => {
    const suggestions = [];

    if (!currentMood) return suggestions;

    switch (currentMood) {
      case 'stressed':
      case 'anxious':
        suggestions.push({
          id: 'stress_support',
          text: "I can sense you're feeling stressed. What would be most helpful for you right now?",
          category: 'mood-based',
          icon: '😰',
          priority: 5,
          type: 'stress_support'
        });
        break;

      case 'happy':
      case 'excited':
        suggestions.push({
          id: 'positive_momentum',
          text: "You seem to be in a great mood! What's contributing to this positive energy?",
          category: 'mood-based',
          icon: '😊',
          priority: 3,
          type: 'positive_momentum'
        });
        break;

      case 'tired':
      case 'exhausted':
        suggestions.push({
          id: 'energy_support',
          text: "You seem tired. How can you give yourself permission to rest and recharge?",
          category: 'mood-based',
          icon: '😴',
          priority: 4,
          type: 'energy_support'
        });
        break;

      case 'frustrated':
      case 'angry':
        suggestions.push({
          id: 'frustration_support',
          text: "I hear your frustration. What's underneath this feeling?",
          category: 'mood-based',
          icon: '😤',
          priority: 4,
          type: 'frustration_support'
        });
        break;
    }

    return suggestions;
  };

  const generateGoalBasedSuggestions = () => {
    const suggestions = [];

    if (!userData?.goals?.personalGoals?.length) return suggestions;

    const goals = userData.goals.personalGoals;
    const recentGoalMentions = userData.journalEntries?.filter(entry => 
      (entry.content || '').toLowerCase().includes('goal') ||
      (entry.content || '').toLowerCase().includes('target')
    ).length || 0;

    if (recentGoalMentions > 0) {
      suggestions.push({
        id: 'goal_progress',
        text: "You've been thinking about your goals lately. How are you feeling about your progress?",
        category: 'goal-based',
        icon: '🎯',
        priority: 3,
        type: 'goal_progress'
      });
    }

    // Suggest goal check-in if it's been a while
    const lastGoalEntry = userData.journalEntries?.find(entry => 
      (entry.content || '').toLowerCase().includes('goal')
    );

    if (!lastGoalEntry || daysSince(new Date(lastGoalEntry.timestamp || lastGoalEntry.date)) > 7) {
      suggestions.push({
        id: 'goal_checkin',
        text: "Would you like to check in on your goals and see how you're progressing?",
        category: 'goal-based',
        icon: '📊',
        priority: 2,
        type: 'goal_checkin'
      });
    }

    return suggestions;
  };

  const generateProactiveSuggestions = () => {
    const suggestions = [];

    // Streak-based suggestions
    const streak = calculateStreak(userData?.journalEntries || []);
    if (streak > 0) {
      suggestions.push({
        id: 'streak_celebration',
        text: `You're on a ${streak}-day reflection streak! What's keeping you consistent?`,
        category: 'proactive',
        icon: '🔥',
        priority: 3,
        type: 'streak_celebration'
      });
    }

    // Stress pattern detection
    if (memoryInsights?.longTermPatterns?.stressPatterns?.length > 0) {
      const recentStress = memoryInsights.longTermPatterns.stressPatterns[0];
      if (daysSince(new Date(recentStress.timestamp)) < 3) {
        suggestions.push({
          id: 'stress_management',
          text: "I've noticed some stress patterns recently. Would you like to explore stress management techniques?",
          category: 'proactive',
          icon: '🧘',
          priority: 4,
          type: 'stress_management'
        });
      }
    }

    // Achievement celebration
    if (memoryInsights?.longTermPatterns?.achievementPatterns?.length > 0) {
      suggestions.push({
        id: 'achievement_reflection',
        text: "You've had some great achievements lately. What have you learned about yourself?",
        category: 'proactive',
        icon: '🏆',
        priority: 2,
        type: 'achievement_reflection'
      });
    }

    return suggestions;
  };

  const generateEngagementSuggestions = () => {
    const suggestions = [];

    // Low engagement detection
    if (conversationContext?.length < 3) {
      suggestions.push({
        id: 'deeper_conversation',
        text: "I'd love to understand you better. What's something you've been thinking about lately?",
        category: 'engagement',
        icon: '💭',
        priority: 3,
        type: 'deeper_conversation'
      });
    }

    // New user suggestions
    if (!userData?.journalEntries?.length) {
      suggestions.push({
        id: 'welcome_exploration',
        text: "Welcome! What brings you to reflection today?",
        category: 'engagement',
        icon: '👋',
        priority: 4,
        type: 'welcome_exploration'
      });
    }

    return suggestions;
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect(suggestion.text);
    onClose();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'time-based': return <Clock className="w-4 h-4" />;
      case 'pattern-based': return <TrendingUp className="w-4 h-4" />;
      case 'mood-based': return <Heart className="w-4 h-4" />;
      case 'goal-based': return <Target className="w-4 h-4" />;
      case 'proactive': return <Brain className="w-4 h-4" />;
      case 'engagement': return <Activity className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'time-based': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'pattern-based': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'mood-based': return 'from-red-500/20 to-pink-500/20 border-red-500/30';
      case 'goal-based': return 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30';
      case 'proactive': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'engagement': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default: return 'from-slate-500/20 to-gray-500/20 border-slate-500/30';
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (selectedCategory === 'all') return suggestions;
    return suggestions.filter(s => s.category === selectedCategory);
  }, [suggestions, selectedCategory]);

  const categories = useMemo(() => {
    const cats = [...new Set(suggestions.map(s => s.category))];
    return ['all', ...cats];
  }, [suggestions]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-50">
              AI Suggestions
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {category === 'all' ? 'All' : category.replace('-', ' ')}
            </button>
          ))}
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            <span className="ml-2 text-slate-400 text-sm">Generating suggestions...</span>
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <div className="space-y-2">
            {filteredSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${getCategoryColor(suggestion.category)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-lg">{suggestion.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-100 text-sm leading-relaxed">
                      {suggestion.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400 capitalize">
                        {suggestion.category.replace('-', ' ')}
                      </span>
                      <div className="flex space-x-1">
                        {[...Array(suggestion.priority)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 bg-cyan-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm">
              Start a conversation to get personalized suggestions
            </p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            These suggestions are based on your conversation patterns, mood, and preferences
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function to calculate days since a date
const daysSince = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to calculate streak
const calculateStreak = (journalEntries) => {
  if (!journalEntries || journalEntries.length === 0) return 0;

  const sortedEntries = journalEntries
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasEntry = sortedEntries.some(entry => {
      const entryDate = new Date(entry.timestamp || entry.date);
      const entryDateStr = entryDate.toISOString().split('T')[0];
      return entryDateStr === dateStr;
    });

    if (hasEntry) {
      streak++;
    } else {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

export default EnhancedAISuggestions; 