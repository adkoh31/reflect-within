import { useState, useCallback } from 'react';
import { getErrorInfo, logError, ERROR_TYPES } from '../utils/errorHandler';

export const useErrorHandling = (currentView, activeTab, handleLogout) => {
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pendingOperations, setPendingOperations] = useState([]);

  const retryPendingOperations = useCallback(() => {
    if (pendingOperations.length > 0) {
      console.log('Retrying pending operations:', pendingOperations.length);
      pendingOperations.forEach(operation => {
        operation();
      });
      setPendingOperations([]);
    }
  }, [pendingOperations]);

  const handleError = useCallback((error, context = '') => {
    const errorInfo = getErrorInfo(error);
    logError(error, { context, currentView, activeTab });
    
    setError(error);
    setShowErrorModal(true);

    if (errorInfo.type === ERROR_TYPES.AUTHENTICATION) {
      handleLogout();
    }
  }, [currentView, activeTab, handleLogout]);

  const handleErrorAction = useCallback((errorType) => {
    switch (errorType) {
      case ERROR_TYPES.AUTHENTICATION:
        // This will be handled by the parent component
        break;
      case ERROR_TYPES.NETWORK:
        retryPendingOperations();
        break;
      default:
        break;
    }
  }, [retryPendingOperations]);

  return {
    error,
    setError,
    showErrorModal,
    setShowErrorModal,
    pendingOperations,
    setPendingOperations,
    handleError,
    handleErrorAction,
    retryPendingOperations
  };
}; 