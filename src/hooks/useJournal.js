// This hook has been deprecated in favor of useUnifiedData
// All journal functionality is now handled by the unified data system
// For data export/import, use DataManagementModal component

export const useJournal = () => {
  console.warn('useJournal is deprecated. Use useUnifiedData for journal functionality.');
  
  return {
    // Empty object to prevent breaking changes
  };
}; 