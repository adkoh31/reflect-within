import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useAuth = (setCurrentView, handleError) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Restore authentication from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('reflectWithin_token');
    const savedUser = localStorage.getItem('reflectWithin_user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Restored authentication from localStorage');
      } catch (error) {
        console.error('Failed to restore authentication:', error);
        // Clear invalid data
        localStorage.removeItem('reflectWithin_token');
        localStorage.removeItem('reflectWithin_user');
      }
    }
  }, []);

  const handleAuthSuccess = useCallback((userData, userToken) => {
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    // Store token in localStorage for persistence
    localStorage.setItem('reflectWithin_token', userToken);
    localStorage.setItem('reflectWithin_user', JSON.stringify(userData));
    // Don't set currentView here - let onboarding logic handle it
    // setCurrentView('app'); // Removed to prevent race condition
  }, []); // Remove setCurrentView dependency

  const handleLogout = useCallback(() => {
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    // Clear localStorage
    localStorage.removeItem('reflectWithin_token');
    localStorage.removeItem('reflectWithin_user');
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