import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import UserProfile from '../UserProfile';

// Mock axios
jest.mock('axios');

// Mock PremiumToggle and ProfileGoalsSection
jest.mock('../../PremiumToggle', () => ({
  __esModule: true,
  default: ({ isPremium, onToggle }) => (
    <button data-testid="premium-toggle" onClick={onToggle}>
      {isPremium ? 'Premium' : 'Free'}
    </button>
  ),
}));

jest.mock('../ProfileGoalsSection', () => ({
  __esModule: true,
  default: ({ user }) => (
    <div data-testid="profile-goals-section">
      Goals for {user.name}
    </div>
  ),
}));

describe('UserProfile', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-01T00:00:00.000Z',
    lastLogin: '2023-12-01T00:00:00.000Z',
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  };

  const defaultProps = {
    user: mockUser,
    onLogout: jest.fn(),
    onUpdateProfile: jest.fn(),
    isPremium: false,
    onPremiumToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    test('renders user profile information', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    test('renders member since and last login dates', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Member since')).toBeInTheDocument();
      expect(screen.getByText('Last login')).toBeInTheDocument();
      expect(screen.getByText('1/1/2023')).toBeInTheDocument(); // createdAt
      expect(screen.getByText('12/1/2023')).toBeInTheDocument(); // lastLogin
    });

    test('renders premium toggle section', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Premium Features')).toBeInTheDocument();
      expect(screen.getByTestId('premium-toggle')).toBeInTheDocument();
      expect(screen.getByText(/Upgrade to premium/)).toBeInTheDocument();
    });

    test('renders profile goals section', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByTestId('profile-goals-section')).toBeInTheDocument();
      expect(screen.getByText('Goals for John Doe')).toBeInTheDocument();
    });

    test('renders sign out button', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    test('returns null when user is not provided', () => {
      const { container } = render(<UserProfile {...defaultProps} user={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Edit Mode', () => {
    test('switches to edit mode when edit button is clicked', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      // There should be two Cancel buttons in edit mode
      const cancelButtons = screen.getAllByText('Cancel');
      expect(cancelButtons.length).toBe(2);
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      // Check the select value for theme
      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect.value).toBe('dark');
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    test('shows form fields in edit mode', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    test('populates form with current user data', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect.value).toBe('dark');
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    test('cancels edit mode when cancel button is clicked', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      // There are two Cancel buttons, the second is the form's
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[1]);
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form successfully', async () => {
      const mockResponse = { data: { user: { ...mockUser, name: 'Jane Doe' } } };
      axios.put.mockResolvedValueOnce(mockResponse);
      
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'Jane Doe' },
      });
      fireEvent.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          '/api/auth/profile',
          expect.objectContaining({ name: 'Jane Doe' }),
          expect.any(Object)
        );
      });
      
      expect(defaultProps.onUpdateProfile).toHaveBeenCalledWith(mockResponse.data.user);
      // Success message should be visible after edit mode exits
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    test('handles form submission error', async () => {
      const error = { response: { data: { message: 'Update failed' } } };
      axios.put.mockRejectedValueOnce(error);
      
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    test('handles form submission error without response', async () => {
      axios.put.mockRejectedValueOnce(new Error('Network error'));
      
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
      });
    });

    test('shows loading state during submission', async () => {
      axios.put.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Save Changes'));
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeDisabled();
    });
  });

  describe('Form Interactions', () => {
    test('updates form data when inputs change', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      expect(nameInput.value).toBe('Jane Doe');
      
      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: 'light' } });
      expect(themeSelect.value).toBe('light');
      
      const notificationsCheckbox = screen.getByLabelText('Enable notifications');
      fireEvent.click(notificationsCheckbox);
      expect(notificationsCheckbox).not.toBeChecked();
    });

    test('handles nested preferences object correctly', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: 'light' } });
      
      const notificationsCheckbox = screen.getByLabelText('Enable notifications');
      fireEvent.click(notificationsCheckbox);
      
      // The form should handle nested preferences correctly
      expect(themeSelect.value).toBe('light');
      expect(notificationsCheckbox).not.toBeChecked();
    });
  });

  describe('Premium Features', () => {
    test('shows premium status correctly', () => {
      render(<UserProfile {...defaultProps} isPremium={true} />);
      
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText(/You have access to all premium features/)).toBeInTheDocument();
    });

    test('shows free status correctly', () => {
      render(<UserProfile {...defaultProps} isPremium={false} />);
      
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText(/Upgrade to premium/)).toBeInTheDocument();
    });

    test('calls onPremiumToggle when premium toggle is clicked', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('premium-toggle'));
      
      expect(defaultProps.onPremiumToggle).toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    test('calls onLogout and clears localStorage when sign out is clicked', () => {
      localStorage.setItem('reflectWithin_token', 'test-token');
      localStorage.setItem('reflectWithin_user', 'test-user');
      
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Sign Out'));
      
      expect(defaultProps.onLogout).toHaveBeenCalled();
      expect(localStorage.getItem('reflectWithin_token')).toBeNull();
      expect(localStorage.getItem('reflectWithin_user')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('handles user without preferences', () => {
      const userWithoutPreferences = { ...mockUser, preferences: undefined };
      render(<UserProfile {...defaultProps} user={userWithoutPreferences} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect.value).toBe('auto'); // default theme
      const notificationsCheckbox = screen.getByLabelText('Enable notifications');
      expect(notificationsCheckbox).not.toBeChecked(); // default notifications
    });

    test('handles user with partial preferences', () => {
      const userWithPartialPreferences = { 
        ...mockUser, 
        preferences: { theme: 'light' } // missing notifications
      };
      render(<UserProfile {...defaultProps} user={userWithPartialPreferences} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect.value).toBe('light');
      const notificationsCheckbox = screen.getByLabelText('Enable notifications');
      expect(notificationsCheckbox).not.toBeChecked(); // default false
    });

    test('handles user without name', () => {
      const userWithoutName = { ...mockUser, name: undefined };
      render(<UserProfile {...defaultProps} user={userWithoutName} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      const nameInput = screen.getByLabelText('Name');
      expect(nameInput.value).toBe(''); // empty name field
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<UserProfile {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
    });

    test('has proper button roles', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });
}); 