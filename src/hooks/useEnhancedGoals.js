import { useState, useEffect, useCallback, useMemo } from 'react';
import { createEnhancedUserDataContainer } from '../models/enhancedDataModel';

/**
 * Enhanced Goals Hook
 * Manages goal creation, progress tracking, milestone detection, and AI integration
 */
export const useEnhancedGoals = (userData, isPremium = false) => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize goals from user data
  useEffect(() => {
    if (userData?.enhancedGoals) {
      setGoals(userData.enhancedGoals);
    } else if (userData?.goals?.personalGoals) {
      // Migrate old goals to new structure
      const migratedGoals = migrateOldGoals(userData.goals.personalGoals);
      setGoals(migratedGoals);
    }
  }, [userData]);

  /**
   * Create a new enhanced goal
   */
  const createGoal = useCallback(async (goalData) => {
    setIsLoading(true);
    setError(null);

    try {
      const newGoal = {
        id: Date.now().toString(),
        userId: userData?.profile?.id || 'anonymous',
        ...goalData,
        status: 'active',
        progress: 0,
        streak: 0,
        totalDays: 0,
        current: {
          value: 0,
          lastUpdated: new Date(),
          lastEntryId: null
        },
        analytics: {
          startValue: 0,
          bestValue: 0,
          averageProgress: 0,
          consistencyScore: 0,
          trend: 'stable',
          correlationWithMood: null,
          correlationWithEnergy: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);

      // Save to backend if premium
      if (isPremium) {
        await saveGoalsToBackend(updatedGoals);
      }

      return newGoal;
    } catch (error) {
      setError('Failed to create goal');
      console.error('Create goal error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [goals, userData, isPremium]);

  /**
   * Update goal progress
   */
  const updateGoalProgress = useCallback(async (goalId, newValue, entryId = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const oldValue = goal.current.value;
          const progress = calculateProgress(goal, newValue);
          const streak = calculateStreak(goal, newValue);
          
          return {
            ...goal,
            current: {
              value: newValue,
              lastUpdated: new Date(),
              lastEntryId: entryId
            },
            progress,
            streak,
            totalDays: goal.totalDays + 1,
            analytics: {
              ...goal.analytics,
              bestValue: Math.max(goal.analytics.bestValue, newValue),
              averageProgress: calculateAverageProgress(goal, newValue),
              trend: calculateTrend(goal, newValue)
            },
            updatedAt: new Date()
          };
        }
        return goal;
      });

      setGoals(updatedGoals);

      // Check for milestone achievements
      const goal = updatedGoals.find(g => g.id === goalId);
      if (goal) {
        const achievedMilestones = checkMilestoneAchievements(goal);
        if (achievedMilestones.length > 0) {
          // Trigger milestone celebration
          triggerMilestoneCelebration(goal, achievedMilestones);
        }
      }

      // Save to backend if premium
      if (isPremium) {
        await saveGoalsToBackend(updatedGoals);
      }

      return updatedGoals.find(g => g.id === goalId);
    } catch (error) {
      setError('Failed to update goal progress');
      console.error('Update goal progress error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [goals, isPremium]);

  /**
   * Complete a goal
   */
  const completeGoal = useCallback(async (goalId) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          return {
            ...goal,
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
            updatedAt: new Date()
          };
        }
        return goal;
      });

      setGoals(updatedGoals);

      // Save to backend if premium
      if (isPremium) {
        await saveGoalsToBackend(updatedGoals);
      }

      return updatedGoals.find(g => g.id === goalId);
    } catch (error) {
      setError('Failed to complete goal');
      console.error('Complete goal error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [goals, isPremium]);

  /**
   * Delete a goal
   */
  const deleteGoal = useCallback(async (goalId) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);

      // Save to backend if premium
      if (isPremium) {
        await saveGoalsToBackend(updatedGoals);
      }
    } catch (error) {
      setError('Failed to delete goal');
      console.error('Delete goal error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [goals, isPremium]);

  /**
   * Get goal analytics
   */
  const getGoalAnalytics = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    
    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      completionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0,
      averageProgress: activeGoals.length > 0 
        ? activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length 
        : 0,
      totalStreak: activeGoals.reduce((sum, goal) => sum + goal.streak, 0),
      categoryBreakdown: getCategoryBreakdown(goals),
      recentProgress: getRecentProgress(activeGoals),
      upcomingMilestones: getUpcomingMilestones(activeGoals)
    };
  }, [goals]);

  /**
   * Get AI context for goals
   */
  const getGoalAIContext = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'active');
    
    return {
      activeGoals,
      recentProgress: getRecentProgress(activeGoals),
      upcomingMilestones: getUpcomingMilestones(activeGoals),
      goalStreaks: activeGoals.map(g => ({ id: g.id, streak: g.streak })),
      goalSuggestions: generateGoalSuggestions(activeGoals)
    };
  }, [goals]);

  /**
   * Extract goal progress from journal entry
   */
  const extractGoalProgress = useCallback((entry) => {
    const extractedProgress = [];
    
    goals.forEach(goal => {
      if (goal.status !== 'active') return;
      
      const progress = extractProgressFromEntry(entry, goal);
      if (progress !== null) {
        extractedProgress.push({
          goalId: goal.id,
          value: progress,
          entryId: entry.id
        });
      }
    });
    
    return extractedProgress;
  }, [goals]);

  return {
    // State
    goals,
    isLoading,
    error,
    
    // Actions
    createGoal,
    updateGoalProgress,
    completeGoal,
    deleteGoal,
    
    // Analytics
    analytics: getGoalAnalytics,
    aiContext: getGoalAIContext,
    
    // Utilities
    extractGoalProgress
  };
};

