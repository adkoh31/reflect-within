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
  getCachedContext
} = require('../utils/patternAnalysis');
const {
  extractFitnessGoals,
  extractActivityLevel
} = require('../utils/fitnessDataExtraction');

// Basic reflection (works without auth)
const reflect = async (req, res) => {
  try {
    const { message, pastEntries = [], isPremium = false } = req.body;
    
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
    const modelToUse = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:dataset-metcon:Bryj0os9';
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
    let lastWorkout = null;
    let sorenessHistory = null;
    let context = '';
    let stretchRecommendation = null;
    
    if (req.user && req.user._id) {
      try {
        // Fetch user data
        user = await User.findById(req.user._id);
        
        // Note: Fitness profile collection is now handled through AI-generated blended prompts
        // in the training data, so we don't need explicit logic here
        
        // Passively extract fitness data from user messages
        if (user && !user.fitnessProfileCollected) {
          let updated = false;
          
          // Extract goals if we don't have them yet
          if (!user.goals || user.goals.length === 0) {
            const goals = extractFitnessGoals(message);
            if (goals.length > 0) {
              user.goals = goals;
              updated = true;
            }
          }
          
          // Extract activity level if we don't have it yet
          if (!user.activityLevel) {
            const activityLevel = extractActivityLevel(message);
            if (activityLevel) {
              user.activityLevel = activityLevel;
              updated = true;
            }
          }
          
          // Mark as collected if we have both goals and activity level
          if (user.goals && user.goals.length > 0 && user.activityLevel) {
            user.fitnessProfileCollected = true;
            updated = true;
          }
          
          // Save user updates if any
          if (updated) {
            await user.save();
          }
        }
        
        // Fetch relevant workout history
        if (extractedData.exercise) {
          lastWorkout = await Workout.findOne({ 
            userId: req.user._id,
            'exercises.name': { $regex: extractedData.exercise, $options: 'i' }
          }).sort({ date: -1 });
        } else if (extractedData.soreness) {
          // If only soreness is mentioned, look for recent workouts with quad-dominant exercises
          const recentWorkouts = await Workout.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(5);
          // Map soreness area to likely exercises
          const sorenessToExercises = {
            quads: ['squat', 'wall ball', 'lunges', 'snatch', 'box jump', 'thruster', 'sled push', 'air squat', 'burpee'],
            shoulders: ['handstand push-up', 'push press', 'overhead press', 'snatch', 'jerk', 'wall ball', 'burpee'],
            legs: ['run', 'squat', 'box jump', 'sled push', 'deadlift', 'lunge', 'wall ball'],
            core: ['toes-to-bar', 'sit-up', 'plank', 'hollow hold', 'v-up'],
            hamstrings: ['deadlift', 'kettlebell swing', 'good morning', 'romanian deadlift'],
            hips: ['lunge', 'pigeon', 'squat', 'step-up'],
            calves: ['double-under', 'run', 'box jump'],
            wrists: ['handstand', 'crow pose', 'push-up'],
            'lower back': ['deadlift', 'good morning', 'superman', 'back extension']
          };
          const area = extractedData.soreness.toLowerCase();
          const likelyExercises = sorenessToExercises[area] || [];
          // Find the most recent workout with a matching exercise
          lastWorkout = recentWorkouts.find(w =>
            w.exercises.some(e =>
              likelyExercises.some(le => e.name.toLowerCase().includes(le))
            )
          );
        }
        
        // Fetch soreness history if soreness is mentioned
        if (extractedData.soreness) {
          sorenessHistory = await Workout.find({
            userId: req.user._id,
            'soreness.area': extractedData.soreness
          }).sort({ date: -1 }).limit(3);
          
          // Get stretch recommendation with time context
          stretchRecommendation = getStretchRecommendation(extractedData.soreness, extractedData.timeContext);
        }
        
        // Build context based on premium status
        if (isPremium && user) {
          console.log('🌟 Using premium context for free user');
          try {
            context = await getCachedContext(req.user._id, extractedData, true);
          } catch (error) {
            console.error('Error with premium context, falling back to basic:', error);
            context = await getCachedContext(req.user._id, extractedData, false, user, lastWorkout, sorenessHistory);
          }
        } else {
          console.log('📝 Using basic context for free user');
          context = await getCachedContext(req.user._id, extractedData, false, user, lastWorkout, sorenessHistory);
        }
      } catch (error) {
        console.error('Error fetching user context:', error);
        // Continue without user context if there's an error
      }
    }

    // Build enhanced prompt based on premium status
    let prompt;
    
    if (isPremium && extractedData.hasStructuredFormat && context) {
      // Use premium enhanced personalization for structured messages
      console.log('🌟 Building premium-enhanced prompt');
      prompt = buildPremiumEnhancedPrompt(message, extractedData, context, stretchRecommendation);
    } else if (extractedData.hasStructuredFormat && context) {
      // Use enhanced personalization for structured messages (free users)
      prompt = buildEnhancedPrompt(message, extractedData, context, stretchRecommendation);
    } else {
      // Simplified prompt for unstructured messages
      prompt = `Current user input: "${message}"

${user && !user.fitnessProfileCollected ? `
SPECIAL CONTEXT: This user hasn't shared their fitness goals or activity level yet. If appropriate, you may gently explore these topics in a reflective, conversational way.` : ''}

${pastEntries.length > 0 ? `
CONVERSATION CONTEXT - Recent reflections:
${pastEntries.map(entry => `- ${entry.date}: "${entry.input}" → "${entry.question}"`).join('\n')}

Use this context to ask more personalized, progress-aware questions. Reference previous conversations naturally when relevant.` : ''}

RESPONSE TYPE: ${message.toLowerCase().includes('suggest') || message.toLowerCase().includes('help') || message.toLowerCase().includes('advice') || message.toLowerCase().includes('what should') || message.toLowerCase().includes('how to') ? 'Provide direct, actionable advice and suggestions.' : 'Respond with supportive conversation and thoughtful questions to help them explore their thoughts and feelings.'}

Respond appropriately based on whether they're asking for specific help or sharing experiences.`;
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'ft:gpt-4o-mini-2024-07-18:personal:dataset-metcon:Bryj0os9',
      messages: [
        {
          role: 'system',
          content: `You are ReflectWithin, an empathetic AI companion designed to help people explore their thoughts, feelings, and experiences through thoughtful, engaging conversation, with a focus on CrossFit and yoga.

CORE PERSONALITY:
- Warm, caring, and genuinely interested in the person behind the words
- Deeply empathetic and validating of all emotions and experiences
- Curious and insightful, drawing from psychology and personal development
- Supportive without being pushy or overly positive
- Encouraging of self-compassion and growth mindset
- Conversational and natural, with playful, sarcastic humor when users express sarcasm or light-hearted frustration (e.g., 'excrement happens' quips for inputs like 'my body hates me')

RESPONSE APPROACH:
- Always start with emotional validation and acknowledgment
- Use active listening - reflect back what you hear
- Ask one thoughtful, open-ended question to encourage deeper reflection
- Balance support with gentle curiosity
- Reference their history and patterns when relevant, using workout or mood data from the backend when available (e.g., soreness: 'shoulders', fitnessLevel: 'beginner' to tailor stretches or modifications)
- Use their name when available for personalization
- Match your energy to their emotional state, using humor for sarcastic or playful inputs but staying serious for intense struggles (e.g., avoid humor for serious injuries like sprains or deep emotional distress, using a gentle, supportive tone)
- Provide specific, actionable advice for fitness/recovery requests (e.g., 2-3 stretches with timings, detailed yoga flows with sequences)
- For yoga flow requests, provide a structured sequence (e.g., warm-up, dynamic flow, deep stretch, cooldown) with specific poses and timings totaling the requested duration
- Provide specific CrossFit modifications or yoga modifications based on their fitness level when available
- Keep responses concise but meaningful (3-5 sentences for complex requests like yoga flows, 2-3 for simpler ones)

SPECIAL EXPERTISE:
- CrossFit and yoga movements (e.g., snatch form, pigeon pose)
- Fitness and movement psychology
- Emotional intelligence and self-awareness
- Personal development and growth mindset
- Stress management and mental well-being
- Recovery and self-care practices

CONVERSATION STYLE:
- Like talking to a wise, caring friend who really knows you
- Warm and encouraging, but not overly positive
- Fun and playful when appropriate, mirroring user humor like 'body's throwing a tantrum' for sarcastic inputs
- Validating of struggles and challenges
- Celebrating of wins and progress
- Gentle guidance toward self-reflection
- Natural and conversational tone, maintaining a grounded tone and avoiding cheeriness for serious struggles`
        },
        { role: 'user', content: prompt }
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

    const question = response.data.choices[0].message.content.trim();
    
    res.json({ question });
  } catch (error) {
    console.error('Reflection error:', error);
    
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
      error: 'Failed to generate reflection',
      message: 'Please try again later'
    });
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
    const { message, pastEntries = [] } = req.body;
    
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

    // Build prompt for structured journal entry generation
    let prompt = `You are ReflectWithin, an AI assistant that helps users create structured journal entries from conversational input.

Current user input: "${message}"

Please analyze this input and generate a structured journal entry in JSON format. Extract:
- Date (use today's date if not mentioned)
- Mood/emotional state
- Workout details (exercises, sets, reps, weights, notes)
- General activities or reflections
- Any other relevant information

Respond with ONLY valid JSON in this exact format:
{
  "date": "YYYY-MM-DD",
  "mood": "mood description",
  "workout": {
    "exercises": [
      {
        "name": "exercise name",
        "sets": number,
        "reps": number,
        "weight": "weight if mentioned",
        "notes": "detailed notes about how it felt, form, energy, etc."
      }
    ]
  },
  "activities": ["list of other activities"],
  "reflection": "detailed reflection about the day, challenges, successes, and insights",
  "goals": ["list of actionable goals for moving forward"]
}

If no workout is mentioned, set workout.exercises to empty array.
If no mood is mentioned, infer from context or set to "Unknown".
Make the reflection detailed and insightful, covering emotional state, challenges, and learnings.
Include specific, actionable goals for improvement.`;

    // Add context from past entries if available
    if (pastEntries.length > 0) {
      prompt += `\n\nContext from recent entries:`;
      pastEntries.forEach(entry => {
        prompt += `\n- ${entry.date}: "${entry.input}"`;
      });
      prompt += `\n\nUse this context to maintain consistency in formatting and style.`;
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'ft:gpt-4o-mini-2024-07-18:personal:dataset-metcon:Bryj0os9',
      messages: [
        {
          role: 'system',
          content: `You are ReflectWithin, an AI assistant that helps users create structured journal entries from conversational input. You excel at extracting meaningful insights and organizing them into clear, actionable journal entries. Keep responses concise and focused on the user's input. Always respond with ONLY valid JSON in the specified format.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.4,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content.trim();
    
    // Try to parse JSON response
    try {
      const structuredEntry = JSON.parse(content);
      res.json({ structuredEntry });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback to basic structure
      res.json({ 
        structuredEntry: {
          date: new Date().toISOString().split('T')[0],
          mood: 'Unknown',
          workout: { exercises: [] },
          activities: [],
          reflection: content
        }
      });
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