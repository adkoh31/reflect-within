/**
 * Enhanced AI Capabilities for ReflectWithin
 * Advanced personalization, proactive suggestions, and improved conversation flow
 */

import { analyzeSentiment, extractTopics } from './advancedAnalytics';

// Enhanced response patterns with more natural conversation flow
const ENHANCED_RESPONSE_PATTERNS = {
  // Emotional support with specific actions
  emotional_support: {
    stress: [
      "I can hear the stress in your voice. When I'm feeling overwhelmed, I find it helps to take a moment to breathe. What's one small thing that usually helps you feel more grounded?",
      "Stress can feel so heavy. You're not alone in this. What would it look like to give yourself permission to take a break, even for just 10 minutes?",
      "I'm here with you through this. Sometimes just naming what we're feeling can help. What's the biggest source of stress right now?"
    ],
    anxiety: [
      "Anxiety can make everything feel uncertain. What's one thing you know is true about yourself, even in the midst of this anxiety?",
      "I hear how challenging this is. When anxiety hits, what's your go-to way of reminding yourself that you've gotten through difficult times before?",
      "Anxiety often makes us feel isolated. You're not alone in this. What would be most supportive for you right now?"
    ],
    overwhelm: [
      "It sounds like you're carrying a lot right now. What's one thing you could let go of, even temporarily, to give yourself some breathing room?",
      "Overwhelm can make everything feel urgent. What's actually the most important thing to focus on right now?",
      "You don't have to figure everything out at once. What's one small step that would help you feel more in control?"
    ]
  },

  // Achievement and progress with deeper reflection
  achievement: {
    fitness: [
      "That's a real accomplishment! What did you learn about yourself during that workout?",
      "I love seeing your progress! What's different about how you approach challenges now compared to when you started?",
      "You're building real strength, both physical and mental. What's the most surprising thing you've discovered about your capabilities?"
    ],
    personal: [
      "This is worth celebrating! What made this achievement meaningful to you?",
      "You've worked hard for this. How has this journey changed you?",
      "I'm genuinely excited for you! What's the next chapter you're curious about exploring?"
    ],
    consistency: [
      "Your consistency is inspiring! What's your secret to showing up even when motivation is low?",
      "You're building something really special with this dedication. What keeps you connected to your why?",
      "This kind of consistency creates real change. What patterns are you noticing about yourself?"
    ]
  },

  // Proactive support based on patterns
  proactive: {
    pattern_recognition: [
      "I've noticed you tend to feel more energized after morning workouts. How are you feeling about your energy levels today?",
      "You often mention feeling stressed on Wednesdays. What's different about this week?",
      "I see you're most reflective in the evenings. What's on your mind as you wind down?"
    ],
    goal_alignment: [
      "Given your goal of [specific goal], how does what you're experiencing today fit into that bigger picture?",
      "You've been working toward [goal] for a while now. What's one thing you've learned about yourself in this process?",
      "I'm curious how this moment connects to your larger vision. What's the deeper meaning here for you?"
    ],
    seasonal_awareness: [
      "This time of year can bring up a lot of emotions. How are you feeling about the changing seasons?",
      "I notice many people feel more reflective as [season] approaches. What's coming up for you?",
      "Seasonal changes can affect our energy and mood. How are you adapting to this transition?"
    ]
  },

  // Deeper reflection prompts
  reflection: {
    self_awareness: [
      "What's the story you're telling yourself about this situation?",
      "If you could step outside yourself and observe, what would you notice?",
      "What's the deeper truth underneath what you're experiencing?"
    ],
    growth: [
      "How has this challenge changed you?",
      "What would your future self thank you for doing right now?",
      "What's one thing you know now that you wish you'd known earlier?"
    ],
    values: [
      "What's really important to you in this situation?",
      "What values are you honoring or compromising right now?",
      "What would it look like to align your actions with what matters most to you?"
    ]
  }
};

/**
 * Enhanced AI response generator with improved personalization
 */
export const generateEnhancedResponse = (userMessage, userData, conversationContext, memoryInsights) => {
  try {
    // Analyze current state
    const messageAnalysis = analyzeMessage(userMessage, userData, conversationContext, memoryInsights);
    
    // Generate personalized response
    const response = buildPersonalizedResponse(messageAnalysis);
    
    // Generate proactive suggestions
    const suggestions = generateProactiveSuggestions(messageAnalysis);
    
    // Generate follow-up questions
    const followUps = generateContextualFollowUps(messageAnalysis);
    
    return {
      response,
      suggestions,
      followUps,
      analysis: messageAnalysis
    };
  } catch (error) {
    console.error('Error generating enhanced response:', error);
    return {
      response: "I'm here to support you. What would you like to explore?",
      suggestions: [],
      followUps: ["How are you feeling right now?"],
      analysis: { type: 'fallback' }
    };
  }
};

