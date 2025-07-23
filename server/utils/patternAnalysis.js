// Pattern analysis utilities for ReflectWithin personalization

// Simple in-memory cache for user context
const contextCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached context or build new one
 */
const getCachedContext = async (userId, extractedData, isPremium, user = null, lastWorkout = null, sorenessHistory = null) => {
  const startTime = Date.now();
  const cacheKey = `${userId}:${isPremium}:${JSON.stringify(extractedData)}`;
  const cached = contextCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    const duration = Date.now() - startTime;
    console.log(`📦 Using cached context (${duration}ms)`);
    return cached.context;
  }
  
  console.log('🔄 Building fresh context');
  let context;
  
  try {
    if (isPremium) {
      context = await buildEnhancedUserContext(userId, extractedData);
    } else {
      // For basic context, we need to fetch user if not provided
      if (!user) {
        const User = require('../models/User');
        user = await User.findById(userId);
      }
      context = buildBasicContext(extractedData, user, lastWorkout, sorenessHistory);
    }
    
    contextCache.set(cacheKey, {
      context,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    if (contextCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of contextCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          contextCache.delete(key);
        }
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Context built in ${duration}ms (${isPremium ? 'premium' : 'basic'})`);
    
    return context;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Context building failed after ${duration}ms:`, error);
    throw error;
  }
};

// Exercise patterns from training data
const EXERCISE_PATTERNS = {
  crossfit: [
    'snatches?', 'deadlifts?', 'sled pushes?', 'muscle-ups?', 'toes-to-bar', 
    'wall balls?', 'burpees?', 'air squats?', 'double-unders?', 'kettlebell swings?', 
    'box jumps?', 'handstand push-ups?', 'thrusters?', 'pull-ups?', 'runs?'
  ],
  yoga: [
    'vinyasa', 'hatha', 'yin', 'crow pose', 'savasana', 'warrior II', 'downward dog'
  ],
  strength: [
    'bench press', 'squat', 'deadlift', 'overhead press', 'row', 'lunge', 'plank'
  ],
  cardio: [
    'run', 'bike', 'swim', 'row', 'elliptical', 'stairmaster', 'jump rope'
  ]
};

// Difficulty patterns with emotional context
const DIFFICULTY_PATTERNS = {
  positive: ['amazing', 'incredible', 'fantastic', 'awesome', 'great', 'solid', 'strong'],
  challenging: ['tough', 'challenging', 'intense', 'grueling', 'exhausting', 'brutal'],
  neutral: ['okay', 'decent', 'fine', 'manageable', 'moderate'],
  negative: ['terrible', 'awful', 'horrible', 'bad', 'weak', 'poor']
};

// Soreness areas with recovery context
const SORENESS_AREAS = [
  'quads?', 'shoulders?', 'legs?', 'core', 'calves?', 'wrists?', 'hamstrings?', 'hips?', 'lower back'
];

// Enhanced mood patterns with emotional intelligence
const MOOD_PATTERNS = {
  positive: ['excited', 'energized', 'grateful', 'happy', 'proud', 'motivated', 'confident', 'peaceful'],
  neutral: ['neutral', 'calm', 'focused', 'determined', 'balanced'],
  negative: ['tired', 'stressed', 'anxious', 'frustrated', 'overwhelmed', 'sad', 'angry', 'worried'],
  recovery: ['sore', 'exhausted', 'drained', 'fatigued', 'restless']
};

// Time patterns for recovery context
const TIME_PATTERNS = {
  immediate: ['today', 'just', 'now', 'this morning', 'this afternoon', 'this evening'],
  recent: ['yesterday', 'last night', 'this week', 'recently'],
  past: ['last week', 'a few days ago', 'earlier this week', 'the other day'],
  ongoing: ['still', 'continuing', 'persistent', 'recurring', 'chronic']
};

// Enhanced stretch recommendations with emotional support
const STRETCH_RECOMMENDATIONS = {
  'quads': [
    'Quad Stretch: hold your foot behind for 30 seconds per side - this should help release that tension',
    'Couch Stretch: shin against a wall for 1-2 min per side - great for opening up those tight quads'
  ],
  'shoulders': [
    'Thread-the-Needle: thread one arm under for 30 seconds per side - perfect for shoulder mobility',
    'Eagle Arm stretch: cross your arms for 30 seconds - helps with that upper body tightness'
  ],
  'hamstrings': [
    'Downward Dog: hold for 1 min - let gravity help stretch those hamstrings',
    'Forward Fold: hang loose for 1 min - breathe into the stretch'
  ],
  'core': [
    'Cat-Cow stretch: flow for 1 min - gentle movement for core recovery'
  ],
  'hips': [
    'Figure-Four stretch: hold for 1 min per side - great for hip opening',
    'Pigeon Pose: hold for 1 min per side - deep hip stretch'
  ],
  'lower back': [
    'Child\'s Pose: sink back for 1 min - gentle decompression for your spine',
    'Supine Twist: hold for 1 min per side - helps release lower back tension'
  ],
  'wrists': [
    'Wrist Stretch: pull your fingers back gently for 30 seconds per side - important for wrist health'
  ],
  'calves': [
    'Forward Fold: hang loose for 1 min - let those calves release'
  ],
  'legs': [
    'Forward Fold: hang loose for 1 min - overall leg stretch'
  ]
};

