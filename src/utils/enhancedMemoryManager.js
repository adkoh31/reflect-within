/**
 * Enhanced Memory Manager for Multi-Turn Conversations
 * Builds on existing conversation systems to provide sophisticated memory capabilities
 */

// Memory types and their importance weights
const MEMORY_TYPES = {
  CONVERSATION_HISTORY: { weight: 0.3, maxItems: 20 },
  EMOTIONAL_PATTERNS: { weight: 0.25, maxItems: 10 },
  GOAL_PROGRESS: { weight: 0.2, maxItems: 15 },
  BEHAVIORAL_PATTERNS: { weight: 0.15, maxItems: 10 },
  SUCCESS_MOMENTS: { weight: 0.1, maxItems: 8 }
};

/**
 * Enhanced Memory Manager Class
 * Provides sophisticated multi-turn memory capabilities
 */
export class EnhancedMemoryManager {
  constructor() {
    this.memoryCache = new Map();
    this.patternCache = new Map();
    this.emotionalHistory = [];
    this.goalTracking = new Map();
    this.successMoments = [];
    this.conversationThreads = new Map();
  }

  /**
   * Process and store conversation memory
   */
  processConversationMemory(conversationId, messages, userData = null) {
    const memory = {
      conversationId,
      timestamp: new Date().toISOString(),
      messages: this.extractKeyMessages(messages),
      emotionalState: this.analyzeEmotionalState(messages),
      topics: this.extractTopics(messages),
      goals: this.extractGoals(messages),
      patterns: this.identifyPatterns(messages),
      insights: this.generateInsights(messages, userData)
    };

    this.memoryCache.set(conversationId, memory);
    this.updatePatternCache(memory);
    this.updateEmotionalHistory(memory.emotionalState);
    this.updateGoalTracking(memory.goals);
    this.updateSuccessMoments(messages);

    return memory;
  }

  /**
   * Extract key messages for memory storage
   */
  extractKeyMessages(messages) {
    return messages
      .filter(msg => msg.sender === 'user')
      .map(msg => ({
        content: msg.text || msg.content,
        timestamp: msg.timestamp,
        emotionalIntensity: this.calculateEmotionalIntensity(msg.text || msg.content),
        topic: this.extractPrimaryTopic(msg.text || msg.content)
      }))
      .filter(msg => msg.emotionalIntensity > 0.3 || msg.topic) // Only store significant messages
      .slice(-10); // Keep last 10 significant messages
  }

  /**
   * Analyze emotional state across conversation
   */
  analyzeEmotionalState(messages) {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const emotions = userMessages.map(msg => this.analyzeMessageEmotion(msg.text || msg.content));
    
    return {
      primary: this.getMostFrequentEmotion(emotions),
      intensity: this.calculateAverageIntensity(emotions),
      trend: this.analyzeEmotionalTrend(emotions),
      triggers: this.identifyEmotionalTriggers(userMessages)
    };
  }

  /**
   * Extract topics from conversation
   */
  extractTopics(messages) {
    const allText = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text || msg.content)
      .join(' ');

    const topics = [
      'workout routine', 'motivation', 'goals', 'progress', 'frustration',
      'stress', 'anxiety', 'confidence', 'consistency', 'injury',
      'nutrition', 'sleep', 'energy', 'comparison', 'perfectionism'
    ];

