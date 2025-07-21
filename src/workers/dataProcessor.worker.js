/**
 * Web Worker for heavy data processing tasks
 * Handles analytics calculations, data transformations, and pattern analysis
 */

// Enhanced sentiment analysis with fitness/wellness context
const FITNESS_POSITIVE_WORDS = [
  'strong', 'energized', 'motivated', 'accomplished', 'proud', 'confident',
  'determined', 'focused', 'disciplined', 'consistent', 'improving', 'progress',
  'breakthrough', 'achievement', 'milestone', 'transformation', 'growth'
];

const FITNESS_NEGATIVE_WORDS = [
  'tired', 'exhausted', 'frustrated', 'plateau', 'stuck', 'demotivated',
  'inconsistent', 'lazy', 'weak', 'failure', 'regression', 'injury',
  'pain', 'struggle', 'overwhelmed', 'burnout'
];

const WELLNESS_POSITIVE_WORDS = [
  'peaceful', 'balanced', 'mindful', 'grateful', 'content', 'fulfilled',
  'present', 'aware', 'calm', 'centered', 'harmonious', 'vital',
  'thriving', 'flourishing', 'resilient', 'authentic'
];

const WELLNESS_NEGATIVE_WORDS = [
  'stressed', 'anxious', 'overwhelmed', 'burned', 'disconnected', 'lost',
  'confused', 'doubtful', 'insecure', 'lonely', 'empty', 'numb',
  'drained', 'fragmented', 'scattered'
];