// Emotional support patterns based on context
const EMOTIONAL_SUPPORT_PATTERNS = {
  achievement: [
    "That's incredible progress! What do you think made this workout feel so powerful?",
    "You should be proud of that effort! What was different about today that helped you push through?",
    "Amazing work! I can feel your energy through your words. What's driving this momentum?"
  ],
  challenge: [
    "It sounds like you're really pushing your limits. How are you feeling about that challenge?",
    "That sounds tough, but you're showing real resilience. What's helping you stay motivated?",
    "I hear the struggle in your voice. What do you think you're learning about yourself through this?"
  ],
  recovery: [
    "Your body is asking for rest, and that's completely normal. How are you feeling about taking it easy?",
    "Recovery is just as important as the workout. What does your body need right now?",
    "It's okay to listen to your body. What would feel most supportive for you today?"
  ],
  stress: [
    "I can hear the stress in your voice. How is your workout helping or not helping with that?",
    "Stress can really impact our energy. What's on your mind that might be affecting your workout?",
    "You're carrying a lot right now. How can movement help you process what you're going through?"
  ]
};

/**
 * Extract time context from message
 */
const extractTimeContext = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for immediate time references
  for (const timeRef of TIME_PATTERNS.immediate) {
    if (lowerMessage.includes(timeRef)) {
      return { type: 'immediate', reference: timeRef };
    }
  }
  
  // Check for recent time references
  for (const timeRef of TIME_PATTERNS.recent) {
    if (lowerMessage.includes(timeRef)) {
      return { type: 'recent', reference: timeRef };
    }
  }
  
  // Check for past time references
  for (const timeRef of TIME_PATTERNS.past) {
    if (lowerMessage.includes(timeRef)) {
      return { type: 'past', reference: timeRef };
    }
  }
  
  // Check for ongoing/recurring patterns
  for (const timeRef of TIME_PATTERNS.ongoing) {
    if (lowerMessage.includes(timeRef)) {
      return { type: 'ongoing', reference: timeRef };
    }
  }
  
  return { type: 'unknown', reference: null };
};

/**
 * Extract emotional context from message
 */
const extractEmotionalContext = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for emotional keywords
  for (const [category, emotions] of Object.entries(MOOD_PATTERNS)) {
    for (const emotion of emotions) {
      if (lowerMessage.includes(emotion)) {
        return { category, emotion, intensity: 'moderate' };
      }
    }
  }
  
  // Check for difficulty patterns
  for (const [category, difficulties] of Object.entries(DIFFICULTY_PATTERNS)) {
    for (const difficulty of difficulties) {
      if (lowerMessage.includes(difficulty)) {
        return { category: 'difficulty', emotion: difficulty, intensity: category };
      }
    }
  }
  
  return { category: 'neutral', emotion: null, intensity: 'low' };
};

/**
 * Extract structured data from user message using patterns
 */
const extractStructuredData = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Extract exercise
  let exercise = null;
  let exerciseType = null;
  
  for (const [type, exercises] of Object.entries(EXERCISE_PATTERNS)) {
    for (const exercisePattern of exercises) {
      const regex = new RegExp(`\\b${exercisePattern}\\b`, 'i');
      if (regex.test(message)) {
        exercise = message.match(regex)[0];
        exerciseType = type;
        break;
      }
    }
    if (exercise) break;
  }
  
  // Extract mood
  let mood = null;
  const moodMatch = message.match(/Mood:\s*([A-Za-z]+)/);
  if (moodMatch && Object.values(MOOD_PATTERNS).flat().includes(moodMatch[1])) {
    mood = moodMatch[1];
  }
  
  // Extract journal details
  let journalDetails = null;
  const journalMatch = message.match(/Journal:\s*Workouts,\s*(CrossFit|Yoga),\s*(.+?)(?=\s*$|\.)/);
  if (journalMatch) {
    journalDetails = journalMatch[2];
  }
  
  // Extract difficulty
  let difficulty = null;
  for (const [category, difficulties] of Object.entries(DIFFICULTY_PATTERNS)) {
    for (const diff of difficulties) {
      if (lowerMessage.includes(diff)) {
        difficulty = diff;
        break;
      }
    }
    if (difficulty) break;
  }
  
  // Extract soreness
  let soreness = null;
  for (const area of SORENESS_AREAS) {
    if (lowerMessage.includes(area)) {
      soreness = area;
      break;
    }
  }
  
  // Extract time context
  const timeContext = extractTimeContext(message);
  
  // Extract emotional context
  const emotionalContext = extractEmotionalContext(message);
  
  // Determine if message has structured format
  const hasStructuredFormat = !!(exercise || mood || journalDetails || difficulty || soreness);
  
  return {
    exercise,
    exerciseType,
    mood,
    journalDetails,
    difficulty,
    soreness,
    timeContext,
    emotionalContext,
    hasStructuredFormat
  };
};

/**
 * Get stretch recommendation for soreness with time context
 */
