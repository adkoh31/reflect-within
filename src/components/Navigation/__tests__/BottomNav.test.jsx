import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import BottomNav from '../BottomNav';

// Mock the LimelightNav component
jest.mock('../../ui/limelight-nav.jsx', () => ({
  LimelightNav: ({ items, onTabChange, defaultActiveIndex }) => (
    <nav data-testid="limelight-nav">
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onTabChange(index)}
          aria-label={item.label}
          data-testid={`nav-${item.id}`}
          className={index === defaultActiveIndex ? 'active' : ''}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}));

describe('BottomNav', () => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'chat', label: 'AI Chat' },
    { id: 'journal', label: 'Journal' },
    { id: 'insights', label: 'Insights' },
    { id: 'profile', label: 'Profile' }
  ];

  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation buttons', () => {
    render(
      <BottomNav activeTab="home" onTabChange={mockOnTabChange} />
    );
    
    navItems.forEach(({ id, label }) => {
      expect(screen.getByTestId(`nav-${id}`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('calls onTabChange with correct tab id when a button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BottomNav activeTab="home" onTabChange={mockOnTabChange} />
    );
    
    for (const { id } of navItems) {
      const btn = screen.getByTestId(`nav-${id}`);
      await user.click(btn);
      expect(mockOnTabChange).toHaveBeenCalledWith(id);
    }
  });

  describe('active tab highlighting', () => {
    [
      { id: 'home', label: 'Home' },
      { id: 'chat', label: 'AI Chat' },
      { id: 'journal', label: 'Journal' },
      { id: 'insights', label: 'Insights' },
      { id: 'profile', label: 'Profile' }
    ].forEach(({ id, label }) => {
      it(`highlights the active tab: ${id}`, () => {
        render(
          <BottomNav activeTab={id} onTabChange={mockOnTabChange} />
        );
        const btn = screen.getByTestId(`nav-${id}`);
        expect(btn).toHaveClass('active');
      });
    });
  });

  it('renders with correct default active tab', () => {
    render(
      <BottomNav activeTab="chat" onTabChange={mockOnTabChange} />
    );
    
    // Chat should be active (index 1)
    expect(screen.getByTestId('nav-chat')).toHaveClass('active');
    expect(screen.getByTestId('nav-home')).not.toHaveClass('active');
  });

  it('handles unknown active tab gracefully', () => {
    render(
      <BottomNav activeTab="unknown" onTabChange={mockOnTabChange} />
    );
    
    // Should default to first tab (home)
    expect(screen.getByTestId('nav-home')).toHaveClass('active');
  });
}); 