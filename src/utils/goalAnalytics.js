/**
 * Advanced Goal Analytics for ReflectWithin
 * Provides goal correlation analysis, success pattern recognition, and predictive insights
 */

import { analyzeSentiment, extractTopics } from './advancedAnalytics';

/**
 * Analyze goal correlations with mood, energy, and other metrics
 */
export const analyzeGoalCorrelations = (userData, timeRange = '30d') => {
  if (!userData?.metricGoals || !userData?.journalEntries) {
    return { correlations: [], insights: [] };
  }

  const correlations = [];
  const insights = [];

  // Get active goals
  const activeGoals = Object.entries(userData.metricGoals)
    .filter(([_, goal]) => goal.hasGoal)
    .map(([metricId, goal]) => ({
      id: metricId,
      target: goal.target,
      current: userData.metricValues?.[metricId] || 0,
      progress: calculateGoalProgress(userData.metricValues?.[metricId], goal.target, metricId)
    }));

  // Analyze journal entries for correlations
  const recentEntries = getRecentEntries(userData.journalEntries, timeRange);
  
  activeGoals.forEach(goal => {
    const goalCorrelations = analyzeGoalCorrelation(goal, recentEntries, userData);
    correlations.push(goalCorrelations);
    
    // Generate insights from correlations
    const goalInsights = generateGoalInsights(goalCorrelations);
    insights.push(...goalInsights);
  });

  return { correlations, insights };
};

/**
 * Analyze correlation between a specific goal and user data
 */
const analyzeGoalCorrelation = (goal, entries, userData) => {
  const correlation = {
    goalId: goal.id,
    goalProgress: goal.progress,
    correlations: {
      mood: 0,
      energy: 0,
      stress: 0,
      sleep: 0,
      workouts: 0
    },
    patterns: [],
    recommendations: []
  };

  // Analyze mood correlation
  const moodCorrelation = analyzeMoodCorrelation(goal, entries);
  correlation.correlations.mood = moodCorrelation.correlation;
  correlation.patterns.push(...moodCorrelation.patterns);

  // Analyze energy correlation
  const energyCorrelation = analyzeEnergyCorrelation(goal, entries);
  correlation.correlations.energy = energyCorrelation.correlation;
  correlation.patterns.push(...energyCorrelation.patterns);

  // Analyze stress correlation
  const stressCorrelation = analyzeStressCorrelation(goal, entries);
  correlation.correlations.stress = stressCorrelation.correlation;
  correlation.patterns.push(...stressCorrelation.patterns);

  // Generate recommendations based on correlations
  correlation.recommendations = generateCorrelationRecommendations(correlation);

  return correlation;
};

/**
 * Analyze mood correlation with goal progress
 */
const analyzeMoodCorrelation = (goal, entries) => {
  const moodData = entries.map(entry => {
    const sentiment = analyzeSentiment(entry.content || '');
    const goalMentioned = detectGoalMention(entry.content, goal.id);
    return {
      date: new Date(entry.createdAt || entry.date),
      mood: sentiment.score,
      goalMentioned,
      progress: goalMentioned ? goal.progress : null
    };
  }).filter(data => data.goalMentioned);

  if (moodData.length < 3) {
    return { correlation: 0, patterns: [] };
  }

  // Calculate correlation coefficient
  const correlation = calculateCorrelation(
    moodData.map(d => d.mood),
    moodData.map(d => d.progress)
  );

  // Identify patterns
  const patterns = [];
  const avgMoodWithGoal = moodData.reduce((sum, d) => sum + d.mood, 0) / moodData.length;
  
  if (avgMoodWithGoal > 0.3) {
    patterns.push({
      type: 'positive_mood_goal',
      description: `You tend to feel more positive when working toward your ${goal.id} goal`,
      strength: Math.abs(correlation)
    });
  } else if (avgMoodWithGoal < -0.3) {
    patterns.push({
      type: 'negative_mood_goal',
      description: `Your ${goal.id} goal might be causing stress or frustration`,
      strength: Math.abs(correlation)
    });
  }

  return { correlation, patterns };
};

