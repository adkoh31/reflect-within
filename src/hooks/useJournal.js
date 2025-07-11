import { useCallback } from 'react';

// Hook for journal functionality
// For data export/import, see utils/dataManagement.js
export const useJournal = (messages, onSuccess) => {
  // This hook is now primarily for journal-related utilities
  // PDF export functionality has been moved to utils/dataManagement.js
  
  const handleDownloadJournal = useCallback(async () => {
    // This function is deprecated - use DataManagementModal instead
    console.warn('handleDownloadJournal is deprecated. Use DataManagementModal for PDF export.');
  }, []);

  return {
    handleDownloadJournal
  };
}; 