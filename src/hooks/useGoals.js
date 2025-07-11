import { useState, useEffect, useCallback } from 'react';

export const useGoals = (user) => {
  const [goals, setGoals] = useState(null);
  const [trackingData, setTrackingData] = useState({});

  // Load goals from localStorage
  useEffect(() => {
    if (!user) return;

    const userGoalsKey = `reflectWithin_user_goals_${user.id || user.email}`;
    const userTrackingKey = `reflectWithin_tracking_data_${user.id || user.email}`;
    
    try {
      const savedGoals = localStorage.getItem(userGoalsKey);
      const savedTracking = localStorage.getItem(userTrackingKey);
      
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      
      if (savedTracking) {
        setTrackingData(JSON.parse(savedTracking));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }, [user]);

  // Save goals to localStorage
  const saveGoals = useCallback((goalData) => {
    if (!user) return;

    const userGoalsKey = `reflectWithin_user_goals_${user.id || user.email}`;
    
    try {
      localStorage.setItem(userGoalsKey, JSON.stringify(goalData));
      setGoals(goalData);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  }, [user]);

  // Update tracking data
  const updateTrackingData = useCallback((date, category, metric, value) => {
    if (!user) return;

    const userTrackingKey = `reflectWithin_tracking_data_${user.id || user.email}`;
    const dateKey = date.toISOString().split('T')[0];
    
    setTrackingData(prev => {
      const newData = {
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [category]: {
            ...prev[dateKey]?.[category],
            [metric]: value
          }
        }
      };
      
      try {
        localStorage.setItem(userTrackingKey, JSON.stringify(newData));
      } catch (error) {
        console.error('Error saving tracking data:', error);
      }
      
      return newData;
    });
  }, [user]);

  // Get tracking data for a specific date
  const getTrackingData = useCallback((date) => {
    const dateKey = date.toISOString().split('T')[0];
    return trackingData[dateKey] || {};
  }, [trackingData]);

  // Get tracking data for a date range
  const getTrackingDataRange = useCallback((startDate, endDate) => {
    const rangeData = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      if (trackingData[dateKey]) {
        rangeData[dateKey] = trackingData[dateKey];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return rangeData;
  }, [trackingData]);

  // Calculate goal progress
  const calculateGoalProgress = useCallback((goalId) => {
    if (!goals || !trackingData) return null;

    const goal = goals.goals?.find(g => g.id === goalId);
    if (!goal) return null;

    // This is a simplified progress calculation
    // In a real implementation, you'd have more complex logic based on goal type
    return {
      current: 0,
      target: 1,
      percentage: 0,
      status: 'not_started'
    };
  }, [goals, trackingData]);

  // Get insights based on tracking data
  const getInsights = useCallback(() => {
    if (!goals || !trackingData) return [];

    const insights = [];
    const recentData = getTrackingDataRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      new Date()
    );

    // Analyze mood trends
    const moodData = Object.values(recentData)
      .map(day => day.mental?.mood)
      .filter(Boolean);
    
    if (moodData.length > 0) {
      const avgMood = moodData.reduce((sum, mood) => sum + mood, 0) / moodData.length;
      if (avgMood < 5) {
        insights.push({
          type: 'mood',
          message: 'Your average mood has been lower this week. Consider what might be affecting you.',
          priority: 'medium'
        });
      }
    }

    // Analyze workout consistency
    const workoutData = Object.values(recentData)
      .map(day => day.physical?.workouts)
      .filter(Boolean);
    
    if (workoutData.length > 0) {
      const avgWorkouts = workoutData.reduce((sum, workouts) => sum + workouts, 0) / workoutData.length;
      if (avgWorkouts < 3) {
        insights.push({
          type: 'workout',
          message: 'You\'ve been working out less than usual. Remember, consistency is key!',
          priority: 'low'
        });
      }
    }

    return insights;
  }, [goals, trackingData, getTrackingDataRange]);

  return {
    goals,
    trackingData,
    saveGoals,
    updateTrackingData,
    getTrackingData,
    getTrackingDataRange,
    calculateGoalProgress,
    getInsights
  };
}; 