/**
 * Comprehensive message analysis
 */
const analyzeMessage = (userMessage, userData, conversationContext, memoryInsights) => {
  const sentiment = analyzeSentiment(userMessage);
  const topics = extractTopics(userMessage);
  const userContext = getUserContext(userData, memoryInsights);
  const conversationState = analyzeConversationState(conversationContext);
  const patterns = identifyPatterns(userMessage, userContext, memoryInsights);
  
  return {
    sentiment,
    topics,
    userContext,
    conversationState,
    patterns,
    messageType: determineMessageType(userMessage, sentiment, topics),
    emotionalState: determineEmotionalState(sentiment, userContext),
    supportNeeded: determineSupportNeeded(sentiment, patterns),
    growthOpportunity: identifyGrowthOpportunity(userMessage, userContext)
  };
};

/**
 * Get comprehensive user context
 */
const getUserContext = (userData, memoryInsights) => {
  const context = {
    recentSentiment: 'neutral',
    primaryTopics: [],
    goalProgress: null,
    writingPatterns: null,
    streak: 0,
    emotionalTrends: null,
    recurringThemes: [],
    peakTimes: [],
    stressPatterns: [],
    achievementPatterns: []
  };

  if (!userData) return context;

  // Enhanced context from memory insights
  if (memoryInsights) {
    context.emotionalTrends = memoryInsights.emotionalTrends;
    context.recurringThemes = memoryInsights.longTermPatterns?.recurringThemes || [];
    context.peakTimes = memoryInsights.engagementMetrics?.peakEngagementTimes || [];
    context.stressPatterns = memoryInsights.longTermPatterns?.stressPatterns || [];
    context.achievementPatterns = memoryInsights.longTermPatterns?.achievementPatterns || [];
  }

  // Analyze recent entries
  const recentEntries = userData.journalEntries
    ?.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
    .slice(0, 5) || [];

  if (recentEntries.length > 0) {
    const sentiments = recentEntries.map(entry => analyzeSentiment(entry.content || ''));
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    context.recentSentiment = avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral';

    const allTopics = recentEntries.flatMap(entry => extractTopics(entry.content || ''));
    const topicFrequency = {};
    allTopics.forEach(topic => {
      topicFrequency[topic.topic] = (topicFrequency[topic.topic] || 0) + topic.relevance;
    });
    
    context.primaryTopics = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  // Goal progress
  if (userData.goals?.personalGoals?.length > 0) {
    context.goalProgress = {
      totalGoals: userData.goals.personalGoals.length,
      recentMentions: recentEntries.filter(entry => 
        (entry.content || '').toLowerCase().includes('goal') ||
        (entry.content || '').toLowerCase().includes('target')
      ).length,
      goals: userData.goals.personalGoals
    };
  }

  // Calculate streak
  context.streak = calculateStreak(userData.journalEntries || []);

  return context;
};

/**
 * Analyze conversation state
 */
const analyzeConversationState = (conversationContext) => {
  if (!conversationContext || conversationContext.length === 0) {
    return {
      depth: 'new',
      engagement: 'low',
      emotionalState: 'neutral',
      topics: [],
      momentum: 'neutral'
    };
  }

  const recentMessages = conversationContext.slice(-5);
  const userMessages = recentMessages.filter(msg => msg.role === 'user');
  
  // Calculate engagement
  const avgLength = userMessages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / userMessages.length;
  const engagement = avgLength > 100 ? 'high' : avgLength > 50 ? 'medium' : 'low';
  
  // Determine depth
  const depth = conversationContext.length > 20 ? 'deep' : conversationContext.length > 10 ? 'medium' : 'shallow';
  
  // Analyze momentum
  const sentiments = userMessages.map(msg => analyzeSentiment(msg.content || ''));
  const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  const momentum = avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral';

  return {
    depth,
    engagement,
    emotionalState: momentum,
    topics: extractTopicsFromMessages(recentMessages),
    momentum
  };
};

/**
 * Identify patterns in user behavior
 */
const identifyPatterns = (userMessage, userContext, memoryInsights) => {
  const patterns = {
    recurringThemes: [],
    emotionalTriggers: [],
    timePatterns: [],
    stressIndicators: [],
    achievementCelebrations: []
  };

  // Check for recurring themes
  if (userContext.recurringThemes) {
    const messageLower = userMessage.toLowerCase();
    patterns.recurringThemes = userContext.recurringThemes.filter(theme => 
      messageLower.includes(theme.toLowerCase())
    );
  }

  // Check for emotional triggers
  if (memoryInsights?.emotionalTrends?.emotionalTriggers) {
    const messageLower = userMessage.toLowerCase();
    patterns.emotionalTriggers = memoryInsights.emotionalTrends.emotionalTriggers.filter(trigger => 
      messageLower.includes(trigger.toLowerCase())
    );
  }

  // Check for stress patterns
  const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'pressure', 'deadline', 'too much'];
  if (stressKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
    patterns.stressIndicators.push('current_message');
  }

  // Check for achievements
  const achievementKeywords = ['achieved', 'accomplished', 'reached', 'hit', 'pr', 'personal record', 'finally'];
  if (achievementKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
    patterns.achievementCelebrations.push('current_message');
  }

  return patterns;
};

