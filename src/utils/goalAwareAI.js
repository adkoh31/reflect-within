/**
 * Goal-Aware AI System for ReflectWithin
 * Integrates user goals with AI responses for personalized, goal-oriented interactions
 */

import { analyzeSentiment, extractTopics } from './advancedAnalytics';

/**
 * Goal-aware response patterns
 */
const GOAL_AWARE_RESPONSES = {
  // Goal progress recognition
  goal_progress: {
    weight_loss: [
      "I can see you're making progress toward your weight goal! Your consistency is really paying off. How are you feeling about your journey so far?",
      "You're moving closer to your weight target every day. What strategies are working best for you?",
      "Your dedication to your weight goal is inspiring. What's the most rewarding part of this journey?"
    ],
    workout_consistency: [
      "You're building such a strong workout routine! Your consistency is creating real change. How do you feel about your progress?",
      "I love seeing your workout dedication. What's driving your motivation to stick with it?",
      "Your workout consistency is impressive! What have you learned about yourself through this process?"
    ],
    sleep_improvement: [
      "Your sleep improvements are really showing! Better rest makes such a difference. How are you feeling with more sleep?",
      "I can see your sleep quality getting better. What changes have made the biggest impact?",
      "Your sleep goal progress is fantastic! What's the most noticeable benefit you're experiencing?"
    ],
    mood_enhancement: [
      "Your mood improvements are really shining through! What's contributing to this positive shift?",
      "I can see your mood goal progress in your reflections. What practices are helping you feel better?",
      "Your emotional well-being is really growing. What's the most valuable lesson you've learned?"
    ],
    stress_reduction: [
      "Your stress management is really working! I can see the difference in your reflections. What's helping you stay calm?",
      "You're making great progress with stress reduction. What techniques are most effective for you?",
      "Your stress goal progress is impressive! How has this affected other areas of your life?"
    ]
  },

  // Goal milestone celebrations
  goal_milestones: {
    achieved: [
      "🎉 Congratulations! You've reached a major milestone in your {goal} journey! This is a huge achievement. How does it feel to see this progress?",
      "🌟 Amazing work! You've hit your {goal} milestone. Your dedication is really paying off. What's the most rewarding part of this success?",
      "🏆 You did it! Milestone reached for your {goal}. This shows what you're capable of. What's next on your journey?"
    ],
    approaching: [
      "You're so close to your {goal} milestone! Just a little more progress and you'll be there. How are you feeling about this achievement?",
      "Almost there! Your {goal} milestone is within reach. What's keeping you motivated to push through?",
      "You're on the verge of a big win with your {goal}! How are you preparing to celebrate this milestone?"
    ],
    setback: [
      "I know setbacks can be frustrating, especially when you're working toward your {goal}. Remember, progress isn't always linear. What can you learn from this experience?",
      "Setbacks are part of every journey, including your {goal} progress. You're still moving forward, even if it doesn't feel like it. What's one small step you can take today?",
      "It's okay to feel disappointed about your {goal} setback. You're human, and challenges are normal. What would be most helpful for you right now?"
    ]
  },

  // Goal-specific encouragement
  goal_encouragement: {
    consistency: [
      "Your consistency with your {goal} is really building momentum. Every day you show up, you're getting stronger. What's driving your commitment?",
      "I can see your dedication to your {goal} in your daily reflections. This kind of consistency creates real change. How are you feeling about your progress?",
      "Your {goal} consistency is inspiring! You're proving to yourself what you're capable of. What's the most rewarding part of staying committed?"
    ],
    motivation: [
      "Your {goal} motivation is really shining through! What's keeping you connected to your why?",
      "I love seeing your passion for your {goal}. Your energy is contagious! What's driving your determination?",
      "Your {goal} motivation is impressive! You're showing real commitment to your vision. What's the most exciting part of this journey?"
    ],
    challenges: [
      "I know working toward your {goal} can be challenging. You're not alone in this. What support do you need right now?",
      "Challenges with your {goal} are opportunities to grow stronger. What are you learning about yourself through this difficulty?",
      "Every challenge with your {goal} is making you more resilient. How are you adapting and growing through this?"
    ]
  },

  // Goal-aligned suggestions
  goal_suggestions: {
    weight: [
      "Given your weight goal, how are you feeling about your nutrition choices today?",
      "Your weight journey is unique to you. What's one thing you could do today to support your progress?",
      "How does your current energy level align with your weight goal?",
      "What's one small change you could make today to move closer to your weight target?"
    ],
    workouts: [
      "Your workout goal is really taking shape! What type of exercise are you most excited about today?",
      "How are you feeling about your workout consistency this week?",
      "What's one thing that would make your next workout more enjoyable?",
      "Your fitness journey is inspiring! What's your biggest workout win this week?"
    ],
    sleep: [
      "Your sleep goal is so important for overall health. How are you feeling about your sleep quality?",
      "What's one thing you could do tonight to support your sleep goal?",
      "How has your improved sleep affected your daily energy?",
      "Your sleep improvements are really showing! What's working best for you?"
    ],
    mood: [
      "Your mood goal is really taking shape! What's contributing to your emotional well-being today?",
      "How are you feeling about your mood progress this week?",
      "What's one thing that always helps boost your mood?",
      "Your emotional growth is inspiring! What's the most positive change you've noticed?"
    ],
    stress: [
      "Your stress management goal is really working! What techniques are helping you stay calm?",
      "How are you feeling about your stress levels today?",
      "What's one thing you could do to reduce stress right now?",
      "Your stress reduction progress is impressive! What's the most effective strategy for you?"
    ]
  }
};

