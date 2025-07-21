import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileGoalsSection from '../ProfileGoalsSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: jest.fn().mockImplementation(({ children, ...props }) => <div {...props}>{children}</div>),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Edit3: () => <span data-testid="edit-icon">EditIcon</span>,
  CheckCircle: () => <span data-testid="check-icon">Check</span>,
  X: () => <span data-testid="x-icon">X</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
}));

// Mock useUnifiedData hook
const mockGetGoals = jest.fn();
const mockUpdateGoals = jest.fn();

jest.mock('../../../hooks/useUnifiedData.js', () => ({
  useUnifiedData: () => ({
    getGoals: mockGetGoals,
    updateGoals: mockUpdateGoals,
  }),
}));

const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockGoals = {
  categories: ['fitness', 'mental-health', 'productivity'],
  metrics: {
    fitness: ['steps', 'workouts'],
    'mental-health': ['mood', 'sleep'],
  },
  goals: [
    { id: 1, title: 'Exercise daily', description: '30 minutes of cardio' },
    { id: 2, title: 'Read more', description: '20 pages per day' },
  ],
  preferences: {
    reminders: ['morning', 'evening'],
    aiFeatures: ['insights', 'suggestions'],
  },
};

const defaultProps = {
  user: mockUser,
  onUpdate: jest.fn(),
};