/**
 * Analyze energy correlation with goal progress
 */
const analyzeEnergyCorrelation = (goal, entries) => {
  const energyKeywords = ['energy', 'tired', 'energized', 'exhausted', 'vitality', 'drained'];
  
  const energyData = entries.map(entry => {
    const content = (entry.content || '').toLowerCase();
    const energyMentioned = energyKeywords.some(keyword => content.includes(keyword));
    const goalMentioned = detectGoalMention(entry.content, goal.id);
    
    if (!energyMentioned || !goalMentioned) return null;
    
    const sentiment = analyzeSentiment(entry.content);
    return {
      date: new Date(entry.createdAt || entry.date),
      energy: sentiment.score,
      progress: goal.progress
    };
  }).filter(Boolean);

  if (energyData.length < 2) {
    return { correlation: 0, patterns: [] };
  }

  const correlation = calculateCorrelation(
    energyData.map(d => d.energy),
    energyData.map(d => d.progress)
  );

  const patterns = [];
  const avgEnergy = energyData.reduce((sum, d) => sum + d.energy, 0) / energyData.length;
  
  if (avgEnergy > 0.2) {
    patterns.push({
      type: 'high_energy_goal',
      description: `You feel more energized when working on your ${goal.id} goal`,
      strength: Math.abs(correlation)
    });
  }

  return { correlation, patterns };
};

/**
 * Analyze stress correlation with goal progress
 */
const analyzeStressCorrelation = (goal, entries) => {
  const stressKeywords = ['stress', 'anxiety', 'overwhelmed', 'pressure', 'worried', 'stressed'];
  
  const stressData = entries.map(entry => {
    const content = (entry.content || '').toLowerCase();
    const stressMentioned = stressKeywords.some(keyword => content.includes(keyword));
    const goalMentioned = detectGoalMention(entry.content, goal.id);
    
    if (!stressMentioned || !goalMentioned) return null;
    
    const sentiment = analyzeSentiment(entry.content);
    return {
      date: new Date(entry.createdAt || entry.date),
      stress: -sentiment.score, // Negative sentiment = higher stress
      progress: goal.progress
    };
  }).filter(Boolean);

  if (stressData.length < 2) {
    return { correlation: 0, patterns: [] };
  }

  const correlation = calculateCorrelation(
    stressData.map(d => d.stress),
    stressData.map(d => d.progress)
  );

  const patterns = [];
  const avgStress = stressData.reduce((sum, d) => sum + d.stress, 0) / stressData.length;
  
  if (avgStress > 0.3) {
    patterns.push({
      type: 'stress_goal',
      description: `Your ${goal.id} goal might be causing stress - consider adjusting your approach`,
      strength: Math.abs(correlation)
    });
  }

  return { correlation, patterns };
};

/**
 * Recognize success patterns for goal achievement
 */
export const recognizeSuccessPatterns = (userData, timeRange = '90d') => {
  if (!userData?.metricGoals || !userData?.journalEntries) {
    return { patterns: [], recommendations: [] };
  }

  const patterns = [];
  const recommendations = [];

  // Analyze successful goal completions
  const completedGoals = Object.entries(userData.metricGoals)
    .filter(([_, goal]) => goal.hasGoal)
    .map(([metricId, goal]) => ({
      id: metricId,
      target: goal.target,
      current: userData.metricValues?.[metricId] || 0,
      progress: calculateGoalProgress(userData.metricValues?.[metricId], goal.target, metricId),
      timeline: goal.timeline
    }))
    .filter(goal => goal.progress >= 100);

  completedGoals.forEach(goal => {
    const successPattern = analyzeSuccessPattern(goal, userData, timeRange);
    patterns.push(successPattern);
    
    const successRecommendations = generateSuccessRecommendations(successPattern);
    recommendations.push(...successRecommendations);
  });

  // Analyze patterns across all goals
  const crossGoalPatterns = analyzeCrossGoalPatterns(userData, timeRange);
  patterns.push(...crossGoalPatterns);

  return { patterns, recommendations };
};

