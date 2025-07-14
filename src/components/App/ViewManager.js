import React, { useState, useEffect } from 'react';
import { LampTransition } from '../ui/page-transition';

// Import components directly instead of lazy loading
import LandingPage from '../Landing/LandingPage';
import AuthPage from '../Auth/AuthPage';
import MainApp from './MainApp';
import OnboardingFlow from '../Onboarding/OnboardingFlow';
import GoalSettingModal from '../Onboarding/GoalSettingModal';

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
  const [showGoalSetting, setShowGoalSetting] = useState(false);

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

  // Show goal-setting modal after onboarding completion
  useEffect(() => {
    if (user && !showOnboarding && onboardingData && !onboardingData.goals) {
      // User completed onboarding but hasn't set goals yet
      console.log('🎯 Showing goal-setting modal for new user');
      setShowGoalSetting(true);
    }
  }, [user, showOnboarding, onboardingData]);

  // Handle goal-setting completion
  const handleGoalSettingComplete = (goalData) => {
    console.log('🎯 Goal-setting completed:', goalData);
    setShowGoalSetting(false);
    
    // Update onboarding data with goals
    const completeData = {
      ...onboardingData,
      goals: goalData.goals
    };
    onOnboardingComplete(completeData);
  };

  // Handle goal-setting skip
  const handleGoalSettingSkip = () => {
    console.log('⏭️ Goal-setting skipped');
    setShowGoalSetting(false);
  };

  // Render different views based on current state
  console.log('🔍 ViewManager Debug:', {
    currentView,
    showOnboarding,
    showGoalSetting,
    user: user?.email,
    transitioning
  });
  
  // Handle navigation state only - let individual components handle their own logic
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

  // Show onboarding if user needs it
  if (user && showOnboarding) {
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
        currentView={currentView}
      />
      
      {/* Goal Setting Modal - appears over main app */}
      <GoalSettingModal
        isOpen={showGoalSetting}
        onClose={handleGoalSettingSkip}
        onComplete={handleGoalSettingComplete}
        user={user}
      />
    </LampTransition>
  );
};

export default ViewManager; 