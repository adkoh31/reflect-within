import React, { useState, useEffect } from 'react';
import { LampTransition } from '../ui/page-transition';

// Import components directly instead of lazy loading
import LandingPage from '../Landing/LandingPage';
import AuthPage from '../Auth/AuthPage';
import MainApp from './MainApp';
import OnboardingFlow from '../Onboarding/OnboardingFlow';

const ViewManager = ({ 
  currentView, 
  setCurrentView,
  onGetStarted, 
  onBackToLanding, 
  onAuthSuccess,
  showOnboarding,
  onboardingData,
  onOnboardingComplete,
  onSkipOnboarding,
  user,
  handleLogout,
  handleProfileUpdate,
  showProfile,
  setShowProfile
}) => {
  const [transitioning, setTransitioning] = useState(false);
  const [previousView, setPreviousView] = useState(currentView);

  // Handle view transitions
  useEffect(() => {
    if (previousView !== currentView) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setTransitioning(false);
        setPreviousView(currentView);
      }, 500); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [currentView, previousView]);

  // Render different views based on current state
  // Show onboarding if needed (check this FIRST)
  console.log('🔍 ViewManager Debug:', {
    currentView,
    showOnboarding,
    user: user?.email,
    transitioning
  });
  
  if (showOnboarding) {
    console.log('✅ Rendering onboarding flow directly');
    return (
      <LampTransition isVisible={!transitioning}>
        <OnboardingFlow 
          onComplete={onOnboardingComplete}
          onSkip={onSkipOnboarding}
          user={user}
        />
      </LampTransition>
    );
  }

  if (currentView === 'landing') {
    return (
      <LampTransition isVisible={!transitioning}>
        <LandingPage onGetStarted={onGetStarted} />
      </LampTransition>
    );
  }

  if (currentView === 'auth') {
    return (
      <LampTransition isVisible={!transitioning}>
        <AuthPage onAuthSuccess={onAuthSuccess} onBack={onBackToLanding} />
      </LampTransition>
    );
  }

  // Main app view
  return (
    <LampTransition isVisible={!transitioning}>
      <MainApp 
        user={user}
        handleLogout={handleLogout}
        handleProfileUpdate={handleProfileUpdate}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        setCurrentView={setCurrentView}
      />
    </LampTransition>
  );
};

export default ViewManager; 