import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { jest, describe, it, expect } from '@jest/globals';
import InsightsDashboard from '../InsightsDashboard';

// Mock Chart.js components
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }) => (
    <div data-testid="bar-chart">
      <div>Chart Title: {options?.plugins?.title?.text || 'Chart'}</div>
    </div>
  ),
}));

// Mock the chart components
jest.mock('../MoodChart', () => ({
  default: ({ insights }) => (
    <div data-testid="mood-chart">
      <div>Mood Chart</div>
      <div>Moods: {insights?.moods?.length || 0}</div>
    </div>
  ),
}));

jest.mock('../ThemeChart', () => ({
  default: ({ insights }) => (
    <div data-testid="theme-chart">
      <div>Theme Chart</div>
      <div>Themes: {insights?.themes?.length || 0}</div>
    </div>
  ),
}));

jest.mock('../GoalAnalytics', () => ({
  __esModule: true,
  default: ({ goals, journalEntries, messages }) => (
    <div data-testid="goal-analytics">
      <h2>Goal Progress</h2>
      <div>Goal Analytics Content</div>
    </div>
  )
}));

jest.mock('../../Typography/Typography', () => ({
  Typography: ({ children, variant, color, weight, className }) => (
    <div className={className} data-testid={`typography-${variant}-${color}`}>
      {children}
    </div>
  )
}));

