import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '../useOnboarding';

describe('useOnboarding', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with showOnboarding false when no user', () => {
    const { result } = renderHook(() => useOnboarding(null));

    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.onboardingData).toBe(null);
  });

  it('should show onboarding when user has not completed it', () => {
    const { result } = renderHook(() => useOnboarding(mockUser));

    expect(result.current.showOnboarding).toBe(true);
    expect(result.current.onboardingData).toBe(null);
  });

  it('should not show onboarding when user has already completed it', () => {
    // Set up localStorage to indicate onboarding is completed
    localStorage.setItem(`reflectWithin_onboarding_completed_${mockUser.id}`, 'true');
    
    const { result } = renderHook(() => useOnboarding(mockUser));

    expect(result.current.showOnboarding).toBe(false);
  });

  it('should load existing onboarding data from localStorage', () => {
    const existingData = {
      preferredMode: 'chat',
      goals: ['fitness', 'recovery']
    };
    
    localStorage.setItem(`reflectWithin_onboarding_completed_${mockUser.id}`, 'true');
    localStorage.setItem(`reflectWithin_onboarding_data_${mockUser.id}`, JSON.stringify(existingData));
    
    const { result } = renderHook(() => useOnboarding(mockUser));

    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.onboardingData).toEqual(existingData);
  });

  it('should complete onboarding and save data to localStorage', () => {
    const { result } = renderHook(() => useOnboarding(mockUser));
    const onboardingData = {
      preferredMode: 'journal',
      goals: ['strength', 'endurance']
    };

    act(() => {
      result.current.completeOnboarding(onboardingData);
    });

    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.onboardingData).toEqual(onboardingData);
    
    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `reflectWithin_onboarding_completed_${mockUser.id}`,
      'true'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `reflectWithin_onboarding_data_${mockUser.id}`,
      JSON.stringify(onboardingData)
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `reflectWithin_user_goals_${mockUser.id}`,
      JSON.stringify(onboardingData.goals)
    );
  });

  it('should skip onboarding and mark as completed', () => {
    const { result } = renderHook(() => useOnboarding(mockUser));

    act(() => {
      result.current.skipOnboarding();
    });

    expect(result.current.showOnboarding).toBe(false);
    
    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `reflectWithin_onboarding_completed_${mockUser.id}`,
      'true'
    );
  });

  it('should reset onboarding and clear localStorage', () => {
    // Set up initial state as completed
    localStorage.setItem(`reflectWithin_onboarding_completed_${mockUser.id}`, 'true');
    localStorage.setItem(`reflectWithin_onboarding_data_${mockUser.id}`, '{"test": "data"}');
    
    const { result } = renderHook(() => useOnboarding(mockUser));

    act(() => {
      result.current.resetOnboarding();
    });

    expect(result.current.showOnboarding).toBe(true);
    
    // Check localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `reflectWithin_onboarding_completed_${mockUser.id}`
    );
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `reflectWithin_onboarding_data_${mockUser.id}`
    );
  });

  it('should handle user with email but no id', () => {
    const userWithEmailOnly = {
      email: 'test@example.com',
      name: 'Test User'
    };

    const { result } = renderHook(() => useOnboarding(userWithEmailOnly));

    expect(result.current.showOnboarding).toBe(true);

    act(() => {
      result.current.completeOnboarding({ preferredMode: 'chat' });
    });

    // Should use email as fallback for localStorage keys
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `reflectWithin_onboarding_completed_${userWithEmailOnly.email}`,
      'true'
    );
  });

  it('should handle malformed onboarding data in localStorage', () => {
    // Set up invalid JSON in localStorage
    localStorage.setItem(`reflectWithin_onboarding_completed_${mockUser.id}`, 'true');
    localStorage.setItem(`reflectWithin_onboarding_data_${mockUser.id}`, 'invalid json');
    
    const { result } = renderHook(() => useOnboarding(mockUser));

    expect(result.current.showOnboarding).toBe(false);
    expect(result.current.onboardingData).toBe(null);
  });

  it('should not save goals separately if goals do not exist', () => {
    const { result } = renderHook(() => useOnboarding(mockUser));
    const onboardingData = {
      preferredMode: 'chat'
      // No goals property
    };

    act(() => {
      result.current.completeOnboarding(onboardingData);
    });

    // Should not call localStorage.setItem for goals
    const goalsCall = localStorage.setItem.mock.calls.find(
      call => call[0].includes('user_goals')
    );
    expect(goalsCall).toBeUndefined();
  });

  it('should update state when user changes', () => {
    const { result, rerender } = renderHook(({ user }) => useOnboarding(user), {
      initialProps: { user: null }
    });

    expect(result.current.showOnboarding).toBe(false);

    // Change user
    rerender({ user: mockUser });

    expect(result.current.showOnboarding).toBe(true);
  });
}); 