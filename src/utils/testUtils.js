import React from 'react';
import { render } from '@testing-library/react';

// Mock data for testing
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z'
};

export const mockMessages = [
  {
    id: 1,
    text: 'Hello, I need some reflection help',
    sender: 'user',
    timestamp: '10:00 AM'
  },
  {
    id: 2,
    text: 'I\'d be happy to help you reflect. What\'s on your mind today?',
    sender: 'ai',
    timestamp: '10:01 AM'
  },
  {
    id: 3,
    text: 'I\'m feeling stressed about work',
    sender: 'user',
    timestamp: '10:02 AM'
  },
  {
    id: 4,
    text: 'Work stress is common. Can you tell me more about what\'s causing this stress?',
    sender: 'ai',
    timestamp: '10:03 AM'
  }
];

export const mockInsights = {
  themes: [
    { name: 'Stress', count: 5 },
    { name: 'Work', count: 3 },
    { name: 'Relationships', count: 2 }
  ],
  moods: [
    { name: 'Anxious', count: 4 },
    { name: 'Hopeful', count: 2 },
    { name: 'Frustrated', count: 1 }
  ]
};

export const mockJournalEntries = [
  {
    id: 1,
    userInput: 'I\'m feeling stressed about work',
    aiQuestion: 'Can you tell me more about what\'s causing this stress?',
    timestamp: '10:00 AM'
  },
  {
    id: 2,
    userInput: 'I have a big presentation tomorrow',
    aiQuestion: 'What specifically about the presentation is causing you stress?',
    timestamp: '10:05 AM'
  }
];

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return children;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock API responses
export const mockApiResponses = {
  reflect: {
    question: 'I\'d be happy to help you reflect. What\'s on your mind today?'
  },
  insights: mockInsights,
  auth: {
    token: 'mock-jwt-token',
    user: mockUser
  }
};

// Helper to mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Helper to mock axios
export const mockAxios = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
};

// Helper to create mock event
export const createMockEvent = (value) => ({
  target: { value },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
});

// Helper to wait for async operations
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to mock window functions
export const mockWindowFunctions = () => {
  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock document.createElement
  const mockElement = {
    href: '',
    download: '',
    click: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn()
  };
  global.document.createElement = jest.fn(() => mockElement);
  
  // Mock document.body methods without replacing the entire body
  if (!global.document.body.appendChild) {
    global.document.body.appendChild = jest.fn();
  }
  if (!global.document.body.removeChild) {
    global.document.body.removeChild = jest.fn();
  }
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
}; 