/**
 * Enhanced Data Model for ReflectWithin
 * Integrated focus areas, metrics, and goal templates with smart defaults
 */

import { 
  Dumbbell, 
  Heart, 
  Brain, 
  TrendingUp, 
  Target, 
  Activity, 
  Clock, 
  Apple,
  Zap,
  Moon,
  Users,
  Palette,
  BookOpen,
  BarChart3
} from 'lucide-react';

/**
 * Enhanced Focus Areas with Goal Templates
 */
export const FOCUS_AREAS = {
  physical: {
    id: 'physical',
    title: 'Physical Health',
    description: 'Track workouts, nutrition, sleep, and body metrics',
    icon: Dumbbell,
    color: 'from-blue-500 to-cyan-500',
    metrics: {
      weight: {
        id: 'weight',
        label: 'Weight',
        unit: 'lbs',
        type: 'number',
        description: 'Track your body weight',
        goalTemplates: [
          {
            id: 'lose_weight',
            title: 'Lose Weight',
            description: 'Gradually reduce body weight in a healthy way',
            defaultTarget: 10,
            defaultUnit: 'lbs',
            defaultTimeline: '3_months',
            milestones: [5, 10],
            aiPrompts: [
              'How is your weight loss journey going?',
              'What strategies are working well for you?',
              'How do you feel about your progress so far?',
              'What challenges are you facing with your weight goal?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 50,
              minTimeline: '1_month',
              maxTimeline: '12_months'
            }
          },
          {
            id: 'maintain_weight',
            title: 'Maintain Weight',
            description: 'Keep your current weight stable',
            defaultTarget: 0,
            defaultUnit: 'lbs',
            defaultTimeline: 'ongoing',
            milestones: [30, 90, 180], // days
            aiPrompts: [
              'How is your weight maintenance going?',
              'What helps you stay consistent with your weight?',
              'How do you feel about your current weight?'
            ],
            validation: {
              minTarget: -5,
              maxTarget: 5,
              minTimeline: 'ongoing'
            }
          }
        ]
      },
      workouts: {
        id: 'workouts',
        label: 'Workouts',
        unit: 'sessions',
        type: 'frequency',
        description: 'Track your exercise sessions',
        goalTemplates: [
          {
            id: 'workout_frequency',
            title: 'Workout Regularly',
            description: 'Establish a consistent workout routine',
            defaultTarget: 3,
            defaultUnit: 'sessions/week',
            defaultTimeline: 'ongoing',
            milestones: [7, 30, 90], // days
            aiPrompts: [
              'How is your workout routine going?',
              'What types of workouts are you enjoying most?',
              'How do you feel after your workouts?',
              'What helps you stay motivated to exercise?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 7,
              minTimeline: 'ongoing'
            }
          },
          {
            id: 'increase_workouts',
            title: 'Increase Workouts',
            description: 'Gradually increase your workout frequency',
            defaultTarget: 5,
            defaultUnit: 'sessions/week',
            defaultTimeline: '2_months',
            milestones: [3, 4, 5],
            aiPrompts: [
              'How is your workout frequency increase going?',
              'What\'s helping you add more workouts?',
              'How do you feel about your increased activity?'
            ],
            validation: {
              minTarget: 2,
              maxTarget: 7,
              minTimeline: '1_month',
              maxTimeline: '6_months'
            }
          }
        ]
      },
      sleep: {
        id: 'sleep',
        label: 'Sleep',
        unit: 'hours',
        type: 'number',
        description: 'Track your sleep duration and quality',
        goalTemplates: [
          {
            id: 'improve_sleep',
            title: 'Improve Sleep',
            description: 'Get better quality and quantity of sleep',
            defaultTarget: 8,
            defaultUnit: 'hours/night',
            defaultTimeline: '1_month',
            milestones: [7, 7.5, 8],
            aiPrompts: [
              'How is your sleep improvement going?',
              'What sleep habits are working well for you?',
              'How do you feel when you get good sleep?',
              'What\'s challenging about your sleep routine?'
            ],
            validation: {
              minTarget: 6,
              maxTarget: 10,
              minTimeline: '1_month',
              maxTimeline: '3_months'
            }
          }
        ]
      },
      nutrition: {
        id: 'nutrition',
        label: 'Nutrition',
        unit: 'meals',
        type: 'frequency',
        description: 'Track your eating habits and nutrition',
        goalTemplates: [
          {
            id: 'healthy_eating',
            title: 'Eat Healthier',
            description: 'Improve your nutrition and eating habits',
            defaultTarget: 3,
            defaultUnit: 'healthy_meals/day',
            defaultTimeline: 'ongoing',
            milestones: [7, 30, 90], // days
            aiPrompts: [
              'How is your healthy eating journey going?',
              'What healthy foods are you enjoying?',
              'How do you feel when you eat well?',
              'What\'s challenging about maintaining healthy eating?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 5,
              minTimeline: 'ongoing'
            }
          }
        ]
      }
    }
  },
  mental: {
    id: 'mental',
    title: 'Mental Wellness',
    description: 'Monitor mood, stress, energy, and emotional patterns',
    icon: Heart,
    color: 'from-purple-500 to-pink-500',
    metrics: {
      mood: {
        id: 'mood',
        label: 'Mood',
        unit: 'rating',
        type: 'scale', // 1-10 scale
        description: 'Track your daily mood and emotional state',
        goalTemplates: [
          {
            id: 'improve_mood',
            title: 'Improve Mood',
            description: 'Increase your average mood rating',
            defaultTarget: 7,
            defaultUnit: 'average_rating',
            defaultTimeline: '1_month',
            milestones: [6, 7, 8],
            aiPrompts: [
              'How has your mood been lately?',
              'What activities boost your mood?',
              'What challenges are affecting your mood?',
              'How do you feel about your emotional well-being?'
            ],
            validation: {
              minTarget: 5,
              maxTarget: 10,
              minTimeline: '1_month',
              maxTimeline: '3_months'
            }
          }
        ]
      },
      stress: {
        id: 'stress',
        label: 'Stress',
        unit: 'rating',
        type: 'scale', // 1-10 scale (lower is better)
        description: 'Track your stress levels',
        goalTemplates: [
          {
            id: 'reduce_stress',
            title: 'Reduce Stress',
            description: 'Lower your stress levels and find more calm',
            defaultTarget: 4,
            defaultUnit: 'average_rating',
            defaultTimeline: '1_month',
            milestones: [6, 5, 4],
            aiPrompts: [
              'How are you managing stress lately?',
              'What stress-reduction techniques are working?',
              'What\'s causing stress in your life?',
              'How do you feel when you\'re less stressed?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 7,
              minTimeline: '1_month',
              maxTimeline: '3_months'
            }
          }
        ]
      },
      energy: {
        id: 'energy',
        label: 'Energy',
        unit: 'rating',
        type: 'scale', // 1-10 scale
        description: 'Track your daily energy levels',
        goalTemplates: [
          {
            id: 'increase_energy',
            title: 'Increase Energy',
            description: 'Boost your daily energy levels',
            defaultTarget: 7,
            defaultUnit: 'average_rating',
            defaultTimeline: '1_month',
            milestones: [6, 7, 8],
            aiPrompts: [
              'How are your energy levels lately?',
              'What gives you more energy?',
              'What drains your energy?',
              'How do you feel when you have good energy?'
            ],
            validation: {
              minTarget: 5,
              maxTarget: 10,
              minTimeline: '1_month',
              maxTimeline: '3_months'
            }
          }
        ]
      },
      meditation: {
        id: 'meditation',
        label: 'Meditation',
        unit: 'minutes',
        type: 'frequency',
        description: 'Track your mindfulness and meditation practice',
        goalTemplates: [
          {
            id: 'meditation_practice',
            title: 'Meditate Regularly',
            description: 'Establish a consistent meditation practice',
            defaultTarget: 10,
            defaultUnit: 'minutes/day',
            defaultTimeline: 'ongoing',
            milestones: [7, 30, 90], // days
            aiPrompts: [
              'How is your meditation practice going?',
              'What benefits are you noticing from meditation?',
              'What helps you maintain your meditation habit?',
              'How do you feel during and after meditation?'
            ],
            validation: {
              minTarget: 5,
              maxTarget: 60,
              minTimeline: 'ongoing'
            }
          }
        ]
      }
    }
  },
  growth: {
    id: 'growth',
    title: 'Personal Growth',
    description: 'Focus on goals, habits, learning, and self-improvement',
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    metrics: {
      goals: {
        id: 'goals',
        label: 'Goals',
        unit: 'goals',
        type: 'count',
        description: 'Track progress toward personal goals',
        goalTemplates: [
          {
            id: 'goal_achievement',
            title: 'Achieve Goals',
            description: 'Make progress toward your personal goals',
            defaultTarget: 3,
            defaultUnit: 'goals_completed',
            defaultTimeline: '6_months',
            milestones: [1, 2, 3],
            aiPrompts: [
              'How are your personal goals progressing?',
              'What steps are you taking toward your goals?',
              'What obstacles are you facing?',
              'How do you feel about your goal progress?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 10,
              minTimeline: '3_months',
              maxTimeline: '12_months'
            }
          }
        ]
      },
      habits: {
        id: 'habits',
        label: 'Habits',
        unit: 'habits',
        type: 'count',
        description: 'Track daily habits and routines',
        goalTemplates: [
          {
            id: 'build_habits',
            title: 'Build Good Habits',
            description: 'Establish positive daily habits',
            defaultTarget: 3,
            defaultUnit: 'habits_established',
            defaultTimeline: '3_months',
            milestones: [1, 2, 3],
            aiPrompts: [
              'How are your new habits developing?',
              'What habits are sticking well?',
              'What helps you maintain your habits?',
              'How do you feel about your habit progress?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 5,
              minTimeline: '1_month',
              maxTimeline: '6_months'
            }
          }
        ]
      },
      learning: {
        id: 'learning',
        label: 'Learning',
        unit: 'hours',
        type: 'frequency',
        description: 'Track time spent learning new skills',
        goalTemplates: [
          {
            id: 'learn_skills',
            title: 'Learn New Skills',
            description: 'Dedicate time to learning and development',
            defaultTarget: 5,
            defaultUnit: 'hours/week',
            defaultTimeline: 'ongoing',
            milestones: [7, 30, 90], // days
            aiPrompts: [
              'How is your learning journey going?',
              'What skills are you working on?',
              'What\'s most exciting about your learning?',
              'How do you feel about your skill development?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 20,
              minTimeline: 'ongoing'
            }
          }
        ]
      },
      productivity: {
        id: 'productivity',
        label: 'Productivity',
        unit: 'tasks',
        type: 'count',
        description: 'Track daily productivity and task completion',
        goalTemplates: [
          {
            id: 'increase_productivity',
            title: 'Increase Productivity',
            description: 'Improve your daily productivity and focus',
            defaultTarget: 5,
            defaultUnit: 'tasks_completed/day',
            defaultTimeline: '1_month',
            milestones: [3, 4, 5],
            aiPrompts: [
              'How is your productivity lately?',
              'What helps you stay focused and productive?',
              'What\'s challenging about your productivity?',
              'How do you feel when you\'re productive?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 10,
              minTimeline: '1_month',
              maxTimeline: '3_months'
            }
          }
        ]
      }
    }
  },
  lifestyle: {
    id: 'lifestyle',
    title: 'Lifestyle & Habits',
    description: 'Track routines, balance, relationships, and daily patterns',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    metrics: {
      routine: {
        id: 'routine',
        label: 'Routine',
        unit: 'days',
        type: 'streak',
        description: 'Track consistency in daily routines',
        goalTemplates: [
          {
            id: 'establish_routine',
            title: 'Establish Routine',
            description: 'Create and maintain a daily routine',
            defaultTarget: 30,
            defaultUnit: 'days_consistent',
            defaultTimeline: 'ongoing',
            milestones: [7, 14, 30],
            aiPrompts: [
              'How is your daily routine going?',
              'What parts of your routine are working well?',
              'What\'s challenging about maintaining your routine?',
              'How do you feel when you follow your routine?'
            ],
            validation: {
              minTarget: 7,
              maxTarget: 365,
              minTimeline: 'ongoing'
            }
          }
        ]
      },
      social: {
        id: 'social',
        label: 'Social',
        unit: 'interactions',
        type: 'frequency',
        description: 'Track social interactions and relationships',
        goalTemplates: [
          {
            id: 'social_connections',
            title: 'Build Social Connections',
            description: 'Strengthen relationships and social connections',
            defaultTarget: 3,
            defaultUnit: 'social_activities/week',
            defaultTimeline: 'ongoing',
            milestones: [7, 30, 90], // days
            aiPrompts: [
              'How are your social connections going?',
              'What social activities are you enjoying?',
              'How do you feel about your relationships?',
              'What helps you connect with others?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 7,
              minTimeline: 'ongoing'
            }
          }
        ]
      },
      creative: {
        id: 'creative',
        label: 'Creative',
        unit: 'hours',
        type: 'frequency',
        description: 'Track time spent on creative activities',
        goalTemplates: [
          {
            id: 'creative_time',
            title: 'Creative Time',
            description: 'Dedicate time to creative activities',
            defaultTarget: 5,
            defaultUnit: 'hours/week',
            defaultTimeline: 'ongoing',
            milestones: [7, 30, 90], // days
            aiPrompts: [
              'How is your creative time going?',
              'What creative activities are you enjoying?',
              'How do you feel when you\'re being creative?',
              'What inspires your creativity?'
            ],
            validation: {
              minTarget: 1,
              maxTarget: 20,
              minTimeline: 'ongoing'
            }
          }
        ]
      },
      balance: {
        id: 'balance',
        label: 'Balance',
        unit: 'rating',
        type: 'scale', // 1-10 scale
        description: 'Track work-life balance satisfaction',
        goalTemplates: [
          {
            id: 'improve_balance',
            title: 'Improve Balance',
            description: 'Achieve better work-life balance',
            defaultTarget: 7,
            defaultUnit: 'balance_rating',
            defaultTimeline: '1_month',
            milestones: [5, 6, 7],
            aiPrompts: [
              'How is your work-life balance lately?',
              'What helps you maintain balance?',
              'What\'s challenging about finding balance?',
              'How do you feel about your current balance?'
            ],
            validation: {
              minTarget: 5,
              maxTarget: 10,
              minTimeline: '1_month',
              maxTimeline: '3_months'
            }
          }
        ]
      }
    }
  }
};

