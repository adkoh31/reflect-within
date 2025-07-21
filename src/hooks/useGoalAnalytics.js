import { useState, useEffect, useCallback } from 'react';
import { safeCreateDate, safeGetDateKey } from '../utils/dateUtils';

// Smart goal detection helper functions
const getGoalKeywords = (goal) => {
  const keywordMap = {
    'fitness': ['workout', 'exercise', 'gym', 'run', 'train', 'cardio', 'strength', 'fitness', 'health'],
    'weight': ['weight', 'scale', 'pounds', 'kg', 'lbs', 'diet', 'nutrition', 'calories'],
    'sleep': ['sleep', 'rest', 'bedtime', 'wake', 'dream', 'insomnia', 'tired', 'energy'],
    'meditation': ['meditation', 'mindfulness', 'zen', 'breath', 'calm', 'peace', 'meditate'],
    'learning': ['study', 'learn', 'course', 'book', 'skill', 'knowledge', 'education', 'reading'],
    'social': ['friend', 'family', 'social', 'meet', 'party', 'relationship', 'connection'],
    'mood': ['mood', 'emotion', 'feel', 'happy', 'sad', 'anxious', 'stress', 'joy'],
    'goals': ['goal', 'target', 'achieve', 'success', 'progress', 'milestone', 'objective'],
    'other': ['progress', 'improve', 'better', 'change', 'growth', 'development']
  };
  
  const goalLower = goal.toLowerCase();
  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (goalLower.includes(key) || keywords.some(k => goalLower.includes(k))) {
      return keywords;
    }
  }
  return [goal.toLowerCase()];
};

const calculateSmartProgress = (goal, goalEntries, allEntries) => {
  if (goalEntries.length === 0) {
    return { progress: 0, quality: 0, consistency: 0 };
  }
  
  // Calculate progress based on entry frequency and recency
  const totalDays = allEntries.length > 0 ? 
    Math.ceil((new Date() - new Date(allEntries[0].createdAt || allEntries[0].timestamp)) / (1000 * 60 * 60 * 24)) : 1;
  
  const frequency = goalEntries.length / Math.max(totalDays / 7, 1); // entries per week
  const progress = Math.min((frequency / 3) * 100, 100); // 3 entries per week = 100%
  
  // Calculate quality based on entry length and detail
  const avgLength = goalEntries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0) / goalEntries.length;
  const quality = Math.min((avgLength / 200) * 100, 100); // 200 chars = 100% quality
  
  // Calculate consistency (recent activity)
  const recentEntries = goalEntries.filter(entry => {
    const entryDate = new Date(entry.createdAt || entry.timestamp);
    const daysAgo = (new Date() - entryDate) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const consistency = Math.min((recentEntries.length / 3) * 100, 100);
  
  return { progress, quality, consistency };
};

const getGoalStatus = (progress, entryCount) => {
  if (progress >= 100) return 'completed';
  if (progress >= 75) return 'near-completion';
  if (progress >= 50) return 'in-progress';
  if (progress >= 25) return 'started';
  if (entryCount > 0) return 'beginning';
  return 'not-started';
};

const getGoalMilestones = (goal, goalEntries) => {
  const milestones = [];
  const entryCount = goalEntries.length;
  
  if (entryCount >= 1) milestones.push({ type: 'first-entry', achieved: true, date: goalEntries[0].createdAt });
  if (entryCount >= 3) milestones.push({ type: 'consistent', achieved: true, date: goalEntries[2].createdAt });
  if (entryCount >= 5) milestones.push({ type: 'dedicated', achieved: true, date: goalEntries[4].createdAt });
  if (entryCount >= 10) milestones.push({ type: 'expert', achieved: true, date: goalEntries[9].createdAt });
  
  // Add future milestones
  if (entryCount < 3) milestones.push({ type: 'consistent', achieved: false, target: 3 });
  if (entryCount < 5) milestones.push({ type: 'dedicated', achieved: false, target: 5 });
  if (entryCount < 10) milestones.push({ type: 'expert', achieved: false, target: 10 });
  
  return milestones;
};

const calculateGoalStreak = (goalEntries) => {
  if (goalEntries.length === 0) return 0;
  
  const sortedEntries = goalEntries.sort((a, b) => 
    new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
  );
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt || entry.timestamp);
    const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const assessGoalDifficulty = (goal, goalEntries) => {
  const entryCount = goalEntries.length;
  const avgLength = goalEntries.length > 0 ? 
    goalEntries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0) / goalEntries.length : 0;
  
  if (entryCount >= 10 && avgLength >= 300) return 'easy';
  if (entryCount >= 5 && avgLength >= 200) return 'medium';
  if (entryCount >= 3 && avgLength >= 100) return 'hard';
  return 'very-hard';
};

