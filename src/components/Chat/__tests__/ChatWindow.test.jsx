import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import ChatWindow from '../ChatWindow';

// Mock the required dependencies
jest.mock('../../ui/MyraLogo', () => ({
  default: ({ size, animated }) => <div data-testid="myra-logo" data-size={size} data-animated={animated}>MyraLogo</div>
}));

jest.mock('../../ui/gesture-feedback', () => ({
  GestureButton: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('../../ui/voice-visualizer', () => ({
  VoiceVisualizer: () => <div data-testid="voice-visualizer">VoiceVisualizer</div>,
  VoiceStatusIndicator: () => <div data-testid="voice-status-indicator">VoiceStatusIndicator</div>
}));

jest.mock('../../ui/typing-indicator', () => ({
  EnhancedTypingIndicator: () => <div data-testid="typing-indicator">TypingIndicator</div>
}));

jest.mock('../../ui/LoadingButton', () => ({
  default: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('../../../hooks/useMobileGestures', () => ({
  useMobileGestures: () => ({
    gestureHandlers: {},
    triggerHaptic: jest.fn()
  })
}));

jest.mock('../../AI/EnhancedAISuggestions', () => ({
  default: () => <div data-testid="ai-suggestions">AISuggestions</div>
}));

describe('ChatWindow Mode Toggle', () => {
  const defaultProps = {
    messages: [],
    inputText: '',
    onInputChange: jest.fn(),
    onSend: jest.fn(),
    onKeyDown: jest.fn(),
    isLoading: false,
    isListening: false,
    onSpeechToggle: jest.fn(),
    transcript: '',
    streak: 0,
    browserSupportsSpeechRecognition: true,
    microphoneStatus: 'granted',
    conversationPersistence: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders mode toggle buttons', () => {
    render(<ChatWindow {...defaultProps} />);
    
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Journal')).toBeInTheDocument();
  });

  it('starts in chat mode by default', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const chatButton = screen.getByText('Chat').closest('button');
    const journalButton = screen.getByText('Journal').closest('button');
    
    expect(chatButton).toHaveClass('bg-cyan-500');
    expect(journalButton).not.toHaveClass('bg-cyan-500');
  });

  it('switches to journal mode when journal button is clicked', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const journalButton = screen.getByText('Journal').closest('button');
    fireEvent.click(journalButton);
    
    expect(journalButton).toHaveClass('bg-cyan-500');
    expect(screen.getByText('Chat').closest('button')).not.toHaveClass('bg-cyan-500');
  });

  it('shows chat-specific quick actions in chat mode', () => {
    render(<ChatWindow {...defaultProps} />);
    
    expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
    expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText('Tell me about your day')).toBeInTheDocument();
  });

  it('shows journal-specific quick actions in journal mode', () => {
    render(<ChatWindow {...defaultProps} />);
    
    // Switch to journal mode
    const journalButton = screen.getByText('Journal').closest('button');
    fireEvent.click(journalButton);
    
    expect(screen.getByText('Workout Entry')).toBeInTheDocument();
    expect(screen.getByText('Mood Reflection')).toBeInTheDocument();
    expect(screen.getByText('Daily Entry')).toBeInTheDocument();
  });

  it('updates welcome message based on mode', () => {
    render(<ChatWindow {...defaultProps} />);
    
    // Check chat mode welcome message
    expect(screen.getByText(/I'm here to help you explore your thoughts and feelings through meaningful conversations/)).toBeInTheDocument();
    
    // Switch to journal mode
    const journalButton = screen.getByText('Journal').closest('button');
    fireEvent.click(journalButton);
    
    // Check journal mode welcome message
    expect(screen.getByText(/I'm here to help you create thoughtful journal entries/)).toBeInTheDocument();
  });

  it('updates input placeholder based on mode', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Share your thoughts/);
    expect(textarea).toBeInTheDocument();
    
    // Switch to journal mode
    const journalButton = screen.getByText('Journal').closest('button');
    fireEvent.click(journalButton);
    
    const journalTextarea = screen.getByPlaceholderText(/What's on your mind/);
    expect(journalTextarea).toBeInTheDocument();
  });

  it('calls onInputChange when quick action buttons are clicked', () => {
    render(<ChatWindow {...defaultProps} />);
    
    const feelingButton = screen.getByText('How are you feeling?');
    fireEvent.click(feelingButton);
    
    expect(defaultProps.onInputChange).toHaveBeenCalledWith({
      target: { value: 'How are you feeling today?' }
    });
  });
}); 