/**
 * Determine message type for appropriate response
 */
const determineMessageType = (userMessage, sentiment, topics) => {
  const messageLower = userMessage.toLowerCase();
  
  if (messageLower.includes('help') || messageLower.includes('advice') || messageLower.includes('what should')) {
    return 'request_for_guidance';
  }
  
  if (messageLower.includes('goal') || messageLower.includes('target') || messageLower.includes('objective')) {
    return 'goal_related';
  }
  
  if (topics.some(t => ['fitness', 'workout', 'exercise'].includes(t.topic))) {
    return 'fitness_related';
  }
  
  if (sentiment.score < -0.3) {
    return 'emotional_support_needed';
  }
  
  if (sentiment.score > 0.3) {
    return 'celebration';
  }
  
  return 'reflection';
};

/**
 * Build personalized response based on analysis
 */
const buildPersonalizedResponse = (analysis) => {
  const { messageType, sentiment, patterns, userContext, conversationState } = analysis;
  
  // Select appropriate response pattern
  let responsePattern = ENHANCED_RESPONSE_PATTERNS.reflection.self_awareness[0]; // Default
  
  switch (messageType) {
    case 'emotional_support_needed':
      if (sentiment.score < -0.5) {
        responsePattern = ENHANCED_RESPONSE_PATTERNS.emotional_support.stress[0];
      } else {
        responsePattern = ENHANCED_RESPONSE_PATTERNS.emotional_support.anxiety[0];
      }
      break;
      
    case 'celebration':
      if (patterns.achievementCelebrations.length > 0) {
        responsePattern = ENHANCED_RESPONSE_PATTERNS.achievement.personal[0];
      } else {
        responsePattern = ENHANCED_RESPONSE_PATTERNS.achievement.consistency[0];
      }
      break;
      
    case 'fitness_related':
      responsePattern = ENHANCED_RESPONSE_PATTERNS.achievement.fitness[0];
      break;
      
    case 'goal_related':
      responsePattern = ENHANCED_RESPONSE_PATTERNS.proactive.goal_alignment[0];
      break;
      
    default:
      responsePattern = ENHANCED_RESPONSE_PATTERNS.reflection.self_awareness[0];
  }
  
  // Personalize the response
  let personalizedResponse = responsePattern;
  
  // Add streak acknowledgment
  if (userContext.streak > 0) {
    personalizedResponse += ` I also notice you're on a ${userContext.streak}-day reflection streak - that's incredible consistency!`;
  }
  
  // Add pattern recognition
  if (patterns.recurringThemes.length > 0) {
    const theme = patterns.recurringThemes[0];
    personalizedResponse += ` I've noticed ${theme} has been coming up a lot in our conversations.`;
  }
  
  // Add conversation depth awareness
  if (conversationState.depth === 'deep') {
    personalizedResponse += ` I appreciate the depth you're bringing to our conversation.`;
  }
  
  return personalizedResponse;
};

/**
 * Generate proactive suggestions based on patterns
 */