const getStretchRecommendation = (soreness, timeContext = null) => {
  if (!soreness || !STRETCH_RECOMMENDATIONS[soreness]) {
    return null;
  }
  
  const stretches = STRETCH_RECOMMENDATIONS[soreness];
  let stretch = stretches[Math.floor(Math.random() * stretches.length)];
  
  // Add time-based context to stretch recommendation
  if (timeContext) {
    switch (timeContext.type) {
      case 'immediate':
        stretch += ' (for immediate relief)';
        break;
      case 'ongoing':
        stretch += ' (consider doing this 2-3 times daily for persistent soreness)';
        break;
      case 'recent':
        stretch += ' (good for recent soreness)';
        break;
    }
  }
  
  return stretch;
};

/**
 * Build context string for AI prompt with time awareness
 */
const buildContext = (extractedData, user, lastWorkout, sorenessHistory) => {
  let context = `Name: ${user.name}`;
  
  if (user.fitnessLevel) {
    context += `, Fitness Level: ${user.fitnessLevel}`;
  }
  
  if (user.goals && user.goals.length > 0) {
    context += `, Goals: ${user.goals.join(', ')}`;
  }
  
  // Add time-aware workout context
  if (extractedData.exercise && lastWorkout) {
    const daysSinceLastWorkout = Math.floor((new Date() - lastWorkout.date) / (1000 * 60 * 60 * 24));
    context += `, Last ${extractedData.exercise}: ${lastWorkout.exercises[0]?.weight || 'no weight'} ${daysSinceLastWorkout} days ago`;
  }
  
  // Add time-aware soreness context
  if (extractedData.soreness && sorenessHistory && sorenessHistory.length > 0) {
    const mostRecentSoreness = sorenessHistory[0];
    const daysSinceSoreness = Math.floor((new Date() - mostRecentSoreness.date) / (1000 * 60 * 60 * 24));
    
    if (sorenessHistory.length > 1) {
      context += `, Recurring soreness in ${extractedData.soreness} (last occurrence: ${daysSinceSoreness} days ago)`;
    } else {
      context += `, Recent soreness in ${extractedData.soreness} (${daysSinceSoreness} days ago)`;
    }
  }
  
  // Add time context
  if (extractedData.timeContext && extractedData.timeContext.type !== 'unknown') {
    context += `, Time Context: ${extractedData.timeContext.reference}`;
  }
  
  if (extractedData.mood) {
    context += `, Current Mood: ${extractedData.mood}`;
  }
  
  return context;
};

/**
 * Build enhanced prompt for AI with time awareness
 */
const buildEnhancedPrompt = (message, extractedData, context, stretchRecommendation) => {
  // Determine emotional context and response style
  const emotionalContext = extractedData.emotionalContext;
  const isAchievement = emotionalContext.category === 'difficulty' && emotionalContext.intensity === 'positive';
  const isChallenge = emotionalContext.category === 'difficulty' && emotionalContext.intensity === 'challenging';
  const isRecovery = emotionalContext.category === 'recovery' || extractedData.soreness;
  const isStress = emotionalContext.category === 'negative' && ['stressed', 'anxious', 'overwhelmed'].includes(emotionalContext.emotion);
  
  // Select appropriate emotional support pattern
  let emotionalSupport = '';
  if (isAchievement) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.achievement[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.achievement.length)];
  } else if (isChallenge) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.challenge[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.challenge.length)];
  } else if (isRecovery) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.recovery[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.recovery.length)];
  } else if (isStress) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.stress[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.stress.length)];
  }

  let prompt = `You are ReflectWithin, an empathetic AI companion designed to help people explore their thoughts, feelings, and experiences through thoughtful conversation. Your personality is warm, supportive, and genuinely curious, with deep expertise in psychology, personal development, fitness, and emotional intelligence.

CORE PERSONALITY TRAITS:
- Warm and genuinely caring, like a trusted friend who knows you well
- Deeply empathetic and validating of all emotions and experiences
- Curious and interested in understanding the person behind the words
- Supportive without being pushy or overly positive
- Wise and insightful, drawing from psychology and personal development
- Encouraging of self-compassion and growth mindset
- Conversational and natural, avoiding clinical or robotic language

RESPONSE APPROACH:
- Always start with emotional validation and acknowledgment
- Use active listening techniques - reflect back what you hear
- Ask 1-2 thoughtful, open-ended questions that encourage deeper reflection
- Balance support with gentle curiosity
- Reference their history and patterns when relevant
- Match your energy to their emotional state
- Keep responses concise but meaningful (2-3 sentences max)

Current user input: "${message}"

Extracted data:
- Exercise: ${extractedData.exercise || 'None mentioned'}
- Difficulty: ${extractedData.difficulty || 'None mentioned'}
- Soreness: ${extractedData.soreness || 'None mentioned'}
- Mood: ${extractedData.mood || 'None mentioned'}
- Time Context: ${extractedData.timeContext?.reference || 'None mentioned'}
- Emotional Context: ${emotionalContext.category} - ${emotionalContext.emotion || 'neutral'}

User context: ${context}

EMOTIONAL INTELLIGENCE GUIDANCE:
${emotionalSupport ? `- Emotional support pattern: "${emotionalSupport}"` : ''}
- If they're celebrating achievement: Acknowledge their effort and explore what made it special
- If they're struggling: Validate the difficulty and explore their resilience
- If they're in recovery: Support their body's needs and explore their relationship with rest
- If they're stressed: Acknowledge the stress and explore how movement helps or doesn't help
- If they're neutral: Gently explore what's on their mind or what they're working through

CONVERSATION FLOW:
1. Acknowledge their current state with warmth and empathy
2. Ask one thoughtful question that encourages deeper reflection
3. Keep the tone conversational and supportive

IMPORTANT: 
- Respond with ONLY a single, thoughtful question or supportive statement followed by a question
- Keep it conversational and supportive
- Reference past workouts if relevant
- Match the tone to their emotional state
- Consider recovery time: immediate soreness vs. persistent soreness
- Avoid generic responses - make it personal to their situation`;

  if (stretchRecommendation) {
    prompt += `\n- If soreness is mentioned, suggest: "${stretchRecommendation}"`;
  }

  // Add time-specific guidance
  if (extractedData.timeContext) {
    switch (extractedData.timeContext.type) {
      case 'immediate':
        prompt += `\n- This is immediate soreness - focus on acute relief and recovery`;
        break;
      case 'ongoing':
        prompt += `\n- This appears to be persistent soreness - consider recovery patterns and prevention`;
        break;
      case 'recent':
        prompt += `\n- This is recent soreness - balance recovery with continued training`;
        break;
    }
  }

  // Add emotional state specific guidance
  if (emotionalContext.category === 'positive') {
    prompt += `\n- They're feeling positive - build on this momentum and explore what's working`;
  } else if (emotionalContext.category === 'negative') {
    prompt += `\n- They're experiencing negative emotions - provide extra validation and gentle support`;
  } else if (emotionalContext.category === 'recovery') {
    prompt += `\n- They're in recovery mode - emphasize the importance of rest and self-care`;
  }

  prompt += `\n\nRESPONSE FORMAT: Start with a warm acknowledgment, then ask one thoughtful question that encourages deeper reflection. Keep it personal and conversational.`;

  return prompt;
};

