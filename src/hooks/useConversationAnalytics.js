import { useMemo, useCallback } from 'react';
import { generateMemoryInsights } from '../utils/conversationAnalytics.js';

/**
 * Analytics hook for conversation insights
 * Uses useMemo for performance optimization
 */
export const useConversationAnalytics = (conversations) => {
  // Generate memory insights using useMemo for performance
  const memoryInsights = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return null;
    }

    return generateMemoryInsights(conversations);
  }, [conversations]);

  // Get memory insights for AI context
  const getMemoryInsightsForAI = useCallback(() => {
    if (!memoryInsights) return null;

    return {
      conversationPatterns: memoryInsights.conversationPatterns,
      emotionalTrends: memoryInsights.emotionalTrends,
      topicEvolution: memoryInsights.topicEvolution,
      engagementMetrics: memoryInsights.engagementMetrics,
      longTermPatterns: memoryInsights.longTermPatterns
    };
  }, [memoryInsights]);

  // Generate smart conversation starters
  const generateSmartStarters = useCallback(() => {
    if (!memoryInsights || conversations.length === 0) {
      return getDefaultStarters();
    }

    const starters = [];
    const currentHour = new Date().getHours();
    const currentDate = new Date();
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // 1. Time-based starters
    if (currentHour >= 6 && currentHour <= 10) {
      starters.push({
        text: "How are you feeling this morning?",
        type: "time-based",
        priority: 1
      });
    } else if (currentHour >= 18 && currentHour <= 22) {
      starters.push({
        text: "How was your day? What's on your mind?",
        type: "time-based",
        priority: 1
      });
    }

    // 2. Pattern-based starters
    if (memoryInsights.longTermPatterns?.recurringThemes?.length > 0) {
      const recentTheme = memoryInsights.longTermPatterns.recurringThemes[0];
      starters.push({
        text: `I've noticed you've been thinking about ${recentTheme} lately. How's that going?`,
        type: "pattern-based",
        priority: 2
      });
    }

    // 3. Achievement-based starters
    if (memoryInsights.longTermPatterns?.achievementPatterns?.length > 0) {
      const recentAchievement = memoryInsights.longTermPatterns.achievementPatterns.slice(-1)[0];
      if (recentAchievement && isRecent(recentAchievement.timestamp, 7)) { // Within last 7 days
        starters.push({
          text: `I remember you mentioned ${recentAchievement.achievement}. How are you feeling about that progress?`,
          type: "achievement-based",
          priority: 2
        });
      }
    }

    // 4. Emotional state starters
    if (memoryInsights.emotionalTrends?.overallSentiment === 'negative') {
      starters.push({
        text: "I've noticed you've been going through some challenges lately. How are you doing today?",
        type: "emotional-support",
        priority: 3
      });
    } else if (memoryInsights.emotionalTrends?.overallSentiment === 'positive') {
      starters.push({
        text: "You've been in such a positive space lately! What's contributing to that energy?",
        type: "celebration",
        priority: 2
      });
    }

    // 5. Goal-focused starters
    if (memoryInsights.longTermPatterns?.goalMentions?.length > 0) {
      const recentGoal = memoryInsights.longTermPatterns.goalMentions.slice(-1)[0];
      if (recentGoal && isRecent(recentGoal.timestamp, 14)) { // Within last 14 days
        starters.push({
          text: `You mentioned wanting to ${recentGoal.goal}. How's that coming along?`,
          type: "goal-focused",
          priority: 2
        });
      }
    }

    // 6. Engagement-based starters
    if (memoryInsights.engagementMetrics?.peakEngagementTimes?.includes(`${currentHour}:00`)) {
      starters.push({
        text: "This is usually when you're most engaged in our conversations. What would you like to explore?",
        type: "engagement-based",
        priority: 1
      });
    }

    // 7. Streak-based starters
    if (memoryInsights.conversationPatterns?.totalConversations > 5) {
      starters.push({
        text: `We've had ${memoryInsights.conversationPatterns.totalConversations} conversations together. What's been the most meaningful insight for you?`,
        type: "reflection",
        priority: 1
      });
    }

    // 8. Weekend vs weekday starters
    if (isWeekend) {
      starters.push({
        text: "Weekends can be a great time for reflection. What's on your mind?",
        type: "time-based",
        priority: 1
      });
    } else {
      starters.push({
        text: "How are you balancing work and wellness this week?",
        type: "balance-focused",
        priority: 1
      });
    }

    // Sort by priority and return top 3
    return starters
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);
  }, [memoryInsights, conversations.length]);

  // Get default starters for new users
  const getDefaultStarters = useCallback(() => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour <= 10) {
      return [
        { text: "How are you feeling this morning?", type: "default", priority: 1 },
        { text: "What's your intention for today?", type: "default", priority: 1 },
        { text: "What would you like to explore or reflect on?", type: "default", priority: 1 }
      ];
    } else if (currentHour >= 18 && currentHour <= 22) {
      return [
        { text: "How was your day?", type: "default", priority: 1 },
        { text: "What's something you're grateful for today?", type: "default", priority: 1 },
        { text: "What's on your mind right now?", type: "default", priority: 1 }
      ];
    } else {
      return [
        { text: "How are you feeling right now?", type: "default", priority: 1 },
        { text: "What would you like to talk about?", type: "default", priority: 1 },
        { text: "What's been on your mind lately?", type: "default", priority: 1 }
      ];
    }
  }, []);

  // Helper function to check if timestamp is recent
  const isRecent = useCallback((timestamp, days) => {
    const timestampDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - timestampDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }, []);

  return {
    // Analytics data
    memoryInsights,
    
    // Functions
    getMemoryInsightsForAI,
    generateSmartStarters,
    getDefaultStarters
  };
}; 