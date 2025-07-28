const axios = require('axios');
const Reflection = require('../models/Reflection');
const User = require('../models/User');
const Workout = require('../models/Workout');
const { 
  extractStructuredData, 
  getStretchRecommendation, 
  buildContext, 
  buildEnhancedPrompt,
  buildEnhancedUserContext,
  buildBasicContext,
  buildPremiumEnhancedPrompt,
  getCachedContext,
  buildEnhancedContextWithMemory,
  buildConversationMemoryContext,
  analyzeConversationContext,
  analyzeMessageSentiment
} = require('../utils/patternAnalysis');
const { enhancedMemoryManager } = require('../utils/enhancedMemoryManager');
const {
  extractFitnessGoals,
  extractActivityLevel
} = require('../utils/fitnessDataExtraction');

// Unified system prompt for all AI interactions
const UNIFIED_SYSTEM_PROMPT = `You are Myra, an empathetic AI companion for fitness and wellness with expertise in exercise programming, mental health support, recovery practices, and evidence-based injury management. You have access to user goals, progress tracking, and journal entries. Always provide warm, supportive guidance while prioritizing safety and appropriate professional referrals when needed. Use scientific principles to explain recommendations and help users understand their body's responses. When giving exercise or recovery advice, be very specific with pose names, breathing techniques, and step-by-step instructions. Remember previous conversations and user patterns to provide personalized guidance. Structure your responses with: 1) Empathetic acknowledgment, 2) Specific, actionable guidance with exact timeframes and techniques, 3) Scientific explanation when relevant, 4) Personalization based on user history, 5) Safety considerations and professional referral when needed.`;

/**
 * Enhanced AI Response Generator
 * Provides more sophisticated, personalized AI responses with proactive support
 */
