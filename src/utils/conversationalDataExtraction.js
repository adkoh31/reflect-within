/**
 * Conversational Data Extraction System
 * Hardcoded patterns for natural workout data collection
 */

// Workout type patterns
const WORKOUT_PATTERNS = {
  crossfit: ['crossfit', 'cf', 'wod', 'metcon', 'cross fit'],
  yoga: ['yoga', 'vinyasa', 'hatha', 'yin', 'ashtanga', 'power yoga'],
  strength: ['strength', 'lifting', 'deadlift', 'squat', 'bench', 'press', 'weight training'],
  cardio: ['run', 'bike', 'swim', 'row', 'elliptical', 'cardio', 'jogging'],
  hiit: ['hiit', 'high intensity', 'interval', 'tabata', 'amrap'],
  mobility: ['mobility', 'stretching', 'flexibility', 'recovery', 'foam rolling']
};

// Intensity indicators
const INTENSITY_PATTERNS = {
  high: ['intense', 'brutal', 'hard', 'tough', 'challenging', 'exhausting', 'killer'],
  medium: ['moderate', 'decent', 'okay', 'solid', 'good', 'manageable'],
  low: ['easy', 'light', 'gentle', 'relaxing', 'chill', 'low intensity']
};

// Soreness areas
const SORENESS_AREAS = [
  'shoulders', 'quads', 'hamstrings', 'calves', 'back', 'chest', 'arms', 
  'core', 'glutes', 'hips', 'knees', 'ankles', 'wrists', 'neck'
];

// Energy level indicators
const ENERGY_PATTERNS = {
  high: ['energized', 'pumped', 'motivated', 'strong', 'powerful', 'great energy'],
  medium: ['okay', 'decent', 'fine', 'alright', 'moderate'],
  low: ['tired', 'exhausted', 'drained', 'fatigued', 'low energy', 'worn out']
};

// Mood patterns
const MOOD_PATTERNS = {
  positive: ['great', 'awesome', 'amazing', 'good', 'happy', 'proud', 'excited', 'motivated'],
  neutral: ['okay', 'fine', 'alright', 'neutral', 'calm', 'focused'],
  negative: ['tired', 'frustrated', 'stressed', 'anxious', 'overwhelmed', 'sad']
};

// Contextual question templates
const QUESTION_TEMPLATES = {
  crossfit: [
    "How are you feeling after that?",
    "What was the workout like?",
    "How did it go?",
    "Feeling energized or tired?",
    "What was the most challenging part?",
    "How's your recovery feeling?"
  ],
  yoga: [
    "That sounds relaxing. How's your energy?",
    "What style did you do?",
    "How are you feeling now?",
    "Did it help with your stress?",
    "What was your favorite pose?",
    "How's your mind-body connection?"
  ],
  strength: [
    "Great! What did you work on?",
    "How did the lifts feel?",
    "Any PRs today?",
    "What's your energy like?",
    "How's your recovery feeling?",
    "What's your next goal?"
  ],
  cardio: [
    "How was your cardio session?",
    "What's your energy like?",
    "How did it feel?",
    "What's your recovery plan?",
    "How's your breathing?"
  ],
  recovery: [
    "How are you feeling now?",
    "What's your recovery plan?",
    "How's your sleep been?",
    "What's helping with the soreness?",
    "How's your stress level?"
  ]
};

// Emotional response templates
const EMOTIONAL_RESPONSES = {
  achievement: [
    "That's fantastic! What made it special?",
    "You should be proud of that! How did it feel?",
    "Amazing work! What's your secret?",
    "That's incredible progress! How are you celebrating?",
    "You're crushing it! What's driving this momentum?"
  ],
  struggle: [
    "That sounds challenging. How are you feeling about it?",
    "It's okay to have tough days. What would help?",
    "You're showing real resilience. What's your next step?",
    "Challenges are part of growth. How can I support you?",
    "You're not alone in this. What do you need right now?"
  ],
  tired: [
    "Recovery is just as important as the workout. How are you planning to rest?",
    "That's a good kind of tired! How's your recovery plan?",
    "Your body is telling you something. How can you honor that?",
    "Rest is productive too. How are you taking care of yourself?",
    "That exhaustion means you worked hard. How's your sleep been?"
  ],
  sore: [
    "Soreness can be tricky. How's your sleep been lately?",
    "Your body is adapting. What's your recovery routine?",
    "Soreness is normal, but let's make sure it's manageable. How are you feeling?",
    "Recovery is key. What's helping with the soreness?",
    "Your body is working hard. How are you supporting it?"
  ]
};

/**
 * Extract workout data from user message
 */
export const extractWorkoutData = (message) => {
  const lowerMessage = message.toLowerCase();
  const extracted = {
    workoutType: null,
    intensity: null,
    soreness: [],
    energy: null,
    mood: null,
    hasWorkout: false
  };

  // Extract workout type
  for (const [type, patterns] of Object.entries(WORKOUT_PATTERNS)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      extracted.workoutType = type;
      extracted.hasWorkout = true;
      break;
    }
  }

  // Extract intensity
  for (const [level, patterns] of Object.entries(INTENSITY_PATTERNS)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      extracted.intensity = level;
      break;
    }
  }

  // Extract soreness areas
  SORENESS_AREAS.forEach(area => {
    if (lowerMessage.includes(area) && (lowerMessage.includes('sore') || lowerMessage.includes('hurt') || lowerMessage.includes('pain'))) {
      extracted.soreness.push(area);
    }
  });

  // Extract energy level
  for (const [level, patterns] of Object.entries(ENERGY_PATTERNS)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      extracted.energy = level;
      break;
    }
  }

  // Extract mood
  for (const [mood, patterns] of Object.entries(MOOD_PATTERNS)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      extracted.mood = mood;
      break;
    }
  }

  return extracted;
};

