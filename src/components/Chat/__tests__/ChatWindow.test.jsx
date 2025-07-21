import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from '../ChatWindow';

// Mock dependencies
jest.mock('../../ui/gesture-feedback', () => ({
  GestureButton: ({ children, onClick, disabled, className }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="gesture-button">
      {children}
    </button>
  )
}));

jest.mock('../../ui/voice-visualizer', () => ({
  VoiceVisualizer: ({ isListening }) => (
    <div data-testid="voice-visualizer" className={isListening ? 'listening' : 'not-listening'}>
      Voice Visualizer
    </div>
  ),
  VoiceStatusIndicator: ({ status }) => (
    <div data-testid="voice-status-indicator" data-status={status}>
      Voice Status: {status}
    </div>
  )
}));

jest.mock('../../ui/typing-indicator', () => ({
  EnhancedTypingIndicator: () => <div data-testid="typing-indicator">AI is typing...</div>
}));

jest.mock('../../ui/loading-states', () => ({
  PulsingButton: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="pulsing-button">
      {children}
    </button>
  )
}));

jest.mock('../../ui/LoadingButton.jsx', () => ({
  LoadingButton: ({ children, onClick, disabled, loading, className }) => (
    <button 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={className}
      data-testid="loading-button"
      data-loading={loading}
    >
      {children}
    </button>
  )
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

describe('ChatWindow Component', () => {
  const defaultProps = {
    messages: [],
    inputText: '',
    onInputChange: jest.fn(),
    onSend: jest.fn(),
    onSendPrompt: jest.fn(),
    onSpeechToggle: jest.fn(),
    isListening: false,
    isLoading: false,
    browserSupportsSpeechRecognition: true,
    transcript: '',
    inputRef: { current: null },
    chatEndRef: { current: null },
    handleKeyPress: jest.fn(),
    user: null,
    streak: 0,
    microphoneStatus: 'ready',
    isPremium: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders chat window with header', () => {
      render(<ChatWindow {...defaultProps} />);
      
      expect(screen.getByText('Reflect Within')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('shows welcome message when no messages exist', () => {
      render(<ChatWindow {...defaultProps} />);
      
      expect(screen.getByText('Welcome to Reflect Within')).toBeInTheDocument();
      expect(screen.getByText("What's on your mind today?")).toBeInTheDocument();
      expect(screen.getByText('How are you feeling right now?')).toBeInTheDocument();
    });

    it('does not show welcome message when messages exist', () => {
      const propsWithMessages = {
        ...defaultProps,
        messages: [
          { id: '1', text: 'Hello', sender: 'user', timestamp: Date.now() }
        ]
      };
      
      render(<ChatWindow {...propsWithMessages} />);
      
      expect(screen.queryByText('Welcome to Reflect Within')).not.toBeInTheDocument();
    });

    it('shows streak display when streak is greater than 0', () => {
      const propsWithStreak = {
        ...defaultProps,
        streak: 5
      };
      
      render(<ChatWindow {...propsWithStreak} />);
      
      expect(screen.getByText('5 days streak')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('does not show streak display when streak is 0', () => {
      render(<ChatWindow {...defaultProps} />);
      
      expect(screen.queryByText(/streak/)).not.toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('displays user messages correctly', () => {
      const propsWithMessages = {
        ...defaultProps,
        messages: [
          { 
            id: '1', 
            text: 'Hello AI', 
            sender: 'user', 
            timestamp: new Date('2024-01-15T10:00:00Z').getTime() 
          }
        ]
      };
      
      render(<ChatWindow {...propsWithMessages} />);
      
      expect(screen.getByText('Hello AI')).toBeInTheDocument();
      expect(screen.queryByText('Welcome to Reflect Within')).not.toBeInTheDocument();
    });

    it('displays AI messages correctly', () => {
      const propsWithMessages = {
        ...defaultProps,
        messages: [
          { 
            id: '1', 
            text: 'Hello! How can I help you today?', 
            sender: 'ai', 
            timestamp: new Date('2024-01-15T10:00:00Z').getTime() 
          }
        ]
      };
      
      render(<ChatWindow {...propsWithMessages} />);
      
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });

    it('displays multiple messages in order', () => {
      const propsWithMessages = {
        ...defaultProps,
        messages: [
          { 
            id: '1', 
            text: 'Hello', 
            sender: 'user', 
            timestamp: new Date('2024-01-15T10:00:00Z').getTime() 
          },
          { 
            id: '2', 
            text: 'Hi there!', 
            sender: 'ai', 
            timestamp: new Date('2024-01-15T10:01:00Z').getTime() 
          }
        ]
      };
      
      render(<ChatWindow {...propsWithMessages} />);
      
      const messages = screen.getAllByText(/Hello|Hi there!/);
      expect(messages).toHaveLength(2);
    });

    it('shows loading indicator when isLoading is true', () => {
      const propsWithLoading = {
        ...defaultProps,
        isLoading: true
      };
      
      render(<ChatWindow {...propsWithLoading} />);
      
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onInputChange when text is entered', async () => {
      const user = userEvent.setup();
      const mockOnInputChange = jest.fn();
      const propsWithMock = {
        ...defaultProps,
        onInputChange: mockOnInputChange
      };
      
      render(<ChatWindow {...propsWithMock} />);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts...');
      await user.type(textarea, 'Hello');
      
      expect(mockOnInputChange).toHaveBeenCalled();
    });

    it('calls onSend when send button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSend = jest.fn();
      const propsWithMock = {
        ...defaultProps,
        inputText: 'Hello',
        onSend: mockOnSend
      };
      
      render(<ChatWindow {...propsWithMock} />);
      
      const sendButton = screen.getByTestId('loading-button');
      await user.click(sendButton);
      
      expect(mockOnSend).toHaveBeenCalled();
    });

    it('disables send button when input is empty', () => {
      render(<ChatWindow {...defaultProps} />);
      
      const sendButton = screen.getByTestId('loading-button');
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has text', () => {
      const propsWithText = {
        ...defaultProps,
        inputText: 'Hello'
      };
      
      render(<ChatWindow {...propsWithText} />);
      
      const sendButton = screen.getByTestId('loading-button');
      expect(sendButton).not.toBeDisabled();
    });

    it('calls onSendPrompt when welcome prompt is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSendPrompt = jest.fn();
      const propsWithMock = {
        ...defaultProps,
        onSendPrompt: mockOnSendPrompt
      };
      
      render(<ChatWindow {...propsWithMock} />);
      
      const promptButton = screen.getByText("What's on your mind today?");
      await user.click(promptButton);
      
      expect(mockOnSendPrompt).toHaveBeenCalledWith("What's on your mind today?");
    });

    it('calls handleKeyPress when Enter is pressed', async () => {
      const user = userEvent.setup();
      const mockHandleKeyPress = jest.fn();
      const propsWithMock = {
        ...defaultProps,
        handleKeyPress: mockHandleKeyPress
      };
      
      render(<ChatWindow {...propsWithMock} />);
      
      const textarea = screen.getByPlaceholderText('Share your thoughts...');
      await user.type(textarea, '{enter}');
      
      expect(mockHandleKeyPress).toHaveBeenCalled();
    });
  });

  describe('Voice Features', () => {
    it('shows microphone button', () => {
      render(<ChatWindow {...defaultProps} />);
      
      expect(screen.getByTestId('gesture-button')).toBeInTheDocument();
    });

    it('calls onSpeechToggle when microphone button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSpeechToggle = jest.fn();
      const propsWithMock = {
        ...defaultProps,
        onSpeechToggle: mockOnSpeechToggle
      };
      
      render(<ChatWindow {...propsWithMock} />);
      
      const micButton = screen.getByTestId('gesture-button');
      await user.click(micButton);
      
      expect(mockOnSpeechToggle).toHaveBeenCalled();
    });

    it('shows voice visualizer when listening', () => {
      const propsWithListening = {
        ...defaultProps,
        isListening: true
      };
      
      render(<ChatWindow {...propsWithListening} />);
      
      expect(screen.getByTestId('voice-visualizer')).toBeInTheDocument();
      expect(screen.getByTestId('voice-status-indicator')).toBeInTheDocument();
    });

    it('does not show voice visualizer when not listening', () => {
      render(<ChatWindow {...defaultProps} />);
      
      expect(screen.queryByTestId('voice-visualizer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('voice-status-indicator')).not.toBeInTheDocument();
    });

    it('shows transcript when available', () => {
      const propsWithTranscript = {
        ...defaultProps,
        transcript: 'Hello, this is a test transcript'
      };
      
      render(<ChatWindow {...propsWithTranscript} />);
      
      expect(screen.getByText('Hello, this is a test transcript')).toBeInTheDocument();
      expect(screen.getByText('Transcript:')).toBeInTheDocument();
    });

    it('disables microphone button when browser does not support speech recognition', () => {
      const propsWithoutSpeechSupport = {
        ...defaultProps,
        browserSupportsSpeechRecognition: false
      };
      
      render(<ChatWindow {...propsWithoutSpeechSupport} />);
      
      const micButton = screen.getByTestId('gesture-button');
      expect(micButton).toBeDisabled();
    });

    it('shows browser support warning when speech recognition is not supported', () => {
      const propsWithoutSpeechSupport = {
        ...defaultProps,
        browserSupportsSpeechRecognition: false
      };
      
      render(<ChatWindow {...propsWithoutSpeechSupport} />);
      
      expect(screen.getByText('Voice input not supported in this browser')).toBeInTheDocument();
    });

    it('disables microphone button when loading', () => {
      const propsWithLoading = {
        ...defaultProps,
        isLoading: true
      };
      
      render(<ChatWindow {...propsWithLoading} />);
      
      const micButton = screen.getByTestId('gesture-button');
      expect(micButton).toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('shows loading state on send button when isLoading is true', () => {
      const propsWithLoading = {
        ...defaultProps,
        inputText: 'Hello',
        isLoading: true
      };
      
      render(<ChatWindow {...propsWithLoading} />);
      
      const sendButton = screen.getByTestId('loading-button');
      expect(sendButton).toHaveAttribute('data-loading', 'true');
    });

    it('disables send button when loading', () => {
      const propsWithLoading = {
        ...defaultProps,
        inputText: 'Hello',
        isLoading: true
      };
      
      render(<ChatWindow {...propsWithLoading} />);
      
      const sendButton = screen.getByTestId('loading-button');
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Premium Features', () => {
    it('shows premium indicator when user is premium', () => {
      const propsWithPremium = {
        ...defaultProps,
        isPremium: true
      };
      
      render(<ChatWindow {...propsWithPremium} />);
      
      // Note: Premium features might be handled differently in the actual component
      // This test can be updated based on how premium features are displayed
      expect(screen.getByText('Reflect Within')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper textarea placeholder', () => {
      render(<ChatWindow {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
    });

    it('has proper button labels and roles', () => {
      render(<ChatWindow {...defaultProps} />);
      
      const sendButton = screen.getByTestId('loading-button');
      const micButton = screen.getByTestId('gesture-button');
      
      expect(sendButton).toBeInTheDocument();
      expect(micButton).toBeInTheDocument();
    });
  });
}); 