/**
 * Build enhanced user context for premium users with comprehensive history
 */
const buildEnhancedUserContext = async (userId, extractedData) => {
  try {
    // Import models at the top to avoid circular dependencies
    const User = require('../models/User');
    const Workout = require('../models/Workout');
    const Reflection = require('../models/Reflection');
    
    // Fetch comprehensive user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    let context = `Name: ${user.name}`;
    
    // Basic user info
    if (user.fitnessLevel) {
      context += `, Fitness Level: ${user.fitnessLevel}`;
    }
    if (user.goals && user.goals.length > 0) {
      context += `, Goals: ${user.goals.join(', ')}`;
    }
    if (user.activityLevel) {
      context += `, Activity Level: ${user.activityLevel}`;
    }
    
    // Enhanced workout history (last 10 workouts)
    const recentWorkouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .limit(10);
    
    if (recentWorkouts.length > 0) {
      const daysSinceOldest = Math.ceil((new Date() - recentWorkouts[recentWorkouts.length - 1].date) / (1000 * 60 * 60 * 24));
      context += `, Recent Workouts: ${recentWorkouts.length} in last ${daysSinceOldest} days`;
      
      // Exercise frequency analysis
      const exerciseCounts = {};
      recentWorkouts.forEach(workout => {
        if (workout.exercises && workout.exercises.length > 0) {
          workout.exercises.forEach(exercise => {
            exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
          });
        }
      });
      
      const topExercises = Object.entries(exerciseCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => `${name}(${count})`)
        .join(', ');
      
      if (topExercises) {
        context += `, Most Frequent: ${topExercises}`;
      }
      
      // Mood trends
      const moodCounts = {};
      recentWorkouts.forEach(workout => {
        if (workout.mood) {
          moodCounts[workout.mood] = (moodCounts[workout.mood] || 0) + 1;
        }
      });
      
      const dominantMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (dominantMood) {
        context += `, Typical Mood: ${dominantMood[0]} (${dominantMood[1]}/${recentWorkouts.length} workouts)`;
      }
    }
    
    // Enhanced soreness patterns
    if (extractedData.soreness) {
      const sorenessHistory = await Workout.find({
        userId,
        'soreness.area': extractedData.soreness
      }).sort({ date: -1 }).limit(5);
      
      if (sorenessHistory.length > 0) {
        const daysSinceLast = Math.floor((new Date() - sorenessHistory[0].date) / (1000 * 60 * 60 * 24));
        context += `, ${extractedData.soreness} Soreness: ${sorenessHistory.length} occurrences, last ${daysSinceLast} days ago`;
        
        if (sorenessHistory.length > 2) {
          context += ` (recurring pattern)`;
        }
      }
    }
    
    // Reflection patterns (last 20 reflections)
    const recentReflections = await Reflection.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    if (recentReflections.length > 0) {
      context += `, Reflection Streak: ${recentReflections.length} entries`;
      
      // Analyze reflection themes
      const themes = analyzeReflectionThemes(recentReflections);
      if (themes.length > 0) {
        context += `, Common Themes: ${themes.slice(0, 3).join(', ')}`;
      }
    }
    
    // Time-based context
    if (extractedData.timeContext && extractedData.timeContext.type !== 'unknown') {
      context += `, Time Context: ${extractedData.timeContext.reference}`;
    }
    
    // Current mood
    if (extractedData.mood) {
      context += `, Current Mood: ${extractedData.mood}`;
    }
    
    return context;
  } catch (error) {
    console.error('Error building enhanced user context:', error);
    // Fallback to basic context
    const User = require('../models/User');
    const user = await User.findById(userId);
    return buildBasicContext(extractedData, user);
  }
};

