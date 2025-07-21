import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import OnboardingFlow from '../OnboardingFlow';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => children
}));

// Mock UI components
jest.mock('../../ui/lamp.jsx', () => ({
  LampBackground: ({ children }) => <div data-testid="lamp-background">{children}</div>
}));

jest.mock('../../ui/interactive-text-pressure.jsx', () => ({
  __esModule: true,
  default: ({ text, children }) => <div data-testid="text-pressure">{text || children}</div>
}));

describe('OnboardingFlow', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'John Doe'
  };

  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render the first step with welcome message', () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText(/Hello, John!/)).toBeInTheDocument();
    expect(screen.getByText(/Your AI-powered workout reflection companion/)).toBeInTheDocument();
    expect(screen.getByText(/Track your fitness journey/)).toBeInTheDocument();
  });

  it('should render with generic greeting when user has no name', () => {
    const userWithoutName = { ...mockUser, name: undefined };
    
    render(
      <OnboardingFlow 
        user={userWithoutName}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText(/Hello, there!/)).toBeInTheDocument();
  });

  it('should navigate to next step when Next button is clicked', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Should start on first step
    expect(screen.getByText(/Hello, John!/)).toBeInTheDocument();

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should be on second step
    expect(screen.getByText(/Track Your Workouts & Recovery/)).toBeInTheDocument();
    expect(screen.getByText(/Detailed fitness logging/)).toBeInTheDocument();
  });

  it('should navigate back when Back button is clicked', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Go to second step
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should be on second step
    expect(screen.getByText(/Track Your Workouts & Recovery/)).toBeInTheDocument();

    // Click Back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    // Should be back on first step
    expect(screen.getByText(/Hello, John!/)).toBeInTheDocument();
  });

  it('should show Back button on steps after the first', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // First step should have disabled Back button
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeDisabled();

    // Go to second step
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Second step should have enabled Back button
    expect(screen.getByRole('button', { name: /back/i })).not.toBeDisabled();
  });

  it('should show Skip button on all steps', () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('should call onSkip when Skip button is clicked', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const skipButton = screen.getByRole('button', { name: /skip/i });
    await user.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('should prevent double-clicks on Skip button', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    const skipButton = screen.getByRole('button', { name: /skip/i });
    
    // Click twice rapidly
    await user.click(skipButton);
    await user.click(skipButton);

    // Should only be called once
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('should complete onboarding on last step', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Navigate through all steps
    for (let i = 0; i < 3; i++) {
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
    }

    // Should be on last step
    expect(screen.getByText(/You're Ready to Reflect!/)).toBeInTheDocument();

    // Click Get Started on last step (should complete)
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    await user.click(getStartedButton);

    expect(mockOnComplete).toHaveBeenCalledWith({
      email: mockUser.email,
      name: mockUser.name,
      preferredMode: 'chat' // default value
    });
  });

  it('should handle touch gestures for navigation', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Find the element with touch handlers
    const touchContainer = screen.getByText(/Hello, John!/).closest('div[onTouchStart]') || 
                          screen.getByText(/Hello, John!/).parentElement;

    // Simulate left swipe (next) - use a larger distance to ensure it triggers
    fireEvent.touchStart(touchContainer, {
      targetTouches: [{ clientX: 200 }]
    });
    fireEvent.touchEnd(touchContainer, {
      targetTouches: [{ clientX: 50 }] // 150px left swipe
    });

    // Wait for the navigation to complete
    await waitFor(() => {
      expect(screen.getByText(/Track Your Workouts & Recovery/)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Simulate right swipe (back)
    fireEvent.touchStart(touchContainer, {
      targetTouches: [{ clientX: 50 }]
    });
    fireEvent.touchEnd(touchContainer, {
      targetTouches: [{ clientX: 200 }] // 150px right swipe
    });

    // Wait for the navigation to complete
    await waitFor(() => {
      expect(screen.getByText(/Hello, John!/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should not navigate on small swipe gestures', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Find the element with touch handlers
    const touchContainer = screen.getByText(/Hello, John!/).closest('div[onTouchStart]') || 
                          screen.getByText(/Hello, John!/).parentElement;

    // Simulate small swipe (less than 50px)
    fireEvent.touchStart(touchContainer, {
      targetTouches: [{ clientX: 100 }]
    });
    fireEvent.touchEnd(touchContainer, {
      targetTouches: [{ clientX: 70 }] // Only 30px swipe
    });

    // Should still be on first step
    expect(screen.getByText(/Hello, John!/)).toBeInTheDocument();
  });

  it('should render example chat on second step', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Go to second step
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show example chat
    expect(screen.getByText(/Squats: 3x8 @ 185lbs/)).toBeInTheDocument();
    expect(screen.getByText(/I notice your quad soreness/)).toBeInTheDocument();
  });

  it('should handle form data changes', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // Navigate to last step
    for (let i = 0; i < 3; i++) {
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
    }

    // Complete onboarding
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    await user.click(getStartedButton);

    // Should call onComplete with user data and default preferredMode
    expect(mockOnComplete).toHaveBeenCalledWith({
      email: mockUser.email,
      name: mockUser.name,
      preferredMode: 'chat'
    });
  });

  it('should render all UI components correctly', () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByTestId('lamp-background')).toBeInTheDocument();
    expect(screen.getByTestId('text-pressure')).toBeInTheDocument();
  });

  it('should handle step validation correctly', async () => {
    render(
      <OnboardingFlow 
        user={mockUser}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    // All steps should be valid by default
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();

    // Navigate through first two steps
    for (let i = 0; i < 2; i++) {
      await user.click(nextButton);
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    }
    
    // Last step should show "Get Started" button
    await user.click(nextButton);
    expect(screen.getByRole('button', { name: /get started/i })).not.toBeDisabled();
  });
}); 