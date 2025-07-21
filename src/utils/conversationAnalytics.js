/**
 * Pure utility functions for conversation analysis
 * No React dependencies - can be used anywhere
 */

// Enhanced conversation metadata with advanced tracking
export const createEnhancedMetadata = () => ({
  topics: [],
  mood: null,
  goals: [],
  emotionalState: {
    primary: null,
    intensity: 0,
    trend: 'neutral'
  },
  engagement: {
    userMessageLength: 0,
    responseTime: 0,
    interactionFrequency: 0
  },
  insights: {
    moodTrend: null,
    consistencyScore: null,
    goalProgress: null,
    topicEvolution: [],
    emotionalPatterns: [],
    peakInteractionTimes: []
  },
  longTermMemory: {
    recurringThemes: [],
    emotionalTriggers: [],
    goalMentions: [],
    stressPatterns: [],
    achievementCelebrations: []
  }
});

// Enhanced topic extraction with clustering
export const extractTopicsFromText = (text) => {
  const topics = [];
  const textLower = text.toLowerCase();
  
  // Enhanced topic keywords with fitness focus
  const topicKeywords = {
    'work': ['work', 'job', 'career', 'office', 'meeting', 'project', 'deadline', 'presentation'],
    'fitness': ['workout', 'exercise', 'gym', 'run', 'train', 'fitness', 'crossfit', 'yoga', 'strength', 'cardio'],
    'stress': ['stress', 'anxiety', 'worried', 'overwhelmed', 'pressure', 'burnout', 'exhausted'],
    'relationships': ['friend', 'family', 'partner', 'relationship', 'social', 'dating', 'marriage'],
    'health': ['health', 'sick', 'pain', 'doctor', 'medical', 'injury', 'recovery', 'soreness'],
    'goals': ['goal', 'target', 'achieve', 'success', 'progress', 'milestone', 'objective'],
    'mood': ['happy', 'sad', 'angry', 'excited', 'depressed', 'joy', 'frustrated', 'grateful'],
    'sleep': ['sleep', 'tired', 'rest', 'insomnia', 'bedtime', 'fatigue', 'energy'],
    'meditation': ['meditation', 'mindfulness', 'zen', 'breath', 'calm', 'peace', 'centered'],
    'nutrition': ['food', 'diet', 'nutrition', 'eating', 'meal', 'hungry', 'energy'],
    'motivation': ['motivated', 'inspired', 'driven', 'passion', 'purpose', 'why'],
    'recovery': ['recovery', 'rest', 'rest day', 'active recovery', 'stretching', 'mobility'],
    'performance': ['performance', 'pr', 'personal record', 'improvement', 'progress'],
    'balance': ['balance', 'work-life', 'priorities', 'time management', 'schedule']
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      topics.push(topic);
    }
  });

  return topics;
};

// Enhanced emotional state analysis
export const analyzeEmotionalState = (text) => {
  const textLower = text.toLowerCase();
  
  // Emotional keywords with intensity scoring
  const emotionalKeywords = {
    positive: {
      high: ['ecstatic', 'thrilled', 'amazing', 'incredible', 'fantastic', 'wonderful'],
      medium: ['happy', 'excited', 'grateful', 'proud', 'motivated', 'confident'],
      low: ['content', 'peaceful', 'calm', 'satisfied', 'okay', 'fine']
    },
    negative: {
      high: ['devastated', 'terrified', 'furious', 'desperate', 'hopeless'],
      medium: ['sad', 'angry', 'frustrated', 'anxious', 'worried', 'stressed'],
      low: ['disappointed', 'concerned', 'tired', 'bored', 'neutral']
    }
  };

  let primaryEmotion = 'neutral';
  let intensity = 0;

  // Check for positive emotions
  for (const [level, keywords] of Object.entries(emotionalKeywords.positive)) {
    const found = keywords.some(keyword => textLower.includes(keyword));
    if (found) {
      primaryEmotion = 'positive';
      intensity = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
      break;
    }
  }

  // Check for negative emotions
  for (const [level, keywords] of Object.entries(emotionalKeywords.negative)) {
    const found = keywords.some(keyword => textLower.includes(keyword));
    if (found) {
      primaryEmotion = 'negative';
      intensity = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
      break;
    }
  }

  return { primary: primaryEmotion, intensity };
};