/**
 * Build basic context for free users
 */
const buildBasicContext = (extractedData, user, lastWorkout = null, sorenessHistory = null) => {
  if (!user) {
    return 'Name: Unknown User';
  }
  
  let context = `Name: ${user.name}`;
  
  if (user.fitnessLevel) {
    context += `, Fitness Level: ${user.fitnessLevel}`;
  }
  
  if (user.goals && user.goals.length > 0) {
    context += `, Goals: ${user.goals.join(', ')}`;
  }
  
  // Add time-aware workout context
  if (extractedData.exercise && lastWorkout) {
    const daysSinceLastWorkout = Math.floor((new Date() - lastWorkout.date) / (1000 * 60 * 60 * 24));
    const weight = lastWorkout.exercises && lastWorkout.exercises[0] ? 
      (lastWorkout.exercises[0].weight || 'no weight') : 'no weight';
    context += `, Last ${extractedData.exercise}: ${weight} ${daysSinceLastWorkout} days ago`;
  }
  
  // Add time-aware soreness context
  if (extractedData.soreness && sorenessHistory && sorenessHistory.length > 0) {
    const mostRecentSoreness = sorenessHistory[0];
    const daysSinceSoreness = Math.floor((new Date() - mostRecentSoreness.date) / (1000 * 60 * 60 * 24));
    
    if (sorenessHistory.length > 1) {
      context += `, Recurring soreness in ${extractedData.soreness} (last occurrence: ${daysSinceSoreness} days ago)`;
    } else {
      context += `, Recent soreness in ${extractedData.soreness} (${daysSinceSoreness} days ago)`;
    }
  }
  
  // Add time context
  if (extractedData.timeContext && extractedData.timeContext.type !== 'unknown') {
    context += `, Time Context: ${extractedData.timeContext.reference}`;
  }
  
  if (extractedData.mood) {
    context += `, Current Mood: ${extractedData.mood}`;
  }
  
  return context;
};

/**
 * Analyze reflection themes from recent entries
 */
const analyzeReflectionThemes = (reflections) => {
  const themes = {
    'fitness': ['workout', 'exercise', 'training', 'gym', 'strength', 'cardio'],
    'recovery': ['sore', 'tired', 'rest', 'recovery', 'rest day'],
    'goals': ['goal', 'target', 'progress', 'improvement', 'achievement'],
    'stress': ['stress', 'anxiety', 'overwhelmed', 'pressure', 'busy'],
    'motivation': ['motivated', 'inspired', 'excited', 'pumped', 'ready'],
    'challenges': ['hard', 'difficult', 'struggle', 'challenge', 'tough'],
    'gratitude': ['grateful', 'thankful', 'blessed', 'appreciate', 'happy'],
    'relationships': ['friend', 'family', 'partner', 'relationship', 'support']
  };
  
  const themeCounts = {};
  const allText = reflections.map(r => `${r.userInput} ${r.aiQuestion}`).join(' ').toLowerCase();
  
  Object.entries(themes).forEach(([theme, keywords]) => {
    const count = keywords.filter(keyword => allText.includes(keyword)).length;
    if (count > 0) {
      themeCounts[theme] = count;
    }
  });
  
  return Object.entries(themeCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([theme]) => theme);
};

/**
 * Build enhanced prompt for premium users with comprehensive context
 */
