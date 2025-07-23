/**
 * Enhanced Memory Manager for Backend
 * Provides sophisticated multi-turn memory capabilities for AI responses
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
class EnhancedMemoryManager {
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
    if (!messages || messages.length === 0) return [];

    // Extract the most recent and important messages
    const keyMessages = messages
      .filter(msg => {
        const content = msg.content || msg.text || '';
        return content.length > 10; // Filter out very short messages
      })
      .slice(-MEMORY_TYPES.CONVERSATION_HISTORY.maxItems)
      .map(msg => ({
        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
        content: msg.content || msg.text || '',
        timestamp: msg.timestamp || new Date().toISOString()
      }));

    return keyMessages;
  }

  /**
   * Analyze emotional state from messages
   */
  analyzeEmotionalState(messages) {
    if (!messages || messages.length === 0) return { primary: 'neutral', confidence: 0.5 };

    const emotionalKeywords = {
      positive: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'proud', 'motivated', 'energized'],
      negative: ['sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'overwhelmed', 'tired'],
      neutral: ['okay', 'fine', 'alright', 'neutral', 'calm', 'focused']
    };

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let totalMessages = 0;

    messages.forEach(msg => {
      const content = (msg.content || msg.text || '').toLowerCase();
      totalMessages++;

      Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            if (emotion === 'positive') positiveCount++;
            else if (emotion === 'negative') negativeCount++;
            else if (emotion === 'neutral') neutralCount++;
          }
        });
      });
    });

    let primary = 'neutral';
    let confidence = 0.5;

    if (totalMessages > 0) {
      const positiveRatio = positiveCount / totalMessages;
      const negativeRatio = negativeCount / totalMessages;
      const neutralRatio = neutralCount / totalMessages;

      if (positiveRatio > negativeRatio && positiveRatio > neutralRatio) {
        primary = 'positive';
        confidence = positiveRatio;
      } else if (negativeRatio > positiveRatio && negativeRatio > neutralRatio) {
        primary = 'negative';
        confidence = negativeRatio;
      } else {
        primary = 'neutral';
        confidence = neutralRatio;
      }
    }

    return { primary, confidence, totalMessages };
  }

  /**
   * Extract topics from messages
   */
  extractTopics(messages) {
    if (!messages || messages.length === 0) return [];

    const topics = new Set();
    const topicKeywords = {
      'fitness': ['workout', 'exercise', 'gym', 'run', 'train', 'fitness', 'strength', 'cardio'],
      'goals': ['goal', 'target', 'achieve', 'success', 'progress', 'improve'],
      'stress': ['stress', 'anxiety', 'worried', 'overwhelmed', 'pressure', 'tension'],
      'motivation': ['motivated', 'inspired', 'encouraged', 'determined', 'focused'],
      'consistency': ['consistent', 'routine', 'habit', 'regular', 'daily'],
      'recovery': ['rest', 'recovery', 'sore', 'tired', 'rest', 'sleep'],
      'nutrition': ['diet', 'food', 'nutrition', 'eating', 'meal', 'protein'],
      'mental_health': ['mental', 'mind', 'thoughts', 'feelings', 'emotions', 'mood']
    };

    messages.forEach(msg => {
      const content = (msg.content || msg.text || '').toLowerCase();
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            topics.add(topic);
          }
        });
      });
    });

    return Array.from(topics);
  }

  /**
   * Extract goals from messages
   */
  extractGoals(messages) {
    if (!messages || messages.length === 0) return [];

    const goals = [];
    const goalPatterns = [
      /i want to (.+)/i,
      /i'm trying to (.+)/i,
      /my goal is to (.+)/i,
      /i hope to (.+)/i,
      /i'm working on (.+)/i
    ];

    messages.forEach(msg => {
      const content = msg.content || msg.text || '';
      
      goalPatterns.forEach(pattern => {
        const match = content.match(pattern);
        if (match && match[1]) {
          goals.push({
            goal: match[1].trim(),
            timestamp: msg.timestamp || new Date().toISOString(),
            source: 'conversation'
          });
        }
      });
    });

    return goals.slice(-MEMORY_TYPES.GOAL_PROGRESS.maxItems);
  }

  /**
   * Identify patterns in messages
   */
  identifyPatterns(messages) {
    if (!messages || messages.length === 0) return [];

    const patterns = [];
    
    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns(messages);
    if (timePatterns.length > 0) {
      patterns.push(...timePatterns);
    }

    // Emotional patterns
    const emotionalPatterns = this.analyzeEmotionalPatterns(messages);
    if (emotionalPatterns.length > 0) {
      patterns.push(...emotionalPatterns);
    }

    // Behavioral patterns
    const behavioralPatterns = this.analyzeBehavioralPatterns(messages);
    if (behavioralPatterns.length > 0) {
      patterns.push(...behavioralPatterns);
    }

    return patterns.slice(-MEMORY_TYPES.BEHAVIORAL_PATTERNS.maxItems);
  }

  /**
   * Analyze time-based patterns
   */
  analyzeTimePatterns(messages) {
    const patterns = [];
    const timeKeywords = ['morning', 'evening', 'night', 'afternoon', 'today', 'yesterday', 'weekend'];
    
    messages.forEach(msg => {
      const content = (msg.content || msg.text || '').toLowerCase();
      timeKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          patterns.push({
            type: 'time',
            pattern: keyword,
            timestamp: msg.timestamp || new Date().toISOString()
          });
        }
      });
    });

    return patterns;
  }

  /**
   * Analyze emotional patterns
   */
  analyzeEmotionalPatterns(messages) {
    const patterns = [];
    const emotionalKeywords = {
      'stress_cycle': ['stressed', 'overwhelmed', 'anxious'],
      'motivation_cycle': ['motivated', 'inspired', 'determined'],
      'frustration_cycle': ['frustrated', 'angry', 'disappointed']
    };

    messages.forEach(msg => {
      const content = (msg.content || msg.text || '').toLowerCase();
      
      Object.entries(emotionalKeywords).forEach(([pattern, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            patterns.push({
              type: 'emotional',
              pattern: pattern,
              keyword: keyword,
              timestamp: msg.timestamp || new Date().toISOString()
            });
          }
        });
      });
    });

    return patterns;
  }

  /**
   * Analyze behavioral patterns
   */
  analyzeBehavioralPatterns(messages) {
    const patterns = [];
    const behavioralKeywords = {
      'consistency_struggle': ['keep starting', 'fall off', 'inconsistent', 'struggle'],
      'motivation_boost': ['feeling good', 'breakthrough', 'progress', 'achievement'],
      'goal_setting': ['new goal', 'want to', 'trying to', 'working on']
    };

    messages.forEach(msg => {
      const content = (msg.content || msg.text || '').toLowerCase();
      
      Object.entries(behavioralKeywords).forEach(([pattern, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            patterns.push({
              type: 'behavioral',
              pattern: pattern,
              keyword: keyword,
              timestamp: msg.timestamp || new Date().toISOString()
            });
          }
        });
      });
    });

    return patterns;
  }

  /**
   * Generate insights from messages and user data
   */
  generateInsights(messages, userData) {
    const insights = {
      conversationLength: messages.length,
      averageMessageLength: this.calculateAverageMessageLength(messages),
      emotionalTrend: this.calculateEmotionalTrend(messages),
      topicDiversity: this.calculateTopicDiversity(messages),
      engagementLevel: this.calculateEngagementLevel(messages)
    };

    if (userData) {
      insights.userContext = {
        hasGoals: userData.goals && userData.goals.length > 0,
        hasWorkouts: userData.workouts && userData.workouts.length > 0,
        hasJournalEntries: userData.journalEntries && userData.journalEntries.length > 0
      };
    }

    return insights;
  }

  /**
   * Calculate average message length
   */
  calculateAverageMessageLength(messages) {
    if (!messages || messages.length === 0) return 0;
    
    const totalLength = messages.reduce((sum, msg) => {
      return sum + (msg.content || msg.text || '').length;
    }, 0);
    
    return Math.round(totalLength / messages.length);
  }

  /**
   * Calculate emotional trend
   */
  calculateEmotionalTrend(messages) {
    if (!messages || messages.length < 2) return 'stable';
    
    const recentMessages = messages.slice(-5);
    const emotionalStates = recentMessages.map(msg => 
      this.analyzeEmotionalState([msg]).primary
    );
    
    const positiveCount = emotionalStates.filter(state => state === 'positive').length;
    const negativeCount = emotionalStates.filter(state => state === 'negative').length;
    
    if (positiveCount > negativeCount) return 'improving';
    if (negativeCount > positiveCount) return 'declining';
    return 'stable';
  }

  /**
   * Calculate topic diversity
   */
  calculateTopicDiversity(messages) {
    const topics = this.extractTopics(messages);
    return topics.length;
  }

  /**
   * Calculate engagement level
   */
  calculateEngagementLevel(messages) {
    if (!messages || messages.length === 0) return 'low';
    
    const avgLength = this.calculateAverageMessageLength(messages);
    const topicDiversity = this.calculateTopicDiversity(messages);
    
    if (avgLength > 50 && topicDiversity > 2) return 'high';
    if (avgLength > 30 && topicDiversity > 1) return 'medium';
    return 'low';
  }

  /**
   * Update pattern cache
   */
  updatePatternCache(memory) {
    memory.patterns.forEach(pattern => {
      const key = `${pattern.type}:${pattern.pattern}`;
      if (!this.patternCache.has(key)) {
        this.patternCache.set(key, []);
      }
      this.patternCache.get(key).push(pattern);
    });
  }

  /**
   * Update emotional history
   */
  updateEmotionalHistory(emotionalState) {
    this.emotionalHistory.push({
      ...emotionalState,
      timestamp: new Date().toISOString()
    });
    
    // Keep only recent history
    if (this.emotionalHistory.length > MEMORY_TYPES.EMOTIONAL_PATTERNS.maxItems) {
      this.emotionalHistory = this.emotionalHistory.slice(-MEMORY_TYPES.EMOTIONAL_PATTERNS.maxItems);
    }
  }

  /**
   * Update goal tracking
   */
  updateGoalTracking(goals) {
    goals.forEach(goal => {
      const key = goal.goal.toLowerCase();
      if (!this.goalTracking.has(key)) {
        this.goalTracking.set(key, []);
      }
      this.goalTracking.get(key).push(goal);
    });
  }

  /**
   * Update success moments
   */
  updateSuccessMoments(messages) {
    const successKeywords = ['achieved', 'completed', 'succeeded', 'reached', 'accomplished', 'breakthrough'];
    
    messages.forEach(msg => {
      const content = (msg.content || msg.text || '').toLowerCase();
      successKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          this.successMoments.push({
            moment: content,
            timestamp: msg.timestamp || new Date().toISOString()
          });
        }
      });
    });
    
    // Keep only recent success moments
    if (this.successMoments.length > MEMORY_TYPES.SUCCESS_MOMENTS.maxItems) {
      this.successMoments = this.successMoments.slice(-MEMORY_TYPES.SUCCESS_MOMENTS.maxItems);
    }
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
    const currentTopics = this.extractTopics([{ content: currentMessage }]);

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
   * Calculate relevance between current and past topics
   */
  calculateRelevance(currentTopics, pastTopics) {
    if (!currentTopics.length || !pastTopics.length) return 0;
    
    const intersection = currentTopics.filter(topic => 
      pastTopics.includes(topic)
    );
    
    return intersection.length / Math.max(currentTopics.length, pastTopics.length);
  }

  /**
   * Generate continuity suggestions
   */
  generateContinuitySuggestions(conversationMemory, currentMessage) {
    const suggestions = [];
    
    if (!conversationMemory) return suggestions;

    // Check for goal continuity
    if (conversationMemory.goals.length > 0) {
      const recentGoal = conversationMemory.goals[conversationMemory.goals.length - 1];
      suggestions.push({
        type: 'goal_continuity',
        suggestion: `Continue working on: ${recentGoal.goal}`,
        relevance: 0.8
      });
    }

    // Check for emotional continuity
    if (conversationMemory.emotionalState.primary !== 'neutral') {
      suggestions.push({
        type: 'emotional_continuity',
        suggestion: `Address ${conversationMemory.emotionalState.primary} emotional state`,
        relevance: 0.7
      });
    }

    // Check for pattern continuity
    if (conversationMemory.patterns.length > 0) {
      const recentPattern = conversationMemory.patterns[conversationMemory.patterns.length - 1];
      suggestions.push({
        type: 'pattern_continuity',
        suggestion: `Address recurring pattern: ${recentPattern.pattern}`,
        relevance: 0.6
      });
    }

    return suggestions.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get user patterns
   */
  getUserPatterns() {
    const patterns = [];
    
    this.patternCache.forEach((patternList, key) => {
      if (patternList.length > 1) {
        patterns.push({
          type: key.split(':')[0],
          pattern: key.split(':')[1],
          frequency: patternList.length,
          lastSeen: patternList[patternList.length - 1].timestamp
        });
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get emotional context
   */
  getEmotionalContext() {
    if (this.emotionalHistory.length === 0) return null;

    const recentEmotions = this.emotionalHistory.slice(-5);
    const primaryEmotions = recentEmotions.map(e => e.primary);
    
    const positiveCount = primaryEmotions.filter(e => e === 'positive').length;
    const negativeCount = primaryEmotions.filter(e => e === 'negative').length;
    const neutralCount = primaryEmotions.filter(e => e === 'neutral').length;

    return {
      recentTrend: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral',
      stability: Math.max(positiveCount, negativeCount, neutralCount) / recentEmotions.length,
      dominantEmotion: primaryEmotions[primaryEmotions.length - 1]
    };
  }

  /**
   * Get goal context
   */
  getGoalContext() {
    const goals = [];
    
    this.goalTracking.forEach((goalList, goalText) => {
      goals.push({
        goal: goalText,
        frequency: goalList.length,
        lastMentioned: goalList[goalList.length - 1].timestamp,
        progress: this.assessGoalProgress(goalText)
      });
    });

    return goals.sort((a, b) => new Date(b.lastMentioned) - new Date(a.lastMentioned));
  }

  /**
   * Assess goal progress
   */
  assessGoalProgress(goalText) {
    // Simple progress assessment based on recent mentions
    const goalList = this.goalTracking.get(goalText);
    if (!goalList || goalList.length < 2) return 'new';

    const recentMentions = goalList.slice(-3);
    const timeSpan = new Date(recentMentions[recentMentions.length - 1].timestamp) - 
                    new Date(recentMentions[0].timestamp);
    
    if (timeSpan < 7 * 24 * 60 * 60 * 1000) { // Less than a week
      return 'active';
    } else if (timeSpan < 30 * 24 * 60 * 60 * 1000) { // Less than a month
      return 'ongoing';
    } else {
      return 'stale';
    }
  }

  /**
   * Clear conversation memory
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
const enhancedMemoryManager = new EnhancedMemoryManager();

module.exports = {
  EnhancedMemoryManager,
  enhancedMemoryManager,
  MEMORY_TYPES
}; 