const generateEnhancedResponse = async (userMessage, userData, conversationContext, memoryInsights, isPremium = false, goalData = null) => {
  try {
    // Extract structured data
    const extractedData = extractStructuredData(userMessage);
    
    // Generate conversation ID for memory tracking
    const conversationId = userData ? `user_${userData._id}_${Date.now()}` : `anonymous_${Date.now()}`;
    
    // Process conversation memory with enhanced memory manager
    if (conversationContext && conversationContext.length > 0) {
      enhancedMemoryManager.processConversationMemory(conversationId, conversationContext, userData);
    }
    
    // Get enhanced memory context
    const enhancedMemoryContext = enhancedMemoryManager.getMemoryContext(conversationId, userMessage);
    
    // Build comprehensive context
    const context = buildEnhancedContextWithMemory(userData, [], conversationContext, memoryInsights, goalData);
    
    // Build conversation memory context
    const conversationMemoryContext = buildConversationMemoryContext(conversationContext, memoryInsights);
    
    // Analyze current conversation state
    const conversationAnalysis = analyzeConversationContext(conversationContext);
    
    // Determine response strategy with enhanced memory
    const responseStrategy = determineResponseStrategy(userMessage, extractedData, conversationAnalysis, enhancedMemoryContext);
    
    // Build enhanced prompt with memory context
    const prompt = buildEnhancedPromptWithStrategy(
      userMessage, 
      extractedData, 
      context, 
      conversationMemoryContext, 
      conversationAnalysis, 
      responseStrategy,
      enhancedMemoryContext,
      isPremium
    );

    console.log('🤖 Generating enhanced AI response with strategy:', responseStrategy.type);

    // Build goal-specific instructions
    let goalInstructions = '';
    if (goalData && goalData.metricGoals) {
      const activeGoals = Object.entries(goalData.metricGoals)
        .filter(([_, goal]) => goal.hasGoal)
        .map(([metricId, goal]) => ({ metricId, goal }));
      
      if (activeGoals.length > 0) {
        goalInstructions = `\n\nUSER GOALS (ALWAYS REFERENCE WHEN RELEVANT):\n`;
        activeGoals.forEach(({ metricId, goal }) => {
          const currentValue = goalData.metricValues?.[metricId] || 'Not set';
          goalInstructions += `- ${metricId}: Current ${currentValue}, Target ${goal.target} ${goal.timeline === 'ongoing' ? '(ongoing)' : `(${goal.timeline})`}\n`;
        });
        goalInstructions += `\nGOAL INTEGRATION RULES:\n`;
        goalInstructions += `- When user mentions ${activeGoals.map(g => g.metricId).join(', ')}, reference their specific targets\n`;
        goalInstructions += `- Celebrate progress toward these goals\n`;
        goalInstructions += `- Provide suggestions that help reach these targets\n`;
        goalInstructions += `- Use phrases like "closer to your ${activeGoals[0]?.goal.target} ${activeGoals[0]?.metricId} goal"\n\n`;
      }
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                              model: process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:unified-enhanced:By8h6kBm',
      messages: [
        {
          role: 'system',
          content: UNIFIED_SYSTEM_PROMPT
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.6,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content.trim();

    // Generate suggestions and follow-ups
    const suggestions = generateProactiveSuggestions(userMessage, extractedData, conversationAnalysis, memoryInsights);
    const followUps = generateContextualFollowUps(userMessage, extractedData, conversationAnalysis, memoryInsights);

    return {
      response: aiResponse,
      suggestions,
      followUps,
      strategy: responseStrategy,
      analysis: conversationAnalysis
    };
  } catch (error) {
    console.error('Error generating enhanced response:', error);
    throw error;
  }
};

/**
 * Determine response strategy based on message content and context
 */
const determineResponseStrategy = (userMessage, extractedData, conversationAnalysis, enhancedMemoryContext) => {
  const messageLower = userMessage.toLowerCase();
  const sentiment = analyzeMessageSentiment(userMessage);
  
  // Check for specific request types
  if (messageLower.includes('help') || messageLower.includes('advice') || messageLower.includes('what should')) {
    return {
      type: 'guidance_request',
      description: 'User is explicitly asking for advice or guidance. Provide specific, actionable suggestions while maintaining empathy.',
      maxTokens: 400,
      temperature: 0.6
    };
  }
  
  if (messageLower.includes('goal') || messageLower.includes('target') || messageLower.includes('objective')) {
    return {
      type: 'goal_focused',
      description: 'User is discussing goals. Focus on goal alignment, progress tracking, and motivation.',
      maxTokens: 350,
      temperature: 0.7
    };
  }
  
  if (extractedData.exercise || messageLower.includes('workout') || messageLower.includes('fitness')) {
    return {
      type: 'fitness_context',
      description: 'User is discussing fitness or exercise. Provide fitness-specific support and advice.',
      maxTokens: 400,
      temperature: 0.6
    };
  }
  
  // Check emotional state
  if (sentiment < -0.3) {
    return {
      type: 'emotional_support',
      description: 'User is experiencing negative emotions. Provide extra validation, support, and gentle guidance.',
      maxTokens: 350,
      temperature: 0.8
    };
  }
  
  if (sentiment > 0.3) {
    return {
      type: 'celebration',
      description: 'User is in a positive state. Build on momentum and explore what\'s working well.',
      maxTokens: 300,
      temperature: 0.7
    };
  }
  
  // Check conversation depth
  if (conversationAnalysis.depth === 'deep') {
    return {
      type: 'deep_reflection',
      description: 'Deep conversation in progress. Continue with thoughtful, introspective responses.',
      maxTokens: 350,
      temperature: 0.7
    };
  }
  
  if (conversationAnalysis.engagementLevel === 'low') {
    return {
      type: 'engagement_boost',
      description: 'Low engagement detected. Use more engaging questions and show genuine curiosity.',
      maxTokens: 300,
      temperature: 0.8
    };
  }
  
  // Check for enhanced memory patterns
  if (enhancedMemoryContext?.userPatterns?.length > 0) {
    const relevantPatterns = enhancedMemoryContext.userPatterns.filter(pattern => 
      messageLower.includes(pattern.pattern.toLowerCase())
    );
    
    if (relevantPatterns.length > 0) {
      return {
        type: 'pattern_recognition',
        description: `Recognizing user pattern: ${relevantPatterns[0].pattern}. Acknowledge the pattern and explore its significance.`,
        maxTokens: 350,
        temperature: 0.7
      };
    }
  }

  // Check for goal continuity
  if (enhancedMemoryContext?.goalContext?.length > 0) {
    const activeGoals = enhancedMemoryContext.goalContext.filter(goal => goal.progress === 'active');
    if (activeGoals.length > 0) {
      return {
        type: 'goal_continuity',
        description: `Building on active goal: ${activeGoals[0].goal}. Continue supporting progress and motivation.`,
        maxTokens: 350,
        temperature: 0.7
      };
    }
  }

  // Check for emotional continuity
  if (enhancedMemoryContext?.emotionalContext?.recentTrend) {
    if (enhancedMemoryContext.emotionalContext.recentTrend === 'negative') {
      return {
        type: 'emotional_support',
        description: 'Addressing ongoing negative emotional trend. Provide extra validation and support.',
        maxTokens: 350,
        temperature: 0.8
      };
    } else if (enhancedMemoryContext.emotionalContext.recentTrend === 'positive') {
      return {
        type: 'momentum_building',
        description: 'Building on positive emotional trend. Encourage and amplify positive momentum.',
        maxTokens: 300,
        temperature: 0.7
      };
    }
  }
  
  // Default strategy
  return {
    type: 'general_reflection',
    description: 'General reflection conversation. Provide supportive, curious responses that encourage deeper exploration.',
    maxTokens: 300,
    temperature: 0.7
  };
};

/**
 * Build enhanced prompt with specific strategy
 */
const buildEnhancedPromptWithStrategy = (userMessage, extractedData, context, conversationMemoryContext, conversationAnalysis, strategy, enhancedMemoryContext, isPremium) => {
  // Build enhanced memory context string
  const memoryContextString = enhancedMemoryContext ? `
ENHANCED MEMORY CONTEXT:
${enhancedMemoryContext.relevantMemories.length > 0 ? `- Relevant past conversations: ${enhancedMemoryContext.relevantMemories.length} found` : ''}
${enhancedMemoryContext.userPatterns.length > 0 ? `- User patterns: ${enhancedMemoryContext.userPatterns.slice(0, 3).map(p => p.pattern).join(', ')}` : ''}
${enhancedMemoryContext.emotionalContext ? `- Emotional trend: ${enhancedMemoryContext.emotionalContext.recentTrend}` : ''}
${enhancedMemoryContext.goalContext.length > 0 ? `- Active goals: ${enhancedMemoryContext.goalContext.slice(0, 2).map(g => g.goal).join(', ')}` : ''}
${enhancedMemoryContext.continuitySuggestions.length > 0 ? `- Continuity suggestions: ${enhancedMemoryContext.continuitySuggestions.slice(0, 2).map(s => s.suggestion).join('; ')}` : ''}
` : '';

  let prompt = `User: "${userMessage}"

Context: ${context}

${conversationMemoryContext ? `Recent conversation: ${conversationMemoryContext}` : ''}
${memoryContextString ? `Memory insights: ${memoryContextString}` : ''}

Strategy: ${strategy.description}

Respond naturally and supportively.`;

  // Add strategy-specific guidance
  switch (strategy.type) {
    case 'guidance_request':
      prompt += `- User is asking for specific advice or guidance
- Provide actionable suggestions while maintaining empathy
- Balance practical advice with emotional support
- Ask follow-up questions to understand their specific situation better
`;
      break;
      
    case 'goal_focused':
      prompt += `- User is discussing goals or objectives
- Help them align their current experience with their larger vision
- Acknowledge progress and consistency
- Explore what's working and what might need adjustment
`;
      break;
      
    case 'fitness_context':
      prompt += `- User is discussing fitness or exercise
- Provide specific, actionable fitness advice when appropriate
- Consider their fitness level and any mentioned limitations
- Connect physical activity to overall well-being
`;
      break;
      
    case 'emotional_support':
      prompt += `- User is experiencing challenging emotions
- Provide extra validation and emotional support
- Acknowledge the difficulty without trying to fix it
- Help them explore their feelings with gentle curiosity
`;
      break;
      
    case 'celebration':
      prompt += `- User is in a positive state
- Build on their momentum and positive energy
- Explore what's contributing to their success
- Help them understand and replicate what's working
`;
      break;
      
    case 'deep_reflection':
      prompt += `- Deep conversation in progress
- Continue with thoughtful, introspective responses
- Build on previous insights and themes
- Encourage deeper self-exploration
`;
      break;
      
    case 'engagement_boost':
      prompt += `- Low engagement detected
- Share interesting insights or observations to re-engage them
- Show genuine interest in their experience through thoughtful comments
- Make the conversation more interactive through shared insights
`;
      break;
      
    case 'pattern_recognition':
      prompt += `- Recognizing recurring themes or patterns
- Acknowledge the pattern you've noticed
- Explore what this pattern means to them
- Help them understand the significance of recurring themes
`;
      break;
      
    case 'goal_continuity':
      prompt += `- Building on active goals from previous conversations
- Reference their ongoing progress and commitment
- Continue supporting their goal achievement journey
- Acknowledge consistency and persistence
`;
      break;
      
    case 'momentum_building':
      prompt += `- Building on positive emotional momentum
- Amplify and encourage their positive progress
- Help them understand what's working well
- Support continued positive momentum
`;
      break;
      
    default:
      prompt += `- General reflection conversation
- Provide supportive insights and observations
- Share gentle guidance and reflections
- Maintain the warm, conversational tone
`;
  }

  prompt += `
RESPONSE FORMAT: 
- Ask questions when you need to understand their situation better
- Provide insights and actionable advice when you have enough context
- Let the conversation flow naturally
- Be helpful and supportive
Keep it personal and conversational.`;

  return prompt;
};

/**
 * Generate proactive suggestions based on context
 */
const generateProactiveSuggestions = (userMessage, extractedData, conversationAnalysis, memoryInsights) => {
  const suggestions = [];
  const messageLower = userMessage.toLowerCase();
  
  // Stress detection
  const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'pressure', 'deadline', 'too much'];
  if (stressKeywords.some(keyword => messageLower.includes(keyword))) {
    suggestions.push({
      type: 'stress_relief',
      text: 'Try a quick 2-minute breathing exercise',
      action: 'stress_techniques'
    });
  }
  
  // Goal-related suggestions
  if (messageLower.includes('goal') || messageLower.includes('target')) {
    suggestions.push({
      type: 'goal_checkin',
      text: 'Review your progress and celebrate small wins',
      action: 'goal_review'
    });
  }
  
  // Pattern recognition suggestions
  if (memoryInsights?.longTermPatterns?.recurringThemes?.length > 0) {
    const relevantThemes = memoryInsights.longTermPatterns.recurringThemes.filter(theme => 
      messageLower.includes(theme.toLowerCase())
    );
    
    if (relevantThemes.length > 0) {
      suggestions.push({
        type: 'pattern_exploration',
        text: `Notice how ${relevantThemes[0]} appears in your life`,
        action: 'explore_theme'
      });
    }
  }
  
  // Low engagement suggestions
  if (conversationAnalysis.engagementLevel === 'low') {
    suggestions.push({
      type: 'engagement_boost',
      text: 'Share something that\'s been on your mind',
      action: 'deeper_conversation'
    });
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

/**
 * Generate contextual follow-up suggestions and gentle prompts
 */
const generateContextualFollowUps = (userMessage, extractedData, conversationAnalysis, memoryInsights) => {
  const followUps = [];
  const messageLower = userMessage.toLowerCase();
  const sentiment = analyzeMessageSentiment(userMessage);
  
  // Emotional state-based suggestions
  if (sentiment < -0.3) {
    followUps.push("Consider what small act of self-care might help right now");
    followUps.push("Sometimes just acknowledging the difficulty can be a first step");
  } else if (sentiment > 0.3) {
    followUps.push("Notice what's contributing to this positive energy");
    followUps.push("This momentum could be worth building on");
  }
  
  // Topic-specific insights
  if (extractedData.exercise || messageLower.includes('workout')) {
    followUps.push("Your commitment to fitness is showing in your overall well-being");
    followUps.push("Celebrate the progress you're making");
  }
  
  if (messageLower.includes('goal') || messageLower.includes('target')) {
    followUps.push("Your motivation is clear - that's a powerful foundation");
    followUps.push("Small steps consistently taken lead to big changes");
  }
  
  // General supportive statements
  followUps.push("You're doing important work on yourself");
  followUps.push("Your awareness and reflection are valuable");
  
  return followUps.slice(0, 3); // Limit to 3 follow-ups
};

/**
 * Identify patterns in user message
 */
const identifyPatterns = (userMessage, memoryInsights) => {
  const patterns = {
    recurringThemes: [],
    emotionalTriggers: [],
    stressIndicators: [],
    achievementCelebrations: []
  };
  
  const messageLower = userMessage.toLowerCase();
  
  // Check for recurring themes
  if (memoryInsights?.longTermPatterns?.recurringThemes) {
    patterns.recurringThemes = memoryInsights.longTermPatterns.recurringThemes.filter(theme => 
      messageLower.includes(theme.toLowerCase())
    );
  }
  
  // Check for emotional triggers
  if (memoryInsights?.emotionalTrends?.emotionalTriggers) {
    patterns.emotionalTriggers = memoryInsights.emotionalTrends.emotionalTriggers.filter(trigger => 
      messageLower.includes(trigger.toLowerCase())
    );
  }
  
  // Check for stress patterns
  const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'pressure', 'deadline', 'too much'];
  if (stressKeywords.some(keyword => messageLower.includes(keyword))) {
    patterns.stressIndicators.push('current_message');
  }
  
  // Check for achievements
  const achievementKeywords = ['achieved', 'accomplished', 'reached', 'hit', 'pr', 'personal record', 'finally'];
  if (achievementKeywords.some(keyword => messageLower.includes(keyword))) {
    patterns.achievementCelebrations.push('current_message');
  }
  
  return patterns;
};

/**
 * Enhanced reflection endpoint
 */
const enhancedReflect = async (req, res) => {
  try {
    const { 
      message, 
      pastEntries = [], 
      conversationContext = [], 
      isPremium = false,
      memoryInsights = null,
      goalData = null
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ No OpenAI API key found, using fallback response');
      const fallbackQuestions = [
        "What's on your mind today?",
        "How are you feeling right now?",
        "What would you like to explore or reflect on?",
        "Tell me more about what you're experiencing.",
        "What's the most important thing you'd like to work through?"
      ];
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      return res.json({ 
        question: randomQuestion,
        suggestions: [],
        followUps: ["How are you feeling right now?"],
        strategy: 'fallback'
      });
    }

    // Get user context if available, or create default context for testing
    let user = null;
    if (req.user && req.user._id) {
      try {
        user = await User.findById(req.user._id);
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    } else {
      // Create default user context for testing/unauthorized requests
      user = {
        name: 'User',
        email: 'test@example.com',
        goals: ['fitness', 'wellness'],
        activityLevel: 'moderate'
      };
    }

    // Generate enhanced response
    const enhancedResponse = await generateEnhancedResponse(
      message, 
      user, 
      conversationContext, 
      memoryInsights, 
      isPremium,
      goalData
    );

    res.json({
      question: enhancedResponse.response,
      suggestions: enhancedResponse.suggestions,
      followUps: enhancedResponse.followUps,
      strategy: enhancedResponse.strategy,
      analysis: enhancedResponse.analysis
    });

  } catch (error) {
    console.error('Enhanced reflect error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      question: "I'm here to support you. What would you like to explore?",
      suggestions: [],
      followUps: ["How are you feeling right now?"],
      strategy: 'fallback'
    });
  }
};

module.exports = {
  enhancedReflect,
  generateEnhancedResponse,
  determineResponseStrategy,
  generateProactiveSuggestions,
  generateContextualFollowUps
}; 