/**
 * Enhanced Goal Structure
 */
export const EnhancedGoal = {
  id: 'string',
  userId: 'string',
  
  // Goal Definition
  title: 'string',
  description: 'string',
  category: 'physical|mental|growth|lifestyle',
  metricId: 'string', // Links to specific metric (e.g., 'weight', 'workouts')
  templateId: 'string', // Links to goal template
  
  // Measurement & Targets
  target: {
    value: 'number',
    unit: 'string', // 'lbs', 'sessions/week', 'rating', etc.
    type: 'number|frequency|scale|boolean|count|streak',
    deadline: 'date|null',
    timeline: 'ongoing|1_month|3_months|6_months|1_year|custom'
  },
  
  // Progress Tracking
  current: {
    value: 'number',
    lastUpdated: 'date',
    lastEntryId: 'string|null' // Link to journal entry that updated this
  },
  
  // Milestones & Achievements
  milestones: [{
    id: 'string',
    value: 'number',
    label: 'string',
    achieved: 'boolean',
    achievedDate: 'date|null',
    celebrated: 'boolean'
  }],
  
  // Status & Progress
  status: 'active|completed|paused|abandoned',
  progress: 'number', // 0-100 percentage
  streak: 'number', // Days of consistent progress
  totalDays: 'number', // Total days since goal creation
  
  // AI Integration
  aiContext: {
    lastMentioned: 'date|null',
    mentionCount: 'number',
    aiResponses: [{
      date: 'date',
      response: 'string',
      context: 'string'
    }],
    suggestedPrompts: 'string[]'
  },
  
  // Analytics
  analytics: {
    startValue: 'number',
    bestValue: 'number',
    averageProgress: 'number',
    consistencyScore: 'number', // 0-100
    trend: 'improving|declining|stable',
    correlationWithMood: 'number|null', // -1 to 1
    correlationWithEnergy: 'number|null'
  },
  
  // Metadata
  createdAt: 'date',
  updatedAt: 'date',
  completedAt: 'date|null'
};

