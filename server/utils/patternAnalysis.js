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
  ]
};

// Difficulty patterns
const DIFFICULTY_PATTERNS = [
  'tough', 'challenging', 'intense', 'solid', 'great', 'amazing', 'okay', 'grueling', 'exhausting'
];

// Soreness areas
const SORENESS_AREAS = [
  'quads?', 'shoulders?', 'legs?', 'core', 'calves?', 'wrists?', 'hamstrings?', 'hips?', 'lower back'
];

// Mood patterns
const MOOD_PATTERNS = ['Tired', 'Energized', 'Grateful', 'Neutral', 'Stressed'];

// Time patterns for recovery context
const TIME_PATTERNS = {
  immediate: ['today', 'just', 'now', 'this morning', 'this afternoon', 'this evening'],
  recent: ['yesterday', 'last night', 'this week', 'recently'],
  past: ['last week', 'a few days ago', 'earlier this week', 'the other day'],
  ongoing: ['still', 'continuing', 'persistent', 'recurring', 'chronic']
};

// Stretch recommendations based on training data
const STRETCH_RECOMMENDATIONS = {
  'quads': [
    'Quad Stretch: hold your foot behind for 30 seconds per side',
    'Couch Stretch: shin against a wall for 1-2 min per side'
  ],
  'shoulders': [
    'Thread-the-Needle: thread one arm under for 30 seconds per side',
    'Eagle Arm stretch: cross your arms for 30 seconds'
  ],
  'hamstrings': [
    'Downward Dog: hold for 1 min',
    'Forward Fold: hang loose for 1 min'
  ],
  'core': [
    'Cat-Cow stretch: flow for 1 min'
  ],
  'hips': [
    'Figure-Four stretch: hold for 1 min per side',
    'Pigeon Pose: hold for 1 min per side'
  ],
  'lower back': [
    'Child\'s Pose: sink back for 1 min',
    'Supine Twist: hold for 1 min per side'
  ],
  'wrists': [
    'Wrist Stretch: pull your fingers back gently for 30 seconds per side'
  ],
  'calves': [
    'Forward Fold: hang loose for 1 min'
  ],
  'legs': [
    'Forward Fold: hang loose for 1 min'
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
  if (moodMatch && MOOD_PATTERNS.includes(moodMatch[1])) {
    mood = moodMatch[1];
  }
  
  // Extract journal details
  let journalDetails = null;
  const journalMatch = message.match(/Journal:\s*Workouts,\s*(CrossFit|Yoga),\s*(.+?)(?=\s*$|\.)/);
  if (journalMatch) {
    journalDetails = {
      type: journalMatch[1],
      details: journalMatch[2]
    };
  }
  
  // If no exercise found in main message, check journal details
  if (!exercise && journalDetails) {
    for (const [type, exercises] of Object.entries(EXERCISE_PATTERNS)) {
      for (const exercisePattern of exercises) {
        const regex = new RegExp(`\\b${exercisePattern}\\b`, 'i');
        if (regex.test(journalDetails.details)) {
          exercise = journalDetails.details.match(regex)[0];
          exerciseType = type;
          break;
        }
      }
      if (exercise) break;
    }
  }
  
  // Extract difficulty
  let difficulty = null;
  for (const diff of DIFFICULTY_PATTERNS) {
    const regex = new RegExp(`(were|was|felt)\\s+${diff}`, 'i');
    if (regex.test(message)) {
      difficulty = diff;
      break;
    }
  }
  
  // Extract soreness
  let soreness = null;
  for (const area of SORENESS_AREAS) {
    // Check for "X sore" pattern
    const sorePattern = new RegExp(`\\b${area}\\s+sore`, 'i');
    if (sorePattern.test(message)) {
      soreness = message.match(sorePattern)[0].replace(' sore', '');
      break;
    }
    
    // Also check for "sore X" pattern
    const sorePattern2 = new RegExp(`sore\\s+${area}`, 'i');
    if (sorePattern2.test(message)) {
      soreness = area;
      break;
    }
  }
  
  // Extract time context
  const timeContext = extractTimeContext(message);
  
  return {
    exercise,
    exerciseType,
    difficulty,
    soreness,
    mood,
    journalDetails,
    timeContext,
    hasStructuredFormat: !!(mood && journalDetails)
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
  let prompt = `You are ReflectWithin, a conversational AI companion for fitness and wellness.

Current user input: "${message}"

Extracted data:
- Exercise: ${extractedData.exercise || 'None mentioned'}
- Difficulty: ${extractedData.difficulty || 'None mentioned'}
- Soreness: ${extractedData.soreness || 'None mentioned'}
- Mood: ${extractedData.mood || 'None mentioned'}
- Time Context: ${extractedData.timeContext?.reference || 'None mentioned'}

User context: ${context}

IMPORTANT: 
- Respond with ONLY a single, thoughtful question
- Keep it conversational and supportive
- Reference past workouts if relevant
- Match the tone to their mood
- Consider recovery time: immediate soreness vs. persistent soreness`;

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

  prompt += `\n\nExample response pattern: "[Exercise] at [weight]? That's [difficulty]! Sore [body part]? Try [specific stretch]. What made it so [difficulty]?"`;

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
  let prompt = `You are ReflectWithin, an AI coach with deep knowledge of this user's fitness journey and personal patterns.

Current user input: "${message}"

Comprehensive user context: ${context}

Extracted data:
- Exercise: ${extractedData.exercise || 'None mentioned'}
- Difficulty: ${extractedData.difficulty || 'None mentioned'}
- Soreness: ${extractedData.soreness || 'None mentioned'}
- Mood: ${extractedData.mood || 'None mentioned'}
- Time Context: ${extractedData.timeContext?.reference || 'None mentioned'}

COACH MODE INSTRUCTIONS:
- You have access to their complete workout history, mood patterns, and reflection themes
- Reference specific patterns from their history (e.g., "You've been doing a lot of ${exercise} lately")
- Acknowledge their progress and consistency
- Provide personalized advice based on their recurring patterns
- Show you remember their goals and track their progress
- Be encouraging but realistic about their patterns
- Suggest improvements based on their historical data`;

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

  prompt += `\n\nRESPONSE TYPE: ${message.toLowerCase().includes('suggest') || message.toLowerCase().includes('help') || message.toLowerCase().includes('advice') || message.toLowerCase().includes('what should') || message.toLowerCase().includes('how to') ? 'Provide direct, actionable advice as their coach.' : 'Respond as their supportive coach with personalized insights and questions.'}`;

  return prompt;
};

module.exports = {
  extractStructuredData,
  getStretchRecommendation,
  buildContext,
  buildEnhancedPrompt,
  buildEnhancedUserContext,
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
  getCachedContext
}; 