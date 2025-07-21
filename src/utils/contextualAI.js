/**
 * Contextual AI Response System for ReflectWithin
 * Provides personalized, context-aware AI responses based on user data and analytics
 */

import { analyzeSentiment, extractTopics } from './advancedAnalytics';

// Context-aware response templates
const RESPONSE_TEMPLATES = {
  positive_momentum: [
    "I can see you're building great momentum! Your recent reflections show real progress. What's driving this positive energy?",
    "Your positive mindset is really shining through. How can we build on this momentum?",
    "This is fantastic progress! What specific actions or mindset shifts are contributing to this positive trend?"
  ],
  
  support_needed: [
    "I hear you're going through a challenging time. Remember, it's okay to not be okay. What would be most helpful for you right now?",
    "Your feelings are valid. Let's explore what's behind this and find ways to support yourself through it.",
    "Challenges are part of growth. What small step could you take today to care for yourself?"
  ],
  
  goal_focused: [
    "I notice you're really focused on your goals. What's the most important next step you can take?",
    "Your goal-oriented mindset is impressive. How can we break this down into manageable actions?",
    "You're showing great commitment to your objectives. What would success look like for you?"
  ],
  
  fitness_context: [
    "Your fitness journey is really taking shape! How are you feeling about your progress?",
    "I can see your dedication to physical wellness. What's working well for you?",
    "Your fitness reflections show real commitment. What's your biggest win this week?"
  ],
  
  wellness_context: [
    "Your focus on overall wellness is inspiring. How are you balancing different areas of your life?",
    "I appreciate your holistic approach to health. What's bringing you the most peace right now?",
    "Your wellness journey is unique to you. What practices are serving you best?"
  ],
  
  reflective: [
    "Your reflective insights are really valuable. What have you learned about yourself?",
    "I love how you're processing your experiences. What patterns are you noticing?",
    "Your self-awareness is growing. What discoveries are you making about yourself?"
  ],
  
  progress_oriented: [
    "You're making real progress! What's the most significant improvement you've noticed?",
    "Your growth mindset is evident. How are you celebrating your wins?",
    "I can see your development. What's the next milestone you're working toward?"
  ]
};

/**
 * Generate contextual AI response based on user data and current message
 */
export const generateContextualResponse = (userMessage, userData, recentAnalytics = null) => {
  if (!userMessage || !userData) {
    return generateDefaultResponse();
  }

  try {
    // Analyze current message
    const messageSentiment = analyzeSentiment(userMessage);
    const messageTopics = extractTopics(userMessage);
    
    // Get user context from recent analytics
    const userContext = getUserContext(userData, recentAnalytics);
    
    // Determine response type based on context
    const responseType = determineResponseType(messageSentiment, messageTopics, userContext);
    
    // Generate personalized response
    const response = generatePersonalizedResponse(responseType, userMessage, userContext);
    
    return {
      response,
      context: {
        sentiment: messageSentiment,
        topics: messageTopics,
        userContext,
        responseType
      }
    };
  } catch (error) {
    console.error('Error generating contextual response:', error);
    return {
      response: generateDefaultResponse(),
      context: { error: error.message }
    };
  }
};

/**
 * Get user context from recent data and analytics
 */
