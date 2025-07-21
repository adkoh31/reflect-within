import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AuthPage from '../AuthPage.jsx';

// Mock axios
jest.mock('axios');

// Mock the API config
jest.mock('../../../config/api.js', () => ({
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      PROFILE: '/api/auth/profile',
      VERIFY_TOKEN: '/api/auth/verify-token'
    }
  }
}));

// Mock the LampBackground component
jest.mock('../../ui/lamp.jsx', () => ({
  LampBackground: () => <div data-testid="lamp-background" />
}));

// Mock the Button component
jest.mock('../../ui/button.jsx', () => ({
  Button: ({ children, ...props }) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  )
}));

// Mock ForgotPasswordModal
jest.mock('../ForgotPasswordModal.jsx', () => {
  return function MockForgotPasswordModal({ isOpen, onClose, onShowLogin }) {
    if (!isOpen) return null;
    return (
      <div data-testid="forgot-password-modal">
        <button onClick={onClose} data-testid="close-forgot-password">Close</button>
        <button onClick={onShowLogin} data-testid="show-login">Show Login</button>
      </div>
    );
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AuthPage', () => {
  const mockOnAuthSuccess = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
  });

  describe('Rendering', () => {
    test('renders login form by default', () => {
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your reflection journey')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
    });

    test('renders back button', () => {
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    test('renders lamp background', () => {
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      expect(screen.getByTestId('lamp-background')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('allows typing in email field', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('allows typing in password field', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput).toHaveValue('password123');
    });

    test('shows name field when in signup mode', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      const signupLink = screen.getByText("Don't have an account? Sign up");
      await user.click(signupLink);
      
      expect(screen.getByText('Join ReflectWithin')).toBeInTheDocument();
      expect(screen.getByText('Create your account to start reflecting')).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('clears form when switching between login and signup', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Fill form in login mode
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Switch to signup mode
      const signupLink = screen.getByText("Don't have an account? Sign up");
      await user.click(signupLink);
      
      // Check that form is cleared
      expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email address/i)).toHaveValue('');
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
    });
  });

  describe('Login Flow', () => {
    test('successfully logs in user', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          token: 'mock-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User' }
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123',
          name: ''
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith('reflectWithin_token', 'mock-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('reflectWithin_user', JSON.stringify(mockResponse.data.user));
        expect(mockOnAuthSuccess).toHaveBeenCalledWith(mockResponse.data.user, 'mock-token');
      });
    });

    test('shows loading state during login', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        data: { token: 'mock-token', user: { id: 1, email: 'test@example.com' } }
      }), 100)));

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    test('handles login error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      axios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('handles network error', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Signup Flow', () => {
    test('successfully creates account', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          token: 'mock-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User' }
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
        expect(mockOnAuthSuccess).toHaveBeenCalledWith(mockResponse.data.user, 'mock-token');
      });
    });

    test('shows loading state during signup', async () => {
      const user = userEvent.setup();
      axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        data: { token: 'mock-token', user: { id: 1, email: 'test@example.com' } }
      }), 100)));

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    test('handles signup error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      axios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      await user.type(screen.getByLabelText(/full name/i), 'Test User');
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Forgot Password', () => {
    test('shows forgot password modal when clicked', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const forgotPasswordLink = screen.getByText('Forgot your password?');
      await user.click(forgotPasswordLink);

      expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
    });

    test('closes forgot password modal', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Open modal
      await user.click(screen.getByText('Forgot your password?'));
      expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
      
      // Close modal
      await user.click(screen.getByTestId('close-forgot-password'));
      expect(screen.queryByTestId('forgot-password-modal')).not.toBeInTheDocument();
    });

    test('does not show forgot password link in signup mode', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      expect(screen.queryByText('Forgot your password?')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('requires email and password for login', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      // Form should not submit without required fields
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('requires name, email, and password for signup', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      // Form should not submit without required fields
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      expect(emailInput).toBeInvalid();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('has proper form labels in signup mode', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('has accessible submit buttons', () => {
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('has accessible submit buttons in signup mode', async () => {
      const user = userEvent.setup();
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Switch to signup mode
      await user.click(screen.getByText("Don't have an account? Sign up"));
      
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('has accessible back button', () => {
      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('clears error when switching modes', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } }
      });

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      // Trigger an error
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Switch modes - error should clear
      await user.click(screen.getByText("Don't have an account? Sign up"));
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });

    test('handles empty response from server', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValueOnce({});

      render(<AuthPage onAuthSuccess={mockOnAuthSuccess} onBack={mockOnBack} />);
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });
}); 