// Helper Functions

/**
 * Migrate old goals to new structure
 */
function migrateOldGoals(oldGoals) {
  return oldGoals.map((oldGoal, index) => ({
    id: oldGoal.id || `migrated_${index}`,
    title: oldGoal.title || `Migrated Goal ${index + 1}`,
    description: oldGoal.description || 'Migrated from previous version',
    category: 'growth', // Default category
    metricId: 'goals',
    templateId: 'goal_achievement',
    target: {
      value: 3,
      unit: 'goals_completed',
      type: 'count',
      timeline: 'ongoing'
    },
    status: 'active',
    progress: 0,
    streak: 0,
    totalDays: 0,
    current: {
      value: 0,
      lastUpdated: new Date(),
      lastEntryId: null
    },
    milestones: [
      { id: 'milestone_1', value: 1, label: 'First Goal', achieved: false, achievedDate: null, celebrated: false },
      { id: 'milestone_2', value: 2, label: 'Second Goal', achieved: false, achievedDate: null, celebrated: false },
      { id: 'milestone_3', value: 3, label: 'Goal Achieved', achieved: false, achievedDate: null, celebrated: false }
    ],
    aiContext: {
      lastMentioned: null,
      mentionCount: 0,
      aiResponses: [],
      suggestedPrompts: [
        'How are your goals progressing?',
        'What steps are you taking toward your goals?',
        'How do you feel about your goal progress?'
      ]
    },
    analytics: {
      startValue: 0,
      bestValue: 0,
      averageProgress: 0,
      consistencyScore: 0,
      trend: 'stable',
      correlationWithMood: null,
      correlationWithEnergy: null
    },
    createdAt: oldGoal.createdAt || new Date(),
    updatedAt: new Date()
  }));
}

/**
 * Calculate progress percentage
 */
function calculateProgress(goal, newValue) {
  const { target } = goal;
  
  if (target.type === 'scale') {
    // For scale-based goals (1-10), calculate percentage
    return Math.min((newValue / target.value) * 100, 100);
  } else if (target.type === 'frequency') {
    // For frequency goals, calculate based on weekly average
    return Math.min((newValue / target.value) * 100, 100);
  } else {
    // For number/count goals, calculate based on target
    return Math.min((newValue / target.value) * 100, 100);
  }
}

/**
 * Calculate streak
 */
function calculateStreak(goal, newValue) {
  const lastUpdate = goal.current.lastUpdated;
  const now = new Date();
  const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastUpdate <= 1) {
    // Continue streak if updated within 1 day
    return goal.streak + 1;
  } else {
    // Reset streak if more than 1 day gap
    return 1;
  }
}

/**
 * Calculate average progress
 */
function calculateAverageProgress(goal, newValue) {
  const currentAvg = goal.analytics.averageProgress;
  const totalUpdates = goal.totalDays + 1;
  
  return ((currentAvg * goal.totalDays) + newValue) / totalUpdates;
}

/**
 * Calculate trend
 */
function calculateTrend(goal, newValue) {
  const oldValue = goal.current.value;
  
  if (newValue > oldValue) return 'improving';
  if (newValue < oldValue) return 'declining';
  return 'stable';
}

/**
 * Check for milestone achievements
 */
function checkMilestoneAchievements(goal) {
  const achievedMilestones = [];
  
  goal.milestones.forEach(milestone => {
    if (!milestone.achieved && goal.progress >= milestone.value) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
      achievedMilestones.push(milestone);
    }
  });
  
  return achievedMilestones;
}

