/**
 * Demo Mode Utility for ReflectWithin
 * Provides sample data and demo functionality for users to experience the app without authentication
 */

// Demo user data
export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@reflectwithin.com',
  name: 'Demo User',
  isDemo: true
};

// Sample conversations for demo mode
export const DEMO_CONVERSATIONS = [
  {
    id: 'demo-conversation-1',
    title: 'Feeling Stressed About Work',
    messages: [
      {
        id: 'demo-msg-1',
        sender: 'user',
        content: "I'm feeling really overwhelmed with work lately. There's just so much to do and I feel like I'm falling behind.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        type: 'text'
      },
      {
        id: 'demo-msg-2',
        sender: 'ai',
        content: "That sounds really challenging, and it's completely normal to feel overwhelmed when work piles up. Can you tell me more about what specifically is making you feel like you're falling behind? Sometimes breaking it down helps us see what's really urgent versus what can wait.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(), // 30 seconds later
        type: 'text'
      },
      {
        id: 'demo-msg-3',
        sender: 'user',
        content: "I have three big projects due this week, and my manager keeps adding more tasks. I feel like I can't say no, but I'm already working late every day.",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
        type: 'text'
      },
      {
        id: 'demo-msg-4',
        sender: 'ai',
        content: "That's a really tough situation. It sounds like you're dealing with both workload pressure and boundary-setting challenges. Have you considered having a conversation with your manager about priorities? Sometimes managers don't realize the full impact of adding tasks when someone is already at capacity. What would it feel like to have that conversation?",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000 + 45000).toISOString(), // 45 seconds later
        type: 'text'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-conversation-2',
    title: 'Great Workout Today',
    messages: [
      {
        id: 'demo-msg-5',
        sender: 'user',
        content: "Just finished an amazing workout! I hit a new personal record on my deadlift and felt so strong today.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        type: 'text'
      },
      {
        id: 'demo-msg-6',
        sender: 'ai',
        content: "That's incredible! Hitting a new PR on deadlifts is such a powerful feeling. What do you think contributed to your success today? Was it your mindset, nutrition, rest, or something else?",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25000).toISOString(), // 25 seconds later
        type: 'text'
      },
      {
        id: 'demo-msg-7',
        sender: 'user',
        content: "I think it was a combination of things. I got good sleep last night, ate a solid breakfast, and I was just feeling really focused. Plus, I've been consistent with my training for the past few weeks.",
        timestamp: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(), // 23.5 hours ago
        type: 'text'
      },
      {
        id: 'demo-msg-8',
        sender: 'ai',
        content: "That's a perfect example of how consistency and preparation come together! Your dedication to sleep, nutrition, and regular training is really paying off. How does this achievement make you feel about your fitness journey?",
        timestamp: new Date(Date.now() - 23.5 * 60 * 60 * 1000 + 30000).toISOString(), // 30 seconds later
        type: 'text'
      }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-conversation-3',
    title: 'Sleep Struggles',
    messages: [
      {
        id: 'demo-msg-9',
        sender: 'user',
        content: "I've been having trouble sleeping lately. I keep waking up in the middle of the night and can't fall back asleep.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        type: 'text'
      },
      {
        id: 'demo-msg-10',
        sender: 'ai',
        content: "Sleep issues can be really frustrating and impact so many areas of life. What time do you usually wake up when this happens? And what's going through your mind when you can't fall back asleep?",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20000).toISOString(), // 20 seconds later
        type: 'text'
      },
      {
        id: 'demo-msg-11',
        sender: 'user',
        content: "Usually around 2 or 3 AM. I start thinking about work, bills, and everything I need to do the next day. It's like my brain won't shut off.",
        timestamp: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000).toISOString(), // 2.9 days ago
        type: 'text'
      },
      {
        id: 'demo-msg-12',
        sender: 'ai',
        content: "That's a really common pattern - the middle-of-the-night worry spiral. Have you tried any relaxation techniques when this happens? Sometimes simple breathing exercises or progressive muscle relaxation can help quiet the mind. What do you think about trying a few strategies?",
        timestamp: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000 + 35000).toISOString(), // 35 seconds later
        type: 'text'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Sample journal entries for demo mode
export const DEMO_JOURNAL_ENTRIES = {
  '2025-01-20': [
    {
      id: 'demo-journal-1',
      content: "Feeling energized after my morning run! The sunrise was beautiful and I managed to beat my usual pace. Really grateful for this peaceful start to the day.",
      topics: ['fitness', 'gratitude', 'morning'],
      mood: 'positive',
      energy: 8,
      createdAt: new Date('2025-01-20T07:30:00Z').toISOString()
    }
  ],
  '2025-01-19': [
    {
      id: 'demo-journal-2',
      content: "Struggling with sleep lately. Been waking up at 2 AM and can't fall back asleep. Think it's related to work stress. Need to find better ways to wind down.",
      topics: ['sleep', 'stress', 'work'],
      mood: 'stressed',
      energy: 4,
      createdAt: new Date('2025-01-19T22:15:00Z').toISOString()
    }
  ],
  '2025-01-18': [
    {
      id: 'demo-journal-3',
      content: "Had a great conversation with my friend today. We talked about our goals for the year and it really motivated me. Sometimes you just need that reminder that you're not alone in your journey.",
      topics: ['friendship', 'goals', 'motivation'],
      mood: 'positive',
      energy: 7,
      createdAt: new Date('2025-01-18T15:45:00Z').toISOString()
    }
  ],
  '2025-01-17': [
    {
      id: 'demo-journal-4',
      content: "Work was overwhelming today. Too many meetings and not enough time to actually get things done. Feeling frustrated but trying to stay positive.",
      topics: ['work', 'frustration', 'meetings'],
      mood: 'frustrated',
      energy: 5,
      createdAt: new Date('2025-01-17T18:20:00Z').toISOString()
    }
  ],
  '2025-01-16': [
    {
      id: 'demo-journal-5',
      content: "Finally hit the gym after a week off. Felt amazing to move my body again. Deadlifted 225 lbs for the first time! Small victories matter.",
      topics: ['fitness', 'achievement', 'strength'],
      mood: 'excited',
      energy: 9,
      createdAt: new Date('2025-01-16T19:30:00Z').toISOString()
    }
  ]
};

// Sample insights for demo mode
export const DEMO_INSIGHTS = {
  themes: [
    { name: 'Fitness', count: 8, trend: 'increasing' },
    { name: 'Work Stress', count: 6, trend: 'stable' },
    { name: 'Sleep', count: 4, trend: 'decreasing' },
    { name: 'Gratitude', count: 3, trend: 'increasing' },
    { name: 'Friendship', count: 2, trend: 'stable' }
  ],
  moods: [
    { name: 'Positive', count: 12, percentage: 60 },
    { name: 'Stressed', count: 4, percentage: 20 },
    { name: 'Frustrated', count: 2, percentage: 10 },
    { name: 'Excited', count: 2, percentage: 10 }
  ],
  patterns: [
    {
      type: 'mood_pattern',
      description: 'You tend to feel more positive after physical activity',
      confidence: 0.85
    },
    {
      type: 'time_pattern',
      description: 'Your energy levels are highest in the morning',
      confidence: 0.78
    },
    {
      type: 'topic_pattern',
      description: 'Fitness and work are your most discussed topics',
      confidence: 0.92
    }
  ]
};

// Sample goals for demo mode
export const DEMO_GOALS = {
  categories: ['physical', 'mental', 'growth'],
  metrics: {
    physical: ['weight', 'workouts', 'sleep'],
    mental: ['mood', 'stress', 'energy'],
    growth: ['goals', 'habits', 'learning']
  },
  metricValues: {
    weight: 165,
    workouts: 4,
    sleep: 6.5,
    mood: 7,
    stress: 6,
    energy: 6
  },
  metricGoals: {
    weight: {
      hasGoal: true,
      target: 160,
      timeline: '3_months',
      description: 'Lose 5 pounds through consistent exercise and better nutrition'
    },
    workouts: {
      hasGoal: true,
      target: 5,
      timeline: '1_month',
      description: 'Work out 5 times per week'
    },
    sleep: {
      hasGoal: true,
      target: 7.5,
      timeline: '1_month',
      description: 'Get 7.5 hours of sleep per night'
    },
    mood: {
      hasGoal: true,
      target: 8,
      timeline: 'ongoing',
      description: 'Maintain positive mood through stress management'
    }
  }
};

// Demo mode state management
export class DemoModeManager {
  constructor() {
    this.isDemoMode = false;
    this.demoData = null;
    this.demoLimits = {
      conversations: 5,
      journalEntries: 10,
      insights: true
    };
    this.demoUsage = {
      conversations: 0,
      journalEntries: 0
    };
  }

  // Initialize demo mode
  initializeDemoMode() {
    this.isDemoMode = true;
    this.demoData = {
      conversations: DEMO_CONVERSATIONS,
      journalEntries: DEMO_JOURNAL_ENTRIES,
      insights: DEMO_INSIGHTS,
      goals: DEMO_GOALS,
      user: DEMO_USER
    };
    
    // Load demo usage from localStorage
    const savedUsage = localStorage.getItem('reflectWithin_demo_usage');
    if (savedUsage) {
      this.demoUsage = JSON.parse(savedUsage);
    }
    
    console.log('🎭 Demo mode initialized');
    return this.demoData;
  }

  // Check if demo mode is active
  isInDemoMode() {
    return this.isDemoMode;
  }

  // Get demo data
  getDemoData() {
    return this.demoData;
  }

  // Check if user has reached demo limits
  hasReachedLimit(feature) {
    if (!this.isDemoMode) return false;
    
    switch (feature) {
      case 'conversations':
        return this.demoUsage.conversations >= this.demoLimits.conversations;
      case 'journalEntries':
        return this.demoUsage.journalEntries >= this.demoLimits.journalEntries;
      default:
        return false;
    }
  }

  // Increment demo usage
  incrementUsage(feature) {
    if (!this.isDemoMode) return;
    
    switch (feature) {
      case 'conversations':
        this.demoUsage.conversations++;
        break;
      case 'journalEntries':
        this.demoUsage.journalEntries++;
        break;
    }
    
    // Save to localStorage
    localStorage.setItem('reflectWithin_demo_usage', JSON.stringify(this.demoUsage));
  }

  // Get demo usage stats
  getDemoUsage() {
    return {
      ...this.demoUsage,
      limits: this.demoLimits
    };
  }

  // Reset demo mode
  resetDemoMode() {
    this.isDemoMode = false;
    this.demoData = null;
    this.demoUsage = {
      conversations: 0,
      journalEntries: 0
    };
    localStorage.removeItem('reflectWithin_demo_usage');
    console.log('🎭 Demo mode reset');
  }

  // Convert demo data to real account
  convertDemoToReal(demoData) {
    // This would be called when user creates a real account
    // Merge demo data with new account data
    return {
      conversations: demoData.conversations || [],
      journalEntries: demoData.journalEntries || {},
      insights: demoData.insights || {},
      goals: demoData.goals || {}
    };
  }
}

// Create singleton instance
export const demoModeManager = new DemoModeManager();

// Demo mode hooks and utilities
export const useDemoMode = () => {
  const isDemoMode = demoModeManager.isInDemoMode();
  const demoData = demoModeManager.getDemoData();
  const demoUsage = demoModeManager.getDemoUsage();

  const startDemoMode = () => {
    return demoModeManager.initializeDemoMode();
  };

  const exitDemoMode = () => {
    demoModeManager.resetDemoMode();
  };

  const checkLimit = (feature) => {
    return demoModeManager.hasReachedLimit(feature);
  };

  const incrementUsage = (feature) => {
    demoModeManager.incrementUsage(feature);
  };

  return {
    isDemoMode,
    demoData,
    demoUsage,
    startDemoMode,
    exitDemoMode,
    checkLimit,
    incrementUsage
  };
};

// Demo mode constants
export const DEMO_MODE_CONSTANTS = {
  MAX_CONVERSATIONS: 5,
  MAX_JOURNAL_ENTRIES: 10,
  DEMO_DURATION_DAYS: 7,
  UPGRADE_PROMPT_THRESHOLD: 0.8 // Show upgrade prompt at 80% usage
}; 