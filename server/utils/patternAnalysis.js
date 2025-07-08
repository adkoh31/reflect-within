// Pattern analysis utilities for ReflectWithin personalization

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

module.exports = {
  extractStructuredData,
  getStretchRecommendation,
  buildContext,
  buildEnhancedPrompt,
  extractTimeContext,
  EXERCISE_PATTERNS,
  DIFFICULTY_PATTERNS,
  SORENESS_AREAS,
  MOOD_PATTERNS,
  TIME_PATTERNS,
  STRETCH_RECOMMENDATIONS
}; 