export const useGoalAnalytics = (goals, journalEntries) => {
  // Convert journalEntries object to array if needed
  const entriesArray = journalEntries && typeof journalEntries === 'object' && !Array.isArray(journalEntries) 
    ? Object.values(journalEntries).flat() 
    : journalEntries || [];
  const [analytics, setAnalytics] = useState({
    journalingFrequency: 0,
    goalProgress: {},
    insights: []
  });

  const calculateAnalytics = useCallback(() => {
    if (!goals || !entriesArray || entriesArray.length === 0) {
      setAnalytics({
        journalingFrequency: 0,
        goalProgress: {},
        insights: []
      });
      return;
    }

    // Calculate journaling frequency
    const dates = entriesArray.map(entry => {
      return safeCreateDate(entry.date);
    }).filter(date => date !== null); // Filter out invalid dates

    if (dates.length === 0) {
      setAnalytics({
        journalingFrequency: 0,
        goalProgress: {},
        insights: []
      });
      return;
    }

    const uniqueDays = new Set(dates.map(date => safeGetDateKey(date)));
    const journalingFrequency = uniqueDays.size;

    // Calculate goal progress based on journal entries that mention the goal
    const goalProgress = {};
    const goalFocusAreas = goals.focusAreas || [];
    const goalMetrics = goals.metrics || {};

    goalFocusAreas.forEach(goal => {
      // Smart goal detection with enhanced keyword matching
      const goalKeywords = getGoalKeywords(goal);
      const goalEntries = entriesArray.filter(entry => {
        if (!entry.content) return false;
        const content = entry.content.toLowerCase();
        
        // Check for exact goal match
        if (content.includes(goal.toLowerCase())) return true;
        
        // Check for keyword matches
        return goalKeywords.some(keyword => content.includes(keyword));
      });
      
      // Calculate smart progress with quality and consistency metrics
      const progress = calculateSmartProgress(goal, goalEntries, entriesArray);
      
      // Determine goal status and milestones
      const status = getGoalStatus(progress.progress, goalEntries.length);
      const milestones = getGoalMilestones(goal, goalEntries);
      
      goalProgress[goal] = {
        entries: goalEntries.length,
        progress: progress.progress,
        quality: progress.quality,
        consistency: progress.consistency,
        status,
        milestones,
        lastEntry: goalEntries.length > 0 ? goalEntries[goalEntries.length - 1].createdAt : null,
        streak: calculateGoalStreak(goalEntries),
        difficulty: assessGoalDifficulty(goal, goalEntries)
      };
    });

    // Generate meaningful insights with proper structure
    const insights = [];
    
    if (journalingFrequency > 0) {
      if (journalingFrequency >= 7) {
        insights.push({
          type: 'achievement',
          title: 'Consistency Champion',
          description: `Great consistency! You've journaled for ${journalingFrequency} days. Keep up this momentum!`,
          priority: 'high',
          actionable: false
        });
      } else if (journalingFrequency >= 3) {
        insights.push({
          type: 'positive',
          title: 'Building Habits',
          description: `Good start! You've journaled for ${journalingFrequency} days. You're building a great habit.`,
          priority: 'medium',
          actionable: false
        });
      } else {
        insights.push({
          type: 'positive',
          title: 'Journey Begins',
          description: `You've started your journaling journey with ${journalingFrequency} day${journalingFrequency > 1 ? 's' : ''}. Every entry counts!`,
          priority: 'medium',
          actionable: false
        });
      }
    }

    if (goalFocusAreas.length > 0) {
      const activeGoals = goalFocusAreas.filter(goal => goalProgress[goal]?.entries > 0);
      const completedGoals = goalFocusAreas.filter(goal => goalProgress[goal]?.progress >= 100);
      
      if (completedGoals.length > 0) {
        insights.push({
          type: 'achievement',
          title: 'Goal Achieved!',
          description: `🎉 You've completed ${completedGoals.length} goal${completedGoals.length > 1 ? 's' : ''}: ${completedGoals.join(', ')}. Amazing work!`,
          priority: 'high',
          actionable: false
        });
      }
      
      if (activeGoals.length > 0 && completedGoals.length === 0) {
        insights.push({
          type: 'correlation',
          title: 'Active Goal Pursuit',
          description: `You're actively working on ${activeGoals.length} goal${activeGoals.length > 1 ? 's' : ''}: ${activeGoals.join(', ')}. Keep writing about your progress!`,
          priority: 'medium',
          actionable: true
        });
      }
      
      if (activeGoals.length === 0 && goalFocusAreas.length > 0) {
        insights.push({
          type: 'suggestion',
          title: 'Goal Focus Opportunity',
          description: `Consider writing about your goals: ${goalFocusAreas.join(', ')}. This will help track your progress.`,
          priority: 'medium',
          actionable: true
        });
      }
    }

    // Add insights based on metrics if available
    if (Object.keys(goalMetrics).length > 0) {
      const trackedMetrics = Object.keys(goalMetrics).filter(metric => goalMetrics[metric]?.value);
      if (trackedMetrics.length > 0) {
        insights.push({
          type: 'positive',
          title: 'Tracking Progress',
          description: `You're tracking ${trackedMetrics.length} metric${trackedMetrics.length > 1 ? 's' : ''}: ${trackedMetrics.join(', ')}. This helps measure your growth.`,
          priority: 'low',
          actionable: false
        });
      }
    }

    // Add pattern-based insights
    if (journalingFrequency >= 5) {
      const recentEntries = entriesArray.slice(-5);
      const hasMoodData = recentEntries.some(entry => entry.mood || entry.energy);
      
      if (hasMoodData) {
        insights.push({
          type: 'correlation',
          title: 'Self-Awareness Growing',
          description: 'You\'re tracking your mood and energy. This self-awareness will help you understand your patterns better.',
          priority: 'medium',
          actionable: false
        });
      }
    }

    // Enhanced goal correlation insights
    if (goalFocusAreas.length > 0) {
      const activeGoals = Object.entries(goalProgress).filter(([goal, data]) => data.entries > 0);
      
      if (activeGoals.length > 1) {
        // Find goals with highest consistency
        const consistentGoals = activeGoals.filter(([goal, data]) => data.consistency >= 70);
        if (consistentGoals.length > 0) {
          const bestGoal = consistentGoals[0];
          insights.push({
            type: 'correlation',
            title: 'Consistency Champion',
            description: `You're most consistent with "${bestGoal[0]}" (${Math.round(bestGoal[1].consistency)}% consistency). This shows strong commitment!`,
            priority: 'high',
            actionable: false
          });
        }
        
        // Find goals with highest quality
        const qualityGoals = activeGoals.filter(([goal, data]) => data.quality >= 80);
        if (qualityGoals.length > 0) {
          const bestQuality = qualityGoals[0];
          insights.push({
            type: 'positive',
            title: 'Quality Writing',
            description: `Your "${bestQuality[0]}" entries show excellent detail (${Math.round(bestQuality[1].quality)}% quality). Keep up this depth!`,
            priority: 'medium',
            actionable: false
          });
        }
      }
      
      // Goal difficulty insights
      const difficultGoals = activeGoals.filter(([goal, data]) => data.difficulty === 'very-hard' || data.difficulty === 'hard');
      if (difficultGoals.length > 0) {
        insights.push({
          type: 'suggestion',
          title: 'Challenge Accepted',
          description: `You're tackling ${difficultGoals.length} challenging goal${difficultGoals.length > 1 ? 's' : ''}. Consider breaking them into smaller milestones.`,
          priority: 'medium',
          actionable: true
        });
      }
      
      // Streak insights
      const streakGoals = activeGoals.filter(([goal, data]) => data.streak >= 3);
      if (streakGoals.length > 0) {
        const bestStreak = streakGoals.reduce((best, current) => 
          current[1].streak > best[1].streak ? current : best
        );
        insights.push({
          type: 'achievement',
          title: 'Streak Master',
          description: `Amazing! You've maintained a ${bestStreak[1].streak}-day streak with "${bestStreak[0]}". Consistency is key!`,
          priority: 'high',
          actionable: false
        });
      }
    }

    setAnalytics({
      journalingFrequency,
      goalProgress,
      insights
    });
  }, [goals, entriesArray]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  return analytics;
}; 