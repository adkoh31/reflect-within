/**
 * Fine-tuning Data Collector for ReflectWithin
 * Helps collect, analyze, and prepare high-quality training data
 */

/**
 * Analyze conversation quality and extract training examples
 */
export const analyzeConversationForTraining = (conversation) => {
  const analysis = {
    qualityScore: 0,
    trainingExamples: [],
    patterns: [],
    issues: []
  };

  if (!conversation?.messages || conversation.messages.length === 0) {
    return analysis;
  }

  // Calculate quality score
  analysis.qualityScore = calculateConversationQuality(conversation);

  // Extract training examples
  analysis.trainingExamples = extractTrainingExamples(conversation);

  // Identify patterns
  analysis.patterns = identifyConversationPatterns(conversation);

  // Find issues
  analysis.issues = identifyQualityIssues(conversation);

  return analysis;
};

/**
 * Calculate overall conversation quality score
 */
const calculateConversationQuality = (conversation) => {
  const factors = {
    length: calculateLengthScore(conversation),
    engagement: calculateEngagementScore(conversation),
    sentiment: calculateSentimentScore(conversation),
    followUpQuality: calculateFollowUpQuality(conversation),
    contextAwareness: calculateContextAwareness(conversation)
  };

  // Weighted average
  const weights = {
    length: 0.15,
    engagement: 0.25,
    sentiment: 0.20,
    followUpQuality: 0.25,
    contextAwareness: 0.15
  };

  return Object.entries(factors).reduce((score, [factor, value]) => {
    return score + (value * weights[factor]);
  }, 0);
};

/**
 * Calculate length-based quality score
 */
const calculateLengthScore = (conversation) => {
  const messageCount = conversation.messages.length;
  
  if (messageCount < 4) return 0.3; // Too short
  if (messageCount < 8) return 0.6; // Short but acceptable
  if (messageCount < 15) return 0.9; // Good length
  if (messageCount < 25) return 1.0; // Ideal length
  return 0.8; // Very long, might be rambling
};

/**
 * Calculate engagement score
 */
const calculateEngagementScore = (conversation) => {
  const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
  const aiMessages = conversation.messages.filter(msg => msg.sender === 'ai');
  
  if (userMessages.length === 0) return 0;

  // Calculate average user message length
  const avgUserLength = userMessages.reduce((sum, msg) => 
    sum + (msg.text?.length || 0), 0) / userMessages.length;

  // Calculate response ratio (user messages to AI messages)
  const responseRatio = aiMessages.length / userMessages.length;

  // Score based on engagement indicators
  let score = 0;
  
  if (avgUserLength > 50) score += 0.4; // Good user engagement
  if (avgUserLength > 100) score += 0.3; // High user engagement
  if (responseRatio >= 0.8 && responseRatio <= 1.2) score += 0.3; // Good balance

  return Math.min(score, 1.0);
};

/**
 * Calculate sentiment score
 */
const calculateSentimentScore = (conversation) => {
  const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
  
  if (userMessages.length === 0) return 0.5; // Neutral

  const sentiments = userMessages.map(msg => analyzeMessageSentiment(msg.text || ''));
  const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

  // Convert sentiment to quality score (we want diverse emotional content)
  if (Math.abs(avgSentiment) < 0.1) return 0.6; // Too neutral
  if (Math.abs(avgSentiment) < 0.3) return 0.8; // Good emotional range
  if (Math.abs(avgSentiment) < 0.5) return 1.0; // Strong emotional content
  return 0.7; // Very strong emotions
};

/**
 * Calculate follow-up question quality
 */
const calculateFollowUpQuality = (conversation) => {
  const aiMessages = conversation.messages.filter(msg => msg.sender === 'ai');
  
  if (aiMessages.length === 0) return 0;

  let qualityScore = 0;
  let questionCount = 0;

  aiMessages.forEach(msg => {
    const text = msg.text || '';
    
    // Check for questions
    if (/\?/.test(text)) {
      questionCount++;
      
      // Score question quality
      if (text.includes('What') || text.includes('How') || text.includes('Why')) {
        qualityScore += 0.8; // Good open-ended questions
      } else if (text.includes('Do you') || text.includes('Have you')) {
        qualityScore += 0.6; // Decent questions
      } else {
        qualityScore += 0.4; // Basic questions
      }
    }
  });

  const avgQuestionQuality = questionCount > 0 ? qualityScore / questionCount : 0;
  const questionRatio = questionCount / aiMessages.length;

  return (avgQuestionQuality * 0.7) + (Math.min(questionRatio, 1.0) * 0.3);
};