/**
 * Analyze success pattern for a specific goal
 */
const analyzeSuccessPattern = (goal, userData, timeRange) => {
  const pattern = {
    goalId: goal.id,
    successFactors: [],
    timeToCompletion: null,
    consistencyScore: 0,
    keyBehaviors: []
  };

  // Analyze journal entries during goal pursuit
  const goalEntries = getGoalEntries(userData.journalEntries, goal.id, timeRange);
  
  // Calculate consistency score
  pattern.consistencyScore = calculateConsistencyScore(goalEntries);
  
  // Identify key behaviors
  pattern.keyBehaviors = identifyKeyBehaviors(goalEntries);
  
  // Identify success factors
  pattern.successFactors = identifySuccessFactors(goal, goalEntries);

  return pattern;
};

/**
 * Generate predictive insights for goal achievement
 */
export const generatePredictiveInsights = (userData, timeRange = '30d') => {
  if (!userData?.metricGoals || !userData?.journalEntries) {
    return { predictions: [], insights: [] };
  }

  const predictions = [];
  const insights = [];

  // Get active goals
  const activeGoals = Object.entries(userData.metricGoals)
    .filter(([_, goal]) => goal.hasGoal)
    .map(([metricId, goal]) => ({
      id: metricId,
      target: goal.target,
      current: userData.metricValues?.[metricId] || 0,
      progress: calculateGoalProgress(userData.metricValues?.[metricId], goal.target, metricId),
      timeline: goal.timeline
    }))
    .filter(goal => goal.progress < 100);

  activeGoals.forEach(goal => {
    const prediction = predictGoalAchievement(goal, userData, timeRange);
    predictions.push(prediction);
    
    const predictionInsights = generatePredictionInsights(prediction);
    insights.push(...predictionInsights);
  });

  return { predictions, insights };
};

/**
 * Predict goal achievement likelihood
 */
const predictGoalAchievement = (goal, userData, timeRange) => {
  const prediction = {
    goalId: goal.id,
    likelihood: 0,
    confidence: 0,
    estimatedCompletion: null,
    riskFactors: [],
    successFactors: []
  };

  // Analyze recent progress rate
  const progressRate = analyzeProgressRate(goal, userData, timeRange);
  
  // Analyze consistency patterns
  const consistency = analyzeConsistencyPatterns(goal, userData, timeRange);
  
  // Analyze external factors
  const externalFactors = analyzeExternalFactors(goal, userData, timeRange);

  // Calculate likelihood based on factors
  prediction.likelihood = calculateAchievementLikelihood(progressRate, consistency, externalFactors);
  prediction.confidence = calculatePredictionConfidence(progressRate, consistency, externalFactors);
  
  // Estimate completion date
  prediction.estimatedCompletion = estimateCompletionDate(goal, progressRate);
  
  // Identify risk and success factors
  prediction.riskFactors = identifyRiskFactors(goal, userData, timeRange);
  prediction.successFactors = identifySuccessFactors(goal, userData, timeRange);

  return prediction;
};

/**
 * Generate personalized goal recommendations
 */
export const generatePersonalizedRecommendations = (userData, timeRange = '30d') => {
  if (!userData?.metricGoals) {
    return { recommendations: [] };
  }

  const recommendations = [];

  // Analyze current goal status
  const goalAnalysis = analyzeGoalStatus(userData);
  
  // Generate recommendations based on analysis
  if (goalAnalysis.strugglingGoals.length > 0) {
    recommendations.push(...generateStrugglingGoalRecommendations(goalAnalysis.strugglingGoals));
  }
  
  if (goalAnalysis.approachingMilestones.length > 0) {
    recommendations.push(...generateMilestoneRecommendations(goalAnalysis.approachingMilestones));
  }
  
  if (goalAnalysis.completedGoals.length > 0) {
    recommendations.push(...generateNextGoalRecommendations(goalAnalysis.completedGoals));
  }

  // Generate general recommendations
  recommendations.push(...generateGeneralRecommendations(userData, timeRange));

  return { recommendations };
};

