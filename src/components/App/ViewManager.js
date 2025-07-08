import React, { Suspense, lazy } from 'react';
import { LoadingMessage } from '../LoadingStates';

// Lazy load heavy components
const LandingPage = lazy(() => import('../Landing/LandingPage'));
const AuthPage = lazy(() => import('../Auth/AuthPage'));
const MainApp = lazy(() => import('./MainApp'));

// Loading fallback component
const LoadingFallback = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex items-center justify-center">
    <div className="text-center">
      <LoadingMessage context="general" />
      <div className="mt-4 text-xs text-gray-500">Version: Latest UI v2.0</div>
    </div>
  </div>
);

const ViewManager = ({ 
  currentView, 
  onGetStarted, 
  onBackToLanding, 
  onAuthSuccess,
  showOnboarding,
  onboardingData,
  onOnboardingComplete,
  onSkipOnboarding,
  user
}) => {
  // Render different views based on current state
  if (currentView === 'landing') {
    return (
      <Suspense fallback={<LoadingFallback message="Loading ReflectWithin..." />}>
        <LandingPage onGetStarted={onGetStarted} />
      </Suspense>
    );
  }

  if (currentView === 'auth') {
    return (
      <Suspense fallback={<LoadingFallback message="Loading authentication..." />}>
        <AuthPage onAuthSuccess={onAuthSuccess} onBack={onBackToLanding} />
      </Suspense>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingFallback message="Setting up your experience..." />}>
        <MainApp 
          showOnboarding={showOnboarding}
          onboardingData={onboardingData}
          onOnboardingComplete={onOnboardingComplete}
          onSkipOnboarding={onSkipOnboarding}
          user={user}
        />
      </Suspense>
    );
  }

  // Main app view
  return (
    <Suspense fallback={<LoadingFallback message="Loading your reflection space..." />}>
      <MainApp user={user} />
    </Suspense>
  );
};

export default ViewManager; 