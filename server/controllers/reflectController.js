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

// Crisis detection keywords
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all', 'want to die', 'self-harm', 'cut myself', 'hopeless', 'no point', 'better off dead'];

// Enhanced reflection with conversation memory
const reflect = async (req, res) => {
  try {
    const { 
      message, 
      pastEntries = [], 
      conversationContext = [], 
      isPremium = false,
      memoryInsights = null,
      goalData = null // Add goal data parameter
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Basic safety checks for crisis detection
    const messageLower = message.toLowerCase();
    const hasCrisisKeywords = CRISIS_KEYWORDS.some(keyword => messageLower.includes(keyword));
    
    if (hasCrisisKeywords) {
      console.log('🚨 Crisis keywords detected in message');
      return res.json({ 
        question: "I'm concerned about what you're sharing. These feelings are serious and deserve immediate attention. Please reach out to a mental health professional, call the National Suicide Prevention Lifeline at 988, or text HOME to 741741 for Crisis Text Line. You don't have to go through this alone, and there are people who want to help you.",
        requiresEscalation: true
      });
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
      return res.json({ question: randomQuestion });
    }

                    // Log which model is being used
        const modelToUse = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:unified-enhanced:By8h6kBm';
        console.log(`🤖 Using model: ${modelToUse}`);
        if (process.env.FINE_TUNED_MODEL_ID) {
            console.log('✅ Fine-tuned model detected!');
        } else {
            console.log('✅ Using unified enhanced fine-tuned model!');
        }

    // Extract structured data using patterns
    const extractedData = extractStructuredData(message);
    
    // Get user context if available (from auth middleware)
    let user = null;
    let context = '';
    
    if (req.user && req.user._id) {
      try {
        // Fetch user data
        user = await User.findById(req.user._id);
        
        // Build enhanced context with memory insights and goal data
        if (user) {
          context = buildEnhancedContextWithMemory(user, pastEntries, conversationContext, memoryInsights, goalData);
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
        // Continue without user context if there's an error
      }
    } else {
      // No auth - build basic context with goal data if available
      context = buildBasicContext(pastEntries, conversationContext, goalData);
    }

    // Generate conversation ID for memory tracking
    const conversationId = req.user ? `user_${req.user._id}_${Date.now()}` : `anonymous_${Date.now()}`;
    
    // Process conversation memory with enhanced memory manager
    if (conversationContext && conversationContext.length > 0) {
      enhancedMemoryManager.processConversationMemory(conversationId, conversationContext, user);
    }
    
    // Get enhanced memory context
    const enhancedMemoryContext = enhancedMemoryManager.getMemoryContext(conversationId, message);
    
    // Build conversation memory context
    const conversationMemoryContext = buildConversationMemoryContext(conversationContext, memoryInsights);

    // Build enhanced prompt with memory context
    const memoryContextString = enhancedMemoryContext ? `
ENHANCED MEMORY CONTEXT:
${enhancedMemoryContext.relevantMemories.length > 0 ? `- Relevant past conversations: ${enhancedMemoryContext.relevantMemories.length} found` : ''}
${enhancedMemoryContext.userPatterns.length > 0 ? `- User patterns: ${enhancedMemoryContext.userPatterns.slice(0, 3).map(p => p.pattern).join(', ')}` : ''}
${enhancedMemoryContext.emotionalContext ? `- Emotional trend: ${enhancedMemoryContext.emotionalContext.recentTrend}` : ''}
${enhancedMemoryContext.goalContext.length > 0 ? `- Active goals: ${enhancedMemoryContext.goalContext.slice(0, 2).map(g => g.goal).join(', ')}` : ''}
${enhancedMemoryContext.continuitySuggestions.length > 0 ? `- Continuity suggestions: ${enhancedMemoryContext.continuitySuggestions.slice(0, 2).map(s => s.suggestion).join('; ')}` : ''}
` : '';

    const prompt = `${context}${conversationMemoryContext}${memoryContextString}

User: "${message}"

Respond naturally and empathetically with memory continuity. Reference previous conversations when relevant and build on past discussions.`;

    console.log('📝 Sending enhanced prompt to AI with conversation memory...');

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: modelToUse,
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

    const question = response.data.choices[0].message.content.trim();
    
    res.json({ question });
  } catch (error) {
    console.error('❌ Reflection error:', error);
    
    // Provide fallback response
    const fallbackQuestions = [
      "I'm here to support you. What would you like to explore today?",
      "That sounds important. Can you tell me more about how you're feeling?",
      "I'm listening. What's on your mind right now?",
      "Thank you for sharing that with me. What would be most helpful to focus on?",
      "I'm here for you. What would you like to work through together?"
    ];
    
    const fallbackQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    
    res.json({ question: fallbackQuestion });
  }
};

// Save reflection to database (requires auth)
const saveReflection = async (req, res) => {
  try {
    const { userInput, aiQuestion } = req.body;
    const userId = req.user._id;

    if (!userInput || !aiQuestion) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'User input and AI question are required'
      });
    }

    const reflection = new Reflection({
      userId,
      userInput,
      aiQuestion,
      timestamp: new Date()
    });

    await reflection.save();

    res.status(201).json({
      message: 'Reflection saved successfully',
      reflection: {
        id: reflection._id,
        userInput: reflection.userInput,
        aiQuestion: reflection.aiQuestion,
        timestamp: reflection.timestamp
      }
    });
  } catch (error) {
    console.error('Save reflection error:', error);
    res.status(500).json({
      error: 'Failed to save reflection',
      message: 'Internal server error'
    });
  }
};