    return topics.filter(topic => 
      allText.toLowerCase().includes(topic.toLowerCase())
    );
  }

  /**
   * Extract goals mentioned in conversation
   */
  extractGoals(messages) {
    const goalKeywords = ['goal', 'want to', 'trying to', 'working on', 'aiming for'];
    const goals = [];

    messages.forEach(msg => {
      if (msg.sender === 'user') {
        const text = msg.text || msg.content;
        goalKeywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            const goalMatch = text.match(new RegExp(`${keyword}\\s+(.+)`, 'i'));
            if (goalMatch) {
              goals.push({
                goal: goalMatch[1].trim(),
                timestamp: msg.timestamp,
                context: text
              });
            }
          }
        });
      }
    });

    return goals;
  }

  /**
   * Identify patterns in conversation
   */
  identifyPatterns(messages) {
    const patterns = {
      recurringThemes: this.findRecurringThemes(messages),
      emotionalCycles: this.identifyEmotionalCycles(messages),
      goalMentions: this.trackGoalMentions(messages),
      challengePatterns: this.identifyChallengePatterns(messages)
    };

    return patterns;
  }

  /**
   * Generate insights from conversation
   */
  generateInsights(messages, userData) {
    const insights = {
      progressIndicators: this.identifyProgressIndicators(messages),
      obstaclePatterns: this.identifyObstaclePatterns(messages),
      successFactors: this.identifySuccessFactors(messages),
      supportNeeds: this.identifySupportNeeds(messages)
    };

    return insights;
  }

  /**
   * Get memory context for AI response
   */
  getMemoryContext(conversationId, currentMessage) {
    const conversationMemory = this.memoryCache.get(conversationId);
    const userPatterns = this.getUserPatterns();
    const emotionalContext = this.getEmotionalContext();
    const goalContext = this.getGoalContext();

    return {
      conversationHistory: conversationMemory?.messages || [],
      userPatterns,
      emotionalContext,
      goalContext,
      relevantMemories: this.findRelevantMemories(currentMessage),
      continuitySuggestions: this.generateContinuitySuggestions(conversationMemory, currentMessage)
    };
  }

  /**
   * Find memories relevant to current message
   */
  findRelevantMemories(currentMessage) {
    const relevantMemories = [];
    const currentTopics = this.extractTopics([{ sender: 'user', text: currentMessage }]);

    this.memoryCache.forEach((memory, conversationId) => {
      const relevance = this.calculateRelevance(currentTopics, memory.topics);
      if (relevance > 0.5) {
        relevantMemories.push({
          conversationId,
          relevance,
          memory: memory
        });
      }
    });

    return relevantMemories
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3); // Top 3 most relevant memories
  }

  /**
   * Generate continuity suggestions for AI
   */
  generateContinuitySuggestions(conversationMemory, currentMessage) {
    const suggestions = [];

    if (conversationMemory) {
      // Check for recurring themes
      const currentTopics = this.extractTopics([{ sender: 'user', text: currentMessage }]);
      const recurringTopics = conversationMemory.patterns.recurringThemes;
      
      const matchingTopics = currentTopics.filter(topic => 
        recurringTopics.includes(topic)
      );

      if (matchingTopics.length > 0) {
        suggestions.push({
          type: 'recurring_theme',
          topics: matchingTopics,
          message: `This conversation touches on recurring themes: ${matchingTopics.join(', ')}`
        });
      }

      // Check for goal continuity
      const currentGoals = this.extractGoals([{ sender: 'user', text: currentMessage }]);
      const previousGoals = conversationMemory.goals;
      
      if (currentGoals.length > 0 && previousGoals.length > 0) {
        suggestions.push({
          type: 'goal_continuity',
          currentGoals,
          previousGoals,
          message: 'User is continuing to work on previously mentioned goals'
        });
      }

      // Check for emotional patterns
      const currentEmotion = this.analyzeMessageEmotion(currentMessage);
      const emotionalPattern = conversationMemory.emotionalState;
      
      if (currentEmotion.primary === emotionalPattern.primary) {
        suggestions.push({
          type: 'emotional_pattern',
          emotion: currentEmotion.primary,
          message: `User is experiencing the same emotional state as in previous conversations`
        });
      }
    }

    return suggestions;
  }

  /**
   * Calculate relevance between current and past topics
   */
  calculateRelevance(currentTopics, pastTopics) {
    if (currentTopics.length === 0 || pastTopics.length === 0) return 0;
    
    const intersection = currentTopics.filter(topic => 
      pastTopics.includes(topic)
    );
    
    return intersection.length / Math.max(currentTopics.length, pastTopics.length);
  }

  /**
   * Analyze message emotion
   */
  analyzeMessageEmotion(text) {
    const positiveWords = ['good', 'great', 'awesome', 'excited', 'motivated', 'confident', 'happy'];
    const negativeWords = ['bad', 'terrible', 'frustrated', 'anxious', 'worried', 'sad', 'overwhelmed'];
    const neutralWords = ['okay', 'fine', 'normal', 'alright'];

    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    positiveWords.forEach(word => {
      if (textLower.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (textLower.includes(word)) negativeCount++;
    });

    neutralWords.forEach(word => {
      if (textLower.includes(word)) neutralCount++;
    });

    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      return { primary: 'positive', intensity: positiveCount / positiveWords.length };
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      return { primary: 'negative', intensity: negativeCount / negativeWords.length };
    } else {
      return { primary: 'neutral', intensity: 0.5 };
    }
  }

  /**
   * Calculate emotional intensity
   */
  calculateEmotionalIntensity(text) {
    const emotion = this.analyzeMessageEmotion(text);
    return emotion.intensity;
  }

  /**
   * Extract primary topic from message
   */
  extractPrimaryTopic(text) {
    const topics = this.extractTopics([{ sender: 'user', text }]);
    return topics.length > 0 ? topics[0] : null;
  }

  /**
   * Get most frequent emotion
   */
  getMostFrequentEmotion(emotions) {
    const counts = {};
    emotions.forEach(emotion => {
      counts[emotion.primary] = (counts[emotion.primary] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
  }

  /**
   * Calculate average intensity
   */
  calculateAverageIntensity(emotions) {
    if (emotions.length === 0) return 0;
    return emotions.reduce((sum, emotion) => sum + emotion.intensity, 0) / emotions.length;
  }

  /**
   * Analyze emotional trend
   */
  analyzeEmotionalTrend(emotions) {
    if (emotions.length < 2) return 'stable';
    
    const firstHalf = emotions.slice(0, Math.floor(emotions.length / 2));
    const secondHalf = emotions.slice(Math.floor(emotions.length / 2));
    
    const firstAvg = this.calculateAverageIntensity(firstHalf);
    const secondAvg = this.calculateAverageIntensity(secondHalf);
    
    if (secondAvg > firstAvg + 0.2) return 'improving';
    if (secondAvg < firstAvg - 0.2) return 'declining';
    return 'stable';
  }

  /**
   * Identify emotional triggers
   */
  identifyEmotionalTriggers(messages) {
    const triggers = [];
    const triggerKeywords = ['when', 'because', 'since', 'after', 'before'];
    
    messages.forEach(msg => {
      const text = msg.text || msg.content;
      triggerKeywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) {
          const triggerMatch = text.match(new RegExp(`${keyword}\\s+(.+)`, 'i'));
          if (triggerMatch) {
            triggers.push(triggerMatch[1].trim());
          }
        }
      });
    });
    
    return [...new Set(triggers)]; // Remove duplicates
  }

  /**
   * Find recurring themes
   */
  findRecurringThemes(messages) {
    const allTopics = messages
      .filter(msg => msg.sender === 'user')
      .flatMap(msg => this.extractTopics([msg]));
    
    const topicCounts = {};
    allTopics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    
    return Object.entries(topicCounts)
      .filter(([, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .map(([topic]) => topic);
  }

  /**
   * Identify emotional cycles
   */
  identifyEmotionalCycles(messages) {
    const emotions = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => this.analyzeMessageEmotion(msg.text || msg.content));
    
    const cycles = [];
    for (let i = 0; i < emotions.length - 1; i++) {
      if (emotions[i].primary !== emotions[i + 1].primary) {
        cycles.push({
          from: emotions[i].primary,
          to: emotions[i + 1].primary,
          transition: `${emotions[i].primary} → ${emotions[i + 1].primary}`
        });
      }
    }
    
    return cycles;
  }

  /**
   * Track goal mentions
   */
  trackGoalMentions(messages) {
    return this.extractGoals(messages);
  }

  /**
   * Identify challenge patterns
   */
  identifyChallengePatterns(messages) {
    const challengeKeywords = ['struggle', 'difficult', 'hard', 'challenge', 'problem', 'issue'];
    const challenges = [];
    
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        const text = msg.text || msg.content;
        challengeKeywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            challenges.push({
              challenge: keyword,
              context: text,
              timestamp: msg.timestamp
            });
          }
        });
      }
    });
    
    return challenges;
  }

  /**
   * Identify progress indicators
   */
  identifyProgressIndicators(messages) {
    const progressKeywords = ['progress', 'improvement', 'better', 'achieved', 'accomplished', 'success'];
    const indicators = [];
    
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        const text = msg.text || msg.content;
        progressKeywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            indicators.push({
              indicator: keyword,
              context: text,
              timestamp: msg.timestamp
            });
          }
        });
      }
    });
    
    return indicators;
  }

  /**
   * Identify obstacle patterns
   */
  identifyObstaclePatterns(messages) {
    const obstacleKeywords = ['can\'t', 'unable', 'blocked', 'stuck', 'obstacle', 'barrier'];
    const obstacles = [];
    
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        const text = msg.text || msg.content;
        obstacleKeywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            obstacles.push({
              obstacle: keyword,
              context: text,
              timestamp: msg.timestamp
            });
          }
        });
      }
    });
    
    return obstacles;
  }

  /**
   * Identify success factors
   */
  identifySuccessFactors(messages) {
    const successKeywords = ['worked', 'helped', 'effective', 'successful', 'breakthrough'];
    const factors = [];
    
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        const text = msg.text || msg.content;
        successKeywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            factors.push({
              factor: keyword,
              context: text,
              timestamp: msg.timestamp
            });
          }
        });
      }
    });
    
    return factors;
  }

  /**
   * Identify support needs
   */
  identifySupportNeeds(messages) {
    const supportKeywords = ['help', 'support', 'guidance', 'advice', 'suggestion'];
    const needs = [];
    
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        const text = msg.text || msg.content;
        supportKeywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            needs.push({
              need: keyword,
              context: text,
              timestamp: msg.timestamp
            });
          }
        });
      }
    });
    
    return needs;
  }

  /**
   * Update pattern cache
   */
  updatePatternCache(memory) {
    const userId = memory.conversationId.split('_')[0]; // Extract user ID from conversation ID
    const userPatterns = this.patternCache.get(userId) || {
      recurringThemes: [],
      emotionalPatterns: [],
      goalPatterns: [],
      challengePatterns: []
    };

    // Update recurring themes
    memory.patterns.recurringThemes.forEach(theme => {
      if (!userPatterns.recurringThemes.includes(theme)) {
        userPatterns.recurringThemes.push(theme);
      }
    });

    // Update emotional patterns
    if (memory.emotionalState.primary) {
      userPatterns.emotionalPatterns.push({
        emotion: memory.emotionalState.primary,
        intensity: memory.emotionalState.intensity,
        timestamp: memory.timestamp
      });
    }

    // Update goal patterns
    memory.goals.forEach(goal => {
      userPatterns.goalPatterns.push({
        goal: goal.goal,
        timestamp: goal.timestamp
      });
    });

    // Update challenge patterns
    memory.patterns.challengePatterns.forEach(challenge => {
      userPatterns.challengePatterns.push({
        challenge: challenge.challenge,
        timestamp: challenge.timestamp
      });
    });

    this.patternCache.set(userId, userPatterns);
  }

  /**
   * Update emotional history
   */
  updateEmotionalHistory(emotionalState) {
    this.emotionalHistory.push({
      ...emotionalState,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 emotional states
    if (this.emotionalHistory.length > 50) {
      this.emotionalHistory = this.emotionalHistory.slice(-50);
    }
  }

  /**
   * Update goal tracking
   */
  updateGoalTracking(goals) {
    goals.forEach(goal => {
      const goalKey = goal.goal.toLowerCase();
      const existing = this.goalTracking.get(goalKey) || [];
      existing.push({
        ...goal,
        timestamp: new Date().toISOString()
      });
      this.goalTracking.set(goalKey, existing);
    });
  }

  /**
   * Update success moments
   */
  updateSuccessMoments(messages) {
    const successMessages = messages.filter(msg => 
      msg.sender === 'user' && 
      this.analyzeMessageEmotion(msg.text || msg.content).primary === 'positive'
    );

    successMessages.forEach(msg => {
      this.successMoments.push({
        content: msg.text || msg.content,
        timestamp: msg.timestamp,
        emotionalIntensity: this.calculateEmotionalIntensity(msg.text || msg.content)
      });
    });

    // Keep only last 20 success moments
    if (this.successMoments.length > 20) {
      this.successMoments = this.successMoments.slice(-20);
    }
  }

  /**
   * Get user patterns
   */
  getUserPatterns() {
    return Array.from(this.patternCache.values());
  }

  /**
   * Get emotional context
   */
  getEmotionalContext() {
    if (this.emotionalHistory.length === 0) return null;

    const recentEmotions = this.emotionalHistory.slice(-10);
    return {
      recentTrend: this.analyzeEmotionalTrend(recentEmotions),
      dominantEmotion: this.getMostFrequentEmotion(recentEmotions),
      averageIntensity: this.calculateAverageIntensity(recentEmotions),
      emotionalStability: this.calculateEmotionalStability(recentEmotions)
    };
  }

  /**
   * Get goal context
   */
  getGoalContext() {
    const allGoals = Array.from(this.goalTracking.values()).flat();
    const recentGoals = allGoals
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    return {
      recentGoals,
      goalFrequency: this.calculateGoalFrequency(allGoals),
      goalProgress: this.assessGoalProgress(allGoals)
    };
  }

  /**
   * Calculate emotional stability
   */
  calculateEmotionalStability(emotions) {
    if (emotions.length < 2) return 1;
    
    const transitions = 0;
    for (let i = 0; i < emotions.length - 1; i++) {
      if (emotions[i].primary !== emotions[i + 1].primary) {
        transitions++;
      }
    }
    
    return 1 - (transitions / (emotions.length - 1));
  }

  /**
   * Calculate goal frequency
   */
  calculateGoalFrequency(goals) {
    const goalCounts = {};
    goals.forEach(goal => {
      const goalKey = goal.goal.toLowerCase();
      goalCounts[goalKey] = (goalCounts[goalKey] || 0) + 1;
    });
    
    return Object.entries(goalCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([goal, count]) => ({ goal, frequency: count }));
  }

  /**
   * Assess goal progress
   */
  assessGoalProgress(goals) {
    const goalProgress = {};
    
    goals.forEach(goal => {
      const goalKey = goal.goal.toLowerCase();
      if (!goalProgress[goalKey]) {
        goalProgress[goalKey] = {
          mentions: 0,
          firstMention: goal.timestamp,
          lastMention: goal.timestamp
        };
      }
      
      goalProgress[goalKey].mentions++;
      goalProgress[goalKey].lastMention = goal.timestamp;
    });
    
    return goalProgress;
  }

  /**
   * Clear memory for a specific conversation
   */
  clearConversationMemory(conversationId) {
    this.memoryCache.delete(conversationId);
  }

  /**
   * Clear all memory
   */
  clearAllMemory() {
    this.memoryCache.clear();
    this.patternCache.clear();
    this.emotionalHistory = [];
    this.goalTracking.clear();
    this.successMoments = [];
    this.conversationThreads.clear();
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return {
      conversationMemories: this.memoryCache.size,
      userPatterns: this.patternCache.size,
      emotionalHistoryLength: this.emotionalHistory.length,
      trackedGoals: this.goalTracking.size,
      successMoments: this.successMoments.length,
      conversationThreads: this.conversationThreads.size
    };
  }
}

// Export singleton instance
export const enhancedMemoryManager = new EnhancedMemoryManager(); 