/**
 * Enhanced User Data Container with Integrated Goals
 */
export const createEnhancedUserDataContainer = (userId, userProfile) => {
  return {
    profile: {
      ...userProfile,
      id: userId,
      createdAt: new Date(),
      lastLogin: new Date()
    },
    
    // Focus Areas & Metrics (Enhanced)
    focusAreas: {
      id: `focus_${userId}`,
      userId,
      selectedAreas: [], // ['physical', 'mental', 'growth', 'lifestyle']
      metrics: {}, // Selected metrics by category
      preferences: {
        trackingFrequency: 'daily|weekly|monthly',
        reminders: ['daily', 'weekly', 'monthly'],
        aiFeatures: ['insights', 'questions', 'goal_support']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Enhanced Goals System
    goals: {
      id: `goals_${userId}`,
      userId,
      activeGoals: [], // EnhancedGoal[]
      completedGoals: [], // EnhancedGoal[]
      goalTemplates: [], // Saved goal templates
      preferences: {
        goalReviewFrequency: 'weekly|monthly',
        milestoneCelebrations: 'boolean',
        aiGoalSupport: 'boolean',
        progressNotifications: 'boolean'
      },
      analytics: {
        totalGoals: 0,
        completedGoals: 0,
        averageCompletionTime: 0,
        successRate: 0,
        mostSuccessfulCategory: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Enhanced Tracking Data
    trackingData: [], // Enhanced with goal correlation
    
    // Journal Entries (Enhanced with goal mentions)
    journalEntries: [],
    
    // Analytics (Enhanced with goal insights)
    analytics: [],
    
    metadata: {
      version: '3.0.0',
      lastSync: new Date(),
      dataSize: 0,
      backupDate: null
    }
  };
};

/**
 * Utility Functions
 */
export const getFocusAreaById = (areaId) => {
  return FOCUS_AREAS[areaId] || null;
};

export const getMetricById = (areaId, metricId) => {
  const area = FOCUS_AREAS[areaId];
  return area?.metrics[metricId] || null;
};

export const getGoalTemplateById = (areaId, metricId, templateId) => {
  const metric = getMetricById(areaId, metricId);
  return metric?.goalTemplates?.find(t => t.id === templateId) || null;
};

export const getAvailableGoalTemplates = (selectedAreas) => {
  const templates = [];
  
  selectedAreas.forEach(areaId => {
    const area = FOCUS_AREAS[areaId];
    if (area) {
      Object.entries(area.metrics).forEach(([metricId, metric]) => {
        metric.goalTemplates.forEach(template => {
          templates.push({
            ...template,
            areaId,
            metricId,
            category: areaId,
            areaTitle: area.title,
            metricTitle: metric.label
          });
        });
      });
    }
  });
  
  return templates;
};

export const validateGoal = (goal, template) => {
  const validation = template.validation;
  const errors = [];
  
  if (goal.target.value < validation.minTarget || goal.target.value > validation.maxTarget) {
    errors.push(`Target should be between ${validation.minTarget} and ${validation.maxTarget}`);
  }
  
  if (validation.minTimeline && goal.target.timeline === 'custom') {
    // Add timeline validation logic
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 