// Helper functions
const calculateGoalProgress = (current, target, metricId) => {
  if (!current || !target) return 0;
  
  if (metricId === 'weight' && target < current) {
    const totalToLose = current - target;
    const lost = current - target;
    return Math.min((lost / totalToLose) * 100, 100);
  }
  
  return Math.min((current / target) * 100, 100);
};

const getRecentEntries = (entries, timeRange) => {
  const cutoffDate = new Date();
  const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.createdAt || entry.date);
    return entryDate > cutoffDate;
  });
};

const detectGoalMention = (content, goalId) => {
  const goalKeywords = getGoalKeywords(goalId);
  const contentLower = (content || '').toLowerCase();
  return goalKeywords.some(keyword => contentLower.includes(keyword));
};

const getGoalKeywords = (goalId) => {
  const keywords = {
    weight: ['weight', 'pounds', 'lbs', 'lose', 'gain', 'maintain'],
    workouts: ['workout', 'exercise', 'gym', 'training', 'fitness'],
    sleep: ['sleep', 'rest', 'bed', 'tired', 'energy'],
    mood: ['mood', 'feel', 'happy', 'sad', 'emotion'],
    stress: ['stress', 'anxiety', 'overwhelmed', 'calm', 'relax']
  };
  return keywords[goalId] || [];
};

const calculateCorrelation = (x, y) => {
  if (x.length !== y.length || x.length < 2) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

const generateGoalInsights = (correlation) => {
  const insights = [];
  
  if (Math.abs(correlation.correlations.mood) > 0.5) {
    insights.push({
      type: 'mood_correlation',
      strength: Math.abs(correlation.correlations.mood),
      description: `Your mood is strongly ${correlation.correlations.mood > 0 ? 'positively' : 'negatively'} correlated with your ${correlation.goalId} goal progress`
    });
  }
  
  if (Math.abs(correlation.correlations.energy) > 0.5) {
    insights.push({
      type: 'energy_correlation',
      strength: Math.abs(correlation.correlations.energy),
      description: `Your energy levels are strongly ${correlation.correlations.energy > 0 ? 'positively' : 'negatively'} correlated with your ${correlation.goalId} goal progress`
    });
  }
  
  return insights;
};

const generateCorrelationRecommendations = (correlation) => {
  const recommendations = [];
  
  if (correlation.correlations.mood < -0.3) {
    recommendations.push({
      type: 'mood_improvement',
      priority: 'high',
      description: `Consider focusing on mood improvement to boost your ${correlation.goalId} goal progress`,
      action: 'Try mood-boosting activities like exercise, meditation, or social connection'
    });
  }
  
  if (correlation.correlations.energy < -0.3) {
    recommendations.push({
      type: 'energy_boost',
      priority: 'medium',
      description: `Improving your energy levels could help with your ${correlation.goalId} goal`,
      action: 'Focus on sleep quality, nutrition, and stress management'
    });
  }
  
  return recommendations;
};

const calculateConsistencyScore = (entries) => {
  if (entries.length < 2) return 0;
  
  const dates = entries.map(entry => new Date(entry.createdAt || entry.date));
  const sortedDates = dates.sort((a, b) => a - b);
  
  let consistencyScore = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 2) consistencyScore += 1;
  }
  
  return Math.min(consistencyScore / (sortedDates.length - 1), 1);
};

const identifyKeyBehaviors = (entries) => {
  const behaviors = [];
  const content = entries.map(entry => entry.content || '').join(' ').toLowerCase();
  
  if (content.includes('workout') || content.includes('exercise')) {
    behaviors.push('regular_exercise');
  }
  
  if (content.includes('sleep') || content.includes('rest')) {
    behaviors.push('sleep_focus');
  }
  
  if (content.includes('nutrition') || content.includes('diet')) {
    behaviors.push('nutrition_focus');
  }
  
  if (content.includes('meditation') || content.includes('mindfulness')) {
    behaviors.push('mindfulness_practice');
  }
  
  return behaviors;
};

