/**
 * AI Model Analyzer - Node.js Version
 * CommonJS version for server-side testing
 */

/**
 * Test scenarios for AI model evaluation
 */
const TEST_SCENARIOS = {
  // Fitness & Wellness Scenarios
  fitness: [
    {
      name: "Progress Frustration",
      userInput: "I've been working out for 3 months but I'm not seeing the results I want. I feel like I'm wasting my time.",
      expectedQualities: ['empathy', 'practical_advice', 'motivation']
    },
    {
      name: "Workout Consistency",
      userInput: "I keep starting workout routines but then I fall off after a few weeks. I don't know how to stay consistent.",
      expectedQualities: ['empathy', 'practical_advice', 'pattern_recognition']
    },
    {
      name: "Injury Recovery",
      userInput: "I hurt my shoulder during CrossFit last week and I'm worried about losing my progress while I recover.",
      expectedQualities: ['empathy', 'domain_knowledge', 'practical_advice']
    }
  ],

  // Emotional Support Scenarios
  emotional: [
    {
      name: "Work Stress",
      userInput: "Work has been incredibly stressful lately. I feel overwhelmed and like I can't keep up with everything.",
      expectedQualities: ['empathy', 'emotional_support', 'practical_advice']
    },
    {
      name: "Loneliness",
      userInput: "I've been feeling really lonely lately. I have friends but I don't feel like anyone really understands me.",
      expectedQualities: ['empathy', 'emotional_support', 'validation']
    },
    {
      name: "Decision Uncertainty",
      userInput: "I'm trying to decide whether to change careers but I'm terrified of making the wrong choice. What if I fail?",
      expectedQualities: ['empathy', 'guidance', 'encouragement']
    }
  ],

  // Goal Setting Scenarios
  goals: [
    {
      name: "Goal Uncertainty",
      userInput: "I want to set some goals but I don't even know what I want anymore. Everything feels so uncertain.",
      expectedQualities: ['empathy', 'guidance', 'reflection_prompts']
    },
    {
      name: "Achievement Failure",
      userInput: "I set a goal to run a marathon but I got injured during training. I feel like such a failure.",
      expectedQualities: ['empathy', 'reframing', 'motivation']
    }
  ],

  // Contextual Awareness Scenarios
  contextual: [
    {
      name: "Recurring Pattern",
      conversation: [
        { role: "user", content: "I always get stressed about work on Sundays." },
        { role: "assistant", content: "That's a common pattern. What do you think triggers that Sunday stress?" },
        { role: "user", content: "I think it's because I'm not prepared for Monday. I always feel behind." }
      ],
      expectedQualities: ['pattern_recognition', 'context_continuity', 'practical_advice']
    },
    {
      name: "Multi-turn Conversation",
      conversation: [
        { role: "user", content: "I had a really good workout today." },
        { role: "assistant", content: "That's great! What made it feel so good?" },
        { role: "user", content: "I finally hit my deadlift PR that I've been working toward for months." },
        { role: "assistant", content: "That's amazing! How did it feel when you finally got it?" },
        { role: "user", content: "Actually, I'm feeling a bit sore now. My lower back is tight." }
      ],
      expectedQualities: ['context_continuity', 'empathy', 'domain_knowledge']
    }
  ],

  // Personality & Tone Scenarios
  personality: [
    {
      name: "Bad Day Support",
      userInput: "Today was just awful. Everything went wrong and I feel like giving up.",
      expectedQualities: ['empathy', 'emotional_support', 'encouragement']
    },
    {
      name: "Need to Talk",
      userInput: "I just need someone to talk to. I've been keeping everything bottled up.",
      expectedQualities: ['empathy', 'validation', 'active_listening']
    }
  ]
};

/**
 * Quality metrics for AI response evaluation
 */
const QUALITY_METRICS = {
  empathy: {
    keywords: ['understand', 'hear', 'feel', 'sounds', 'challenging', 'difficult', 'hard'],
    weight: 0.25
  },
  questions: {
    keywords: ['what', 'how', 'why', 'when', 'where', 'tell me', 'can you'],
    weight: 0.20
  },
  domain_knowledge: {
    keywords: ['workout', 'fitness', 'exercise', 'recovery', 'stress', 'wellness', 'mindfulness'],
    weight: 0.20
  },
  tone: {
    positive_words: ['supportive', 'encouraging', 'helpful', 'caring', 'warm'],
    negative_words: ['judgmental', 'critical', 'harsh', 'cold'],
    weight: 0.15
  },
  length: {
    min_words: 15,
    max_words: 100,
    weight: 0.10
  }
};