/**
 * Analyze user goals and their progress
 */
export const analyzeGoalProgress = (userData, currentMessage) => {
  if (!userData?.metricGoals) {
    return { hasGoals: false, goals: [], progress: null };
  }

  const goals = [];
  const progress = {
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    approachingMilestones: [],
    recentProgress: []
  };

  Object.entries(userData.metricGoals).forEach(([metricId, goalData]) => {
    if (!goalData.hasGoal) return;

    const currentValue = userData.metricValues?.[metricId];
    const goal = {
      id: metricId,
      target: goalData.target,
      current: currentValue || 0,
      timeline: goalData.timeline,
      description: goalData.description,
      progress: calculateGoalProgress(currentValue, goalData.target, metricId),
      status: determineGoalStatus(currentValue, goalData.target, metricId),
      category: getGoalCategory(metricId)
    };

    goals.push(goal);
    progress.totalGoals++;

    if (goal.status === 'active') {
      progress.activeGoals++;
    } else if (goal.status === 'completed') {
      progress.completedGoals++;
    }

    // Check for approaching milestones
    if (goal.progress >= 80 && goal.progress < 100) {
      progress.approachingMilestones.push(goal);
    }

    // Check for recent progress (if we have historical data)
    if (goal.progress > 0) {
      progress.recentProgress.push(goal);
    }
  });

  return {
    hasGoals: goals.length > 0,
    goals,
    progress
  };
};

/**
 * Generate goal-aware AI response
 */
export const generateGoalAwareResponse = (userMessage, userData, conversationContext = []) => {
  const goalAnalysis = analyzeGoalProgress(userData, userMessage);
  const messageSentiment = analyzeSentiment(userMessage);
  const messageTopics = extractTopics(userMessage);

  // If no goals, return standard response
  if (!goalAnalysis.hasGoals) {
    return {
      response: generateStandardResponse(userMessage, messageSentiment),
      suggestions: generateStandardSuggestions(messageTopics),
      goalContext: null
    };
  }

  // Analyze goal-related content in message
  const goalMentions = detectGoalMentions(userMessage, goalAnalysis.goals);
  const goalProgress = detectGoalProgress(userMessage, goalAnalysis.goals);
  const goalChallenges = detectGoalChallenges(userMessage, goalAnalysis.goals);

  // Generate goal-aware response
  const response = buildGoalAwareResponse(
    userMessage,
    goalAnalysis,
    goalMentions,
    goalProgress,
    goalChallenges,
    messageSentiment
  );

  // Generate goal-specific suggestions
  const suggestions = generateGoalSpecificSuggestions(goalAnalysis, messageTopics);

  // Generate goal progress follow-ups
  const followUps = generateGoalFollowUps(goalAnalysis, goalMentions);

  return {
    response,
    suggestions,
    followUps,
    goalContext: {
      activeGoals: goalAnalysis.goals.filter(g => g.status === 'active'),
      approachingMilestones: goalAnalysis.progress.approachingMilestones,
      recentProgress: goalAnalysis.progress.recentProgress,
      goalMentions,
      goalProgress,
      goalChallenges
    }
  };
};