const buildPremiumEnhancedPrompt = (message, extractedData, context, stretchRecommendation) => {
  // Determine emotional context and response style
  const emotionalContext = extractedData.emotionalContext;
  const isAchievement = emotionalContext.category === 'difficulty' && emotionalContext.intensity === 'positive';
  const isChallenge = emotionalContext.category === 'difficulty' && emotionalContext.intensity === 'challenging';
  const isRecovery = emotionalContext.category === 'recovery' || extractedData.soreness;
  const isStress = emotionalContext.category === 'negative' && ['stressed', 'anxious', 'overwhelmed'].includes(emotionalContext.emotion);
  
  // Select appropriate emotional support pattern
  let emotionalSupport = '';
  if (isAchievement) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.achievement[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.achievement.length)];
  } else if (isChallenge) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.challenge[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.challenge.length)];
  } else if (isRecovery) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.recovery[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.recovery.length)];
  } else if (isStress) {
    emotionalSupport = EMOTIONAL_SUPPORT_PATTERNS.stress[Math.floor(Math.random() * EMOTIONAL_SUPPORT_PATTERNS.stress.length)];
  }

  let prompt = `You are ReflectWithin, an empathetic AI companion designed to help people explore their thoughts, feelings, and experiences through thoughtful conversation. Your personality is warm, supportive, and genuinely curious, with deep expertise in psychology, personal development, fitness, and emotional intelligence.

CORE PERSONALITY TRAITS:
- Warm and genuinely caring, like a trusted friend who knows you well
- Deeply empathetic and validating of all emotions and experiences
- Curious and interested in understanding the person behind the words
- Supportive without being pushy or overly positive
- Wise and insightful, drawing from psychology and personal development
- Encouraging of self-compassion and growth mindset
- Conversational and natural, avoiding clinical or robotic language

PREMIUM COACH MODE - ENHANCED CAPABILITIES:
- You have access to their complete workout history, mood patterns, and reflection themes
- You can reference specific patterns from their history naturally
- You can acknowledge their progress and consistency over time
- You can provide personalized advice based on their recurring patterns
- You can show you remember their goals and track their progress
- You can be encouraging but realistic about their patterns
- You can suggest improvements based on their historical data
- You can identify trends and help them understand their patterns

Current user input: "${message}"

Comprehensive user context: ${context}

Extracted data:
- Exercise: ${extractedData.exercise || 'None mentioned'}
- Difficulty: ${extractedData.difficulty || 'None mentioned'}
- Soreness: ${extractedData.soreness || 'None mentioned'}
- Mood: ${extractedData.mood || 'None mentioned'}
- Time Context: ${extractedData.timeContext?.reference || 'None mentioned'}
- Emotional Context: ${emotionalContext.category} - ${emotionalContext.emotion || 'neutral'}

EMOTIONAL INTELLIGENCE GUIDANCE:
${emotionalSupport ? `- Emotional support pattern: "${emotionalSupport}"` : ''}
- If they're celebrating achievement: Acknowledge their effort and explore what made it special
- If they're struggling: Validate the difficulty and explore their resilience
- If they're in recovery: Support their body's needs and explore their relationship with rest
- If they're stressed: Acknowledge the stress and explore how movement helps or doesn't help
- If they're neutral: Gently explore what's on their mind or what they're working through

PREMIUM COACHING APPROACH:
- Reference their specific patterns and progress naturally
- Acknowledge their consistency and growth over time
- Provide insights based on their historical data
- Help them understand their patterns and trends
- Offer personalized suggestions based on their journey
- Balance celebration of wins with realistic assessment
- Encourage self-reflection on their progress and goals

CONVERSATION FLOW:
1. Acknowledge their current state with warmth and empathy
2. Reference their patterns or progress when relevant
3. Ask one thoughtful question that encourages deeper reflection
4. Keep the tone conversational and supportive`;

  if (stretchRecommendation) {
    prompt += `\n- If soreness is mentioned, suggest: "${stretchRecommendation}"`;
  }

  // Add time-specific guidance
  if (extractedData.timeContext) {
    switch (extractedData.timeContext.type) {
      case 'immediate':
        prompt += `\n- This is immediate soreness - focus on acute relief and recovery`;
        break;
      case 'ongoing':
        prompt += `\n- This appears to be persistent soreness - consider recovery patterns and prevention`;
        break;
      case 'recent':
        prompt += `\n- This is recent soreness - balance recovery with continued training`;
        break;
    }
  }

  // Add emotional state specific guidance
  if (emotionalContext.category === 'positive') {
    prompt += `\n- They're feeling positive - build on this momentum and explore what's working`;
  } else if (emotionalContext.category === 'negative') {
    prompt += `\n- They're experiencing negative emotions - provide extra validation and gentle support`;
  } else if (emotionalContext.category === 'recovery') {
    prompt += `\n- They're in recovery mode - emphasize the importance of rest and self-care`;
  }

  prompt += `\n\nRESPONSE TYPE: ${message.toLowerCase().includes('suggest') || message.toLowerCase().includes('help') || message.toLowerCase().includes('advice') || message.toLowerCase().includes('what should') || message.toLowerCase().includes('how to') ? 'Provide direct, actionable advice as their coach.' : 'Respond as their supportive coach with personalized insights and questions.'}`;

  prompt += `\n\nRESPONSE FORMAT: Start with a warm acknowledgment, reference their patterns if relevant, then ask one thoughtful question that encourages deeper reflection. Keep it personal and conversational.`;

  return prompt;
};

/**
 * Build enhanced user context with conversation history
 */
const buildConversationUserContext = (user, pastEntries = [], conversationContext = []) => {
  let context = `USER CONTEXT:
- Name: ${user?.name || 'User'}
- Email: ${user?.email || 'Not provided'}
- Goals: ${user?.goals ? user.goals.join(', ') : 'Not specified'}
- Activity Level: ${user?.activityLevel || 'Not specified'}

`;

  // Add past entries context
  if (pastEntries && pastEntries.length > 0) {
    context += `RECENT JOURNAL ENTRIES (last 5):
${pastEntries.map(entry => `- ${entry.date}: "${entry.input}" → "${entry.question}"`).join('\n')}

`;
  }

  // Add conversation context summary
  if (conversationContext && conversationContext.length > 0) {
    const userMessages = conversationContext.filter(msg => msg.role === 'user');
    const aiMessages = conversationContext.filter(msg => msg.role === 'assistant');
    
    context += `CONVERSATION SUMMARY:
- Total messages in this conversation: ${conversationContext.length}
- User messages: ${userMessages.length}
- AI responses: ${aiMessages.length}
- Recent topics discussed: ${extractTopicsFromConversation(conversationContext).join(', ')}

`;
  }

  return context;
};

