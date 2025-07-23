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

// Enhanced reflection with conversation memory
const reflect = async (req, res) => {
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
      return res.json({ question: randomQuestion });
    }

    // Log which model is being used
    const modelToUse = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:complementary-data:Bw5xGY3w';
    console.log(`🤖 Using model: ${modelToUse}`);
    if (process.env.FINE_TUNED_MODEL_ID) {
      console.log('✅ Fine-tuned model detected!');
    } else {
      console.log('⚠️ Using base model - add FINE_TUNED_MODEL_ID to .env for custom model');
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
        
        // Build enhanced context with memory insights
        if (user) {
          context = buildEnhancedContextWithMemory(user, pastEntries, conversationContext, memoryInsights);
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
        // Continue without user context if there's an error
      }
    } else {
      // No auth - build basic context
      context = buildBasicContext(pastEntries, conversationContext);
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
          content: `You are Myra, an empathetic AI companion for fitness and wellness.

CORE APPROACH:
- Listen and validate emotions first
- Ask one thoughtful follow-up question to encourage deeper reflection
- Provide specific, actionable advice when requested
- Use the user's name: ${user ? user.name : 'you'}

STYLE: Warm, supportive, conversational. Keep responses under 3 sentences unless providing detailed advice.

EXPERTISE: CrossFit, yoga, fitness psychology, and personal development.`
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

// Generate structured journal entry from conversational input
const generateJournalEntry = async (req, res) => {
  try {
    const { message, pastEntries = [], conversationHistory = [], isReadyForEntry = false } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ No OpenAI API key found, using fallback response');
      return res.json({ 
        structuredEntry: {
          date: new Date().toISOString().split('T')[0],
          mood: 'Unknown',
          workout: { exercises: [] },
          reflection: 'Please enable OpenAI API key for AI journal assistance.'
        }
      });
    }

    // Log which model is being used
    const modelToUse = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:dataset-metcon:Bryj0os9';
    console.log(`🤖 Using model: ${modelToUse}`);
    if (process.env.FINE_TUNED_MODEL_ID) {
      console.log('✅ Fine-tuned model detected!');
    } else {
      console.log('⚠️ Using base model - add FINE_TUNED_MODEL_ID to .env for custom model');
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

    // Determine if we should have a conversation or generate an entry
    if (!isReadyForEntry) {
      // CONVERSATION PHASE - Ask follow-up questions
      const conversationPrompt = `${context}User: "${message}"

${conversationHistory.length > 0 ? `Conversation so far:
${conversationHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}
` : ''}

Have a natural conversation to understand their day and feelings. Ask 1-2 thoughtful follow-up questions.`;

      const conversationResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are ReflectWithin, an empathetic AI companion for fitness and wellness. Have natural conversations and use the user's name: ${user ? user.name : 'you'}.`
          },
          { role: 'user', content: conversationPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const conversationText = conversationResponse.data.choices[0].message.content.trim();
      
      return res.json({ 
        conversation: conversationText,
        shouldGenerateEntry: false
      });
    } else {
      // ENTRY GENERATION PHASE - Generate natural language entry
      let entryPrompt = `${context}Conversation:
${conversationHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

Create a natural, readable journal entry based on this conversation. Write it as if the user is writing their own reflection, but with AI assistance to capture all the important details.

Structure it with these sections (but write naturally, not as headers):
- How they're feeling and their overall mood
- Key highlights and activities from their day
- Workout details (if mentioned) - describe naturally like "Hit a new PR on back squats at 115kg"
- What they learned or insights gained
- Goals or focus for tomorrow
- A brief gratitude note

Write in first person, as if the user is writing their own entry. Make it engaging and personal, not robotic. Include specific details mentioned in the conversation.`;

      // Add context from past entries if available
      if (pastEntries.length > 0) {
        entryPrompt += `\n\nContext from recent entries:`;
        pastEntries.forEach(entry => {
          entryPrompt += `\n- ${entry.date}: "${entry.input}"`;
        });
        entryPrompt += `\n\nUse this context to maintain consistency in writing style and tone.`;
      }

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are ReflectWithin, an AI assistant that helps users create natural, personal journal entries. Write in the user's voice - as if they're writing their own reflection with your help. Make entries engaging, personal, and readable. Use natural language, not structured data. Include specific details and emotions mentioned in the conversation. Write in first person perspective.`
          },
          { role: 'user', content: entryPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content.trim();
      
      // Create a structured entry object for the frontend, but with natural language content
      const structuredEntry = {
        date: new Date().toISOString().split('T')[0],
        mood: 'reflected', // Will be extracted from content if needed
        content: content,
        reflection: content,
        activities: [],
        goals: [],
        workout: null
      };

      res.json({ structuredEntry });
    }
  } catch (error) {
    console.error('Journal entry generation error:', error);
    
    // Handle specific API errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API key is invalid or expired',
        message: 'Please check your OpenAI API key configuration'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(500).json({ 
        error: 'Rate limit exceeded',
        message: 'Please wait a moment before trying again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate journal entry',
      message: 'Please try again later'
    });
  }
};

module.exports = {
  reflect,
  saveReflection,
  getReflections,
  deleteReflection,
  generateJournalEntry
}; 