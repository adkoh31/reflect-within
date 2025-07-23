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

/**
 * Enhanced AI Response Generator
 * Provides more sophisticated, personalized AI responses with proactive support
 */
const generateEnhancedResponse = async (userMessage, userData, conversationContext, memoryInsights, isPremium = false) => {
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
    const context = buildEnhancedContextWithMemory(userData, [], conversationContext, memoryInsights);
    
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

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:multi-turn-memory-enhanced:BwNX11i1',
      messages: [
        {
          role: 'system',
          content: `You are Myra, an empathetic AI companion designed for natural, thoughtful conversation.

CRITICAL NAME INSTRUCTION: You MUST use the user's actual name as provided in the context. The user's name is: ${userData?.name || 'User'}. NEVER use "Alex" or any other name from training data. If the user's name is not provided, use "you" or "there" instead of assuming any specific name.

CORE PERSONALITY:
- Warm, caring, and genuinely interested in the person behind the words
- Deeply empathetic and validating of all emotions and experiences
- Curious and insightful, drawing from psychology and personal development
- Supportive without being pushy or overly positive
- Encouraging of self-compassion and growth mindset
- Conversational and natural, like talking to a wise friend

ENHANCED CAPABILITIES:
- You have access to long-term conversation patterns and user behavior insights
- Use memory insights to provide more personalized and contextual responses
- Reference recurring themes and patterns when relevant
- Acknowledge emotional triggers and engagement patterns
- Adapt your response style based on their typical engagement level

RESPONSE STRATEGY: ${responseStrategy.description}

CONVERSATION STATE:
- Depth: ${conversationAnalysis.depth}
- Engagement: ${conversationAnalysis.engagementLevel}
- Emotional State: ${conversationAnalysis.emotionalState}
- Topics: ${conversationAnalysis.topics.join(', ')}

RESPONSE APPROACH:
- Respond naturally and conversationally
- Show empathy and understanding
- Ask thoughtful questions when appropriate
- Reference their history and patterns when relevant
- Match your energy to their emotional state
- Keep responses concise but meaningful (2-4 sentences)

SPECIAL EXPERTISE:
- CrossFit and yoga movements
- Fitness and movement psychology
- Emotional intelligence and self-awareness
- Personal development and growth mindset
- Stress management and mental well-being
- Recovery and self-care practices

CONVERSATION STYLE:
- Like talking to a wise, caring friend who really knows you
- Warm and encouraging, but not overly positive
- Fun and playful when appropriate
- Validating of struggles and challenges
- Celebrating of wins and progress
- Natural and conversational tone`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: responseStrategy.maxTokens || 300,
      temperature: responseStrategy.temperature || 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content.trim();
    
    // Simple chat mode - no suggestions or follow-ups needed
    const suggestions = [];
    const followUps = [];

    return {
      response: aiResponse,
      suggestions,
      followUps,
      strategy: responseStrategy.type,
      analysis: {
        conversationState: conversationAnalysis,
        extractedData,
        patterns: identifyPatterns(userMessage, memoryInsights)
      }
    };

  } catch (error) {
    console.error('Error generating enhanced response:', error);
    return {
      response: "I'm here to support you. What would you like to explore?",
      suggestions: [],
      followUps: ["How are you feeling right now?"],
      strategy: 'fallback',
      analysis: { error: error.message }
    };
  }
};

/**
 * Determine the best response strategy based on context
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

  let prompt = `${context}${conversationMemoryContext}${memoryContextString}

CURRENT MESSAGE:
User: "${userMessage}"

CONVERSATION ANALYSIS:
- Depth: ${conversationAnalysis.depth}
- Engagement: ${conversationAnalysis.engagementLevel}
- Emotional State: ${conversationAnalysis.emotionalState}
- Topics: ${conversationAnalysis.topics.join(', ')}

EXTRACTED DATA:
- Exercise: ${extractedData.exercise || 'None mentioned'}
- Difficulty: ${extractedData.difficulty || 'None mentioned'}
- Soreness: ${extractedData.soreness || 'None mentioned'}
- Mood: ${extractedData.mood || 'None mentioned'}
- Time Context: ${extractedData.timeContext?.reference || 'None mentioned'}

RESPONSE STRATEGY: ${strategy.description}

SPECIFIC GUIDANCE:
`;

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
- Use more engaging and curious questions
- Show genuine interest in their experience
- Make the conversation more interactive and dynamic
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
- Provide supportive, curious responses
- Encourage deeper exploration of their thoughts and feelings
- Maintain the warm, conversational tone
`;
  }

  prompt += `
RESPONSE FORMAT: Start with a warm acknowledgment, then provide your response based on the strategy above. End with one thoughtful question that encourages deeper reflection. Keep it personal and conversational.`;

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
      text: 'Would you like to explore some quick stress relief techniques?',
      action: 'stress_techniques'
    });
  }
  
  // Goal-related suggestions
  if (messageLower.includes('goal') || messageLower.includes('target')) {
    suggestions.push({
      type: 'goal_checkin',
      text: 'Would you like to check in on your goals and see how you\'re progressing?',
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
        text: `I notice ${relevantThemes[0]} keeps coming up. Would you like to dive deeper into this?`,
        action: 'explore_theme'
      });
    }
  }
  
  // Low engagement suggestions
  if (conversationAnalysis.engagementLevel === 'low') {
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
const generateContextualFollowUps = (userMessage, extractedData, conversationAnalysis, memoryInsights) => {
  const followUps = [];
  const messageLower = userMessage.toLowerCase();
  const sentiment = analyzeMessageSentiment(userMessage);
  
  // Emotional state-based questions
  if (sentiment < -0.3) {
    followUps.push("What would be most supportive for you right now?");
    followUps.push("How can you practice self-compassion in this moment?");
  } else if (sentiment > 0.3) {
    followUps.push("What made this achievement meaningful to you?");
    followUps.push("How has this journey changed you?");
  }
  
  // Topic-specific questions
  if (extractedData.exercise || messageLower.includes('workout')) {
    followUps.push("How is your fitness journey supporting your overall well-being?");
    followUps.push("What's your biggest win this week?");
  }
  
  if (messageLower.includes('goal') || messageLower.includes('target')) {
    followUps.push("What's the next small step toward your goals?");
    followUps.push("What would success look like for you?");
  }
  
  // Pattern-based questions
  if (memoryInsights?.longTermPatterns?.recurringThemes?.length > 0) {
    const relevantThemes = memoryInsights.longTermPatterns.recurringThemes.filter(theme => 
      messageLower.includes(theme.toLowerCase())
    );
    
    if (relevantThemes.length > 0) {
      followUps.push(`What's your relationship with ${relevantThemes[0]} right now?`);
    }
  }
  
  // Default questions
  if (followUps.length === 0) {
    followUps.push("What's on your mind about this?");
    followUps.push("How are you feeling about this situation?");
  }
  
  return followUps.slice(0, 2); // Limit to 2 questions
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
      memoryInsights = null 
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

    // Get user context if available
    let user = null;
    if (req.user && req.user._id) {
      try {
        user = await User.findById(req.user._id);
      } catch (error) {
        console.error('Error fetching user context:', error);
      }
    }

    // Generate enhanced response
    const enhancedResponse = await generateEnhancedResponse(
      message, 
      user, 
      conversationContext, 
      memoryInsights, 
      isPremium
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