const generateProactiveSuggestions = (analysis) => {
  const suggestions = [];
  const { patterns, userContext, conversationState } = analysis;
  
  // Suggest based on stress patterns
  if (patterns.stressIndicators.length > 0) {
    suggestions.push({
      type: 'stress_relief',
      text: 'Would you like to explore some quick stress relief techniques?',
      action: 'stress_techniques'
    });
  }
  
  // Suggest based on recurring themes
  if (patterns.recurringThemes.length > 0) {
    suggestions.push({
      type: 'pattern_exploration',
      text: `I notice ${patterns.recurringThemes[0]} keeps coming up. Would you like to dive deeper into this?`,
      action: 'explore_theme'
    });
  }
  
  // Suggest based on goals
  if (userContext.goalProgress && userContext.goalProgress.recentMentions > 0) {
    suggestions.push({
      type: 'goal_checkin',
      text: 'Would you like to check in on your goals and see how you\'re progressing?',
      action: 'goal_review'
    });
  }
  
  // Suggest based on conversation depth
  if (conversationState.depth === 'shallow' && conversationState.engagement === 'low') {
    suggestions.push({
      type: 'engagement_boost',
      text: 'I\'d love to understand you better. What\'s something you\'ve been thinking about lately?',
      action: 'deeper_conversation'
    });
  }
  
  return suggestions.slice(0, 2); // Limit to 2 suggestions
};

/**
 * Generate contextual follow-up questions
 */
const generateContextualFollowUps = (analysis) => {
  const followUps = [];
  const { messageType, sentiment, patterns, userContext } = analysis;
  
  // Add type-specific questions
  switch (messageType) {
    case 'emotional_support_needed':
      followUps.push("What would be most supportive for you right now?");
      followUps.push("How can you practice self-compassion in this moment?");
      break;
      
    case 'celebration':
      followUps.push("What made this achievement meaningful to you?");
      followUps.push("How has this journey changed you?");
      break;
      
    case 'fitness_related':
      followUps.push("How is your fitness journey supporting your overall well-being?");
      followUps.push("What's your biggest win this week?");
      break;
      
    case 'goal_related':
      followUps.push("What's the next small step toward your goals?");
      followUps.push("What would success look like for you?");
      break;
      
    default:
      followUps.push("What's on your mind about this?");
      followUps.push("How are you feeling about this situation?");
  }
  
  // Add pattern-based questions
  if (patterns.recurringThemes.length > 0) {
    followUps.push(`What's your relationship with ${patterns.recurringThemes[0]} right now?`);
  }
  
  // Add streak-related questions
  if (userContext.streak > 0) {
    followUps.push(`What's keeping you consistent with your reflection practice?`);
  }
  
  return followUps.slice(0, 2); // Limit to 2 questions
};

/**
 * Calculate user's journaling streak
 */
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

/**
 * Extract topics from conversation messages
 */
const extractTopicsFromMessages = (messages) => {
  const allTopics = messages.flatMap(msg => extractTopics(msg.content || ''));
  const topicFrequency = {};
  
  allTopics.forEach(topic => {
    topicFrequency[topic.topic] = (topicFrequency[topic.topic] || 0) + topic.relevance;
  });
  
  return Object.entries(topicFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
};

/**
 * Determine emotional state
 */
const determineEmotionalState = (sentiment, userContext) => {
  if (sentiment.score < -0.3) return 'distressed';
  if (sentiment.score > 0.3) return 'positive';
  if (userContext.recentSentiment === 'negative') return 'struggling';
  if (userContext.recentSentiment === 'positive') return 'building_momentum';
  return 'neutral';
};

/**
 * Determine support needed
 */
const determineSupportNeeded = (sentiment, patterns) => {
  if (sentiment.score < -0.5) return 'high';
  if (patterns.stressIndicators.length > 0) return 'medium';
  if (sentiment.score < -0.2) return 'low';
  return 'none';
};

/**
 * Identify growth opportunity
 */
const identifyGrowthOpportunity = (userMessage, userContext) => {
  const messageLower = userMessage.toLowerCase();
  
  if (messageLower.includes('learn') || messageLower.includes('grow')) {
    return 'self_development';
  }
  
  if (messageLower.includes('pattern') || messageLower.includes('habit')) {
    return 'behavior_change';
  }
  
  if (userContext.goalProgress && userContext.goalProgress.recentMentions > 0) {
    return 'goal_achievement';
  }
  
  return 'general_reflection';
};

export default {
  generateEnhancedResponse,
  ENHANCED_RESPONSE_PATTERNS
}; 