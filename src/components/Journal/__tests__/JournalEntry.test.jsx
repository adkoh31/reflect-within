import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
// Import the actual component, not the lazy wrapper
import JournalEntry from '../JournalEntry.jsx';

// Mock dependencies
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <div>{children}</div>,
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, onClick, disabled, className, ...props }) => (
      <button onClick={onClick} disabled={disabled} className={className} {...props}>
        {children}
      </button>
    )
  }
}));

jest.mock('lucide-react', () => ({
  Edit3: () => <span data-testid="edit-icon">Edit</span>,
  Trash2: () => <span data-testid="delete-icon">Delete</span>,
  Mic: () => <span data-testid="mic-icon">Mic</span>,
  MicOff: () => <span data-testid="mic-off-icon">MicOff</span>,
  Save: () => <span data-testid="save-icon">Save</span>,
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
  Loader2: () => <span data-testid="loader-icon">Loader</span>
}));

jest.mock('../MediaAttachment', () => ({
  default: () => <div data-testid="media-attachment">Media Attachment</div>
}));

jest.mock('../JournalTemplates', () => ({
  default: ({ onSelect }) => (
    <div data-testid="journal-templates">
      <button onClick={() => onSelect('gratitude')}>Gratitude</button>
    </div>
  )
}));

jest.mock('../TopicSelector', () => ({
  default: ({ onSelect }) => (
    <div data-testid="topic-selector">
      <button onClick={() => onSelect('work')}>Work</button>
    </div>
  )
}));

// Mock the lazy-loaded RichTextEditor
jest.mock('../../RichTextEditor', () => ({
  default: ({ value, onChange, placeholder, autoFocus, className }) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={className}
    />
  )
}));

// Test wrapper component to handle Suspense
const TestWrapper = ({ children }) => (
  <Suspense fallback={<div data-testid="loading">Loading...</div>}>
    {children}
  </Suspense>
);

describe('JournalEntry', () => {
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSpeechToggle = jest.fn();
  const user = userEvent.setup();

  const defaultProps = {
    selectedDate: '2024-01-15',
    entry: null,
    onSave: mockOnSave,
    onDelete: mockOnDelete,
    isLoading: false,
    onSpeechToggle: mockOnSpeechToggle,
    isListening: false,
    browserSupportsSpeechRecognition: true,
    transcript: '',
    isPremium: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render new entry form when no entry exists', () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/new reflection/i)).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should render existing entry when entry is provided', () => {
    const existingEntry = {
      id: '1',
      content: 'This is my reflection for today',
      date: '2024-01-15',
      topics: ['work', 'stress'],
      mood: 'stressed',
      energy: 3
    };

    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} entry={existingEntry} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/edit reflection/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is my reflection for today')).toBeInTheDocument();
  });

  it('should handle text input changes', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const editor = screen.getByTestId('rich-text-editor');
    await user.type(editor, 'This is a new reflection');
    
    expect(editor).toHaveValue('This is a new reflection');
  });

  it('should handle save action', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const editor = screen.getByTestId('rich-text-editor');
    await user.type(editor, 'Test reflection content');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      date: '2024-01-15',
      content: 'Test reflection content',
      topics: [],
      tags: [],
      attachments: [],
      mood: null,
      energy: null
    });
  });

  it('should handle delete action', async () => {
    const existingEntry = {
      id: '1',
      content: 'Test entry to delete',
      date: '2024-01-15'
    };

    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} entry={existingEntry} />
      </TestWrapper>
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should handle speech toggle', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const micButton = screen.getByRole('button', { name: /voice input/i });
    await user.click(micButton);
    
    expect(mockOnSpeechToggle).toHaveBeenCalled();
  });

  it('should show listening state when isListening is true', () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} isListening={true} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('mic-off-icon')).toBeInTheDocument();
    expect(screen.getByText(/stop listening/i)).toBeInTheDocument();
  });

  it('should display transcript when available', () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} transcript="This is a voice transcript" />
      </TestWrapper>
    );
    
    expect(screen.getByText('This is a voice transcript')).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} isLoading={true} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('should handle topic selection', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const topicButton = screen.getByRole('button', { name: /work/i });
    await user.click(topicButton);
    
    // Should add the topic to the entry
    expect(screen.getByText(/work/i)).toBeInTheDocument();
  });

  it('should handle template selection', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const templateButton = screen.getByRole('button', { name: /gratitude/i });
    await user.click(templateButton);
    
    // Should apply the template content
    const editor = screen.getByTestId('rich-text-editor');
    expect(editor.value).toContain('gratitude');
  });

  it('should handle mood selection', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const moodSelect = screen.getByLabelText(/mood/i);
    await user.selectOptions(moodSelect, 'happy');
    
    expect(moodSelect.value).toBe('happy');
  });

  it('should handle energy level selection', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const energySelect = screen.getByLabelText(/energy/i);
    await user.selectOptions(energySelect, '4');
    
    expect(energySelect.value).toBe('4');
  });

  it('should show premium features when isPremium is true', () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} isPremium={true} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('journal-templates')).toBeInTheDocument();
    expect(screen.getByTestId('topic-selector')).toBeInTheDocument();
  });

  it('should hide premium features when isPremium is false', () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} isPremium={false} />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('journal-templates')).not.toBeInTheDocument();
    expect(screen.queryByTestId('topic-selector')).not.toBeInTheDocument();
  });

  it('should handle media attachment removal', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const removeButton = screen.getByRole('button', { name: /remove media/i });
    await user.click(removeButton);
    
    // Should remove the media attachment
    expect(screen.queryByTestId('media-attachment')).not.toBeInTheDocument();
  });

  it('should validate required fields before saving', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    // Try to save without content
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Should not call onSave
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const editor = screen.getByTestId('rich-text-editor');
    await user.type(editor, 'Test content');
    
    // Test Ctrl+S shortcut
    await user.keyboard('{Control>}s{/Control}');
    
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should show character count when typing', async () => {
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const editor = screen.getByTestId('rich-text-editor');
    await user.type(editor, 'This is a test reflection');
    
    expect(screen.getByText(/5 words/i)).toBeInTheDocument();
  });

  it('should handle auto-save functionality', async () => {
    jest.useFakeTimers();
    
    render(
      <TestWrapper>
        <JournalEntry {...defaultProps} />
      </TestWrapper>
    );
    
    const editor = screen.getByTestId('rich-text-editor');
    await user.type(editor, 'Auto-save test content');
    
    // Fast-forward time to trigger auto-save
    jest.advanceTimersByTime(5000);
    
    expect(mockOnSave).toHaveBeenCalled();
    
    jest.useRealTimers();
  });
}); 