describe('ProfileGoalsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset mock implementations to default
    mockGetGoals.mockResolvedValue(mockGoals);
    mockUpdateGoals.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders goals section with user data', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });
    });

    test('renders focus areas correctly', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Focus Areas')).toBeInTheDocument();
        expect(screen.getByText('Fitness')).toBeInTheDocument();
        expect(screen.getByText('Mental-health')).toBeInTheDocument();
        expect(screen.getByText('Productivity')).toBeInTheDocument();
      });
    });

    test('renders metrics correctly', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Metrics')).toBeInTheDocument();
        expect(screen.getByText('Steps')).toBeInTheDocument();
        expect(screen.getByText('Workouts')).toBeInTheDocument();
        expect(screen.getByText('Mood')).toBeInTheDocument();
        expect(screen.getByText('Sleep')).toBeInTheDocument();
      });
    });

    test('renders personal goals correctly', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Personal Goals')).toBeInTheDocument();
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
        expect(screen.getByText('30 minutes of cardio')).toBeInTheDocument();
        expect(screen.getByText('Read more')).toBeInTheDocument();
        expect(screen.getByText('20 pages per day')).toBeInTheDocument();
      });
    });

    test('renders preferences correctly', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Preferences')).toBeInTheDocument();
        expect(screen.getByText('morning reminder')).toBeInTheDocument();
        expect(screen.getByText('evening reminder')).toBeInTheDocument();
        expect(screen.getByText('AI: insights')).toBeInTheDocument();
        expect(screen.getByText('AI: suggestions')).toBeInTheDocument();
      });
    });

    test('shows empty state when no goals', async () => {
      mockGetGoals.mockResolvedValue(null);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('No goals set yet. Click Edit to get started!')).toBeInTheDocument();
      });
    });

    test('returns null when user is not provided', () => {
      const { container } = render(<ProfileGoalsSection {...defaultProps} user={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Edit Mode', () => {
    test('switches to edit mode when edit button is clicked', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
      });
      
      // Use a more specific selector for the edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Goals')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    test('shows existing goals in edit mode', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Exercise daily')).toBeInTheDocument();
        expect(screen.getByDisplayValue('30 minutes of cardio')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Read more')).toBeInTheDocument();
        expect(screen.getByDisplayValue('20 pages per day')).toBeInTheDocument();
      });
    });

    test('cancels edit mode when cancel button is clicked', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
        expect(screen.queryByText('Edit Goals')).not.toBeInTheDocument();
      });
    });
  });

  describe('Goal Management', () => {
    test('adds new goal when add button is clicked', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Exercise daily')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Add Goal'));
      
      await waitFor(() => {
        // Should have 3 goals now (2 original + 1 new)
        const titleInputs = screen.getAllByPlaceholderText('Goal title');
        expect(titleInputs).toHaveLength(3);
      });
    });

    test('updates goal title when input changes', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Exercise daily')).toBeInTheDocument();
      });
      
      const titleInput = screen.getByDisplayValue('Exercise daily');
      fireEvent.change(titleInput, { target: { value: 'Workout daily' } });
      
      expect(titleInput.value).toBe('Workout daily');
    });

    test('updates goal description when input changes', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('30 minutes of cardio')).toBeInTheDocument();
      });
      
      const descInput = screen.getByDisplayValue('30 minutes of cardio');
      fireEvent.change(descInput, { target: { value: '45 minutes of cardio' } });
      
      expect(descInput.value).toBe('45 minutes of cardio');
    });

    test('removes goal when X button is clicked', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Exercise daily')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByTestId('x-icon');
      fireEvent.click(removeButtons[0]); // Remove first goal
      
      await waitFor(() => {
        // Should have 1 goal left
        const titleInputs = screen.getAllByPlaceholderText('Goal title');
        expect(titleInputs).toHaveLength(1);
      });
    });
  });

  describe('Save Functionality', () => {
    test('saves goals and shows success message', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Exercise daily')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        // The component may pass only the goals array to updateGoals
        expect(mockUpdateGoals).toHaveBeenCalledWith(expect.objectContaining({ goals: expect.any(Array) }));
        expect(screen.getByText('Goals updated!')).toBeInTheDocument();
      });
      
      // Success message should disappear after 2 seconds
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.queryByText('Goals updated!')).not.toBeInTheDocument();
      });
    });

    test('exits edit mode after saving', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
        expect(screen.queryByText('Edit Goals')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles goals with missing properties', async () => {
      const incompleteGoals = {
        categories: ['fitness'],
        goals: [
          { id: 1, title: 'Exercise' }, // missing description
          { id: 2, description: 'Read books' }, // missing title
        ],
      };
      mockGetGoals.mockResolvedValue(incompleteGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise')).toBeInTheDocument();
      });
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Exercise')).toBeInTheDocument();
        // Check for empty title input specifically
        const emptyTitleInputs = screen.getAllByDisplayValue('');
        const titleInputs = emptyTitleInputs.filter(input => input.placeholder === 'Goal title');
        expect(titleInputs.length).toBeGreaterThan(0);
      });
    });

    test('handles empty goals array', async () => {
      const emptyGoals = {
        categories: ['fitness'],
        goals: [],
        metrics: {},
        preferences: {},
      };
      mockGetGoals.mockResolvedValue(emptyGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('No personal goals set.')).toBeInTheDocument();
      });
    });

    test('handles goals with null/undefined values', async () => {
      const nullGoals = {
        categories: null,
        metrics: undefined,
        goals: null,
        preferences: null,
      };
      mockGetGoals.mockResolvedValue(nullGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('No goals set yet. Click Edit to get started!')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    test('fetches goals on component mount', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      
      render(<ProfileGoalsSection {...defaultProps} />);
      
      expect(mockGetGoals).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper button roles', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      render(<ProfileGoalsSection {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });
    test('has proper heading structure', async () => {
      mockGetGoals.mockResolvedValue(mockGoals);
      render(<ProfileGoalsSection {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('My Goals')).toBeInTheDocument();
      });
    });
    test('has proper form inputs in edit mode', async () => {
      mockGetGoals.mockResolvedValue(mockGoals); // Ensure mock is reset
      render(<ProfileGoalsSection {...defaultProps} />);
      // Wait for goals to be loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Exercise daily')).toBeInTheDocument();
      });
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      await waitFor(() => {
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
      });
    });
  });
});

test('handles goals fetch error gracefully', async () => {
  mockGetGoals.mockRejectedValue(new Error('Failed to fetch'));
  render(<ProfileGoalsSection {...defaultProps} />);
  await waitFor(() => {
    expect(screen.getByText('No goals set yet. Click Edit to get started!')).toBeInTheDocument();
  });
}); 