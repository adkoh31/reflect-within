import React, { useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Contexts
import { ToastProvider } from './contexts/ToastContext';

// Components
import ViewManager from './components/App/ViewManager';

// Custom hooks
import { useAppState } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Main App Component - Latest version with new UI - Vercel Test v2
const App = () => {
  // App state
  const appState = useAppState();
  const { currentView, setCurrentView } = appState;

  // Auth
  const auth = useAuth(setCurrentView);
  const { user, handleAuthSuccess } = auth;

  // Onboarding
  const { showOnboarding, onboardingData, completeOnboarding, skipOnboarding } = useOnboarding();

  // Effects
  useEffect(() => {
    const savedToken = localStorage.getItem('reflectWithin_token');
    const savedUser = localStorage.getItem('reflectWithin_user');
    
    if (savedToken && savedUser) {
      try {
        auth.setUser(JSON.parse(savedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        setCurrentView('app');
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('reflectWithin_token');
        localStorage.removeItem('reflectWithin_user');
      }
    }
  }, []);

  // Navigation handlers
  const handleGetStarted = () => setCurrentView('auth');
  const handleBackToLanding = () => setCurrentView('landing');

  // Onboarding handlers
  const handleOnboardingComplete = (data) => {
    completeOnboarding(data);
  };

  return (
    <ViewManager 
      currentView={currentView}
      onGetStarted={handleGetStarted}
      onBackToLanding={handleBackToLanding}
      onAuthSuccess={handleAuthSuccess}
      showOnboarding={showOnboarding}
      onboardingData={onboardingData}
      onOnboardingComplete={handleOnboardingComplete}
      onSkipOnboarding={skipOnboarding}
      user={user}
    />
  );
};

export default App;