// Get user's reflections (requires auth)
const getReflections = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const reflections = await Reflection.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Reflection.countDocuments({ userId });

    res.json({
      reflections,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reflections error:', error);
    res.status(500).json({
      error: 'Failed to get reflections',
      message: 'Internal server error'
    });
  }
};

// Delete reflection (requires auth)
const deleteReflection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reflection = await Reflection.findOneAndDelete({ _id: id, userId });
    
    if (!reflection) {
      return res.status(404).json({
        error: 'Reflection not found',
        message: 'Reflection does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      message: 'Reflection deleted successfully'
    });
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({
      error: 'Failed to delete reflection',
      message: 'Internal server error'
    });
  }
};

// Generate structured journal entry from user input
const generateJournalEntry = async (req, res) => {
  try {
    const { message, pastEntries = [], promptType, prompt, isReadyForEntry = true } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ No OpenAI API key found, using fallback response');
      return res.json({ 
        structuredEntry: {
          date: new Date().toISOString().split('T')[0],
          content: 'Please enable OpenAI API key for AI journal assistance.',
          mood: 'Unknown',
          topics: []
        }
      });
    }

    // Log which model is being used
    const modelToUse = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:unified-enhanced:By8h6kBm';
    console.log(`🤖 Using model: ${modelToUse}`);
    if (process.env.FINE_TUNED_MODEL_ID) {
      console.log('✅ Fine-tuned model detected!');
    } else {
      console.log('✅ Using unified enhanced fine-tuned model!');
    }

    // Get user context if available (from auth middleware)
    let user = null;
    let context = '';
    
    if (req.user && req.user._id) {
      try {
        // Fetch user data
        user = await User.findById(req.user._id);
        
        // Build basic context with user info
        if (user) {
          context = `USER CONTEXT:
- Name: ${user.name || 'User'}
- Email: ${user.email}
- Goals: ${user.goals ? user.goals.join(', ') : 'Not specified'}
- Activity Level: ${user.activityLevel || 'Not specified'}

`;
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
        // Continue without user context if there's an error
      }
    }

    // Build prompt-specific guidance
    let promptGuidance = '';
    switch (promptType) {
      case 'workout':
        promptGuidance = `
WORKOUT ENTRY GUIDANCE:
- Focus on the workout details: exercises, sets, reps, weights
- Include how it felt physically and mentally
- Mention any achievements, PRs, or challenges
- Add recovery notes if relevant
- Keep it personal and engaging`;
        break;
      case 'mood':
        promptGuidance = `
MOOD CHECK GUIDANCE:
- Explore the emotional state and what's affecting it
- Include context about what happened today
- Mention any coping strategies or self-care
- Be empathetic and validating
- Keep it reflective and honest`;
        break;
      case 'daily':
        promptGuidance = `
DAILY REFLECTION GUIDANCE:
- Capture the key events and experiences of the day
- Include gratitude and positive moments
- Reflect on learnings and insights
- Consider how the day felt overall
- Make it personal and meaningful`;
        break;
      case 'goals':
        promptGuidance = `
GOAL CHECK-IN GUIDANCE:
- Review progress toward specific goals
- Include actions taken today toward goals
- Mention any obstacles or challenges
- Celebrate small wins and progress
- Plan next steps if relevant`;
        break;
      default:
        promptGuidance = `
GENERAL JOURNAL GUIDANCE:
- Create a natural, personal journal entry
- Include relevant details and emotions
- Make it engaging and authentic
- Keep the user's voice and style`;
    }

    // Generate the journal entry
    const entryPrompt = `${context}${promptGuidance}

USER RESPONSE: "${message}"

${pastEntries.length > 0 ? `RECENT ENTRIES CONTEXT:
${pastEntries.slice(-3).map(entry => `- ${entry.date}: "${entry.content?.substring(0, 100)}..."`).join('\n')}
` : ''}

Create a natural, well-written journal entry based on the user's response. Write it in first person as if the user is writing their own entry, but with AI assistance to make it more comprehensive and reflective.

The entry should be:
- Natural and conversational
- Personal and authentic to the user's voice
- Well-structured and easy to read
- Include relevant details from their response
- 2-4 paragraphs in length

Write the entry as a single, flowing piece of text.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelToUse,
      messages: [
        {
          role: 'system',
          content: `You are ReflectWithin, an AI assistant that helps users create thoughtful journal entries. Write in the user's voice, making their entries more comprehensive and reflective while maintaining authenticity.`
        },
        { role: 'user', content: entryPrompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const generatedEntry = response.data.choices[0].message.content.trim();

    // Create structured entry
    const structuredEntry = {
      date: new Date().toISOString().split('T')[0],
      content: generatedEntry,
      mood: extractMoodFromEntry(generatedEntry),
      topics: extractTopicsFromEntry(generatedEntry, promptType),
      promptType: promptType
    };

    res.json({ structuredEntry });

  } catch (error) {
    console.error('❌ Journal entry generation error:', error);
    
    // Provide fallback response
    const fallbackEntry = {
      date: new Date().toISOString().split('T')[0],
      content: "I'm having trouble generating your journal entry right now. Please try again or write your entry manually.",
      mood: 'neutral',
      topics: ['general'],
      promptType: promptType || 'general'
    };
    
    res.json({ structuredEntry: fallbackEntry });
  }
};