/**
 * Trigger milestone celebration
 */
function triggerMilestoneCelebration(goal, milestones) {
  // This would typically trigger a notification or celebration UI
  console.log(`🎉 Goal "${goal.title}" achieved milestones:`, milestones.map(m => m.label));
  
  // You could integrate with a notification system here
  // showNotification(`Congratulations! You achieved ${milestones.length} milestone(s) in your "${goal.title}" goal!`);
}

/**
 * Get category breakdown
 */
function getCategoryBreakdown(goals) {
  const breakdown = {};
  
  goals.forEach(goal => {
    if (!breakdown[goal.category]) {
      breakdown[goal.category] = { total: 0, active: 0, completed: 0 };
    }
    breakdown[goal.category].total++;
    if (goal.status === 'active') breakdown[goal.category].active++;
    if (goal.status === 'completed') breakdown[goal.category].completed++;
  });
  
  return breakdown;
}

/**
 * Get recent progress
 */
function getRecentProgress(activeGoals) {
  return activeGoals
    .filter(goal => goal.current.lastUpdated)
    .sort((a, b) => new Date(b.current.lastUpdated) - new Date(a.current.lastUpdated))
    .slice(0, 5)
    .map(goal => ({
      id: goal.id,
      title: goal.title,
      progress: goal.progress,
      lastUpdated: goal.current.lastUpdated
    }));
}

/**
 * Get upcoming milestones
 */
function getUpcomingMilestones(activeGoals) {
  const upcoming = [];
  
  activeGoals.forEach(goal => {
    goal.milestones.forEach(milestone => {
      if (!milestone.achieved && goal.progress < milestone.value) {
        upcoming.push({
          goalId: goal.id,
          goalTitle: goal.title,
          milestone: milestone,
          progressToMilestone: milestone.value - goal.progress
        });
      }
    });
  });
  
  return upcoming.sort((a, b) => a.progressToMilestone - b.progressToMilestone).slice(0, 5);
}

/**
 * Generate goal suggestions
 */
function generateGoalSuggestions(activeGoals) {
  const suggestions = [];
  
  // Suggest goal review for goals with low progress
  const lowProgressGoals = activeGoals.filter(g => g.progress < 25);
  if (lowProgressGoals.length > 0) {
    suggestions.push({
      type: 'review',
      message: `Consider reviewing your ${lowProgressGoals.length} goal(s) with low progress`,
      goals: lowProgressGoals.map(g => g.id)
    });
  }
  
  // Suggest celebration for high progress goals
  const highProgressGoals = activeGoals.filter(g => g.progress > 75);
  if (highProgressGoals.length > 0) {
    suggestions.push({
      type: 'celebrate',
      message: `Great progress on ${highProgressGoals.length} goal(s)!`,
      goals: highProgressGoals.map(g => g.id)
    });
  }
  
  return suggestions;
}

/**
 * Extract progress from journal entry
 */
function extractProgressFromEntry(entry, goal) {
  const content = (entry.content || '').toLowerCase();
  const { category, metricId } = goal;
  
  // This is a simplified extraction - in a real app, you'd use NLP
  // to extract specific values from the entry content
  
  // Example: Extract weight mentions
  if (metricId === 'weight' && category === 'physical') {
    const weightMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg)/i);
    if (weightMatch) {
      return parseFloat(weightMatch[1]);
    }
  }
  
  // Example: Extract workout mentions
  if (metricId === 'workouts' && category === 'physical') {
    const workoutKeywords = ['workout', 'exercise', 'gym', 'training'];
    if (workoutKeywords.some(keyword => content.includes(keyword))) {
      return 1; // Count as one workout
    }
  }
  
  // Example: Extract mood mentions
  if (metricId === 'mood' && category === 'mental') {
    const moodKeywords = {
      'happy': 8, 'great': 8, 'excellent': 9, 'amazing': 9,
      'good': 7, 'fine': 6, 'okay': 5, 'neutral': 5,
      'bad': 3, 'terrible': 2, 'awful': 1
    };
    
    for (const [keyword, value] of Object.entries(moodKeywords)) {
      if (content.includes(keyword)) {
        return value;
      }
    }
  }
  
  return null; // No progress detected
}

/**
 * Save goals to backend
 */
async function saveGoalsToBackend(goals) {
  // This would typically make an API call to save goals
  // For now, we'll just log the action
  console.log('Saving goals to backend:', goals.length);
  
  // Example API call:
  // const response = await fetch('/api/goals', {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ goals })
  // });
  // return response.json();
} 