const getUserContext = (userData, recentAnalytics) => {
  const context = {
    recentSentiment: 'neutral',
    primaryTopics: [],
    goalProgress: null,
    writingPatterns: null,
    streak: 0
  };

  if (!userData) return context;

  const { journalEntries = [], goals = null, trackingData = [] } = userData;

  // Analyze recent entries (last 5)
  const recentEntries = journalEntries
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
    .slice(0, 5);

  if (recentEntries.length > 0) {
    // Calculate recent sentiment trend
    const sentiments = recentEntries.map(entry => 
      analyzeSentiment(entry.content || '')
    );
    
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    context.recentSentiment = avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral';

    // Extract common topics
    const allTopics = recentEntries.flatMap(entry => 
      extractTopics(entry.content || '')
    );
    
    const topicFrequency = {};
    allTopics.forEach(topic => {
      topicFrequency[topic.topic] = (topicFrequency[topic.topic] || 0) + topic.relevance;
    });
    
    context.primaryTopics = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  // Get goal progress if available
  if (goals && goals.personalGoals && goals.personalGoals.length > 0) {
    context.goalProgress = {
      totalGoals: goals.personalGoals.length,
      recentMentions: recentEntries.filter(entry => 
        (entry.content || '').toLowerCase().includes('goal') ||
        (entry.content || '').toLowerCase().includes('target')
      ).length
    };
  }

  // Get writing patterns
  if (recentAnalytics?.writingPatterns) {
    context.writingPatterns = recentAnalytics.writingPatterns;
  }

  // Calculate streak
  context.streak = calculateStreak(journalEntries);

  return context;
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

  for (let i = 0; i < 30; i++) { // Check last 30 days
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
 * Determine the best response type based on context
 */
const determineResponseType = (messageSentiment, messageTopics, userContext) => {
  // Check for support needed
  if (messageSentiment.score < -0.3 || userContext.recentSentiment === 'negative') {
    return 'support_needed';
  }

  // Check for positive momentum
  if (messageSentiment.score > 0.3 || userContext.recentSentiment === 'positive') {
    return 'positive_momentum';
  }

  // Check for fitness context
  if (messageTopics.some(t => t.topic === 'fitness') || 
      messageSentiment.context === 'fitness') {
    return 'fitness_context';
  }

  // Check for wellness context
  if (messageTopics.some(t => t.topic === 'wellness') || 
      messageSentiment.context === 'wellness') {
    return 'wellness_context';
  }

  // Check for goal focus
  if (messageTopics.some(t => t.topic === 'goals') || 
      userContext.goalProgress?.recentMentions > 0) {
    return 'goal_focused';
  }

  // Check for reflection patterns
  if (messageTopics.some(t => t.topic === 'progress') || 
      userContext.writingPatterns?.patterns?.includes('reflective')) {
    return 'reflective';
  }

  // Check for progress orientation
  if (messageTopics.some(t => t.topic === 'progress') || 
      userContext.writingPatterns?.patterns?.includes('progress-oriented')) {
    return 'progress_oriented';
  }

  return 'general';
};

/**
 * Generate personalized response based on type and context
 */
const generatePersonalizedResponse = (responseType, userMessage, userContext) => {
  const templates = RESPONSE_TEMPLATES[responseType] || RESPONSE_TEMPLATES.general;
  
  // Select template based on context
  let selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Personalize based on user context
  if (userContext.streak > 0) {
    selectedTemplate += ` I also notice you're on a ${userContext.streak}-day reflection streak - that's amazing consistency!`;
  }
  
  if (userContext.primaryTopics.length > 0) {
    const topic = userContext.primaryTopics[0];
    selectedTemplate += ` I can see you've been focusing a lot on ${topic} lately.`;
  }
  
  if (userContext.goalProgress && userContext.goalProgress.recentMentions > 0) {
    selectedTemplate += ` Your goal-focused mindset is really showing through.`;
  }
  
  return selectedTemplate;
};

/**
 * Generate default response when context is unavailable
 */
const generateDefaultResponse = () => {
  const defaultResponses = [
    "Thank you for sharing that with me. What would you like to explore further?",
    "I appreciate you taking the time to reflect. How are you feeling about this?",
    "That's an interesting perspective. What's on your mind about this?",
    "Thank you for being open with me. What would be most helpful to focus on right now?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

/**
 * Generate follow-up questions based on user response
 */
export const generateFollowUpQuestions = (userMessage, userContext) => {
  const questions = [];
  
  const messageSentiment = analyzeSentiment(userMessage);
  const messageTopics = extractTopics(userMessage);
  
  // Add context-specific questions
  if (messageSentiment.score > 0.3) {
    questions.push("What's contributing to this positive energy?");
    questions.push("How can you build on this momentum?");
  } else if (messageSentiment.score < -0.3) {
    questions.push("What would be most supportive for you right now?");
    questions.push("How can you practice self-compassion in this moment?");
  }
  
  // Add topic-specific questions
  messageTopics.forEach(topic => {
    switch (topic.topic) {
      case 'fitness':
        questions.push("How is your fitness journey supporting your overall well-being?");
        break;
      case 'goals':
        questions.push("What's the next small step toward your goals?");
        break;
      case 'progress':
        questions.push("What progress are you most proud of?");
        break;
      case 'challenges':
        questions.push("What resources or support do you need to overcome this challenge?");
        break;
      case 'motivation':
        questions.push("What's driving your motivation right now?");
        break;
    }
  });
  
  // Add streak-related questions
  if (userContext.streak > 0) {
    questions.push(`You're on a ${userContext.streak}-day streak! What's keeping you consistent?`);
  }
  
  // Limit to 3 questions and shuffle
  return questions
    .slice(0, 3)
    .sort(() => Math.random() - 0.5);
};

/**
 * Generate personalized journaling prompts based on user context
 */
export const generatePersonalizedPrompts = (userContext) => {
  const prompts = [];
  
  // Base prompts on recent sentiment
  if (userContext.recentSentiment === 'negative') {
    prompts.push("What's one small thing you can do today to care for yourself?");
    prompts.push("What would it look like to be kinder to yourself right now?");
  } else if (userContext.recentSentiment === 'positive') {
    prompts.push("What's contributing to this positive energy?");
    prompts.push("How can you build on this momentum?");
  }
  
  // Add topic-specific prompts
  userContext.primaryTopics.forEach(topic => {
    switch (topic) {
      case 'fitness':
        prompts.push("How is movement affecting your mental state today?");
        break;
      case 'goals':
        prompts.push("What's one step you can take toward your most important goal?");
        break;
      case 'progress':
        prompts.push("What progress are you celebrating today?");
        break;
      case 'balance':
        prompts.push("How are you balancing different areas of your life?");
        break;
    }
  });
  
  // Add goal-focused prompts
  if (userContext.goalProgress && userContext.goalProgress.recentMentions > 0) {
    prompts.push("What's the most important next step toward your goals?");
  }
  
  // Add streak-related prompts
  if (userContext.streak > 0) {
    prompts.push(`You're on a ${userContext.streak}-day reflection streak! What's working well for you?`);
  }
  
  return prompts.slice(0, 3);
}; 