// Analyze conversation patterns
export const analyzeConversationPatterns = (conversations) => {
  const patterns = {
    totalConversations: conversations.length,
    averageMessagesPerConversation: 0,
    mostActiveTime: null,
    conversationDuration: {
      short: 0, // < 10 messages
      medium: 0, // 10-30 messages
      long: 0 // > 30 messages
    }
  };

  let totalMessages = 0;
  const timeSlots = {};

  conversations.forEach(conv => {
    totalMessages += conv.messages.length;
    
    // Categorize by duration
    if (conv.messages.length < 10) patterns.conversationDuration.short++;
    else if (conv.messages.length < 30) patterns.conversationDuration.medium++;
    else patterns.conversationDuration.long++;

    // Analyze time patterns
    conv.messages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      timeSlots[hour] = (timeSlots[hour] || 0) + 1;
    });
  });

  patterns.averageMessagesPerConversation = Math.round(totalMessages / conversations.length);
  
  // Find most active time
  const mostActiveHour = Object.entries(timeSlots)
    .sort(([,a], [,b]) => b - a)[0];
  if (mostActiveHour) {
    patterns.mostActiveTime = `${mostActiveHour[0]}:00`;
  }

  return patterns;
};

// Analyze emotional trends
export const analyzeEmotionalTrends = (conversations) => {
  const trends = {
    overallSentiment: 'neutral',
    emotionalStability: 0,
    positiveTrends: [],
    negativeTrends: [],
    emotionalTriggers: []
  };

  const allEmotionalStates = [];
  const triggers = new Set();

  conversations.forEach(conv => {
    // Ensure metadata exists with defensive programming
    if (!conv.metadata) {
      conv.metadata = createEnhancedMetadata();
    }
    
    conv.messages.forEach(msg => {
      if (msg.sender === 'user' && conv.metadata.emotionalState) {
        allEmotionalStates.push(conv.metadata.emotionalState);
      }
    });

    // Collect emotional triggers with null check
    if (conv.metadata.longTermMemory && conv.metadata.longTermMemory.emotionalTriggers) {
      conv.metadata.longTermMemory.emotionalTriggers.forEach(trigger => {
        triggers.add(trigger);
      });
    }
  });

  // Calculate overall sentiment
  const positiveCount = allEmotionalStates.filter(state => state.primary === 'positive').length;
  const negativeCount = allEmotionalStates.filter(state => state.primary === 'negative').length;
  const neutralCount = allEmotionalStates.filter(state => state.primary === 'neutral').length;

  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    trends.overallSentiment = 'positive';
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    trends.overallSentiment = 'negative';
  }

  // Calculate emotional stability (consistency in emotional state)
  const uniqueStates = new Set(allEmotionalStates.map(state => state.primary));
  trends.emotionalStability = 1 - (uniqueStates.size / allEmotionalStates.length);

  trends.emotionalTriggers = Array.from(triggers);

  return trends;
};

// Analyze topic evolution
export const analyzeTopicEvolution = (conversations) => {
  const evolution = {
    primaryTopics: [],
    topicFrequency: {},
    emergingTopics: [],
    decliningTopics: []
  };

  const topicCounts = {};
  const recentTopics = new Set();
  const oldTopics = new Set();

  conversations.forEach((conv, index) => {
    // Ensure metadata and topics exist with defensive programming
    if (!conv.metadata) {
      conv.metadata = createEnhancedMetadata();
    }
    if (!conv.metadata.topics) {
      conv.metadata.topics = [];
    }
    
    conv.metadata.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      
      // Recent conversations (last 30%)
      if (index >= conversations.length * 0.7) {
        recentTopics.add(topic);
      } else {
        oldTopics.add(topic);
      }
    });
  });

  // Find primary topics
  evolution.primaryTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);

  evolution.topicFrequency = topicCounts;

  // Find emerging and declining topics
  evolution.emergingTopics = Array.from(recentTopics).filter(topic => !oldTopics.has(topic));
  evolution.decliningTopics = Array.from(oldTopics).filter(topic => !recentTopics.has(topic));

  return evolution;
};