// Enhanced sentiment analysis with context awareness
const analyzeSentiment = (text, context = 'general') => {
  if (!text || typeof text !== 'string') {
    return { score: 0, confidence: 0, emotions: [], context: 'neutral' };
  }

  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  let fitnessScore = 0;
  let wellnessScore = 0;
  
  // Analyze fitness-related sentiment
  FITNESS_POSITIVE_WORDS.forEach(word => {
    const matches = words.filter(w => w.includes(word)).length;
    fitnessScore += matches * 0.5;
  });
  
  FITNESS_NEGATIVE_WORDS.forEach(word => {
    const matches = words.filter(w => w.includes(word)).length;
    fitnessScore -= matches * 0.5;
  });
  
  // Analyze wellness-related sentiment
  WELLNESS_POSITIVE_WORDS.forEach(word => {
    const matches = words.filter(w => w.includes(word)).length;
    wellnessScore += matches * 0.5;
  });
  
  WELLNESS_NEGATIVE_WORDS.forEach(word => {
    const matches = words.filter(w => w.includes(word)).length;
    wellnessScore -= matches * 0.5;
  });
  
  // Normalize scores
  const normalizedFitness = fitnessScore / Math.max(wordCount, 1);
  const normalizedWellness = wellnessScore / Math.max(wordCount, 1);
  
  // Determine primary context and overall score
  let primaryContext = 'general';
  let overallScore = 0;
  
  if (Math.abs(normalizedFitness) > Math.abs(normalizedWellness)) {
    primaryContext = 'fitness';
    overallScore = normalizedFitness;
  } else if (Math.abs(normalizedWellness) > 0) {
    primaryContext = 'wellness';
    overallScore = normalizedWellness;
  }
  
  // Calculate confidence based on word count and score magnitude
  const confidence = Math.min(0.9, Math.max(0.1, wordCount / 50 + Math.abs(overallScore)));
  
  // Extract emotions
  const emotions = extractEmotions(text);
  
  return {
    score: Math.round(overallScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    emotions,
    context: primaryContext,
    fitnessScore: Math.round(normalizedFitness * 100) / 100,
    wellnessScore: Math.round(normalizedWellness * 100) / 100
  };
};

// Extract emotions from text
const extractEmotions = (text) => {
  const emotionMap = {
    joy: ['happy', 'joy', 'excited', 'thrilled', 'elated', 'ecstatic'],
    gratitude: ['grateful', 'thankful', 'blessed', 'appreciative'],
    pride: ['proud', 'accomplished', 'achieved', 'successful'],
    determination: ['determined', 'focused', 'committed', 'resolute'],
    frustration: ['frustrated', 'annoyed', 'irritated', 'aggravated'],
    anxiety: ['anxious', 'worried', 'nervous', 'stressed'],
    sadness: ['sad', 'down', 'blue', 'melancholy', 'depressed'],
    anger: ['angry', 'mad', 'furious', 'enraged']
  };
  
  const emotions = [];
  const lowerText = text.toLowerCase();
  
  Object.entries(emotionMap).forEach(([emotion, words]) => {
    const count = words.reduce((total, word) => {
      const regex = new RegExp(`\\b${word}\\w*`, 'gi');
      return total + (lowerText.match(regex) || []).length;
    }, 0);
    
    if (count > 0) {
      emotions.push({ emotion, intensity: count });
    }
  });
  
  return emotions.sort((a, b) => b.intensity - a.intensity);
};

// Extract topics from journal entries
const extractTopics = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // ReflectWithin-specific topics
  const topicKeywords = {
    'fitness': ['workout', 'exercise', 'training', 'gym', 'run', 'lift', 'cardio', 'strength'],
    'nutrition': ['food', 'diet', 'meal', 'protein', 'carbs', 'healthy', 'eating'],
    'recovery': ['rest', 'sleep', 'recovery', 'rest day', 'stretching', 'mobility'],
    'goals': ['goal', 'target', 'objective', 'aim', 'plan', 'strategy'],
    'progress': ['improvement', 'progress', 'advancement', 'growth', 'development'],
    'challenges': ['challenge', 'obstacle', 'difficulty', 'struggle', 'hurdle'],
    'motivation': ['motivated', 'inspired', 'driven', 'passionate', 'enthusiastic'],
    'mindset': ['mindset', 'attitude', 'perspective', 'outlook', 'approach'],
    'stress': ['stress', 'pressure', 'overwhelmed', 'burnout', 'tension'],
    'balance': ['balance', 'harmony', 'equilibrium', 'moderation', 'well-rounded']
  };
  
  const topics = [];
  const lowerText = text.toLowerCase();
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    const count = keywords.reduce((total, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\w*`, 'gi');
      return total + (lowerText.match(regex) || []).length;
    }, 0);
    
    if (count > 0) {
      topics.push({ topic, relevance: count });
    }
  });
  
  return topics.sort((a, b) => b.relevance - a.relevance);
};

// Analyze writing patterns
const analyzeWritingPatterns = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      averageLength: 0,
      timeDistribution: {},
      consistency: 0,
      complexity: 0,
      patterns: []
    };
  }
  
  const patterns = {
    averageLength: 0,
    timeDistribution: {},
    consistency: 0,
    complexity: 0,
    patterns: []
  };
  
  // Calculate average length
  const totalWords = entries.reduce((sum, entry) => {
    return sum + (entry.content || '').split(/\s+/).length;
  }, 0);
  patterns.averageLength = Math.round(totalWords / entries.length);
  
  // Analyze time distribution
  entries.forEach(entry => {
    const hour = new Date(entry.timestamp || entry.date).getHours();
    patterns.timeDistribution[hour] = (patterns.timeDistribution[hour] || 0) + 1;
  });
  
  // Calculate consistency (entries per week)
  const timeSpan = entries.length > 1 ? 
    (new Date(entries[entries.length - 1].timestamp) - new Date(entries[0].timestamp)) / (1000 * 60 * 60 * 24 * 7) : 1;
  patterns.consistency = Math.round(entries.length / timeSpan * 10) / 10;
  
  // Calculate complexity (average sentence length, vocabulary diversity)
  const allText = entries.map(e => e.content || '').join(' ');
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, sentence) => 
    sum + sentence.split(/\s+/).length, 0) / sentences.length;
  
  const uniqueWords = new Set(allText.toLowerCase().split(/\s+/));
  const vocabularyDiversity = uniqueWords.size / allText.split(/\s+/).length;
  
  patterns.complexity = Math.round((avgSentenceLength + vocabularyDiversity * 100) / 2);
  
  // Identify patterns
  patterns.patterns = identifyWritingPatterns(entries);
  
  return patterns;
};

// Identify specific writing patterns
const identifyWritingPatterns = (entries) => {
  const patterns = [];
  
  // Check for goal-oriented writing
  const goalEntries = entries.filter(entry => 
    (entry.content || '').toLowerCase().includes('goal') ||
    (entry.content || '').toLowerCase().includes('target')
  );
  if (goalEntries.length > entries.length * 0.3) {
    patterns.push('goal-focused');
  }
  
  // Check for reflection patterns
  const reflectionEntries = entries.filter(entry => 
    (entry.content || '').toLowerCase().includes('learned') ||
    (entry.content || '').toLowerCase().includes('realized') ||
    (entry.content || '').toLowerCase().includes('discovered')
  );
  if (reflectionEntries.length > entries.length * 0.2) {
    patterns.push('reflective');
  }
  
  // Check for progress tracking
  const progressEntries = entries.filter(entry => 
    (entry.content || '').toLowerCase().includes('progress') ||
    (entry.content || '').toLowerCase().includes('improved') ||
    (entry.content || '').toLowerCase().includes('achieved')
  );
  if (progressEntries.length > entries.length * 0.2) {
    patterns.push('progress-oriented');
  }
  
  return patterns;
};

// Predict goal achievement likelihood
const predictGoalAchievement = (goals, journalEntries, trackingData) => {
  if (!goals || !Array.isArray(journalEntries)) {
    return { likelihood: 0, confidence: 0, factors: [] };
  }
  
  const factors = [];
  let totalScore = 0;
  let maxScore = 0;
  
  // Analyze journaling consistency
  const recentEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp || entry.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return entryDate > weekAgo;
  });
  
  const consistencyScore = Math.min(1, recentEntries.length / 7);
  factors.push({ factor: 'journaling_consistency', score: consistencyScore, weight: 0.3 });
  totalScore += consistencyScore * 0.3;
  maxScore += 0.3;
  
  // Analyze sentiment trends
  const recentSentiments = recentEntries.map(entry => 
    analyzeSentiment(entry.content || '')
  );
  
  const avgSentiment = recentSentiments.reduce((sum, s) => sum + s.score, 0) / recentSentiments.length;
  const sentimentScore = Math.max(0, (avgSentiment + 1) / 2); // Normalize to 0-1
  factors.push({ factor: 'positive_mindset', score: sentimentScore, weight: 0.25 });
  totalScore += sentimentScore * 0.25;
  maxScore += 0.25;
  
  // Analyze goal-specific mentions
  const goalMentions = recentEntries.filter(entry => {
    const content = (entry.content || '').toLowerCase();
    return goals.some(goal => 
      content.includes(goal.toLowerCase()) || 
      content.includes('goal') || 
      content.includes('target')
    );
  }).length;
  
  const goalFocusScore = Math.min(1, goalMentions / recentEntries.length);
  factors.push({ factor: 'goal_focus', score: goalFocusScore, weight: 0.25 });
  totalScore += goalFocusScore * 0.25;
  maxScore += 0.25;
  
  // Analyze tracking consistency
  const recentTracking = trackingData?.filter(track => {
    const trackDate = new Date(track.timestamp || track.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return trackDate > weekAgo;
  }) || [];
  
  const trackingScore = Math.min(1, recentTracking.length / 7);
  factors.push({ factor: 'tracking_consistency', score: trackingScore, weight: 0.2 });
  totalScore += trackingScore * 0.2;
  maxScore += 0.2;
  
  const likelihood = maxScore > 0 ? totalScore / maxScore : 0;
  const confidence = Math.min(0.9, recentEntries.length / 10);
  
  return {
    likelihood: Math.round(likelihood * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    factors: factors.sort((a, b) => b.score - a.score)
  };
};

// Generate personalized insights
const generatePersonalizedInsights = (userData) => {
  const insights = [];
  
  if (!userData) return insights;
  
  const { journalEntries = [], goals = null, trackingData = [] } = userData;
  
  // Analyze recent entries
  const recentEntries = journalEntries
    .filter(entry => {
      const entryDate = new Date(entry.timestamp || entry.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return entryDate > weekAgo;
    })
    .slice(-5); // Last 5 entries
  
  if (recentEntries.length > 0) {
    // Sentiment trend analysis
    const sentiments = recentEntries.map(entry => 
      analyzeSentiment(entry.content || '')
    );
    
    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    
    if (avgSentiment > 0.3) {
      insights.push({
        type: 'positive_trend',
        title: 'Positive Momentum',
        message: 'Your recent entries show a positive emotional trend. Keep up this momentum!',
        priority: 'high',
        actionable: true
      });
    } else if (avgSentiment < -0.3) {
      insights.push({
        type: 'support_needed',
        title: 'Supportive Reflection',
        message: 'Consider focusing on self-compassion and celebrating small wins in your next entry.',
        priority: 'high',
        actionable: true
      });
    }
    
    // Topic analysis
    const allTopics = recentEntries.flatMap(entry => 
      extractTopics(entry.content || '')
    );
    
    const topicFrequency = {};
    allTopics.forEach(topic => {
      topicFrequency[topic.topic] = (topicFrequency[topic.topic] || 0) + topic.relevance;
    });
    
    const mostFrequentTopic = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostFrequentTopic) {
      insights.push({
        type: 'topic_focus',
        title: `Focus on ${mostFrequentTopic[0].charAt(0).toUpperCase() + mostFrequentTopic[0].slice(1)}`,
        message: `You've been reflecting a lot on ${mostFrequentTopic[0]}. Consider setting specific goals in this area.`,
        priority: 'medium',
        actionable: true
      });
    }
  }
  
  // Goal achievement prediction
  if (goals && goals.personalGoals && goals.personalGoals.length > 0) {
    const prediction = predictGoalAchievement(goals.personalGoals, journalEntries, trackingData);
    
    if (prediction.likelihood > 0.7) {
      insights.push({
        type: 'goal_success',
        title: 'Goal Achievement Likely',
        message: 'Your current patterns suggest strong progress toward your goals. Keep up the great work!',
        priority: 'high',
        actionable: false
      });
    } else if (prediction.likelihood < 0.3) {
      insights.push({
        type: 'goal_support',
        title: 'Goal Support Needed',
        message: 'Consider breaking down your goals into smaller, more manageable steps.',
        priority: 'high',
        actionable: true
      });
    }
  }
  
  return insights;
};