/**
 * Detect if user is mentioning their goals
 */
const detectGoalMentions = (message, goals) => {
  const mentions = [];
  const messageLower = message.toLowerCase();

  goals.forEach(goal => {
    const goalKeywords = getGoalKeywords(goal.category, goal.id);
    const isMentioned = goalKeywords.some(keyword => 
      messageLower.includes(keyword)
    );

    if (isMentioned) {
      mentions.push({
        goalId: goal.id,
        category: goal.category,
        keywords: goalKeywords.filter(keyword => messageLower.includes(keyword))
      });
    }
  });

  return mentions;
};

/**
 * Detect goal progress in message
 */
const detectGoalProgress = (message, goals) => {
  const progress = [];
  const messageLower = message.toLowerCase();

  const progressKeywords = [
    'progress', 'improved', 'better', 'achieved', 'reached', 'hit', 'met',
    'success', 'win', 'accomplished', 'gained', 'lost', 'increased', 'decreased'
  ];

  const hasProgressKeywords = progressKeywords.some(keyword => 
    messageLower.includes(keyword)
  );

  if (hasProgressKeywords) {
    goals.forEach(goal => {
      const goalKeywords = getGoalKeywords(goal.category, goal.id);
      const mentionsGoal = goalKeywords.some(keyword => 
        messageLower.includes(keyword)
      );

      if (mentionsGoal) {
        progress.push({
          goalId: goal.id,
          category: goal.category,
          sentiment: analyzeSentiment(message),
          keywords: progressKeywords.filter(keyword => messageLower.includes(keyword))
        });
      }
    });
  }

  return progress;
};

/**
 * Detect goal challenges in message
 */
const detectGoalChallenges = (message, goals) => {
  const challenges = [];
  const messageLower = message.toLowerCase();

  const challengeKeywords = [
    'struggling', 'difficult', 'hard', 'challenging', 'stuck', 'plateau',
    'frustrated', 'disappointed', 'setback', 'regress', 'lost motivation'
  ];

  const hasChallengeKeywords = challengeKeywords.some(keyword => 
    messageLower.includes(keyword)
  );

  if (hasChallengeKeywords) {
    goals.forEach(goal => {
      const goalKeywords = getGoalKeywords(goal.category, goal.id);
      const mentionsGoal = goalKeywords.some(keyword => 
        messageLower.includes(keyword)
      );

      if (mentionsGoal) {
        challenges.push({
          goalId: goal.id,
          category: goal.category,
          sentiment: analyzeSentiment(message),
          keywords: challengeKeywords.filter(keyword => messageLower.includes(keyword))
        });
      }
    });
  }

  return challenges;
};

/**
 * Build goal-aware response
 */
const buildGoalAwareResponse = (userMessage, goalAnalysis, goalMentions, goalProgress, goalChallenges, sentiment) => {
  // If user mentions specific goals
  if (goalMentions.length > 0) {
    const mentionedGoal = goalMentions[0];
    const goal = goalAnalysis.goals.find(g => g.id === mentionedGoal.goalId);
    
    if (goalProgress.length > 0) {
      // Celebrate progress
      return getGoalProgressResponse(goal, sentiment);
    } else if (goalChallenges.length > 0) {
      // Support through challenges
      return getGoalChallengeResponse(goal, sentiment);
    } else {
      // General goal discussion
      return getGoalDiscussionResponse(goal, userMessage);
    }
  }

  // If approaching milestones
  if (goalAnalysis.progress.approachingMilestones.length > 0) {
    const milestone = goalAnalysis.progress.approachingMilestones[0];
    return getMilestoneResponse(milestone);
  }

  // If recent progress
  if (goalAnalysis.progress.recentProgress.length > 0) {
    const recentGoal = goalAnalysis.progress.recentProgress[0];
    return getRecentProgressResponse(recentGoal);
  }

  // Default goal-aware response
  return getDefaultGoalResponse(goalAnalysis);
};

/**
 * Generate goal-specific suggestions
 */
