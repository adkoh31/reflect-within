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

// Data processing functions
const processAnalytics = (data) => {
  const startTime = performance.now();
  
  try {
    const { journalEntries = [], chatMessages = [], trackingData = [] } = data;
    
    // Calculate sentiment analysis
    const sentimentScores = journalEntries.map(entry => {
      const text = (entry.content || '').toLowerCase();
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
      const wordCount = (entry.content || '').split(' ').length;
      const timeOfDay = new Date(entry.timestamp || entry.date).getHours();
      
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
      conversationTopics: extractTopics(chatMessages.map(m => m.content || '').join(' '))
    };

    const processingTime = performance.now() - startTime;
    
    return {
      success: true,
      data: {
        sentimentScores,
        writingPatterns,
        chatMetrics,
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
    
    // Enhanced chat analysis
    const chatAnalysis = {
      totalMessages: chatMessages.length,
      userMessages: chatMessages.filter(m => m.role === 'user').length,
      aiMessages: chatMessages.filter(m => m.role === 'assistant').length,
      averageResponseTime: calculateAverageResponseTime(chatMessages),
      conversationTopics: extractTopics(chatMessages.map(m => m.content || '').join(' ')),
      engagementScore: calculateEngagementScore(chatMessages)
    };
    
    const result = {
      sentimentAnalysis,
      topicAnalysis,
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
      const userTime = new Date(messages[i].timestamp || Date.now()).getTime();
      const aiTime = new Date(messages[i + 1].timestamp || Date.now()).getTime();
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