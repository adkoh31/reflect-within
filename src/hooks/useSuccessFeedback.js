import { useState, useCallback } from 'react';
import { playSuccessChime, triggerHapticFeedback } from '../utils/audio';

export const useSuccessFeedback = () => {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  const showSuccess = useCallback((message, type = 'success', duration = 3000) => {
    // Play chime and haptic feedback
    playSuccessChime();
    triggerHapticFeedback();
    
    setToast({
      isVisible: true,
      message,
      type,
      duration
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Convenience methods for common actions
  const showMessageSent = useCallback(() => {
    showSuccess('Message sent successfully!', 'sent', 2000);
  }, [showSuccess]);

  const showChatSaved = useCallback(() => {
    showSuccess('Chat saved to journal!', 'saved', 3000);
  }, [showSuccess]);

  const showJournalDownloaded = useCallback(() => {
    showSuccess('Journal downloaded successfully!', 'downloaded', 3000);
  }, [showSuccess]);

  const showInsightsGenerated = useCallback(() => {
    showSuccess('Insights generated!', 'info', 3000);
  }, [showSuccess]);

  const showProfileUpdated = useCallback(() => {
    showSuccess('Profile updated successfully!', 'success', 3000);
  }, [showSuccess]);

  const showOnboardingComplete = useCallback(() => {
    showSuccess('Welcome to ReflectWithin!', 'success', 4000);
  }, [showSuccess]);

  const showStreakMilestone = useCallback((days) => {
    showSuccess(`🎉 ${days} day streak! Keep it up!`, 'success', 4000);
  }, [showSuccess]);

  const showPremiumActivated = useCallback(() => {
    showSuccess('Premium features activated!', 'success', 3000);
  }, [showSuccess]);

  return {
    toast,
    showSuccess,
    hideToast,
    showMessageSent,
    showChatSaved,
    showJournalDownloaded,
    showInsightsGenerated,
    showProfileUpdated,
    showOnboardingComplete,
    showStreakMilestone,
    showPremiumActivated
  };
}; 