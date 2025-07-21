import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import HomeTab from '../HomeTab';

jest.mock('../../Typography/Typography.jsx', () => ({
  Typography: ({ children, ...props }) => <div {...props}>{children}</div>
}));

describe('HomeTab', () => {
  const mockUser = { name: 'Alice Example' };
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HomeTab user={mockUser} streak={3} last5JournalEntries={[]} onAction={mockOnAction} />);
    expect(screen.getByText(/Ready to reflect on your journey/i)).toBeInTheDocument();
  });

  it('shows personalized greeting with user name', () => {
    render(<HomeTab user={mockUser} streak={0} last5JournalEntries={[]} onAction={mockOnAction} />);
    expect(screen.getByText(/Alice!/)).toBeInTheDocument();
  });

  it('shows generic greeting if no user name', () => {
    render(<HomeTab user={{}} streak={0} last5JournalEntries={[]} onAction={mockOnAction} />);
    expect(screen.getByText(/there!/)).toBeInTheDocument();
  });

  it('shows a reflection prompt and Start Reflecting button', () => {
    render(<HomeTab user={mockUser} streak={0} last5JournalEntries={[]} onAction={mockOnAction} />);
    expect(screen.getByText(/Today's Reflection/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start reflecting/i })).toBeInTheDocument();
  });

  it('shows a philosophical quote and author', () => {
    render(<HomeTab user={mockUser} streak={0} last5JournalEntries={[]} onAction={mockOnAction} />);
    // Quotes are random, so just check for known authors
    const authors = [
      'Rainer Maria Rilke',
      'Aristotle',
      'Buddha',
      'Baltasar Gracián',
      'Socrates'
    ];
    expect(
      authors.some(author => screen.queryByText(new RegExp(author, 'i')))
    ).toBe(true);
  });

  it('shows streak counter if streak > 0', () => {
    render(<HomeTab user={mockUser} streak={5} last5JournalEntries={[]} onAction={mockOnAction} />);
    expect(screen.getByText(/Your reflection streak/i)).toBeInTheDocument();
    expect(screen.getByText(/5 days?/i)).toBeInTheDocument();
  });

  it('does not show streak counter if streak is 0', () => {
    render(<HomeTab user={mockUser} streak={0} last5JournalEntries={[]} onAction={mockOnAction} />);
    expect(screen.queryByText(/Your reflection streak/i)).not.toBeInTheDocument();
  });

  it('calls onAction when Start Reflecting button is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeTab user={mockUser} streak={0} last5JournalEntries={[]} onAction={mockOnAction} />);
    const btn = screen.getByRole('button', { name: /start reflecting/i });
    await user.click(btn);
    expect(mockOnAction).toHaveBeenCalledWith('voice');
  });
}); 