// Data processing functions
const processAnalytics = (data) => {
  const startTime = performance.now();
  
  try {
    const { journalEntries, chatMessages, trackingData } = data;
    
    // Calculate sentiment analysis
    const sentimentScores = journalEntries.map(entry => {
      const text = entry.content.toLowerCase();
      const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'love', 'wonderful', 'amazing'];
      const negativeWords = ['sad', 'angry', 'frustrated', 'anxious', 'worried', 'depressed'];
      
      let score = 0;
      positiveWords.forEach(word => {
        score += (text.match(new RegExp(word, 'g')) || []).length;
      });
      negativeWords.forEach(word => {
        score -= (text.match(new RegExp(word, 'g')) || []).length;
      });
      
      return {
        id: entry.id,
        score: score / Math.max(text.split(' ').length, 1),
        date: entry.timestamp
      };
    });

    // Calculate writing patterns
    const writingPatterns = journalEntries.reduce((patterns, entry) => {
      const wordCount = entry.content.split(' ').length;
      const timeOfDay = new Date(entry.timestamp).getHours();
      
      patterns.wordCounts.push(wordCount);
      patterns.timeDistribution[timeOfDay] = (patterns.timeDistribution[timeOfDay] || 0) + 1;
      
      return patterns;
    }, { wordCounts: [], timeDistribution: {} });

    // Calculate chat engagement metrics
    const chatMetrics = {
      totalMessages: chatMessages.length,
      userMessages: chatMessages.filter(m => m.role === 'user').length,
      aiMessages: chatMessages.filter(m => m.role === 'assistant').length,
      averageResponseTime: calculateAverageResponseTime(chatMessages),
      conversationTopics: extractTopics(chatMessages)
    };

    // Calculate tracking data insights
    const trackingInsights = trackingData.reduce((insights, entry) => {
      if (entry.type === 'mood') {
        insights.moodTrends.push({
          value: entry.value,
          date: entry.timestamp
        });
      } else if (entry.type === 'activity') {
        insights.activityFrequency[entry.value] = (insights.activityFrequency[entry.value] || 0) + 1;
      }
      return insights;
    }, { moodTrends: [], activityFrequency: {} });

    const processingTime = performance.now() - startTime;
    
    return {
      success: true,
      data: {
        sentimentScores,
        writingPatterns,
        chatMetrics,
        trackingInsights,
        processingTime
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Enhanced analytics processing with advanced features
const processAdvancedAnalytics = (userData) => {
  const startTime = performance.now();
  
  try {
    const { journalEntries = [], goals = null, trackingData = [], chatMessages = [] } = userData;
    
    // Process all analytics
    const sentimentAnalysis = journalEntries.map(entry => ({
      id: entry.id,
      ...analyzeSentiment(entry.content || ''),
      date: entry.timestamp || entry.date
    }));
    
    const topicAnalysis = journalEntries.map(entry => ({
      id: entry.id,
      topics: extractTopics(entry.content || ''),
      date: entry.timestamp || entry.date
    }));
    
    const writingPatterns = analyzeWritingPatterns(journalEntries);
    const goalPrediction = predictGoalAchievement(goals?.personalGoals || [], journalEntries, trackingData);
    const personalizedInsights = generatePersonalizedInsights(userData);
    
    // Enhanced chat analysis
    const chatAnalysis = {
      totalMessages: chatMessages.length,
      userMessages: chatMessages.filter(m => m.role === 'user').length,
      aiMessages: chatMessages.filter(m => m.role === 'assistant').length,
      averageResponseTime: calculateAverageResponseTime(chatMessages),
      conversationTopics: extractTopicsFromMessages(chatMessages),
      engagementScore: calculateEngagementScore(chatMessages)
    };
    
    const result = {
      sentimentAnalysis,
      topicAnalysis,
      writingPatterns,
      goalPrediction,
      personalizedInsights,
      chatAnalysis,
      processingTime: performance.now() - startTime
    };
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const calculateAverageResponseTime = (messages) => {
  let totalTime = 0;
  let responseCount = 0;
  
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
      const userTime = new Date(messages[i].timestamp).getTime();
      const aiTime = new Date(messages[i + 1].timestamp).getTime();
      totalTime += aiTime - userTime;
      responseCount++;
    }
  }
  
  return responseCount > 0 ? totalTime / responseCount : 0;
};

const calculateEngagementScore = (messages) => {
  if (messages.length === 0) return 0;
  
  const userMessages = messages.filter(m => m.role === 'user');
  const avgMessageLength = userMessages.reduce((sum, msg) => 
    sum + (msg.content || '').length, 0) / userMessages.length;
  
  const responseRate = messages.filter(m => m.role === 'assistant').length / userMessages.length;
  
  return Math.round((avgMessageLength / 100 + responseRate) / 2 * 100) / 100;
};

const extractTopicsFromMessages = (messages) => {
  const topics = {};
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  messages.forEach(message => {
    const words = message.content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    words.forEach(word => {
      topics[word] = (topics[word] || 0) + 1;
    });
  });
  
  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

const processDataMigration = (oldData) => {
  const startTime = performance.now();
  
  try {
    // Transform old data format to new format
    const transformedData = {
      journalEntries: oldData.journalEntries?.map(entry => ({
        id: entry.id || generateId(),
        content: entry.content || entry.text || '',
        timestamp: entry.timestamp || entry.date || new Date().toISOString(),
        tags: entry.tags || [],
        mood: entry.mood || null,
        wordCount: (entry.content || entry.text || '').split(' ').length
      })) || [],
      
      chatMessages: oldData.chatMessages?.map(msg => ({
        id: msg.id || generateId(),
        content: msg.content || msg.text || '',
        role: msg.role || msg.sender || 'user',
        timestamp: msg.timestamp || new Date().toISOString()
      })) || [],
      
      trackingData: oldData.trackingData?.map(track => ({
        id: track.id || generateId(),
        type: track.type || 'mood',
        value: track.value,
        timestamp: track.timestamp || new Date().toISOString(),
        metadata: track.metadata || {}
      })) || []
    };
    
    const processingTime = performance.now() - startTime;
    
    return {
      success: true,
      data: transformedData,
      processingTime
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Message handler
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'PROCESS_ANALYTICS':
        result = processAnalytics(data);
        break;
        
      case 'PROCESS_ADVANCED_ANALYTICS':
        result = processAdvancedAnalytics(data);
        break;
        
      case 'PROCESS_MIGRATION':
        result = processDataMigration(data);
        break;
        
      case 'CLEANUP':
        // Clean up any resources
        result = { success: true };
        break;
        
      default:
        result = { success: false, error: `Unknown message type: ${type}` };
    }
    
    self.postMessage({
      id,
      type: `${type}_RESPONSE`,
      result
    });
  } catch (error) {
    self.postMessage({
      id,
      type: `${type}_ERROR`,
      error: error.message
    });
  }
});

// Handle worker errors
self.addEventListener('error', (error) => {
  console.error('Worker error:', error);
  self.postMessage({
    type: 'WORKER_ERROR',
    error: error.message
  });
}); 