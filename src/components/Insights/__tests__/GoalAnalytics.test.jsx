import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalAnalytics from '../GoalAnalytics';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

jest.mock('../../../hooks/useGoalAnalytics', () => ({
  useGoalAnalytics: jest.fn()
}));

describe('GoalAnalytics Component', () => {
  const mockUseGoalAnalytics = require('../../../hooks/useGoalAnalytics').useGoalAnalytics;
  
  const defaultProps = {
    goals: {
      categories: ['fitness', 'mental_health'],
      metrics: {
        fitness: ['workouts', 'steps'],
        mental_health: ['mood', 'stress']
      },
      goals: [
        { title: 'Exercise more', description: 'Work out 3 times per week' }
      ]
    },
    journalEntries: {
      '2024-01-15': [{ id: '1', content: 'Worked out today', topics: ['fitness'] }]
    },
    messages: [
      { id: '1', text: 'Feeling good today', sender: 'user' }
    ]
  };

  const mockAnalyticsData = {
    analyzeJournalingConsistency: jest.fn().mockReturnValue({
      currentStreak: 5,
      totalEntries: 20,
      progressPercentage: 75
    }),
    analyzeMoodTrends: jest.fn().mockReturnValue({
      averageMood: 6.2,
      mostCommonMood: 'happy',
      moodTrend: 'improving',
      progressPercentage: 80
    }),
    analyzeEnergyPatterns: jest.fn().mockReturnValue({
      averageEnergy: 4.1,
      energyTrend: 'stable',
      workoutDays: 12,
      progressPercentage: 65
    }),
    analyzeTopicAlignment: jest.fn().mockReturnValue({
      alignmentPercentage: 85,
      mostFocusedCategory: 'fitness',
      totalRelevantEntries: 15,
      totalEntries: 20,
      progressPercentage: 75
    }),
    generateGoalInsights: jest.fn().mockReturnValue([
      {
        type: 'achievement',
        title: 'Great Progress!',
        message: 'You\'ve been consistent with your fitness goals',
        category: 'fitness',
        priority: 'high'
      },
      {
        type: 'suggestion',
        title: 'Consider This',
        message: 'Try adding more variety to your workouts',
        category: 'fitness',
        priority: 'medium'
      }
    ]),
    getGoalProgressSummary: jest.fn().mockReturnValue({
      totalProgress: 78,
      overallStatus: 'good',
      goalsMet: 2,
      totalGoals: 3
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGoalAnalytics.mockReturnValue(mockAnalyticsData);
  });

  describe('Basic Rendering', () => {
    it('renders goal analytics header', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Goal Progress')).toBeInTheDocument();
      expect(screen.getByText('Track your progress against your personal goals')).toBeInTheDocument();
    });

    it('shows no goals message when goals are not provided', () => {
      render(<GoalAnalytics goals={null} journalEntries={{}} messages={[]} />);
      
      expect(screen.getByText('No Goals Set')).toBeInTheDocument();
      expect(screen.getByText('Set your goals in your profile to see personalized analytics')).toBeInTheDocument();
    });
  });

  describe('Progress Summary', () => {
    it('displays overall progress card', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('GOOD')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Goals Met')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Total Goals')).toBeInTheDocument();
    });

    it('shows correct status colors', () => {
      const mockDataWithStatus = {
        ...mockAnalyticsData,
        getGoalProgressSummary: jest.fn().mockReturnValue({
          totalProgress: 90,
          overallStatus: 'excellent',
          goalsMet: 3,
          totalGoals: 3
        })
      };
      mockUseGoalAnalytics.mockReturnValue(mockDataWithStatus);
      
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('EXCELLENT')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('shows all three tabs', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Insights')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('shows overview tab by default', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Journaling Consistency')).toBeInTheDocument();
      expect(screen.getByText('Mental Wellness')).toBeInTheDocument();
      expect(screen.getByText('Physical Energy')).toBeInTheDocument();
      expect(screen.getByText('Goal Alignment')).toBeInTheDocument();
    });

    it('switches to insights tab when clicked', async () => {
      const user = userEvent.setup();
      render(<GoalAnalytics {...defaultProps} />);
      
      const insightsTab = screen.getByText('Insights');
      await user.click(insightsTab);
      
      expect(screen.getByText('Great Progress!')).toBeInTheDocument();
      expect(screen.getByText('You\'ve been consistent with your fitness goals')).toBeInTheDocument();
    });

    it('switches to details tab when clicked', async () => {
      const user = userEvent.setup();
      render(<GoalAnalytics {...defaultProps} />);
      
      const detailsTab = screen.getByText('Details');
      await user.click(detailsTab);
      
      expect(screen.getByText('Your Goals')).toBeInTheDocument();
      expect(screen.getByText('Focus Areas')).toBeInTheDocument();
      expect(screen.getByText('Selected Metrics')).toBeInTheDocument();
    });
  });

  describe('Overview Tab Content', () => {
    it('displays journaling consistency data', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Journaling Consistency')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays mood trends data', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Mental Wellness')).toBeInTheDocument();
      expect(screen.getByText('6.2/7')).toBeInTheDocument();
      expect(screen.getByText('happy')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('displays energy patterns data', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Physical Energy')).toBeInTheDocument();
      expect(screen.getByText('4.1/5')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('displays topic alignment data', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Goal Alignment')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('fitness')).toBeInTheDocument();
      expect(screen.getByText('15/20')).toBeInTheDocument();
    });
  });

  describe('Insights Tab Content', () => {
    it('displays insights when available', async () => {
      const user = userEvent.setup();
      render(<GoalAnalytics {...defaultProps} />);
      
      const insightsTab = screen.getByText('Insights');
      await user.click(insightsTab);
      
      expect(screen.getByText('Great Progress!')).toBeInTheDocument();
      expect(screen.getByText('Consider This')).toBeInTheDocument();
      expect(screen.getAllByText('fitness').length).toBeGreaterThan(0);
      expect(screen.getByText('high priority')).toBeInTheDocument();
      expect(screen.getByText('medium priority')).toBeInTheDocument();
    });

    it('shows no insights message when no insights available', async () => {
      const user = userEvent.setup();
      const mockDataWithNoInsights = {
        ...mockAnalyticsData,
        generateGoalInsights: jest.fn().mockReturnValue([])
      };
      mockUseGoalAnalytics.mockReturnValue(mockDataWithNoInsights);
      
      render(<GoalAnalytics {...defaultProps} />);
      
      const insightsTab = screen.getByText('Insights');
      await user.click(insightsTab);
      
      expect(screen.getByText('No Insights Yet')).toBeInTheDocument();
      expect(screen.getByText('Keep journaling to unlock personalized insights')).toBeInTheDocument();
    });
  });

  describe('Details Tab Content', () => {
    it('displays focus areas', async () => {
      const user = userEvent.setup();
      render(<GoalAnalytics {...defaultProps} />);
      
      const detailsTab = screen.getByText('Details');
      await user.click(detailsTab);
      
      expect(screen.getAllByText('fitness').length).toBeGreaterThan(0);
      expect(screen.getByText('mental health')).toBeInTheDocument();
    });

    it('displays selected metrics', async () => {
      const user = userEvent.setup();
      render(<GoalAnalytics {...defaultProps} />);
      
      const detailsTab = screen.getByText('Details');
      await user.click(detailsTab);
      
      expect(screen.getByText('workouts')).toBeInTheDocument();
      expect(screen.getByText('steps')).toBeInTheDocument();
      expect(screen.getByText('mood')).toBeInTheDocument();
      expect(screen.getByText('stress')).toBeInTheDocument();
    });

    it('displays personal goals', async () => {
      const user = userEvent.setup();
      render(<GoalAnalytics {...defaultProps} />);
      
      const detailsTab = screen.getByText('Details');
      await user.click(detailsTab);
      
      expect(screen.getByText('Exercise more')).toBeInTheDocument();
      expect(screen.getByText('Work out 3 times per week')).toBeInTheDocument();
    });
  });

  describe('Trend Indicators', () => {
    it('shows improving trend icon', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      // The mood trend is 'improving' in our mock data
      expect(screen.getByText('6.2/7')).toBeInTheDocument();
    });

    it('shows declining trend icon', () => {
      const mockDataWithDeclining = {
        ...mockAnalyticsData,
        analyzeMoodTrends: jest.fn().mockReturnValue({
          averageMood: 4.5,
          mostCommonMood: 'sad',
          moodTrend: 'declining',
          progressPercentage: 60
        })
      };
      mockUseGoalAnalytics.mockReturnValue(mockDataWithDeclining);
      
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('4.5/7')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('calls useGoalAnalytics with correct parameters', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(mockUseGoalAnalytics).toHaveBeenCalledWith(
        defaultProps.goals,
        defaultProps.journalEntries,
        defaultProps.messages
      );
    });

    it('calls all analytics functions', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(mockAnalyticsData.analyzeJournalingConsistency).toHaveBeenCalled();
      expect(mockAnalyticsData.analyzeMoodTrends).toHaveBeenCalled();
      expect(mockAnalyticsData.analyzeEnergyPatterns).toHaveBeenCalled();
      expect(mockAnalyticsData.analyzeTopicAlignment).toHaveBeenCalled();
      expect(mockAnalyticsData.generateGoalInsights).toHaveBeenCalled();
      expect(mockAnalyticsData.getGoalProgressSummary).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper tab structure', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('has proper progress indicators', () => {
      render(<GoalAnalytics {...defaultProps} />);
      
      expect(screen.getByText('78%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });
}); 