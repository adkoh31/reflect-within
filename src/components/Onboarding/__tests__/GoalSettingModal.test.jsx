import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalSettingModal from '../GoalSettingModal.jsx';

// Mock the step components
jest.mock('../FocusAreasStep.jsx', () => {
  return function MockFocusAreasStep({ onDataUpdate, initialData }) {
    return (
      <div data-testid="focus-areas-step">
        <button 
          onClick={() => onDataUpdate({ focusAreas: ['fitness', 'mental-health'] })}
          data-testid="select-focus-areas"
        >
          Select Focus Areas
        </button>
        <div data-testid="current-focus-areas">
          {initialData.focusAreas.join(', ')}
        </div>
      </div>
    );
  };
});

jest.mock('../MetricsSelectionStep.jsx', () => {
  return function MockMetricsSelectionStep({ onDataUpdate, initialData }) {
    return (
      <div data-testid="metrics-selection-step">
        <button 
          onClick={() => onDataUpdate({ selectedMetrics: { fitness: ['steps', 'calories'] } })}
          data-testid="select-metrics"
        >
          Select Metrics
        </button>
        <div data-testid="current-metrics">
          {Object.entries(initialData.selectedMetrics).map(([key, values]) => 
            `${key}: ${values.join(', ')}`
          ).join('; ')}
        </div>
      </div>
    );
  };
});

jest.mock('../JournalingPreferencesStep.jsx', () => {
  return function MockJournalingPreferencesStep({ onDataUpdate, initialData }) {
    return (
      <div data-testid="journaling-preferences-step">
        <button 
          onClick={() => onDataUpdate({ 
            journalingFrequency: 'weekly', 
            reminders: ['weekly', 'monthly'] 
          })}
          data-testid="select-preferences"
        >
          Select Preferences
        </button>
        <div data-testid="current-preferences">
          Frequency: {initialData.journalingFrequency}, Reminders: {initialData.reminders.join(', ')}
        </div>
      </div>
    );
  };
});

jest.mock('../PersonalGoalsStep.jsx', () => {
  return function MockPersonalGoalsStep({ onDataUpdate, initialData }) {
    return (
      <div data-testid="personal-goals-step">
        <button 
          onClick={() => onDataUpdate({ personalGoals: ['Run a marathon', 'Meditate daily'] })}
          data-testid="add-goals"
        >
          Add Goals
        </button>
        <div data-testid="current-goals">
          {initialData.personalGoals.join(', ')}
        </div>
      </div>
    );
  };
});

describe('GoalSettingModal', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();
  const mockUser = { id: 1, name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders when isOpen is true', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByText('Welcome to ReflectWithin! 🎉')).toBeInTheDocument();
      expect(screen.getByText("Let's personalize your experience")).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(
        <GoalSettingModal 
          isOpen={false} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.queryByText('Welcome to ReflectWithin! 🎉')).not.toBeInTheDocument();
    });

    test('renders first step content by default', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByTestId('focus-areas-step')).toBeInTheDocument();
    });

    test('renders close button', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    test('renders navigation buttons', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    test('shows back button disabled on first step', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    test('enables back button after moving to second step', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Complete first step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Check we're on second step
      expect(screen.getByTestId('metrics-selection-step')).toBeInTheDocument();
      
      // Back button should be enabled
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).not.toBeDisabled();
    });

    test('navigates to previous step when back is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Move to second step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByTestId('metrics-selection-step')).toBeInTheDocument();
      
      // Go back
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByTestId('focus-areas-step')).toBeInTheDocument();
    });

    test('updates progress bar when navigating steps', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Initial progress
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      
      // Move to second step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Step Validation', () => {
    test('disables next button when step is invalid', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    test('enables next button when step is valid', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Complete first step
      await user.click(screen.getByTestId('select-focus-areas'));
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });

    test('shows validation message for invalid step', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Try to proceed without completing step
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByText('Please select at least one focus area')).toBeInTheDocument();
    });

    test('hides validation message when step becomes valid', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Show validation message
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText('Please select at least one focus area')).toBeInTheDocument();
      
      // Complete step
      await user.click(screen.getByTestId('select-focus-areas'));
      expect(screen.queryByText('Please select at least one focus area')).not.toBeInTheDocument();
    });
  });

  describe('Step Content', () => {
    test('renders focus areas step first', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByTestId('focus-areas-step')).toBeInTheDocument();
      expect(screen.getByText('Welcome to ReflectWithin! 🎉')).toBeInTheDocument();
    });

    test('renders metrics selection step second', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Move to second step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('metrics-selection-step')).toBeInTheDocument();
      expect(screen.getByText('What would you like to track?')).toBeInTheDocument();
    });

    test('renders journaling preferences step third', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Move to third step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-metrics'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('journaling-preferences-step')).toBeInTheDocument();
      expect(screen.getByText('How often do you want to reflect?')).toBeInTheDocument();
    });

    test('renders personal goals step fourth', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Move to fourth step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-metrics'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-preferences'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByTestId('personal-goals-step')).toBeInTheDocument();
      expect(screen.getByText('Any specific goals?')).toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    test('passes initial data to step components', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByTestId('current-focus-areas')).toHaveTextContent('');
    });

    test('updates form data when step data changes', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Update focus areas
      await user.click(screen.getByTestId('select-focus-areas'));
      expect(screen.getByTestId('current-focus-areas')).toHaveTextContent('fitness, mental-health');
    });

    test('maintains data across step navigation', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Set focus areas and move to next step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Set metrics and go back
      await user.click(screen.getByTestId('select-metrics'));
      await user.click(screen.getByRole('button', { name: /back/i }));
      
      // Focus areas should still be selected
      expect(screen.getByTestId('current-focus-areas')).toHaveTextContent('fitness, mental-health');
    });
  });

  describe('Completion', () => {
    test('calls onComplete with correct data when all steps are completed', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Complete all steps
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await user.click(screen.getByTestId('select-metrics'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await user.click(screen.getByTestId('select-preferences'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await user.click(screen.getByTestId('add-goals'));
      await user.click(screen.getByRole('button', { name: /complete/i }));
      
      expect(mockOnComplete).toHaveBeenCalledWith({
        goals: {
          categories: ['fitness', 'mental-health'],
          metrics: { fitness: ['steps', 'calories'] },
          preferences: {
            journalingGoal: 'weekly',
            reminders: ['weekly', 'monthly']
          },
          goals: ['Run a marathon', 'Meditate daily']
        }
      });
    });

    test('shows complete button on last step', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Navigate to last step
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-metrics'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-preferences'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    test('calls onClose when skip button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /skip for now/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has accessible close button', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    test('has accessible navigation buttons', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('shows progress information', () => {
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles step validation correctly for optional steps', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Navigate to personal goals step (optional)
      await user.click(screen.getByTestId('select-focus-areas'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-metrics'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-preferences'));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Should be able to complete without adding goals
      const completeButton = screen.getByRole('button', { name: /complete/i });
      expect(completeButton).not.toBeDisabled();
    });

    test('maintains state when navigating back and forth', async () => {
      const user = userEvent.setup();
      render(
        <GoalSettingModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onComplete={mockOnComplete}
          user={mockUser}
        />
      );
      
      // Set data on first step
      await user.click(screen.getByTestId('select-focus-areas'));
      
      // Move to second step and set data
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('select-metrics'));
      
      // Go back and forth
      await user.click(screen.getByRole('button', { name: /back/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Data should be preserved
      expect(screen.getByTestId('current-metrics')).toHaveTextContent('fitness: steps, calories');
    });
  });
}); 