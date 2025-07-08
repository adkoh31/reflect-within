import { useState, useEffect } from 'react';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('reflectWithin_onboarding_completed');
    const savedOnboardingData = localStorage.getItem('reflectWithin_onboarding_data');
    
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
    
    if (savedOnboardingData) {
      try {
        setOnboardingData(JSON.parse(savedOnboardingData));
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
      }
    }
  }, []);

  const completeOnboarding = (data) => {
    setShowOnboarding(false);
    setOnboardingData(data);
    
    // Save to localStorage
    localStorage.setItem('reflectWithin_onboarding_completed', 'true');
    localStorage.setItem('reflectWithin_onboarding_data', JSON.stringify(data));
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('reflectWithin_onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    setShowOnboarding(true);
    localStorage.removeItem('reflectWithin_onboarding_completed');
    localStorage.removeItem('reflectWithin_onboarding_data');
  };

  return {
    showOnboarding,
    onboardingData,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}; 