/**
 * Calculate context awareness
 */
const calculateContextAwareness = (conversation) => {
  const aiMessages = conversation.messages.filter(msg => msg.sender === 'ai');
  
  if (aiMessages.length < 2) return 0.5; // Not enough context

  let contextScore = 0;

  // Check for references to previous messages
  for (let i = 1; i < aiMessages.length; i++) {
    const currentMsg = aiMessages[i].text || '';
    const previousUserMsg = conversation.messages
      .filter(msg => msg.sender === 'user')
      .slice(-2)[0]?.text || '';

    if (currentMsg.toLowerCase().includes('earlier') || 
        currentMsg.toLowerCase().includes('before') ||
        currentMsg.toLowerCase().includes('we talked') ||
        currentMsg.toLowerCase().includes('you mentioned')) {
      contextScore += 0.3;
    }

    // Check for topic continuity
    const currentTopics = extractTopics(currentMsg);
    const previousTopics = extractTopics(previousUserMsg);
    
    if (currentTopics.some(topic => 
      previousTopics.some(pt => pt.toLowerCase().includes(topic.toLowerCase())))) {
      contextScore += 0.2;
    }
  }

  return Math.min(contextScore / aiMessages.length, 1.0);
};

/**
 * Extract training examples from conversation
 */
const extractTrainingExamples = (conversation) => {
  const examples = [];
  
  for (let i = 0; i < conversation.messages.length - 1; i++) {
    const currentMsg = conversation.messages[i];
    const nextMsg = conversation.messages[i + 1];
    
    if (currentMsg.sender === 'user' && nextMsg.sender === 'ai') {
      const example = {
        user: currentMsg.text || '',
        assistant: nextMsg.text || '',
        context: extractContext(conversation, i),
        quality: calculateExchangeQuality(currentMsg, nextMsg),
        timestamp: currentMsg.timestamp || nextMsg.timestamp
      };
      
      // Only include high-quality examples
      if (example.quality > 0.7) {
        examples.push(example);
      }
    }
  }
  
  return examples;
};

/**
 * Calculate quality of a single exchange
 */
const calculateExchangeQuality = (userMsg, aiMsg) => {
  const userText = userMsg.text || '';
  const aiText = aiMsg.text || '';
  
  let score = 0;
  
  // Check AI response length (not too short, not too long)
  if (aiText.length > 20 && aiText.length < 300) score += 0.3;
  
  // Check for questions in AI response
  if (/\?/.test(aiText)) score += 0.2;
  
  // Check for empathy indicators
  const empathyWords = ['hear', 'understand', 'feel', 'sounds', 'seems', 'must'];
  if (empathyWords.some(word => aiText.toLowerCase().includes(word))) score += 0.2;
  
  // Check for generic responses
  const genericPhrases = ['that\'s good', 'keep it up', 'that\'s interesting', 'i see'];
  const isGeneric = genericPhrases.some(phrase => 
    aiText.toLowerCase().includes(phrase.toLowerCase())
  );
  if (!isGeneric) score += 0.3;
  
  return Math.min(score, 1.0);
};

/**
 * Extract context for a message
 */
const extractContext = (conversation, messageIndex) => {
  const contextMessages = conversation.messages
    .slice(Math.max(0, messageIndex - 4), messageIndex)
    .filter(msg => msg.sender === 'user')
    .map(msg => msg.text)
    .join(' ');
  
  return contextMessages;
};

/**
 * Identify conversation patterns
 */
const identifyConversationPatterns = (conversation) => {
  const patterns = [];
  const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
  
  // Extract topics
  const allTopics = userMessages.flatMap(msg => extractTopics(msg.text || ''));
  const topicFrequency = {};
  
  allTopics.forEach(topic => {
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
  });
  
  // Add recurring topics
  Object.entries(topicFrequency)
    .filter(([, count]) => count > 1)
    .forEach(([topic, count]) => {
      patterns.push({
        type: 'recurring_topic',
        topic,
        frequency: count
      });
    });
  
  // Add emotional patterns
  const sentiments = userMessages.map(msg => analyzeMessageSentiment(msg.text || ''));
  const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
  
  if (avgSentiment < -0.2) {
    patterns.push({ type: 'negative_emotional_state', intensity: Math.abs(avgSentiment) });
  } else if (avgSentiment > 0.2) {
    patterns.push({ type: 'positive_emotional_state', intensity: avgSentiment });
  }
  
  return patterns;
};

/**
 * Identify quality issues
 */
