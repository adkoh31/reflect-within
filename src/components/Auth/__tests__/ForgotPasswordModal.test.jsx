import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ForgotPasswordModal from '../ForgotPasswordModal.jsx';

// Mock axios
jest.mock('axios');

// Mock the API config
jest.mock('../../../config/api.js', () => ({
  API_ENDPOINTS: {
    AUTH: {
      FORGOT_PASSWORD: '/api/auth/forgot-password'
    }
  }
}));

describe('ForgotPasswordModal', () => {
  const mockOnClose = jest.fn();
  const mockOnShowLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders when isOpen is true', () => {
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(
        <ForgotPasswordModal 
          isOpen={false} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      expect(screen.queryByText('Reset Password')).not.toBeInTheDocument();
    });

    test('renders close button', () => {
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('allows typing in email field', async () => {
      const user = userEvent.setup();
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('clears form when opened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      // Fill the form
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveValue('test@example.com');
      
      // Close and reopen
      rerender(
        <ForgotPasswordModal 
          isOpen={false} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      rerender(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      // Form should be cleared
      expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    });
  });

  describe('API Integration', () => {
    test('successfully sends reset email', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          message: 'Password reset email sent successfully'
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
          email: 'test@example.com'
        });
        expect(screen.getByText('Password reset email sent successfully')).toBeInTheDocument();
      });
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        data: { message: 'Password reset email sent successfully' }
      }), 100)));

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    });

    test('handles API error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email not found';
      axios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'nonexistent@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('handles network error', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    test('shows reset URL in development', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          message: 'Password reset email sent successfully',
          resetUrl: 'http://localhost:3000/reset?token=abc123'
        }
      };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText(/Reset URL: http:\/\/localhost:3000\/reset\?token=abc123/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onShowLogin when back to sign in is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      const backButton = screen.getByRole('button', { name: /back to sign in/i });
      await user.click(backButton);
      
      expect(mockOnShowLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('requires email for submission', async () => {
      const user = userEvent.setup();
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      await user.click(submitButton);
      
      // Form should not submit without email
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      expect(emailInput).toBeInvalid();
    });
  });

  describe('State Management', () => {
    test('clears error when form is submitted', async () => {
      const user = userEvent.setup();
      // First, trigger an error
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Email not found' } }
      });

      const { rerender } = render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'nonexistent@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument();
      });

      // Now trigger a success
      axios.post.mockResolvedValueOnce({
        data: { message: 'Password reset email sent successfully' }
      });

      await user.clear(screen.getByLabelText(/email address/i));
      await user.type(screen.getByLabelText(/email address/i), 'valid@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.queryByText('Email not found')).not.toBeInTheDocument();
        expect(screen.getByText('Password reset email sent successfully')).toBeInTheDocument();
      });
    });

    test('clears message when form is submitted again', async () => {
      const user = userEvent.setup();
      // First, trigger a success
      axios.post.mockResolvedValueOnce({
        data: { message: 'Password reset email sent successfully' }
      });

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText('Password reset email sent successfully')).toBeInTheDocument();
      });

      // Now trigger an error
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Email not found' } }
      });

      await user.clear(screen.getByLabelText(/email address/i));
      await user.type(screen.getByLabelText(/email address/i), 'nonexistent@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.queryByText('Password reset email sent successfully')).not.toBeInTheDocument();
        expect(screen.getByText('Email not found')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    test('has accessible submit button', () => {
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    test('has accessible close button', () => {
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    test('has accessible back to sign in button', () => {
      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty response from server', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValueOnce({});

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset link/i }));

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    test('prevents multiple submissions while loading', async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
        data: { message: 'Password reset email sent successfully' }
      }), 100)));

      render(
        <ForgotPasswordModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onShowLogin={mockOnShowLogin} 
        />
      );
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      // Click multiple times
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only make one API call
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
}); 