jest.mock('../../ui/ComponentErrorBoundary.jsx', () => ({
  ComponentErrorBoundary: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

jest.mock('../../ui/loading-states', () => ({
  InsightsSkeleton: () => <div data-testid="insights-skeleton">Loading Insights...</div>
}));

describe('InsightsDashboard Component', () => {
  const defaultProps = {
    insights: {},
    isGeneratingInsights: false,
    isPremium: false,
    onPremiumToggle: jest.fn(),
    messages: [],
    onAction: jest.fn(),
    goals: null,
    journalEntries: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Premium Features', () => {
    it('shows premium upgrade screen when user is not premium', () => {
      render(<InsightsDashboard {...defaultProps} />);
      
      expect(screen.getByText('Premium Insights Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Unlock personalized insights about your fitness and mental well-being patterns')).toBeInTheDocument();
      expect(screen.getByText('Enable Premium Features')).toBeInTheDocument();
    });

    it('calls onPremiumToggle when premium button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPremiumToggle = jest.fn();
      const propsWithMock = {
        ...defaultProps,
        onPremiumToggle: mockOnPremiumToggle
      };
      
      render(<InsightsDashboard {...propsWithMock} />);
      
      const premiumButton = screen.getByText('Enable Premium Features');
      await user.click(premiumButton);
      
      expect(mockOnPremiumToggle).toHaveBeenCalled();
    });

    it('shows premium features list', () => {
      render(<InsightsDashboard {...defaultProps} />);
      
      expect(screen.getByText('Discover recurring themes in your reflections')).toBeInTheDocument();
      expect(screen.getByText('Track your mood and emotional patterns')).toBeInTheDocument();
      expect(screen.getByText('Visualize your personal growth journey')).toBeInTheDocument();
      expect(screen.getByText('Track progress against your personal goals')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when generating insights', () => {
      const propsWithLoading = {
        ...defaultProps,
        isPremium: true,
        isGeneratingInsights: true
      };
      
      render(<InsightsDashboard {...propsWithLoading} />);
      
      expect(screen.getByTestId('insights-skeleton')).toBeInTheDocument();
    });
  });

  describe('Premium Dashboard', () => {
    const premiumProps = {
      ...defaultProps,
      isPremium: true
    };

    it('renders dashboard header when premium', () => {
      render(<InsightsDashboard {...premiumProps} />);
      
      expect(screen.getByText('Insights Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Discover patterns and trends in your reflection journey')).toBeInTheDocument();
    });

    it('shows goal analytics when goals are provided', () => {
      const propsWithGoals = {
        ...premiumProps,
        goals: {
          categories: ['fitness', 'mental_health'],
          metrics: {
            fitness: ['workouts', 'steps'],
            mental_health: ['mood', 'stress']
          }
        }
      };
      
      render(<InsightsDashboard {...propsWithGoals} />);
      
      expect(screen.getByTestId('goal-analytics')).toBeInTheDocument();
    });

    it('does not show goal analytics when no goals are provided', () => {
      render(<InsightsDashboard {...premiumProps} />);
      
      expect(screen.queryByTestId('goal-analytics')).not.toBeInTheDocument();
    });

    it('shows theme and mood charts', () => {
      render(<InsightsDashboard {...premiumProps} />);
      
      expect(screen.getByTestId('theme-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
    });

    it('shows empty state when no insights and no goals', () => {
      render(<InsightsDashboard {...premiumProps} />);
      
      expect(screen.getByText('No Insights Yet')).toBeInTheDocument();
      expect(screen.getByText('Start journaling to unlock personalized insights about your fitness journey, mood patterns, and personal growth.')).toBeInTheDocument();
    });

    it('calls onAction with journal when start journaling button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnAction = jest.fn();
      const propsWithMock = {
        ...premiumProps,
        onAction: mockOnAction
      };
      
      render(<InsightsDashboard {...propsWithMock} />);
      
      const journalButton = screen.getByRole('button', { name: /start journaling/i });
      await user.click(journalButton);
      
      expect(mockOnAction).toHaveBeenCalledWith('journal');
    });


  });

  describe('Data Handling', () => {
    it('passes insights data to charts', () => {
      const mockInsights = {
        themes: [
          { name: 'Fitness', count: 5 },
          { name: 'Mental Health', count: 3 }
        ],
        moods: [
          { name: 'Happy', count: 4 },
          { name: 'Stressed', count: 2 }
        ]
      };
      
      const propsWithInsights = {
        ...defaultProps,
        isPremium: true,
        insights: mockInsights
      };
      
      render(<InsightsDashboard {...propsWithInsights} />);
      
      expect(screen.getByTestId('theme-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
    });

    it('passes goals data to goal analytics', () => {
      const mockGoals = {
        categories: ['fitness'],
        metrics: {
          fitness: ['workouts']
        },
        goals: [
          { title: 'Exercise more', description: 'Work out 3 times per week' }
        ]
      };
      
      const propsWithGoals = {
        ...defaultProps,
        isPremium: true,
        goals: mockGoals
      };
      
      render(<InsightsDashboard {...propsWithGoals} />);
      
      expect(screen.getByTestId('goal-analytics')).toBeInTheDocument();
    });

    it('passes journal entries and messages to goal analytics', () => {
      const mockJournalEntries = {
        '2024-01-15': [{ id: '1', content: 'Test entry' }]
      };
      const mockMessages = [
        { id: '1', text: 'Hello', sender: 'user' }
      ];
      
      const propsWithData = {
        ...defaultProps,
        isPremium: true,
        goals: { categories: ['fitness'] },
        journalEntries: mockJournalEntries,
        messages: mockMessages
      };
      
      render(<InsightsDashboard {...propsWithData} />);
      
      expect(screen.getByTestId('goal-analytics')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('wraps content in error boundary', () => {
      render(<InsightsDashboard {...defaultProps} />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      render(<InsightsDashboard {...defaultProps} />);
      
      const premiumButton = screen.getByRole('button', { name: /enable premium features/i });
      expect(premiumButton).toBeInTheDocument();
    });

    it('has proper loading state accessibility', () => {
      const propsWithLoading = {
        ...defaultProps,
        isPremium: true,
        isGeneratingInsights: true
      };
      
      render(<InsightsDashboard {...propsWithLoading} />);
      
      const loadingContainer = screen.getByTestId('insights-skeleton').parentElement;
      expect(loadingContainer).toHaveAttribute('aria-busy', 'true');
    });
  });
}); 