/**
 * Comprehensive data management utilities for ReflectWithin
 * Handles PDF export, JSON import/export, and backup/restore functionality
 */

// ============================================================================
// PDF EXPORT FUNCTIONS
// ============================================================================

/**
 * Export journal entries as PDF
 */
export const exportJournalEntriesAsPDF = async (entries, filename = null) => {
  try {
    // Dynamically import jsPDF only when needed
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('ReflectWithin Journal Entries', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Statistics
    const totalEntries = Object.keys(entries).length;
    const totalWords = Object.values(entries).reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Total Entries: ${totalEntries} | Total Words: ${totalWords}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Entries
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);

    const sortedEntries = Object.entries(entries)
      .map(([id, entry]) => ({ id, ...entry }))
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB - dateA;
      });

    for (const entry of sortedEntries) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Date header
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, 'bold');
      const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
      doc.text(entryDate.toLocaleDateString(), margin, yPosition);
      yPosition += 8;

      // Topics
      if (entry.topics && entry.topics.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont(undefined, 'normal');
        const topicsText = `Topics: ${entry.topics.join(', ')}`;
        doc.text(topicsText, margin, yPosition);
        yPosition += 6;
      }

      // Content
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.setFont(undefined, 'normal');
      
      const contentLines = doc.splitTextToSize(entry.content, pageWidth - 2 * margin);
      doc.text(contentLines, margin, yPosition);
      yPosition += contentLines.length * 5 + 10;

      // Mood and energy if available
      if (entry.mood || entry.energy) {
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        const moodText = entry.mood ? `Mood: ${entry.mood}` : '';
        const energyText = entry.energy ? `Energy: ${entry.energy}` : '';
        const combined = [moodText, energyText].filter(Boolean).join(' | ');
        if (combined) {
          doc.text(combined, margin, yPosition);
          yPosition += 5;
        }
      }

      yPosition += 5; // Spacing between entries
    }

    // Save the PDF
    const defaultFilename = `reflectwithin_journal_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename || defaultFilename);
    
    return { success: true, filename: filename || defaultFilename };
  } catch (error) {
    console.error('Failed to export journal entries as PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export chat messages as PDF (existing functionality)
 */
export const exportChatAsPDF = async (messages, filename = null) => {
  try {
    // Dynamically import jsPDF only when needed
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('ReflectWithin Chat', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Messages
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);

    for (let i = 0; i < messages.length; i += 2) {
      if (messages[i] && messages[i + 1] && 
          messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Timestamp
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(messages[i].timestamp, margin, yPosition);
        yPosition += 8;

        // User message
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.setFont(undefined, 'bold');
        doc.text('You:', margin, yPosition);
        yPosition += 6;
        doc.setFont(undefined, 'normal');
        
        const userLines = doc.splitTextToSize(messages[i].text, pageWidth - 2 * margin);
        doc.text(userLines, margin, yPosition);
        yPosition += userLines.length * 6 + 8;

        // AI response
        doc.setFont(undefined, 'bold');
        doc.text('ReflectWithin:', margin, yPosition);
        yPosition += 6;
        doc.setFont(undefined, 'normal');
        
        const aiLines = doc.splitTextToSize(messages[i + 1].text, pageWidth - 2 * margin);
        doc.text(aiLines, margin, yPosition);
        yPosition += aiLines.length * 6 + 15;
      }
    }

    const defaultFilename = `reflectwithin_chat_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename || defaultFilename);
    
    return { success: true, filename: filename || defaultFilename };
  } catch (error) {
    console.error('Failed to export chat as PDF:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// JSON IMPORT/EXPORT FUNCTIONS
// ============================================================================

/**
 * Export all data as JSON
 */
export const exportDataAsJSON = (data, filename = null) => {
  try {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'ReflectWithin',
      data: {
        journalEntries: data.journalEntries || {},
        chatMessages: data.chatMessages || [],
        userPreferences: data.userPreferences || {},
        insights: data.insights || {},
        stats: data.stats || {}
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `reflectwithin_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, filename: a.download };
  } catch (error) {
    console.error('Failed to export data as JSON:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import data from JSON
 */
export const importDataFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Validate the imported data structure
        if (!importedData.version || !importedData.data) {
          throw new Error('Invalid backup file format');
        }

        // Check version compatibility
        if (importedData.version !== '1.0') {
          throw new Error(`Unsupported backup version: ${importedData.version}`);
        }

        resolve({
          success: true,
          data: importedData.data,
          exportedAt: importedData.exportedAt
        });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    };

    reader.onerror = () => {
      reject({ success: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
};

// ============================================================================
// BACKUP/RESTORE FUNCTIONS
// ============================================================================

/**
 * Create a comprehensive backup of all user data
 */
export const createBackup = () => {
  try {
    const backup = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      app: 'ReflectWithin',
      data: {
        // Journal entries
        journalEntries: JSON.parse(localStorage.getItem('reflectWithin_journal_entries') || '{}'),
        
        // Chat messages
        chatMessages: JSON.parse(localStorage.getItem('reflectWithin_messages') || '[]'),
        
        // User preferences
        userPreferences: {
          theme: localStorage.getItem('reflectWithin_theme') || 'auto',
          isPremium: localStorage.getItem('reflectWithin_isPremium') === 'true',
          onboardingCompleted: localStorage.getItem('reflectWithin_onboarding_completed') === 'true'
        },
        
        // Auth data (if available)
        auth: {
          token: localStorage.getItem('reflectWithin_token'),
          user: localStorage.getItem('reflectWithin_user')
        },
        
        // Insights data
        insights: JSON.parse(localStorage.getItem('reflectWithin_insights') || '{}'),
        
        // Statistics
        stats: {
          totalEntries: Object.keys(JSON.parse(localStorage.getItem('reflectWithin_journal_entries') || '{}')).length,
          totalMessages: JSON.parse(localStorage.getItem('reflectWithin_messages') || '[]').length,
          totalWords: Object.values(JSON.parse(localStorage.getItem('reflectWithin_journal_entries') || '{}'))
            .reduce((sum, entry) => sum + (entry.wordCount || 0), 0)
        }
      }
    };

    return { success: true, backup };
  } catch (error) {
    console.error('Failed to create backup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Restore data from backup
 */
export const restoreFromBackup = (backup, options = {}) => {
  try {
    const { 
      restoreJournalEntries = true,
      restoreChatMessages = true,
      restorePreferences = true,
      restoreAuth = false, // Don't restore auth by default for security
      overwriteExisting = false
    } = options;

    const restored = {};

    // Restore journal entries
    if (restoreJournalEntries && backup.data.journalEntries) {
      if (overwriteExisting || !localStorage.getItem('reflectWithin_journal_entries')) {
        localStorage.setItem('reflectWithin_journal_entries', JSON.stringify(backup.data.journalEntries));
        restored.journalEntries = Object.keys(backup.data.journalEntries).length;
      }
    }

    // Restore chat messages
    if (restoreChatMessages && backup.data.chatMessages) {
      if (overwriteExisting || !localStorage.getItem('reflectWithin_messages')) {
        localStorage.setItem('reflectWithin_messages', JSON.stringify(backup.data.chatMessages));
        restored.chatMessages = backup.data.chatMessages.length;
      }
    }

    // Restore preferences
    if (restorePreferences && backup.data.userPreferences) {
      Object.entries(backup.data.userPreferences).forEach(([key, value]) => {
        if (overwriteExisting || !localStorage.getItem(`reflectWithin_${key}`)) {
          localStorage.setItem(`reflectWithin_${key}`, value.toString());
        }
      });
      restored.preferences = Object.keys(backup.data.userPreferences).length;
    }

    // Restore auth (only if explicitly requested)
    if (restoreAuth && backup.data.auth) {
      if (backup.data.auth.token) {
        localStorage.setItem('reflectWithin_token', backup.data.auth.token);
      }
      if (backup.data.auth.user) {
        localStorage.setItem('reflectWithin_user', backup.data.auth.user);
      }
      restored.auth = true;
    }

    return { success: true, restored };
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get data statistics
 */
export const getDataStats = () => {
  try {
    const journalEntries = JSON.parse(localStorage.getItem('reflectWithin_journal_entries') || '{}');
    const chatMessages = JSON.parse(localStorage.getItem('reflectWithin_messages') || '[]');
    
    const totalEntries = Object.keys(journalEntries).length;
    const totalWords = Object.values(journalEntries).reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const totalMessages = chatMessages.length;
    
    // Get date range
    const entryDates = Object.values(journalEntries).map(entry => {
      const dateInput = entry.date;
      return dateInput instanceof Date ? dateInput : new Date(dateInput);
    });
    
    const earliest = new Date(Math.min(...entryDates.map(d => d.getTime()))).toISOString().split('T')[0];
    const latest = new Date(Math.max(...entryDates.map(d => d.getTime()))).toISOString().split('T')[0];

    return {
      journalEntries: totalEntries,
      chatMessages: totalMessages,
      totalWords,
      dateRange: { earliest, latest },
      lastBackup: localStorage.getItem('reflectWithin_last_backup'),
      backupSize: JSON.stringify(journalEntries).length + JSON.stringify(chatMessages).length
    };
  } catch (error) {
    console.error('Failed to get data stats:', error);
    return {
      journalEntries: 0,
      chatMessages: 0,
      totalWords: 0,
      dateRange: null,
      lastBackup: null,
      backupSize: 0
    };
  }
};

/**
 * Clear all data (with confirmation)
 */
export const clearAllData = () => {
  try {
    const keysToRemove = [
      'reflectWithin_journal_entries',
      'reflectWithin_messages',
      'reflectWithin_theme',
      'reflectWithin_isPremium',
      'reflectWithin_onboarding_completed',
      'reflectWithin_insights',
      'reflectWithin_last_backup'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    return { success: true, cleared: keysToRemove.length };
  } catch (error) {
    console.error('Failed to clear data:', error);
    return { success: false, error: error.message };
  }
}; 