// Analyze engagement metrics
export const analyzeEngagementMetrics = (conversations) => {
  const metrics = {
    averageMessageLength: 0,
    responseTime: 0,
    engagementScore: 0,
    peakEngagementTimes: []
  };

  let totalLength = 0;
  let totalMessages = 0;
  const timeEngagement = {};

  conversations.forEach(conv => {
    conv.messages.forEach(msg => {
      if (msg.sender === 'user') {
        const length = (msg.text || msg.content || '').length;
        totalLength += length;
        totalMessages++;

        // Track engagement by time
        const hour = new Date(msg.timestamp).getHours();
        if (!timeEngagement[hour]) {
          timeEngagement[hour] = { count: 0, totalLength: 0 };
        }
        timeEngagement[hour].count++;
        timeEngagement[hour].totalLength += length;
      }
    });
  });

  metrics.averageMessageLength = totalMessages > 0 ? Math.round(totalLength / totalMessages) : 0;

  // Find peak engagement times
  metrics.peakEngagementTimes = Object.entries(timeEngagement)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`);

  // Calculate engagement score (0-100)
  const avgLength = metrics.averageMessageLength;
  const conversationCount = conversations.length;
  const avgMessagesPerConversation = totalMessages / conversationCount;
  
  metrics.engagementScore = Math.min(100, Math.round(
    (avgLength / 100) * 30 + // Message length weight
    (avgMessagesPerConversation / 10) * 40 + // Conversation depth weight
    (conversationCount / 10) * 30 // Frequency weight
  ));

  return metrics;
};

// Analyze long-term patterns
export const analyzeLongTermPatterns = (conversations) => {
  const patterns = {
    recurringThemes: [],
    goalProgress: [],
    achievementPatterns: [],
    stressPatterns: []
  };

  const themeFrequency = {};
  const goalMentions = [];
  const achievements = [];
  const stressIndicators = [];

  conversations.forEach(conv => {
    // Ensure metadata exists with defensive programming
    if (!conv.metadata) {
      conv.metadata = createEnhancedMetadata();
    }
    if (!conv.metadata.longTermMemory) {
      conv.metadata.longTermMemory = {
        recurringThemes: [],
        emotionalTriggers: [],
        goalMentions: [],
        stressPatterns: [],
        achievementCelebrations: []
      };
    }
    
    // Collect recurring themes
    if (conv.metadata.longTermMemory.recurringThemes) {
      conv.metadata.longTermMemory.recurringThemes.forEach(theme => {
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
      });
    }

    // Collect goal mentions
    if (conv.metadata.longTermMemory.goalMentions) {
      conv.metadata.longTermMemory.goalMentions.forEach(goal => {
        goalMentions.push({ goal, timestamp: conv.lastActive });
      });
    }

    // Collect achievements
    if (conv.metadata.longTermMemory.achievementCelebrations) {
      conv.metadata.longTermMemory.achievementCelebrations.forEach(achievement => {
        achievements.push(achievement);
      });
    }

    // Analyze stress patterns
    if (conv.metadata.emotionalState && 
        conv.metadata.emotionalState.primary === 'negative' && 
        conv.metadata.emotionalState.intensity > 1) {
      stressIndicators.push({
        timestamp: conv.lastActive,
        intensity: conv.metadata.emotionalState.intensity,
        topics: conv.metadata.topics || []
      });
    }
  });

  patterns.recurringThemes = Object.entries(themeFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme);

  patterns.goalProgress = goalMentions;
  patterns.achievementPatterns = achievements;
  patterns.stressPatterns = stressIndicators;

  return patterns;
};

// Generate comprehensive memory insights
export const generateMemoryInsights = (conversations) => {
  if (!conversations || conversations.length === 0) {
    return null;
  }

  return {
    conversationPatterns: analyzeConversationPatterns(conversations),
    emotionalTrends: analyzeEmotionalTrends(conversations),
    topicEvolution: analyzeTopicEvolution(conversations),
    engagementMetrics: analyzeEngagementMetrics(conversations),
    longTermPatterns: analyzeLongTermPatterns(conversations)
  };
}; 