const identifySuccessFactors = (goal, entries) => {
  const factors = [];
  
  // Check for consistency
  const consistencyScore = calculateConsistencyScore(entries);
  if (consistencyScore > 0.7) {
    factors.push('high_consistency');
  }
  
  // Check for positive mindset
  const positiveEntries = entries.filter(entry => {
    const sentiment = analyzeSentiment(entry.content || '');
    return sentiment.score > 0.3;
  });
  
  if (positiveEntries.length / entries.length > 0.6) {
    factors.push('positive_mindset');
  }
  
  return factors;
};

const analyzeCrossGoalPatterns = (userData, timeRange) => {
  const patterns = [];
  
  // Analyze if users who achieve one goal are more likely to achieve others
  const completedGoals = Object.entries(userData.metricGoals)
    .filter(([_, goal]) => goal.hasGoal)
    .map(([metricId, goal]) => ({
      id: metricId,
      progress: calculateGoalProgress(userData.metricValues?.[metricId], goal.target, metricId)
    }))
    .filter(goal => goal.progress >= 100);
  
  if (completedGoals.length > 1) {
    patterns.push({
      type: 'multiple_goal_success',
      description: 'You have a pattern of successfully achieving multiple goals',
      strength: 0.8
    });
  }
  
  return patterns;
};

const generateSuccessRecommendations = (successPattern) => {
  const recommendations = [];
  
  if (successPattern.consistencyScore > 0.8) {
    recommendations.push({
      type: 'consistency_strength',
      description: 'Your consistency is a key strength - apply this to other goals',
      action: 'Use the same consistency strategies for your current goals'
    });
  }
  
  if (successPattern.keyBehaviors.includes('regular_exercise')) {
    recommendations.push({
      type: 'exercise_success',
      description: 'Regular exercise helped you achieve this goal',
      action: 'Maintain your exercise routine to support other goals'
    });
  }
  
  return recommendations;
};

const analyzeProgressRate = (goal, userData, timeRange) => {
  // This would analyze the rate of progress over time
  // For now, return a simple calculation
  const recentEntries = getRecentEntries(userData.journalEntries, timeRange);
  const goalEntries = recentEntries.filter(entry => 
    detectGoalMention(entry.content, goal.id)
  );
  
  return {
    entriesPerWeek: goalEntries.length / (timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : 1),
    progressRate: goal.progress / (timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : 1)
  };
};

const analyzeConsistencyPatterns = (goal, userData, timeRange) => {
  const recentEntries = getRecentEntries(userData.journalEntries, timeRange);
  const goalEntries = recentEntries.filter(entry => 
    detectGoalMention(entry.content, goal.id)
  );
  
  return calculateConsistencyScore(goalEntries);
};

const analyzeExternalFactors = (goal, userData, timeRange) => {
  // This would analyze external factors like season, day of week, etc.
  // For now, return a neutral score
  return 0.5;
};

const calculateAchievementLikelihood = (progressRate, consistency, externalFactors) => {
  // Simple weighted calculation
  const progressWeight = 0.4;
  const consistencyWeight = 0.4;
  const externalWeight = 0.2;
  
  const progressScore = Math.min(progressRate.progressRate * 10, 1);
  const consistencyScore = consistency;
  const externalScore = externalFactors;
  
  return (progressScore * progressWeight) + 
         (consistencyScore * consistencyWeight) + 
         (externalScore * externalWeight);
};

const calculatePredictionConfidence = (progressRate, consistency, externalFactors) => {
  // Confidence based on data availability and consistency
  const dataPoints = progressRate.entriesPerWeek;
  const consistencyScore = consistency;
  
  return Math.min((dataPoints / 3) * 0.6 + consistencyScore * 0.4, 1);
};

const estimateCompletionDate = (goal, progressRate) => {
  if (progressRate.progressRate <= 0) return null;
  
  const remainingProgress = 100 - goal.progress;
  const weeksToCompletion = remainingProgress / (progressRate.progressRate * 10);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + (weeksToCompletion * 7));
  
  return completionDate;
};

