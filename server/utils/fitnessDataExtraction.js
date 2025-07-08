// Extract fitness goals from user message
const extractFitnessGoals = (message) => {
  const goals = [];
  const lowerMessage = message.toLowerCase();
  
  // Goal patterns
  const goalPatterns = {
    strength: ['strength', 'strong', 'lift', 'heavy', 'power', 'muscle'],
    flexibility: ['flexibility', 'flexible', 'mobility', 'stretch', 'yoga'],
    endurance: ['endurance', 'stamina', 'cardio', 'conditioning', 'aerobic'],
    balance: ['balance', 'stability', 'coordination'],
    weight_loss: ['weight loss', 'lose weight', 'fat loss', 'slim', 'lean', 'lose some weight', 'get leaner'],
    muscle_gain: ['muscle gain', 'build muscle', 'bulk', 'size', 'get bigger'],
    general_fitness: ['fitness', 'healthy', 'in shape', 'fit'],
    recovery: ['recovery', 'recover', 'rest', 'heal'],
    stress_relief: ['stress', 'relax', 'calm', 'mental', 'mind'],
    competition_prep: ['competition', 'compete', 'competition prep', 'rx'],
    injury_prevention: ['injury', 'prevent', 'safe', 'protect'],
    consistency: ['consistent', 'routine', 'habit', 'regular']
  };
  
  // Check each goal pattern
  Object.entries(goalPatterns).forEach(([goal, patterns]) => {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      goals.push(goal);
    }
  });
  
  return goals;
};

// Extract activity level from user message
const extractActivityLevel = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Activity level patterns
  if (lowerMessage.includes('4') || lowerMessage.includes('five') || lowerMessage.includes('5') || 
      lowerMessage.includes('six') || lowerMessage.includes('6') || lowerMessage.includes('daily') ||
      lowerMessage.includes('every day') || lowerMessage.includes('most days')) {
    return '4_plus_times_week';
  }
  
  if (lowerMessage.includes('2') || lowerMessage.includes('3') || lowerMessage.includes('two') || 
      lowerMessage.includes('three') || lowerMessage.includes('couple') || 
      lowerMessage.includes('few times')) {
    return '2_3_times_week';
  }
  
  if (lowerMessage.includes('1') || lowerMessage.includes('once') || lowerMessage.includes('one') ||
      lowerMessage.includes('sometimes') || lowerMessage.includes('occasionally')) {
    return '1_2_times_week';
  }
  
  if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('new') ||
      lowerMessage.includes('just') || lowerMessage.includes('trying')) {
    return 'just_starting';
  }
  
  return null;
};

// Check if this is a fitness profile collection message
const isFitnessProfileCollection = (message, user) => {
  // If user hasn't completed fitness profile, check if this looks like a response to our questions
  if (!user.fitnessProfileCollected) {
    const lowerMessage = message.toLowerCase();
    
    // Check if message contains fitness-related keywords
    const fitnessKeywords = [
      'strength', 'flexibility', 'endurance', 'fitness', 'workout', 'exercise',
      'times', 'week', 'day', 'start', 'begin', 'goal', 'recovery', 'stress'
    ];
    
    return fitnessKeywords.some(keyword => lowerMessage.includes(keyword));
  }
  
  return false;
};

// Determine which fitness question to ask next
const getNextFitnessQuestion = (user) => {
  if (!user.fitnessProfileCollected) {
    if (!user.goals || user.goals.length === 0) {
      return "What are your main fitness goals?";
    }
    if (!user.activityLevel) {
      return "How often do you work out?";
    }
  }
  
  return null; // No more questions needed
};

module.exports = {
  extractFitnessGoals,
  extractActivityLevel,
  isFitnessProfileCollection,
  getNextFitnessQuestion
}; 