const generateGoalSpecificSuggestions = (goalAnalysis, messageTopics) => {
  const suggestions = [];

  goalAnalysis.goals.forEach(goal => {
    if (goal.status === 'active') {
      const goalSuggestions = GOAL_AWARE_RESPONSES.goal_suggestions[goal.category] || [];
      if (goalSuggestions.length > 0) {
        suggestions.push(goalSuggestions[Math.floor(Math.random() * goalSuggestions.length)]);
      }
    }
  });

  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

/**
 * Generate goal follow-up questions
 */
const generateGoalFollowUps = (goalAnalysis, goalMentions) => {
  const followUps = [];

  if (goalMentions.length > 0) {
    const mentionedGoal = goalMentions[0];
    const goal = goalAnalysis.goals.find(g => g.id === mentionedGoal.goalId);
    
    followUps.push(
      `How are you feeling about your ${goal.description} progress?`,
      `What's the biggest challenge with your ${goal.description} right now?`,
      `What would help you stay motivated with your ${goal.description}?`
    );
  } else {
    // General goal follow-ups
    followUps.push(
      "How are your goals going this week?",
      "What's one goal you'd like to focus on today?",
      "What's the most challenging part of working toward your goals?"
    );
  }

  return followUps;
};

// Helper functions
const calculateGoalProgress = (current, target, metricId) => {
  if (!current || !target) return 0;
  
  // For weight loss (lower is better)
  if (metricId === 'weight' && target < current) {
    const totalToLose = current - target;
    const lost = current - target;
    return Math.min((lost / totalToLose) * 100, 100);
  }
  
  // For other metrics (higher is better)
  return Math.min((current / target) * 100, 100);
};

const determineGoalStatus = (current, target, metricId) => {
  const progress = calculateGoalProgress(current, target, metricId);
  
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'active';
  return 'not_started';
};

const getGoalCategory = (metricId) => {
  const categories = {
    weight: 'weight',
    workouts: 'workouts',
    sleep: 'sleep',
    mood: 'mood',
    stress: 'stress',
    energy: 'mood',
    meditation: 'mood'
  };
  return categories[metricId] || 'general';
};

const getGoalKeywords = (category, metricId) => {
  const keywords = {
    weight: ['weight', 'pounds', 'lbs', 'lose', 'gain', 'maintain'],
    workouts: ['workout', 'exercise', 'gym', 'training', 'fitness'],
    sleep: ['sleep', 'rest', 'bed', 'tired', 'energy'],
    mood: ['mood', 'feel', 'happy', 'sad', 'emotion'],
    stress: ['stress', 'anxiety', 'overwhelmed', 'calm', 'relax']
  };
  return keywords[category] || [];
};

// Response generators
const getGoalProgressResponse = (goal, sentiment) => {
  const responses = GOAL_AWARE_RESPONSES.goal_progress[goal.category] || 
                   GOAL_AWARE_RESPONSES.goal_progress.weight_loss;
  return responses[Math.floor(Math.random() * responses.length)];
};

const getGoalChallengeResponse = (goal, sentiment) => {
  const responses = GOAL_AWARE_RESPONSES.goal_encouragement.challenges;
  return responses[Math.floor(Math.random() * responses.length)]
    .replace('{goal}', goal.description);
};

const getGoalDiscussionResponse = (goal, userMessage) => {
  return `I can see you're thinking about your ${goal.description}. How are you feeling about your progress toward this goal?`;
};

const getMilestoneResponse = (goal) => {
  const responses = GOAL_AWARE_RESPONSES.goal_milestones.approaching;
  return responses[Math.floor(Math.random() * responses.length)]
    .replace('{goal}', goal.description);
};

const getRecentProgressResponse = (goal) => {
  return `I can see your ${goal.description} progress is really taking shape! What's driving your momentum?`;
};

const getDefaultGoalResponse = (goalAnalysis) => {
  return `I can see you're working toward ${goalAnalysis.goals.length} goal${goalAnalysis.goals.length > 1 ? 's' : ''}. How are you feeling about your progress today?`;
};

const generateStandardResponse = (message, sentiment) => {
  return "I'm here to support you. What would you like to explore today?";
};

const generateStandardSuggestions = (topics) => {
  return [
    "How are you feeling right now?",
    "What's on your mind today?",
    "What would you like to reflect on?"
  ];
}; 