/**
 * Analyze AI response quality
 */
const analyzeResponseQuality = (response, expectedQualities = []) => {
  const analysis = {
    overallScore: 0,
    qualityScores: {},
    strengths: [],
    weaknesses: [],
    recommendations: []
  };

  // Analyze each quality metric
  const qualityScores = {
    empathy: analyzeEmpathy(response),
    questions: analyzeQuestionQuality(response),
    domainKnowledge: analyzeDomainKnowledge(response),
    tone: analyzeTone(response),
    length: analyzeResponseLength(response)
  };

  // Add specific quality checks based on expected qualities
  expectedQualities.forEach(quality => {
    switch (quality) {
      case 'pattern_recognition':
        qualityScores.pattern_recognition = analyzePatternRecognition(response);
        break;
      case 'context_continuity':
        qualityScores.context_continuity = analyzeContextContinuity(response);
        break;
      case 'practical_advice':
        qualityScores.practical_advice = analyzePracticalAdvice(response);
        break;
      case 'motivation':
        qualityScores.motivation = analyzeMotivation(response);
        break;
      case 'emotional_support':
        qualityScores.emotional_support = analyzeEmotionalSupport(response);
        break;
      case 'guidance':
        qualityScores.guidance = analyzeGuidance(response);
        break;
      case 'validation':
        qualityScores.validation = analyzeValidation(response);
        break;
      case 'encouragement':
        qualityScores.encouragement = analyzeEncouragement(response);
        break;
      case 'reflection_prompts':
        qualityScores.reflection_prompts = analyzeReflectionPrompts(response);
        break;
      case 'reframing':
        qualityScores.reframing = analyzeReframing(response);
        break;
      case 'active_listening':
        qualityScores.active_listening = analyzeActiveListening(response);
        break;
    }
  });

  // Calculate overall score
  const totalWeight = Object.values(QUALITY_METRICS).reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = Object.entries(qualityScores).reduce((score, [quality, value]) => {
    const weight = QUALITY_METRICS[quality]?.weight || 0.1;
    return score + (value * weight);
  }, 0);

  analysis.overallScore = weightedScore / totalWeight;
  analysis.qualityScores = qualityScores;

  // Identify strengths and weaknesses
  Object.entries(qualityScores).forEach(([quality, score]) => {
    if (score > 0.7) {
      analysis.strengths.push(quality);
    } else if (score < 0.5) {
      analysis.weaknesses.push(quality);
    }
  });

  // Generate recommendations
  analysis.recommendations = generateRecommendations(qualityScores, expectedQualities);

  return analysis;
};

// Helper functions for quality analysis
const analyzeResponseLength = (response) => {
  const words = response.split(' ').length;
  if (words >= QUALITY_METRICS.length.min_words && words <= QUALITY_METRICS.length.max_words) {
    return 1.0;
  } else if (words < QUALITY_METRICS.length.min_words) {
    return words / QUALITY_METRICS.length.min_words;
  } else {
    return Math.max(0, 1 - (words - QUALITY_METRICS.length.max_words) / 50);
  }
};

const analyzeEmpathy = (response) => {
  const responseLower = response.toLowerCase();
  const empathyKeywords = QUALITY_METRICS.empathy.keywords;
  const matches = empathyKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length / 3);
};

const analyzeQuestionQuality = (response) => {
  const responseLower = response.toLowerCase();
  const questionKeywords = QUALITY_METRICS.questions.keywords;
  const matches = questionKeywords.filter(keyword => responseLower.includes(keyword));
  
  // Check for open-ended questions
  const openEndedQuestions = (response.match(/\?/g) || []).length;
  const hasOpenEnded = responseLower.includes('what') || responseLower.includes('how') || responseLower.includes('why');
  
  let score = matches.length * 0.2;
  if (openEndedQuestions > 0) score += 0.3;
  if (hasOpenEnded) score += 0.2;
  
  return Math.min(1.0, score);
};

const analyzeDomainKnowledge = (response) => {
  const responseLower = response.toLowerCase();
  const domainKeywords = QUALITY_METRICS.domain_knowledge.keywords;
  const matches = domainKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length / 2);
};

