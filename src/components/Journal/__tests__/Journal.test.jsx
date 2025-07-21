import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Journal from '../Journal';

// Mock dependencies
jest.mock('../../../hooks/useJournalEntries', () => ({
  useJournalEntries: jest.fn()
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

jest.mock('../JournalEntry', () => ({
  __esModule: true,
  default: ({ selectedDate, entry, onSave, onDelete }) => (
    <div data-testid="journal-entry">
      <div data-testid="entry-date">{selectedDate.toDateString()}</div>
      {entry && <div data-testid="entry-content">{entry.content}</div>}
      <button onClick={() => onSave(selectedDate, 'Test content', ['test'])} data-testid="save-entry">
        Save
      </button>
      {entry && (
        <button onClick={() => onDelete(entry.id)} data-testid="delete-entry">
          Delete
        </button>
      )}
    </div>
  )
}));

jest.mock('../Calendar', () => ({
  __esModule: true,
  default: ({ selectedDate, onDateSelect, onMonthChange, entriesByDate }) => (
    <div data-testid="calendar">
      <div data-testid="selected-date">{selectedDate.toDateString()}</div>
      <button onClick={() => onDateSelect(new Date('2024-01-15'))} data-testid="select-date">
        Select Date
      </button>
      <button onClick={() => onMonthChange(new Date('2024-02-01'))} data-testid="change-month">
        Change Month
      </button>
      <div data-testid="entries-count">{Object.keys(entriesByDate).length}</div>
    </div>
  )
}));

// Mock AIJournalAssistant to render with test ID
jest.mock('../AIJournalAssistant', () => ({
  __esModule: true,
  default: ({ onSaveEntry, onCancel, dataTestId }) => (
    <div data-testid={dataTestId || "ai-assistant"}>
      <div>AI Journal Assistant</div>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => onSaveEntry('2024-01-15', 'AI generated content')}>Save</button>
    </div>
  )
}));

jest.mock('../JournalEntriesList', () => ({
  __esModule: true,
  default: ({ selectedDate, entries, onAddEntry, onEditEntry, onDeleteEntry }) => (
    <div data-testid="entries-list">
      <div data-testid="list-date">{selectedDate.toDateString()}</div>
      <div data-testid="entries-count">{entries.length}</div>
      <button onClick={onAddEntry} data-testid="add-entry">
        Add Entry
      </button>
      {entries.map(entry => (
        <div key={entry.id} data-testid={`entry-${entry.id}`}>
          <span>{entry.content}</span>
          <button onClick={() => onEditEntry(entry)} data-testid={`edit-${entry.id}`}>
            Edit
          </button>
          <button onClick={() => onDeleteEntry(entry.id)} data-testid={`delete-${entry.id}`}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../RecentEntries', () => ({
  __esModule: true,
  default: ({ onEntryClick }) => (
    <div data-testid="recent-entries">
      <button onClick={() => onEntryClick(new Date('2024-01-10'))} data-testid="recent-entry-1">
        Recent Entry 1
      </button>
      <button onClick={() => onEntryClick(new Date('2024-01-09'))} data-testid="recent-entry-2">
        Recent Entry 2
      </button>
    </div>
  )
}));

// Fix DataManagementModal mock path
jest.mock('../../DataManagement/DataManagementModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, dataTestId }) => (
    isOpen ? (
      <div data-testid={dataTestId || "data-management-modal"}>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}));

// Fix ComponentErrorBoundary mock path
jest.mock('../../ui/ComponentErrorBoundary', () => ({
  ComponentErrorBoundary: ({ children }) => <div>{children}</div>
}));

// Fix gesture-feedback mock path
jest.mock('../../ui/gesture-feedback', () => ({
  SwipeableCard: ({ children, className }) => <div className={className}>{children}</div>
}));

// Fix loading-states mock path
jest.mock('../../ui/loading-states', () => ({
  JournalSkeleton: () => <div data-testid="journal-skeleton">Loading...</div>
}));

// Mock LoadingButton to avoid real rendering issues
jest.mock('../../ui/LoadingButton', () => ({
  LoadingButton: ({ children, ...props }) => <button {...props}>{children}</button>
}));

jest.mock('../../../utils/dateUtils', () => ({
  safeCreateDate: jest.fn(date => new Date(date)),
  safeGetDateKey: jest.fn(date => date.toISOString().split('T')[0]),
  safeFormatDate: jest.fn(date => date.toLocaleDateString())
}));

const mockUseJournalEntries = require('../../../hooks/useJournalEntries').useJournalEntries;

describe('Journal Component', () => {
  const defaultProps = {
    onSpeechToggle: jest.fn(),
    isListening: false,
    browserSupportsSpeechRecognition: true,
    transcript: '',
    microphoneStatus: 'ready',
    isPremium: false,
    user: { id: '1', name: 'Test User' },
    messages: []
  };

  const mockEntries = {
    '1': {
      id: '1',
      content: 'Test entry 1',
      date: '2024-01-15',
      topics: ['test'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    '2': {
      id: '2',
      content: 'Test entry 2',
      date: '2024-01-15',
      topics: ['test'],
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    }
  };

  beforeEach(() => {
    mockUseJournalEntries.mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      saveEntry: jest.fn().mockResolvedValue({ success: true }),
      deleteEntry: jest.fn().mockResolvedValue({ success: true }),
      getEntriesForDate: jest.fn().mockReturnValue([mockEntries['1']]),
      getRecentEntries: jest.fn().mockReturnValue([mockEntries['1'], mockEntries['2']]),
      getStats: jest.fn().mockReturnValue({ totalEntries: 2, streak: 5 })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders journal component with header', () => {
      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('journal-header')).toBeInTheDocument();
      expect(screen.getByText('Your Private Journal')).toBeInTheDocument();
    });

    it('shows loading skeleton when isLoading is true', () => {
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        isLoading: true
      });

      render(<Journal {...defaultProps} />);
      
      // Use getAllByTestId since there are multiple elements with this test ID
      const skeletonElements = screen.getAllByTestId('journal-skeleton');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('displays calendar when not in search mode', () => {
      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    it('displays recent entries when not in search mode', () => {
      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('recent-entries')).toBeInTheDocument();
    });
  });

  describe('Entry Display', () => {
    it('shows journal entry when single entry exists', () => {
      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('journal-entry')).toBeInTheDocument();
    });

    it('shows entries list when multiple entries exist', () => {
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        getEntriesForDate: jest.fn().mockReturnValue([mockEntries['1'], mockEntries['2']])
      });

      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('entries-list')).toBeInTheDocument();
      // Use getAllByTestId and check that one of them has the expected value
      const entriesCountElements = screen.getAllByTestId('entries-count');
      const hasExpectedCount = entriesCountElements.some(element => element.textContent === '2');
      expect(hasExpectedCount).toBe(true);
    });
  });

  describe('Date Selection', () => {
    it('updates selected date when calendar date is clicked', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);
      
      const selectDateButton = screen.getByTestId('select-date');
      await user.click(selectDateButton);
      
      expect(screen.getByTestId('selected-date')).toHaveTextContent('Mon Jan 15 2024');
    });

    it('updates current month when month is changed', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);
      
      const changeMonthButton = screen.getByTestId('change-month');
      await user.click(changeMonthButton);
      
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });
  });

  describe('Entry Management', () => {
    it('saves entry when save button is clicked', async () => {
      const user = userEvent.setup();
      const mockSaveEntry = jest.fn().mockResolvedValue({ success: true });
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        saveEntry: mockSaveEntry
      });

      render(<Journal {...defaultProps} />);
      
      const saveButton = screen.getByTestId('save-entry');
      await user.click(saveButton);
      
      expect(mockSaveEntry).toHaveBeenCalledWith(
        expect.any(Date),
        'Test content',
        ['test'],
        expect.any(Object)
      );
    });

    it('deletes entry when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockDeleteEntry = jest.fn().mockResolvedValue({ success: true });
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        deleteEntry: mockDeleteEntry
      });

      render(<Journal {...defaultProps} />);
      
      const deleteButton = screen.getByTestId('delete-entry');
      await user.click(deleteButton);
      
      expect(mockDeleteEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('Entry Modes', () => {
    it('shows manual entry mode by default', () => {
      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('journal-entry')).toBeInTheDocument();
      expect(screen.queryByTestId('ai-assistant')).not.toBeInTheDocument();
    });

    it('switches to AI mode when AI button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock with no entries so mode selection shows automatically
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        getEntriesForDate: jest.fn().mockReturnValue([])
      });
      
      render(<Journal {...defaultProps} />);
      
      // With no entries, mode selection should appear automatically
      // Look for the AI entry button with the correct test ID
      const aiButton = screen.getByTestId('ai-entry-button');
      await user.click(aiButton);
      
      // Wait for the AI assistant to appear
      await waitFor(() => {
        expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('shows search button in header', () => {
      render(<Journal {...defaultProps} />);
      
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });
  });

  describe('Recent Entries', () => {
    it('navigates to entry date when recent entry is clicked', async () => {
      const user = userEvent.setup();
      render(<Journal {...defaultProps} />);
      
      const recentEntryButton = screen.getByTestId('recent-entry-1');
      await user.click(recentEntryButton);
      
      expect(screen.getByTestId('selected-date')).toHaveTextContent('Wed Jan 10 2024');
    });
  });

  describe('Premium Features', () => {
    it('shows premium indicator when user is premium', () => {
      render(<Journal {...defaultProps} isPremium={true} />);
      
      expect(screen.getByTestId('premium-indicator')).toBeInTheDocument();
    });

    it('does not show premium indicator for free users', () => {
      render(<Journal {...defaultProps} isPremium={false} />);
      
      expect(screen.queryByTestId('premium-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles save entry errors gracefully', async () => {
      const user = userEvent.setup();
      const mockSaveEntry = jest.fn().mockRejectedValue(new Error('Save failed'));
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        saveEntry: mockSaveEntry
      });

      render(<Journal {...defaultProps} />);
      
      const saveButton = screen.getByTestId('save-entry');
      await user.click(saveButton);
      
      // The error should be handled gracefully by the component
      expect(mockSaveEntry).toHaveBeenCalled();
      // The error message should be shown in the UI
      await waitFor(() => {
        expect(screen.getByTestId('journal-error')).toHaveTextContent('Save failed');
      });
      // The component should still be rendered (not crashed)
      expect(screen.getByTestId('journal-header')).toBeInTheDocument();
    });

    it('handles delete entry errors gracefully', async () => {
      const user = userEvent.setup();
      const mockDeleteEntry = jest.fn().mockRejectedValue(new Error('Delete failed'));
      mockUseJournalEntries.mockReturnValue({
        ...mockUseJournalEntries(),
        deleteEntry: mockDeleteEntry
      });

      render(<Journal {...defaultProps} />);
      
      const deleteButton = screen.getByTestId('delete-entry');
      await user.click(deleteButton);
      
      // The error should be handled gracefully by the component
      expect(mockDeleteEntry).toHaveBeenCalled();
      // The error message should be shown in the UI
      await waitFor(() => {
        expect(screen.getByTestId('journal-error')).toHaveTextContent('Delete failed');
      });
      // The component should still be rendered (not crashed)
      expect(screen.getByTestId('journal-header')).toBeInTheDocument();
    });
  });
}); 