/**
 * Analyze conversation context for enhanced AI responses
 */
const analyzeConversationContext = (conversationContext) => {
  const analysis = {
    emotionalState: 'neutral',
    engagementLevel: 'medium',
    depth: 'shallow',
    topics: [],
    sentiment: 0
  };

  if (!conversationContext || conversationContext.length === 0) {
    return analysis;
  }

  // Analyze emotional state from recent messages
  const recentMessages = conversationContext.slice(-5);
  let positiveCount = 0;
  let negativeCount = 0;
  let totalSentiment = 0;

  recentMessages.forEach(msg => {
    if (msg.role === 'user') {
      const sentiment = analyzeMessageSentiment(msg.content);
      totalSentiment += sentiment;
      
      if (sentiment > 0.2) positiveCount++;
      else if (sentiment < -0.2) negativeCount++;
    }
  });

  // Determine emotional state
  if (positiveCount > negativeCount) {
    analysis.emotionalState = 'positive';
  } else if (negativeCount > positiveCount) {
    analysis.emotionalState = 'negative';
  }

  // Calculate engagement level
  const avgMessageLength = recentMessages
    .filter(msg => msg.role === 'user')
    .reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / 
    Math.max(recentMessages.filter(msg => msg.role === 'user').length, 1);

  if (avgMessageLength > 100) analysis.engagementLevel = 'high';
  else if (avgMessageLength > 50) analysis.engagementLevel = 'medium';
  else analysis.engagementLevel = 'low';

  // Determine conversation depth
  if (conversationContext.length > 20) analysis.depth = 'deep';
  else if (conversationContext.length > 10) analysis.depth = 'medium';
  else analysis.depth = 'shallow';

  // Extract topics
  analysis.topics = extractTopicsFromConversation(conversationContext);
  analysis.sentiment = totalSentiment / recentMessages.length;

  return analysis;
};

/**
 * Analyze message sentiment for emotional context
 */
const analyzeMessageSentiment = (message) => {
  if (!message) return 0;

  const text = message.toLowerCase();
  let sentiment = 0;

  // Positive keywords
  const positiveWords = [
    'happy', 'excited', 'grateful', 'proud', 'motivated', 'confident', 
    'amazing', 'incredible', 'fantastic', 'wonderful', 'great', 'love',
    'joy', 'peaceful', 'content', 'satisfied', 'achieved', 'success'
  ];

  // Negative keywords
  const negativeWords = [
    'sad', 'angry', 'frustrated', 'anxious', 'worried', 'stressed',
    'overwhelmed', 'exhausted', 'burnout', 'terrible', 'awful', 'hate',
    'depressed', 'hopeless', 'desperate', 'tired', 'bored', 'disappointed'
  ];

  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      sentiment += matches.length * 0.3;
    }
  });

  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      sentiment -= matches.length * 0.3;
    }
  });

  // Clamp sentiment to [-1, 1]
  return Math.max(-1, Math.min(1, sentiment));
};

/**
 * Build enhanced context with long-term memory patterns
 */
const buildEnhancedContextWithMemory = (user, pastEntries = [], conversationContext = [], memoryInsights = null) => {
  let context = buildConversationUserContext(user || null, pastEntries, conversationContext);

  // Add memory insights if available
  if (memoryInsights) {
    context += `LONG-TERM MEMORY INSIGHTS:
`;

    // Add conversation patterns
    if (memoryInsights.conversationPatterns) {
      const patterns = memoryInsights.conversationPatterns;
      context += `- Total conversations: ${patterns.totalConversations}
- Average messages per conversation: ${patterns.averageMessagesPerConversation}
- Most active time: ${patterns.mostActiveTime || 'Not available'}
- Conversation duration distribution: ${patterns.conversationDuration.short} short, ${patterns.conversationDuration.medium} medium, ${patterns.conversationDuration.long} long

`;
    }

    // Add emotional trends
    if (memoryInsights.emotionalTrends) {
      const trends = memoryInsights.emotionalTrends;
      context += `- Overall emotional trend: ${trends.overallSentiment}
- Emotional stability: ${Math.round(trends.emotionalStability * 100)}%
- Emotional triggers: ${trends.emotionalTriggers.join(', ') || 'None identified'}

`;
    }

    // Add topic evolution
    if (memoryInsights.topicEvolution) {
      const evolution = memoryInsights.topicEvolution;
      context += `- Primary topics: ${evolution.primaryTopics.join(', ')}
- Emerging topics: ${evolution.emergingTopics.join(', ') || 'None'}
- Declining topics: ${evolution.decliningTopics.join(', ') || 'None'}

`;
    }

    // Add engagement metrics
    if (memoryInsights.engagementMetrics) {
      const metrics = memoryInsights.engagementMetrics;
      context += `- Engagement score: ${metrics.engagementScore}/100
- Average message length: ${metrics.averageMessageLength} characters
- Peak engagement times: ${metrics.peakEngagementTimes.join(', ')}

`;
    }

    // Add long-term patterns
    if (memoryInsights.longTermPatterns) {
      const patterns = memoryInsights.longTermPatterns;
      context += `- Recurring themes: ${patterns.recurringThemes.join(', ') || 'None'}
- Recent achievements: ${patterns.achievementPatterns.length > 0 ? patterns.achievementPatterns.slice(-3).map(a => a.achievement).join(', ') : 'None'}
- Stress patterns: ${patterns.stressPatterns.length > 0 ? `${patterns.stressPatterns.length} stress indicators identified` : 'No stress patterns'}

`;
    }
  }

  return context;
};