// Helper function to extract mood from entry
const extractMoodFromEntry = (entry) => {
  const entryLower = entry.toLowerCase();
  if (entryLower.includes('happy') || entryLower.includes('excited') || entryLower.includes('great')) return 'happy';
  if (entryLower.includes('sad') || entryLower.includes('down') || entryLower.includes('disappointed')) return 'sad';
  if (entryLower.includes('stressed') || entryLower.includes('anxious') || entryLower.includes('worried')) return 'stressed';
  if (entryLower.includes('calm') || entryLower.includes('peaceful') || entryLower.includes('relaxed')) return 'calm';
  if (entryLower.includes('tired') || entryLower.includes('exhausted') || entryLower.includes('drained')) return 'tired';
  return 'neutral';
};

// Helper function to extract topics from entry
const extractTopicsFromEntry = (entry, promptType) => {
  const topics = [];
  const entryLower = entry.toLowerCase();
  
  // Add prompt-specific topics
  if (promptType === 'workout') topics.push('fitness', 'workout');
  if (promptType === 'mood') topics.push('mood', 'emotions');
  if (promptType === 'daily') topics.push('daily', 'reflection');
  if (promptType === 'goals') topics.push('goals', 'progress');
  
  // Extract additional topics from content
  if (entryLower.includes('workout') || entryLower.includes('exercise') || entryLower.includes('gym')) topics.push('fitness');
  if (entryLower.includes('goal') || entryLower.includes('target') || entryLower.includes('progress')) topics.push('goals');
  if (entryLower.includes('grateful') || entryLower.includes('thankful') || entryLower.includes('blessed')) topics.push('gratitude');
  if (entryLower.includes('stress') || entryLower.includes('anxiety') || entryLower.includes('pressure')) topics.push('stress');
  
  return [...new Set(topics)]; // Remove duplicates
};

module.exports = {
  reflect,
  saveReflection,
  getReflections,
  deleteReflection,
  generateJournalEntry
}; 