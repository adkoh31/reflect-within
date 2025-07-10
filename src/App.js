import React, { useEffect } from 'react';
import axios from 'axios';
import { AppProvider } from './contexts/AppContext';
import ViewManager from './components/App/ViewManager';
import { useAppState } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';

// Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // This line was removed as per the new_code

// Main App Component - Latest version with new UI - Vercel Test v2
const App = () => {
  // App state
  const appState = useAppState();
  const { currentView, setCurrentView } = appState;

  // Auth
  const auth = useAuth(setCurrentView);
  const { user, handleAuthSuccess, handleLogout, handleProfileUpdate, showProfile, setShowProfile } = auth;

  // Onboarding
  const { showOnboarding, onboardingData, completeOnboarding, skipOnboarding } = useOnboarding(user);

  // Effects
  useEffect(() => {
    // Don't automatically load saved auth - let user choose to log in
    // This prevents auto-login when user just wants to browse
    setCurrentView('landing');
  }, [setCurrentView]);

  // Handle view transitions based on user and onboarding state
  useEffect(() => {
    console.log('🔄 App State Debug:', {
      user: user?.email,
      showOnboarding,
      currentView
    });

    // Only handle transitions for authenticated users
    if (user) {
      if (showOnboarding) {
        console.log('✅ User authenticated and needs onboarding - going to app');
        setCurrentView('app'); // Go to app, let ViewManager handle onboarding
      } else if (currentView !== 'app') {
        console.log('✅ User authenticated and completed onboarding - going to app');
        setCurrentView('app');
      }
    }
    // Don't interfere with auth navigation - let user stay on auth page
  }, [user, showOnboarding, currentView, setCurrentView]);

  // Navigation handlers
  const handleGetStarted = () => {
    setCurrentView('auth');
  };
  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // Onboarding handlers
  const handleOnboardingComplete = (data) => {
    completeOnboarding(data);
  };

  return (
    <AppProvider>
      <ViewManager 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onGetStarted={handleGetStarted}
        onBackToLanding={handleBackToLanding}
        onAuthSuccess={handleAuthSuccess}
        showOnboarding={showOnboarding}
        onboardingData={onboardingData}
        onOnboardingComplete={handleOnboardingComplete}
        onSkipOnboarding={skipOnboarding}
        user={user}
        handleLogout={handleLogout}
        handleProfileUpdate={handleProfileUpdate}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
      />
    </AppProvider>
  );
};

export default App;
