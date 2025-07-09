import { useState, useCallback } from 'react';
import axios from 'axios';

export const useAuth = (setCurrentView, handleError) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleAuthSuccess = useCallback((userData, userToken) => {
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    // Don't set currentView here - let onboarding logic handle it
    // setCurrentView('app'); // Removed to prevent race condition
  }, []); // Remove setCurrentView dependency

  const handleLogout = useCallback(() => {
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setShowProfile(false);
    setCurrentView('landing');
  }, [setCurrentView]);

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('reflectWithin_user', JSON.stringify(updatedUser));
  }, []);

  return {
    user,
    setUser,
    showAuthModal,
    setShowAuthModal,
    showProfile,
    setShowProfile,
    handleAuthSuccess,
    handleLogout,
    handleProfileUpdate
  };
}; 