/**
 * Generate contextual question based on extracted data
 */
export const generateContextualQuestion = (extractedData, conversationHistory = []) => {
  const { workoutType, intensity, soreness, energy, mood } = extractedData;
  
  // Get recent questions to avoid repetition
  const recentQuestions = conversationHistory
    .filter(msg => msg.role === 'assistant')
    .slice(-3)
    .map(msg => msg.content);

  let questionPool = [];

  // Select question pool based on context
  if (workoutType && QUESTION_TEMPLATES[workoutType]) {
    questionPool = [...QUESTION_TEMPLATES[workoutType]];
  }

  // Add recovery questions if soreness mentioned
  if (soreness.length > 0) {
    questionPool = [...questionPool, ...QUESTION_TEMPLATES.recovery];
  }

  // Add emotional response if mood detected
  if (mood && EMOTIONAL_RESPONSES[mood]) {
    questionPool = [...questionPool, ...EMOTIONAL_RESPONSES[mood]];
  }

  // Filter out recently asked questions
  const availableQuestions = questionPool.filter(q => 
    !recentQuestions.some(recent => recent.includes(q.split(' ')[0]))
  );

  // Return random question or fallback
  if (availableQuestions.length > 0) {
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  // Fallback questions
  const fallbacks = [
    "How are you feeling after that?",
    "What's your energy like?",
    "How did it go?",
    "What's your recovery plan?"
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

/**
 * Extract additional data from user response
 */
export const extractResponseData = (message, previousData) => {
  const lowerMessage = message.toLowerCase();
  const extracted = { ...previousData };

  // Extract numbers (intensity, energy, sleep hours)
  const numbers = message.match(/\d+/g);
  if (numbers) {
    const num = parseInt(numbers[0]);
    
    // Context-based number interpretation
    if (lowerMessage.includes('intensity') || lowerMessage.includes('level')) {
      extracted.intensity = num;
    } else if (lowerMessage.includes('energy')) {
      extracted.energy = num;
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('hour')) {
      extracted.sleepHours = num;
    } else if (lowerMessage.includes('stress')) {
      extracted.stressLevel = num;
    }
  }

  // Extract sleep information
  if (lowerMessage.includes('sleep')) {
    if (lowerMessage.includes('good') || lowerMessage.includes('great')) {
      extracted.sleepQuality = 'good';
    } else if (lowerMessage.includes('bad') || lowerMessage.includes('poor')) {
      extracted.sleepQuality = 'poor';
    }
  }

  // Extract recovery methods
  const recoveryMethods = ['stretching', 'foam rolling', 'ice', 'heat', 'rest', 'massage'];
  recoveryMethods.forEach(method => {
    if (lowerMessage.includes(method)) {
      if (!extracted.recoveryMethods) extracted.recoveryMethods = [];
      extracted.recoveryMethods.push(method);
    }
  });

  return extracted;
};

/**
 * Generate follow-up question based on user response
 */
export const generateFollowUpQuestion = (userResponse, extractedData, conversationHistory) => {
  const lowerResponse = userResponse.toLowerCase();
  
  // If user mentions being tired, ask about recovery
  if (lowerResponse.includes('tired') || lowerResponse.includes('exhausted')) {
    return "Recovery is just as important as the workout. How are you planning to rest?";
  }

  // If user mentions soreness, ask about sleep
  if (lowerResponse.includes('sore') || lowerResponse.includes('hurt')) {
    return "Soreness can be tricky. How's your sleep been lately?";
  }

  // If user mentions stress, ask about coping
  if (lowerResponse.includes('stress') || lowerResponse.includes('anxious')) {
    return "Stress can really affect recovery. What's helping you manage it?";
  }

  // If user mentions good energy, ask about what's working
  if (lowerResponse.includes('good') || lowerResponse.includes('great') || lowerResponse.includes('energized')) {
    return "That's fantastic energy! What's working well for you right now?";
  }

  // Default follow-up
  return "How are you feeling about your progress?";
};

/**
 * Check if conversation should continue data collection
 */
export const shouldContinueDataCollection = (extractedData, conversationLength) => {
  // Continue if we have basic workout info but missing key data
  if (extractedData.hasWorkout && !extractedData.intensity && conversationLength < 4) {
    return true;
  }

  // Continue if soreness mentioned but no recovery info
  if (extractedData.soreness.length > 0 && !extractedData.recoveryMethods && conversationLength < 5) {
    return true;
  }

  // Continue if tired/exhausted but no sleep info
  if (extractedData.energy === 'low' && !extractedData.sleepHours && conversationLength < 4) {
    return true;
  }

  return false;
};

/**
 * Format extracted data for storage
 */
export const formatExtractedData = (extractedData) => {
  return {
    workout: {
      type: extractedData.workoutType,
      intensity: extractedData.intensity,
      timestamp: new Date().toISOString()
    },
    recovery: {
      soreness: extractedData.soreness,
      methods: extractedData.recoveryMethods || [],
      sleepHours: extractedData.sleepHours,
      sleepQuality: extractedData.sleepQuality
    },
    wellness: {
      energy: extractedData.energy,
      mood: extractedData.mood,
      stressLevel: extractedData.stressLevel
    }
  };
}; 