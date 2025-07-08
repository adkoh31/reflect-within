import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { useAuth } from '../useAuth';

// Mock axios
jest.mock('axios');

describe('useAuth', () => {
  const mockSetCurrentView = jest.fn();
  const mockHandleError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    
    // Ensure localStorage methods are properly mocked
    if (!localStorage.setItem.mock) {
      localStorage.setItem = jest.fn();
    }
    if (!localStorage.getItem.mock) {
      localStorage.getItem = jest.fn();
    }
    if (!localStorage.removeItem.mock) {
      localStorage.removeItem = jest.fn();
    }
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));

    expect(result.current.user).toBe(null);
    expect(result.current.showAuthModal).toBe(false);
    expect(result.current.showProfile).toBe(false);
  });

  it('should update user state', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should update showAuthModal state', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));

    act(() => {
      result.current.setShowAuthModal(true);
    });

    expect(result.current.showAuthModal).toBe(true);
  });

  it('should update showProfile state', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));

    act(() => {
      result.current.setShowProfile(true);
    });

    expect(result.current.showProfile).toBe(true);
  });

  it('should handle auth success correctly', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-jwt-token';

    act(() => {
      result.current.handleAuthSuccess(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    expect(mockSetCurrentView).toHaveBeenCalledWith('app');
  });

  it('should handle logout correctly', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    
    // Set up initial state
    act(() => {
      result.current.setUser({ id: '1', name: 'Test User' });
      result.current.setShowProfile(true);
      axios.defaults.headers.common['Authorization'] = 'Bearer mock-token';
    });

    act(() => {
      result.current.handleLogout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.showProfile).toBe(false);
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
    expect(mockSetCurrentView).toHaveBeenCalledWith('landing');
  });

  it('should handle profile update correctly', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    const initialUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const updatedUser = { id: '1', name: 'Updated User', email: 'updated@example.com' };

    // Set initial user
    act(() => {
      result.current.setUser(initialUser);
    });

    act(() => {
      result.current.handleProfileUpdate(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(localStorage.setItem).toHaveBeenCalledWith('reflectWithin_user', JSON.stringify(updatedUser));
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    const mockUser = { id: '1', name: 'Test User' };

    act(() => {
      result.current.setUser(mockUser);
      result.current.setShowAuthModal(true);
    });

    rerender();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.showAuthModal).toBe(true);
  });

  it('should handle multiple auth operations', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    const mockUser = { id: '1', name: 'Test User' };
    const mockToken = 'mock-jwt-token';

    act(() => {
      result.current.handleAuthSuccess(mockUser, mockToken);
      result.current.setShowProfile(true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.showProfile).toBe(true);
    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    expect(mockSetCurrentView).toHaveBeenCalledWith('app');
  });

  it('should handle logout when no user is logged in', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));

    act(() => {
      result.current.handleLogout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.showProfile).toBe(false);
    expect(mockSetCurrentView).toHaveBeenCalledWith('landing');
  });

  it('should handle profile update with null user', () => {
    const { result } = renderHook(() => useAuth(mockSetCurrentView, mockHandleError));
    const updatedUser = { id: '1', name: 'Updated User' };

    act(() => {
      result.current.handleProfileUpdate(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(localStorage.setItem).toHaveBeenCalledWith('reflectWithin_user', JSON.stringify(updatedUser));
  });
}); 