const identifyQualityIssues = (conversation) => {
  const issues = [];
  const aiMessages = conversation.messages.filter(msg => msg.sender === 'ai');
  
  // Check for very short responses
  const shortResponses = aiMessages.filter(msg => (msg.text || '').length < 15);
  if (shortResponses.length > 0) {
    issues.push({
      type: 'short_responses',
      count: shortResponses.length,
      percentage: (shortResponses.length / aiMessages.length) * 100
    });
  }
  
  // Check for generic responses
  const genericPhrases = ['that\'s good', 'keep it up', 'that\'s interesting', 'i see', 'okay'];
  const genericResponses = aiMessages.filter(msg => 
    genericPhrases.some(phrase => 
      (msg.text || '').toLowerCase().includes(phrase.toLowerCase())
    )
  );
  
  if (genericResponses.length > 0) {
    issues.push({
      type: 'generic_responses',
      count: genericResponses.length,
      percentage: (genericResponses.length / aiMessages.length) * 100
    });
  }
  
  // Check for lack of questions
  const responsesWithoutQuestions = aiMessages.filter(msg => !/\?/.test(msg.text || ''));
  if (responsesWithoutQuestions.length > aiMessages.length * 0.5) {
    issues.push({
      type: 'lack_of_questions',
      count: responsesWithoutQuestions.length,
      percentage: (responsesWithoutQuestions.length / aiMessages.length) * 100
    });
  }
  
  return issues;
};

/**
 * Simple sentiment analysis
 */
const analyzeMessageSentiment = (text) => {
  const positiveWords = ['happy', 'excited', 'great', 'amazing', 'wonderful', 'progress', 'achieved', 'proud'];
  const negativeWords = ['sad', 'frustrated', 'stressed', 'overwhelmed', 'difficult', 'struggling', 'tired'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  
  return (positiveCount - negativeCount) / Math.max(words.length, 1);
};

/**
 * Simple topic extraction
 */
const extractTopics = (text) => {
  const topics = [];
  const textLower = text.toLowerCase();
  
  // Fitness topics
  if (textLower.includes('workout') || textLower.includes('exercise') || textLower.includes('fitness')) {
    topics.push('fitness');
  }
  if (textLower.includes('goal') || textLower.includes('target')) {
    topics.push('goals');
  }
  if (textLower.includes('stress') || textLower.includes('anxiety')) {
    topics.push('stress');
  }
  if (textLower.includes('work') || textLower.includes('job')) {
    topics.push('work');
  }
  if (textLower.includes('relationship') || textLower.includes('friend') || textLower.includes('family')) {
    topics.push('relationships');
  }
  
  return topics;
};

/**
 * Convert training examples to OpenAI format
 */
export const convertToOpenAIFormat = (trainingExamples) => {
  return trainingExamples.map(example => ({
    messages: [
      {
        role: 'system',
        content: 'You are ReflectWithin, an empathetic AI companion focused on fitness, wellness, and personal growth. Always use the user\'s actual name when provided.'
      },
      {
        role: 'user',
        content: example.user
      },
      {
        role: 'assistant',
        content: example.assistant
      }
    ]
  }));
};

/**
 * Generate training data report
 */
export const generateTrainingDataReport = (conversations) => {
  const report = {
    totalConversations: conversations.length,
    highQualityConversations: 0,
    totalTrainingExamples: 0,
    averageQualityScore: 0,
    patterns: {},
    issues: {}
  };
  
  let totalQualityScore = 0;
  let allExamples = [];
  
  conversations.forEach(conversation => {
    const analysis = analyzeConversationForTraining(conversation);
    
    if (analysis.qualityScore > 0.8) {
      report.highQualityConversations++;
    }
    
    totalQualityScore += analysis.qualityScore;
    allExamples.push(...analysis.trainingExamples);
    
    // Aggregate patterns
    analysis.patterns.forEach(pattern => {
      if (!report.patterns[pattern.type]) {
        report.patterns[pattern.type] = [];
      }
      report.patterns[pattern.type].push(pattern);
    });
    
    // Aggregate issues
    analysis.issues.forEach(issue => {
      if (!report.issues[issue.type]) {
        report.issues[issue.type] = { count: 0, total: 0 };
      }
      report.issues[issue.type].count += issue.count;
      report.issues[issue.type].total += 1;
    });
  });
  
  report.totalTrainingExamples = allExamples.length;
  report.averageQualityScore = totalQualityScore / conversations.length;
  
  return {
    report,
    trainingExamples: allExamples
  };
};

export default {
  analyzeConversationForTraining,
  convertToOpenAIFormat,
  generateTrainingDataReport
}; 