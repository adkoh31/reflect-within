import { useCallback, useMemo } from 'react';

export const useGoalAnalytics = (goals, journalEntries, messages) => {
  
  // Analyze journaling consistency against goals
  const analyzeJournalingConsistency = useCallback(() => {
    if (!goals || !journalEntries) return null;

    const entries = Object.values(journalEntries);
    const totalEntries = entries.length;
    
    if (totalEntries === 0) return null;

    // Calculate journaling frequency
    const dates = entries.map(entry => new Date(entry.date));
    const uniqueDays = new Set(dates.map(date => date.toISOString().split('T')[0]));
    const daysWithEntries = uniqueDays.size;
    
    // Calculate current streak
    const sortedDates = Array.from(uniqueDays).sort();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = sortedDates[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - (sortedDates.length - 1 - i));
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (date === expectedDateStr) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get user's journaling goal preference
    const journalingGoal = goals.preferences?.journalingGoal || 'inspired';
    
    let goalMet = false;
    let progressPercentage = 0;
    
    switch (journalingGoal) {
      case 'daily':
        goalMet = currentStreak >= 7; // 7-day streak
        progressPercentage = Math.min((currentStreak / 7) * 100, 100);
        break;
      case 'weekly':
        goalMet = daysWithEntries >= 3; // 3+ days per week
        progressPercentage = Math.min((daysWithEntries / 7) * 100, 100);
        break;
      case 'inspired':
        goalMet = totalEntries >= 5; // At least 5 entries total
        progressPercentage = Math.min((totalEntries / 10) * 100, 100);
        break;
    }

    return {
      totalEntries,
      daysWithEntries,
      currentStreak,
      goalMet,
      progressPercentage,
      journalingGoal,
      averageEntriesPerWeek: totalEntries / Math.max(1, Math.ceil(daysWithEntries / 7))
    };
  }, [goals, journalEntries]);

  // Analyze mood trends against mental wellness goals
  const analyzeMoodTrends = useCallback(() => {
    if (!goals || !journalEntries) return null;

    const mentalMetrics = goals.metrics?.mental || [];
    if (!mentalMetrics.includes('mood')) return null;

    const entries = Object.values(journalEntries).filter(entry => entry.mood);
    
    if (entries.length === 0) return null;

    // Mood scoring (1-7 scale)
    const moodScores = {
      'excited': 7,
      'happy': 6,
      'calm': 5,
      'neutral': 4,
      'tired': 3,
      'stressed': 2,
      'frustrated': 1
    };

    const moodData = entries.map(entry => ({
      date: entry.date,
      mood: entry.mood,
      score: moodScores[entry.mood] || 4
    }));

    // Calculate trends
    const recentEntries = moodData.slice(-7); // Last 7 entries
    const olderEntries = moodData.slice(0, -7); // Previous entries

    const recentAvg = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + entry.score, 0) / recentEntries.length 
      : 0;
    
    const olderAvg = olderEntries.length > 0 
      ? olderEntries.reduce((sum, entry) => sum + entry.score, 0) / olderEntries.length 
      : recentAvg;

    const moodChange = recentAvg - olderAvg;
    const moodTrend = moodChange > 0.5 ? 'improving' : moodChange < -0.5 ? 'declining' : 'stable';

    // Most common moods
    const moodCounts = {};
    moodData.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    return {
      totalMoodEntries: moodData.length,
      averageMood: recentAvg,
      moodTrend,
      moodChange: Math.round(moodChange * 10) / 10,
      mostCommonMood,
      recentMoodEntries: recentEntries.length,
      goalMet: recentAvg >= 5, // Goal: maintain positive mood (5+)
      progressPercentage: Math.min((recentAvg / 7) * 100, 100)
    };
  }, [goals, journalEntries]);

  // Analyze energy patterns against physical goals
  const analyzeEnergyPatterns = useCallback(() => {
    if (!goals || !journalEntries) return null;

    const physicalMetrics = goals.metrics?.physical || [];
    if (!physicalMetrics.includes('workouts')) return null;

    const entries = Object.values(journalEntries).filter(entry => entry.energy !== null);
    
    if (entries.length === 0) return null;

    const energyData = entries.map(entry => ({
      date: entry.date,
      energy: entry.energy,
      hasWorkout: entry.topics?.some(topic => 
        topic.toLowerCase().includes('workout') || 
        topic.toLowerCase().includes('exercise') ||
        topic.toLowerCase().includes('gym') ||
        topic.toLowerCase().includes('run')
      )
    }));

    // Energy on workout vs non-workout days
    const workoutDays = energyData.filter(entry => entry.hasWorkout);
    const nonWorkoutDays = energyData.filter(entry => !entry.hasWorkout);

    const workoutEnergyAvg = workoutDays.length > 0 
      ? workoutDays.reduce((sum, entry) => sum + entry.energy, 0) / workoutDays.length 
      : 0;
    
    const nonWorkoutEnergyAvg = nonWorkoutDays.length > 0 
      ? nonWorkoutDays.reduce((sum, entry) => sum + entry.energy, 0) / nonWorkoutDays.length 
      : 0;

    const energyCorrelation = workoutEnergyAvg - nonWorkoutEnergyAvg;
    const hasEnergyCorrelation = Math.abs(energyCorrelation) > 0.5;

    // Overall energy trend
    const recentEnergy = energyData.slice(-7);
    const olderEnergy = energyData.slice(0, -7);

    const recentEnergyAvg = recentEnergy.length > 0 
      ? recentEnergy.reduce((sum, entry) => sum + entry.energy, 0) / recentEnergy.length 
      : 0;
    
    const olderEnergyAvg = olderEnergy.length > 0 
      ? olderEnergy.reduce((sum, entry) => sum + entry.energy, 0) / olderEnergy.length 
      : recentEnergyAvg;

    const energyChange = recentEnergyAvg - olderEnergyAvg;
    const energyTrend = energyChange > 0.3 ? 'improving' : energyChange < -0.3 ? 'declining' : 'stable';

    return {
      totalEnergyEntries: energyData.length,
      averageEnergy: recentEnergyAvg,
      energyTrend,
      energyChange: Math.round(energyChange * 10) / 10,
      workoutDays: workoutDays.length,
      nonWorkoutDays: nonWorkoutDays.length,
      workoutEnergyAvg: Math.round(workoutEnergyAvg * 10) / 10,
      nonWorkoutEnergyAvg: Math.round(nonWorkoutEnergyAvg * 10) / 10,
      hasEnergyCorrelation,
      energyCorrelation: Math.round(energyCorrelation * 10) / 10,
      goalMet: recentEnergyAvg >= 3.5, // Goal: maintain good energy (3.5+)
      progressPercentage: Math.min((recentEnergyAvg / 5) * 100, 100)
    };
  }, [goals, journalEntries]);

  // Analyze topic alignment with selected focus areas
  const analyzeTopicAlignment = useCallback(() => {
    if (!goals || !journalEntries) return null;

    const selectedCategories = goals.categories || [];
    if (selectedCategories.length === 0) return null;

    const entries = Object.values(journalEntries);
    if (entries.length === 0) return null;

    // Define topic mappings to categories
    const topicMappings = {
      physical: ['workout', 'exercise', 'gym', 'run', 'fitness', 'training', 'squat', 'deadlift', 'cardio', 'strength', 'weight', 'body', 'muscle', 'health', 'nutrition', 'diet', 'sleep', 'recovery', 'sore', 'pain', 'injury'],
      mental: ['mood', 'stress', 'anxiety', 'depression', 'happy', 'sad', 'angry', 'frustrated', 'calm', 'peaceful', 'meditation', 'mindfulness', 'therapy', 'counseling', 'mental', 'emotional', 'feeling', 'thought', 'mind'],
      growth: ['goal', 'achievement', 'progress', 'learning', 'study', 'read', 'book', 'course', 'skill', 'development', 'improvement', 'growth', 'success', 'failure', 'challenge', 'overcome', 'habit', 'routine', 'productivity', 'focus'],
      lifestyle: ['routine', 'schedule', 'time', 'balance', 'work', 'life', 'family', 'friend', 'social', 'relationship', 'hobby', 'interest', 'passion', 'creative', 'art', 'music', 'travel', 'vacation', 'rest', 'leisure', 'fun', 'enjoy']
    };

    // Count topics by category
    const categoryCounts = {};
    selectedCategories.forEach(category => {
      categoryCounts[category] = 0;
    });

    let totalRelevantEntries = 0;

    entries.forEach(entry => {
      const entryTopics = entry.topics || [];
      const entryContent = entry.content.toLowerCase();
      
      let hasRelevantTopic = false;
      
      selectedCategories.forEach(category => {
        const categoryTopics = topicMappings[category] || [];
        
        // Check if any topic matches this category
        const topicMatch = entryTopics.some(topic => 
          categoryTopics.some(catTopic => 
            topic.toLowerCase().includes(catTopic)
          )
        );
        
        // Check if content mentions this category
        const contentMatch = categoryTopics.some(catTopic => 
          entryContent.includes(catTopic)
        );
        
        if (topicMatch || contentMatch) {
          categoryCounts[category]++;
          hasRelevantTopic = true;
        }
      });
      
      if (hasRelevantTopic) {
        totalRelevantEntries++;
      }
    });

    // Calculate alignment percentage
    const alignmentPercentage = entries.length > 0 
      ? (totalRelevantEntries / entries.length) * 100 
      : 0;

    // Find most focused category
    const mostFocusedCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    return {
      totalEntries: entries.length,
      totalRelevantEntries,
      alignmentPercentage: Math.round(alignmentPercentage),
      categoryCounts,
      mostFocusedCategory,
      goalMet: alignmentPercentage >= 60, // Goal: 60%+ entries align with focus areas
      progressPercentage: Math.min(alignmentPercentage, 100)
    };
  }, [goals, journalEntries]);

  // Generate goal-based insights
  const generateGoalInsights = useCallback(() => {
    const insights = [];
    
    const journalingAnalysis = analyzeJournalingConsistency();
    const moodAnalysis = analyzeMoodTrends();
    const energyAnalysis = analyzeEnergyPatterns();
    const topicAnalysis = analyzeTopicAlignment();

    // Journaling insights
    if (journalingAnalysis) {
      if (journalingAnalysis.currentStreak >= 7) {
        insights.push({
          type: 'achievement',
          category: 'journaling',
          title: 'Consistency Champion!',
          message: `You've journaled ${journalingAnalysis.currentStreak} days in a row. Amazing consistency!`,
          priority: 'high',
          icon: '🔥'
        });
      } else if (journalingAnalysis.progressPercentage < 50) {
        insights.push({
          type: 'suggestion',
          category: 'journaling',
          title: 'Build Your Journaling Habit',
          message: `You're ${Math.round(100 - journalingAnalysis.progressPercentage)}% away from your journaling goal. Try setting a daily reminder!`,
          priority: 'medium',
          icon: '📝'
        });
      }
    }

    // Mood insights
    if (moodAnalysis) {
      if (moodAnalysis.moodTrend === 'improving') {
        insights.push({
          type: 'positive',
          category: 'mental',
          title: 'Mood on the Rise!',
          message: `Your mood has improved by ${Math.abs(moodAnalysis.moodChange)} points. Keep up the great work!`,
          priority: 'medium',
          icon: '😊'
        });
      } else if (moodAnalysis.averageMood < 4) {
        insights.push({
          type: 'suggestion',
          category: 'mental',
          title: 'Mood Check-in',
          message: 'Your average mood has been lower recently. Consider what might be affecting you.',
          priority: 'high',
          icon: '🧠'
        });
      }
    }

    // Energy insights
    if (energyAnalysis) {
      if (energyAnalysis.hasEnergyCorrelation && energyAnalysis.energyCorrelation > 0) {
        insights.push({
          type: 'correlation',
          category: 'physical',
          title: 'Workout Energy Boost!',
          message: `Your energy is ${energyAnalysis.energyCorrelation} points higher on workout days. Exercise is working for you!`,
          priority: 'medium',
          icon: '💪'
        });
      } else if (energyAnalysis.energyTrend === 'declining') {
        insights.push({
          type: 'suggestion',
          category: 'physical',
          title: 'Energy Check',
          message: 'Your energy levels have been declining. Consider your sleep, nutrition, and stress levels.',
          priority: 'medium',
          icon: '⚡'
        });
      }
    }

    // Topic alignment insights
    if (topicAnalysis) {
      if (topicAnalysis.alignmentPercentage >= 80) {
        insights.push({
          type: 'achievement',
          category: 'focus',
          title: 'Focused Reflection!',
          message: `${topicAnalysis.alignmentPercentage}% of your entries align with your focus areas. You're staying on track!`,
          priority: 'medium',
          icon: '🎯'
        });
      } else if (topicAnalysis.alignmentPercentage < 40) {
        insights.push({
          type: 'suggestion',
          category: 'focus',
          title: 'Refocus Your Reflections',
          message: `Only ${topicAnalysis.alignmentPercentage}% of your entries relate to your goals. Try using journal templates to stay focused.`,
          priority: 'medium',
          icon: '📋'
        });
      }
    }

    return insights;
  }, [analyzeJournalingConsistency, analyzeMoodTrends, analyzeEnergyPatterns, analyzeTopicAlignment]);

  // Get overall goal progress summary
  const getGoalProgressSummary = useCallback(() => {
    const journalingAnalysis = analyzeJournalingConsistency();
    const moodAnalysis = analyzeMoodTrends();
    const energyAnalysis = analyzeEnergyPatterns();
    const topicAnalysis = analyzeTopicAlignment();

    const metrics = [];
    
    if (journalingAnalysis) {
      metrics.push({
        name: 'Journaling Consistency',
        progress: journalingAnalysis.progressPercentage,
        goalMet: journalingAnalysis.goalMet,
        category: 'journaling'
      });
    }

    if (moodAnalysis) {
      metrics.push({
        name: 'Mental Wellness',
        progress: moodAnalysis.progressPercentage,
        goalMet: moodAnalysis.goalMet,
        category: 'mental'
      });
    }

    if (energyAnalysis) {
      metrics.push({
        name: 'Physical Energy',
        progress: energyAnalysis.progressPercentage,
        goalMet: energyAnalysis.goalMet,
        category: 'physical'
      });
    }

    if (topicAnalysis) {
      metrics.push({
        name: 'Goal Alignment',
        progress: topicAnalysis.progressPercentage,
        goalMet: topicAnalysis.goalMet,
        category: 'focus'
      });
    }

    const totalProgress = metrics.length > 0 
      ? metrics.reduce((sum, metric) => sum + metric.progress, 0) / metrics.length 
      : 0;

    const goalsMet = metrics.filter(metric => metric.goalMet).length;
    const totalGoals = metrics.length;

    return {
      totalProgress: Math.round(totalProgress),
      goalsMet,
      totalGoals,
      metrics,
      overallStatus: totalProgress >= 80 ? 'excellent' : totalProgress >= 60 ? 'good' : totalProgress >= 40 ? 'fair' : 'needs_improvement'
    };
  }, [analyzeJournalingConsistency, analyzeMoodTrends, analyzeEnergyPatterns, analyzeTopicAlignment]);

  return {
    analyzeJournalingConsistency,
    analyzeMoodTrends,
    analyzeEnergyPatterns,
    analyzeTopicAlignment,
    generateGoalInsights,
    getGoalProgressSummary
  };
}; 