const identifyRiskFactors = (goal, userData, timeRange) => {
  const riskFactors = [];
  
  // Check for negative sentiment in goal-related entries
  const recentEntries = getRecentEntries(userData.journalEntries, timeRange);
  const goalEntries = recentEntries.filter(entry => 
    detectGoalMention(entry.content, goal.id)
  );
  
  const negativeEntries = goalEntries.filter(entry => {
    const sentiment = analyzeSentiment(entry.content || '');
    return sentiment.score < -0.3;
  });
  
  if (negativeEntries.length / goalEntries.length > 0.3) {
    riskFactors.push('negative_mindset');
  }
  
  // Check for inconsistency
  const consistency = calculateConsistencyScore(goalEntries);
  if (consistency < 0.3) {
    riskFactors.push('low_consistency');
  }
  
  return riskFactors;
};

const analyzeGoalStatus = (userData) => {
  const goals = Object.entries(userData.metricGoals)
    .filter(([_, goal]) => goal.hasGoal)
    .map(([metricId, goal]) => ({
      id: metricId,
      progress: calculateGoalProgress(userData.metricValues?.[metricId], goal.target, metricId),
      status: determineGoalStatus(userData.metricValues?.[metricId], goal.target, metricId)
    }));
  
  return {
    strugglingGoals: goals.filter(g => g.progress < 30),
    approachingMilestones: goals.filter(g => g.progress >= 80 && g.progress < 100),
    completedGoals: goals.filter(g => g.progress >= 100)
  };
};

const determineGoalStatus = (current, target, metricId) => {
  const progress = calculateGoalProgress(current, target, metricId);
  
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'active';
  return 'not_started';
};

const generateStrugglingGoalRecommendations = (strugglingGoals) => {
  return strugglingGoals.map(goal => ({
    type: 'struggling_goal_support',
    priority: 'high',
    description: `Your ${goal.id} goal needs attention`,
    action: 'Consider breaking it down into smaller, more manageable steps',
    goalId: goal.id
  }));
};

const generateMilestoneRecommendations = (approachingGoals) => {
  return approachingGoals.map(goal => ({
    type: 'milestone_celebration',
    priority: 'medium',
    description: `You're close to achieving your ${goal.id} goal!`,
    action: 'Keep up the great work and celebrate your progress',
    goalId: goal.id
  }));
};

const generateNextGoalRecommendations = (completedGoals) => {
  return completedGoals.map(goal => ({
    type: 'next_goal_suggestion',
    priority: 'low',
    description: `Great job completing your ${goal.id} goal!`,
    action: 'Consider setting a new goal to build on this success',
    goalId: goal.id
  }));
};

const generateGeneralRecommendations = (userData, timeRange) => {
  const recommendations = [];
  
  // Check for goal balance
  const activeGoals = Object.entries(userData.metricGoals)
    .filter(([_, goal]) => goal.hasGoal).length;
  
  if (activeGoals > 5) {
    recommendations.push({
      type: 'goal_overload',
      priority: 'medium',
      description: 'You have many active goals',
      action: 'Consider focusing on 2-3 most important goals to avoid overwhelm'
    });
  }
  
  return recommendations;
};

const generatePredictionInsights = (prediction) => {
  const insights = [];
  
  if (prediction.likelihood > 0.8) {
    insights.push({
      type: 'high_achievement_likelihood',
      description: `You're on track to achieve your ${prediction.goalId} goal`,
      confidence: prediction.confidence
    });
  } else if (prediction.likelihood < 0.3) {
    insights.push({
      type: 'low_achievement_likelihood',
      description: `Your ${prediction.goalId} goal may need adjustment`,
      confidence: prediction.confidence
    });
  }
  
  if (prediction.riskFactors.length > 0) {
    insights.push({
      type: 'risk_factors',
      description: `Watch out for: ${prediction.riskFactors.join(', ')}`,
      confidence: 0.7
    });
  }
  
  return insights;
}; 