import { useState, useEffect } from 'react';

export const useOnboarding = (user) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    // Only check onboarding if user is authenticated
    if (!user) {
      setShowOnboarding(false);
      return;
    }

    // Create user-specific onboarding keys
    const userOnboardingKey = `reflectWithin_onboarding_completed_${user.id || user.email}`;
    const userOnboardingDataKey = `reflectWithin_onboarding_data_${user.id || user.email}`;
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey);
    const savedOnboardingData = localStorage.getItem(userOnboardingDataKey);
    
    console.log('🔍 useOnboarding Debug:', {
      user: user?.email,
      userOnboardingKey,
      hasCompletedOnboarding,
      savedOnboardingData,
      willShowOnboarding: !hasCompletedOnboarding
    });
    
    if (!hasCompletedOnboarding) {
      console.log('✅ Setting showOnboarding = true for user:', user.email);
      setShowOnboarding(true);
    } else {
      console.log('❌ Onboarding already completed for user:', user.email);
      setShowOnboarding(false);
    }
    
    if (savedOnboardingData) {
      try {
        setOnboardingData(JSON.parse(savedOnboardingData));
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
      }
    }
  }, [user]); // Re-run when user changes

  const completeOnboarding = (data) => {
    console.log('🎉 Completing onboarding with data:', data);
    setShowOnboarding(false);
    setOnboardingData(data);
    
    // Save to localStorage with user-specific keys
    const userOnboardingKey = `reflectWithin_onboarding_completed_${user?.id || user?.email}`;
    const userOnboardingDataKey = `reflectWithin_onboarding_data_${user?.id || user?.email}`;
    
    localStorage.setItem(userOnboardingKey, 'true');
    localStorage.setItem(userOnboardingDataKey, JSON.stringify(data));
  };

  const skipOnboarding = () => {
    console.log('⏭️ Skipping onboarding');
    setShowOnboarding(false);
    
    // Save to localStorage with user-specific keys
    const userOnboardingKey = `reflectWithin_onboarding_completed_${user?.id || user?.email}`;
    localStorage.setItem(userOnboardingKey, 'true');
  };

  const resetOnboarding = () => {
    console.log('🔄 Resetting onboarding');
    setShowOnboarding(true);
    
    // Remove user-specific keys
    const userOnboardingKey = `reflectWithin_onboarding_completed_${user?.id || user?.email}`;
    const userOnboardingDataKey = `reflectWithin_onboarding_data_${user?.id || user?.email}`;
    
    localStorage.removeItem(userOnboardingKey);
    localStorage.removeItem(userOnboardingDataKey);
  };

  return {
    showOnboarding,
    onboardingData,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}; 