const analyzeTone = (response) => {
  const responseLower = response.toLowerCase();
  const positiveWords = QUALITY_METRICS.tone.positive_words;
  const negativeWords = QUALITY_METRICS.tone.negative_words;
  
  const positiveMatches = positiveWords.filter(word => responseLower.includes(word)).length;
  const negativeMatches = negativeWords.filter(word => responseLower.includes(word)).length;
  
  let score = positiveMatches * 0.2;
  score -= negativeMatches * 0.3;
  
  return Math.max(0, Math.min(1.0, score + 0.5));
};

// Additional quality analysis functions
const analyzePatternRecognition = (response) => {
  const responseLower = response.toLowerCase();
  const patternKeywords = ['pattern', 'recurring', 'often', 'always', 'usually', 'tend to', 'seems like'];
  const matches = patternKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.3);
};

const analyzeContextContinuity = (response) => {
  const responseLower = response.toLowerCase();
  const contextKeywords = ['earlier', 'before', 'mentioned', 'said', 'talked about', 'we discussed'];
  const matches = contextKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.3);
};

const analyzePracticalAdvice = (response) => {
  const responseLower = response.toLowerCase();
  const adviceKeywords = ['try', 'suggest', 'recommend', 'could', 'might', 'consider', 'practice'];
  const matches = adviceKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeMotivation = (response) => {
  const responseLower = response.toLowerCase();
  const motivationKeywords = ['can', 'will', 'able', 'capable', 'strength', 'progress', 'improve'];
  const matches = motivationKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeEmotionalSupport = (response) => {
  const responseLower = response.toLowerCase();
  const supportKeywords = ['support', 'here', 'with you', 'understand', 'valid', 'normal'];
  const matches = supportKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeGuidance = (response) => {
  const responseLower = response.toLowerCase();
  const guidanceKeywords = ['think about', 'consider', 'explore', 'reflect', 'ask yourself'];
  const matches = guidanceKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeValidation = (response) => {
  const responseLower = response.toLowerCase();
  const validationKeywords = ['valid', 'normal', 'understandable', 'makes sense', 'reasonable'];
  const matches = validationKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeEncouragement = (response) => {
  const responseLower = response.toLowerCase();
  const encouragementKeywords = ['great', 'good', 'excellent', 'amazing', 'proud', 'impressive'];
  const matches = encouragementKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeReflectionPrompts = (response) => {
  const responseLower = response.toLowerCase();
  const reflectionKeywords = ['what', 'how', 'why', 'when', 'where', 'tell me more'];
  const matches = reflectionKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeReframing = (response) => {
  const responseLower = response.toLowerCase();
  const reframingKeywords = ['but', 'however', 'on the other hand', 'another way', 'different perspective'];
  const matches = reframingKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const analyzeActiveListening = (response) => {
  const responseLower = response.toLowerCase();
  const listeningKeywords = ['hear', 'sounds like', 'seems', 'feel', 'experience'];
  const matches = listeningKeywords.filter(keyword => responseLower.includes(keyword));
  return Math.min(1.0, matches.length * 0.2);
};

const generateRecommendations = (qualityScores, expectedQualities) => {
  const recommendations = [];
  
  // General recommendations
  if (qualityScores.empathy < 0.6) {
    recommendations.push("Add more empathy indicators like 'I hear you' or 'That sounds challenging'");
  }
  
  // Question recommendations
  if (qualityScores.questions < 0.6) {
    recommendations.push("Include more open-ended questions to encourage deeper reflection");
  }
  
  // Domain knowledge recommendations
  if (qualityScores.domainKnowledge < 0.6) {
    recommendations.push("Incorporate more fitness and wellness terminology and practical advice");
  }
  
  // Tone recommendations
  if (qualityScores.tone < 0.6) {
    recommendations.push("Use more supportive and encouraging language");
  }
  
  // Specific quality recommendations
  expectedQualities.forEach(quality => {
    if (!qualityScores[quality] || qualityScores[quality] < 0.6) {
      switch (quality) {
        case 'pattern_recognition':
          recommendations.push("Add pattern recognition to identify recurring themes in user conversations");
          break;
        case 'context_continuity':
          recommendations.push("Improve context awareness to reference previous parts of conversations");
          break;
        case 'practical_advice':
          recommendations.push("Provide more actionable and practical suggestions");
          break;
        case 'motivation':
          recommendations.push("Include more motivational and encouraging language");
          break;
      }
    }
  });
  
  return recommendations;
};

/**
 * Test AI model with scenarios
 */
const testAIModel = async (scenarios, aiResponseFunction) => {
  const results = {
    overallScore: 0,
    categoryScores: {},
    detailedResults: [],
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      averageScore: 0
    }
  };

  let totalScore = 0;
  let totalTests = 0;

  for (const [category, categoryScenarios] of Object.entries(scenarios)) {
    const categoryResults = [];
    let categoryScore = 0;

    for (const scenario of categoryScenarios) {
      try {
        let aiResponse;
        
        if (scenario.conversation) {
          // Multi-turn conversation
          aiResponse = await aiResponseFunction(scenario.conversation);
        } else {
          // Single turn
          aiResponse = await aiResponseFunction([{ role: "user", content: scenario.userInput }]);
        }

        const analysis = analyzeResponseQuality(aiResponse, scenario.expectedQualities);
        
        const result = {
          scenario: scenario.name,
          userInput: scenario.userInput || scenario.conversation,
          aiResponse,
          analysis,
          passed: analysis.overallScore > 0.7
        };

        categoryResults.push(result);
        categoryScore += analysis.overallScore;
        totalScore += analysis.overallScore;
        totalTests++;

        if (result.passed) {
          results.summary.passedTests++;
        } else {
          results.summary.failedTests++;
        }

      } catch (error) {
        console.error(`Error testing scenario ${scenario.name}:`, error);
        
        const result = {
          scenario: scenario.name,
          userInput: scenario.userInput || scenario.conversation,
          aiResponse: "Error occurred",
          analysis: { overallScore: 0, qualityScores: {}, strengths: [], weaknesses: [], recommendations: [] },
          passed: false,
          error: error.message
        };

        categoryResults.push(result);
        totalTests++;
        results.summary.failedTests++;
      }
    }

    results.categoryScores[category] = categoryScore / categoryScenarios.length;
    results.detailedResults.push({
      category,
      scenarios: categoryResults,
      averageScore: categoryScore / categoryScenarios.length
    });
  }

  results.overallScore = totalScore / totalTests;
  results.summary.totalTests = totalTests;
  results.summary.averageScore = results.overallScore;

  return results;
};

/**
 * Generate detailed test report
 */
const generateTestReport = (testResults) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: testResults.summary,
    overallScore: testResults.overallScore,
    categoryBreakdown: {},
    strengths: [],
    weaknesses: [],
    recommendations: [],
    detailedResults: testResults.detailedResults
  };

  // Analyze category performance
  Object.entries(testResults.categoryScores).forEach(([category, score]) => {
    report.categoryBreakdown[category] = {
      score: Math.round(score * 100),
      performance: score > 0.8 ? 'Excellent' : score > 0.6 ? 'Good' : score > 0.4 ? 'Fair' : 'Needs Improvement'
    };
  });

  // Collect all strengths and weaknesses
  const allStrengths = [];
  const allWeaknesses = [];
  const allRecommendations = [];

  testResults.detailedResults.forEach(categoryResult => {
    categoryResult.scenarios.forEach(scenario => {
      allStrengths.push(...scenario.analysis.strengths);
      allWeaknesses.push(...scenario.analysis.weaknesses);
      allRecommendations.push(...scenario.analysis.recommendations);
    });
  });

  // Get most common strengths and weaknesses
  const strengthCounts = {};
  const weaknessCounts = {};

  allStrengths.forEach(strength => {
    strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
  });

  allWeaknesses.forEach(weakness => {
    weaknessCounts[weakness] = (weaknessCounts[weakness] || 0) + 1;
  });

  report.strengths = Object.entries(strengthCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([strength, count]) => ({ strength, frequency: count }));

  report.weaknesses = Object.entries(weaknessCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([weakness, count]) => ({ weakness, frequency: count }));

  // Get unique recommendations
  report.recommendations = [...new Set(allRecommendations)];

  return report;
};

// CommonJS exports
module.exports = {
  TEST_SCENARIOS,
  analyzeResponseQuality,
  testAIModel,
  generateTestReport
}; 