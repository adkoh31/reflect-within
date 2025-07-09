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
    const savedToken = localStorage.getItem('reflectWithin_token');
    const savedUser = localStorage.getItem('reflectWithin_user');
    
    if (savedToken && savedUser) {
      try {
        auth.setUser(JSON.parse(savedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        // Returning users go directly to app
        setCurrentView('app');
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('reflectWithin_token');
        localStorage.removeItem('reflectWithin_user');
        // If token is invalid, stay on landing page
        setCurrentView('landing');
      }
    } else {
      // New users start at landing page
      setCurrentView('landing');
    }
  }, [setCurrentView]); // Only depend on setCurrentView, not auth object

  // Handle view transitions based on user and onboarding state
  useEffect(() => {
    console.log('🔄 App State Debug:', {
      user: user?.email,
      showOnboarding,
      currentView
    });

    if (user && showOnboarding) {
      console.log('✅ User authenticated and needs onboarding - staying on current view');
      // Don't change view - let ViewManager handle onboarding
    } else if (user && !showOnboarding && currentView !== 'app') {
      console.log('✅ User authenticated and completed onboarding - going to app');
      setCurrentView('app');
    } else if (!user && currentView !== 'landing' && currentView !== 'auth') {
      console.log('❌ No user - going to landing');
      setCurrentView('landing');
    }
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