/**
 * Build context with conversation memory for AI responses
 */
const buildConversationMemoryContext = (conversationContext, memoryInsights = null) => {
  let context = '';

  if (conversationContext && conversationContext.length > 0) {
    // Analyze current conversation
    const analysis = analyzeConversationContext(conversationContext);
    
    context += `CURRENT CONVERSATION ANALYSIS:
- Emotional state: ${analysis.emotionalState}
- Engagement level: ${analysis.engagementLevel}
- Conversation depth: ${analysis.depth}
- Recent sentiment: ${analysis.sentiment > 0.2 ? 'positive' : analysis.sentiment < -0.2 ? 'negative' : 'neutral'}
- Topics discussed: ${analysis.topics.join(', ')}

`;

    // Add memory insights for context
    if (memoryInsights) {
      context += `MEMORY CONTEXT:
`;

      // Reference recurring themes if relevant
      if (memoryInsights.longTermPatterns?.recurringThemes) {
        const relevantThemes = memoryInsights.longTermPatterns.recurringThemes
          .filter(theme => analysis.topics.some(topic => 
            theme.toLowerCase().includes(topic.toLowerCase()) || 
            topic.toLowerCase().includes(theme.toLowerCase())
          ));
        
        if (relevantThemes.length > 0) {
          context += `- This conversation touches on recurring themes: ${relevantThemes.join(', ')}
`;
        }
      }

      // Reference emotional patterns
      if (memoryInsights.emotionalTrends?.emotionalTriggers) {
        const currentTopics = analysis.topics.join(' ').toLowerCase();
        const relevantTriggers = memoryInsights.emotionalTrends.emotionalTriggers
          .filter(trigger => currentTopics.includes(trigger.toLowerCase()));
        
        if (relevantTriggers.length > 0) {
          context += `- Emotional triggers identified: ${relevantTriggers.join(', ')}
`;
        }
      }

      // Reference engagement patterns
      if (memoryInsights.engagementMetrics?.peakEngagementTimes) {
        const currentHour = new Date().getHours();
        const peakTimes = memoryInsights.engagementMetrics.peakEngagementTimes
          .map(time => parseInt(time.split(':')[0]));
        
        if (peakTimes.includes(currentHour)) {
          context += `- User is typically most engaged at this time
`;
        }
      }
    }
  }

  return context;
};

/**
 * Extract topics from conversation context
 */
const extractTopicsFromConversation = (conversationContext) => {
  const topics = new Set();
  
  conversationContext.forEach(msg => {
    const content = msg.content || msg.text || '';
    const contentLower = content.toLowerCase();
    
    // Define topic keywords
    const topicKeywords = {
      'work': ['work', 'job', 'career', 'office', 'meeting', 'project'],
      'fitness': ['workout', 'exercise', 'gym', 'run', 'train', 'fitness'],
      'stress': ['stress', 'anxiety', 'worried', 'overwhelmed', 'pressure'],
      'relationships': ['friend', 'family', 'partner', 'relationship', 'social'],
      'health': ['health', 'sick', 'pain', 'doctor', 'medical'],
      'goals': ['goal', 'target', 'achieve', 'success', 'progress'],
      'mood': ['happy', 'sad', 'angry', 'excited', 'depressed', 'joy'],
      'sleep': ['sleep', 'tired', 'rest', 'insomnia', 'bedtime'],
      'meditation': ['meditation', 'mindfulness', 'zen', 'breath', 'calm']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        topics.add(topic);
      }
    });
  });

  return Array.from(topics);
};

module.exports = {
  extractStructuredData,
  extractEmotionalContext,
  getStretchRecommendation,
  buildContext,
  buildEnhancedPrompt,
  buildEnhancedUserContext,
  buildConversationUserContext,
  buildBasicContext,
  buildPremiumEnhancedPrompt,
  analyzeReflectionThemes,
  extractTimeContext,
  EXERCISE_PATTERNS,
  DIFFICULTY_PATTERNS,
  SORENESS_AREAS,
  MOOD_PATTERNS,
  TIME_PATTERNS,
  STRETCH_RECOMMENDATIONS,
  EMOTIONAL_SUPPORT_PATTERNS,
  getCachedContext,
  extractTopicsFromConversation,
  buildEnhancedContextWithMemory,
  buildConversationMemoryContext,
  analyzeConversationContext,
  analyzeMessageSentiment
}; 