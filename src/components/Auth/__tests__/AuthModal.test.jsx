import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import AuthModal from '../AuthModal';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Mock API endpoints
jest.mock('../../../config/api.js', () => ({
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register'
    }
  }
}));

describe('AuthModal', () => {
  const mockOnAuthSuccess = jest.fn();
  const mockOnClose = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form by default', () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should switch to register mode when toggle is clicked', async () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    const toggleButton = screen.getByText(/don't have an account/i);
    await user.click(toggleButton);
    
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should handle login successfully', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
      }
    };

    axios.post.mockResolvedValue(mockResponse);

    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledWith(
        mockResponse.data.user,
        mockResponse.data.token
      );
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('reflectWithin_token', mockResponse.data.token);
    expect(localStorage.setItem).toHaveBeenCalledWith('reflectWithin_user', JSON.stringify(mockResponse.data.user));
  });

  it('should handle registration successfully', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        user: { id: '1', name: 'New User', email: 'new@example.com' }
      }
    };

    axios.post.mockResolvedValue(mockResponse);

    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    // Switch to register mode
    const toggleButton = screen.getByText(/don't have an account/i);
    await user.click(toggleButton);
    
    // Fill in registration form
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledWith(
        mockResponse.data.user,
        mockResponse.data.token
      );
    });
  });

  it('should handle login errors', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Invalid email or password'
        }
      }
    };

    axios.post.mockRejectedValue(mockError);

    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    
    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    const mockError = new Error('Network error');

    axios.post.mockRejectedValue(mockError);

    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Should show validation errors or prevent submission
    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });

  it('should close modal when close button is clicked', async () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not render when isOpen is false', () => {
    render(
      <AuthModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });

  it('should show loading state during form submission', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onAuthSuccess={mockOnAuthSuccess} 
      />
    );
    
    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
}); 