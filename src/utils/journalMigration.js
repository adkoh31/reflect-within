import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * Migrate journal entries from localStorage to database
 * This is called when a user upgrades to premium
 */
export const migrateJournalEntriesToDatabase = async (user) => {
  try {
    console.log('🔄 Starting journal entries migration...');
    
    // Get entries from localStorage
    const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
    if (!savedEntries) {
      console.log('✅ No local entries to migrate');
      return { success: true, migrated: 0 };
    }

    const localEntries = JSON.parse(savedEntries);
    const entryIds = Object.keys(localEntries);
    
    if (entryIds.length === 0) {
      console.log('✅ No entries to migrate');
      return { success: true, migrated: 0 };
    }

    console.log(`📦 Found ${entryIds.length} entries to migrate`);

    const token = localStorage.getItem('reflectWithin_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    let migratedCount = 0;
    let failedCount = 0;

    // Migrate each entry to database
    for (const entryId of entryIds) {
      try {
        const entry = localEntries[entryId];
        
        // Prepare entry data for database
        const entryData = {
          date: entry.date,
          content: entry.content,
          topics: entry.topics || [],
          attachments: entry.attachments || [],
          template: entry.template || null,
          tags: entry.tags || [],
          mood: entry.mood || null,
          energy: entry.energy || null,
          wordCount: entry.wordCount || 0
        };

        // Save to database
        await axios.post(API_ENDPOINTS.JOURNAL_ENTRIES.SAVE, entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        migratedCount++;
        console.log(`✅ Migrated entry: ${entryId}`);
      } catch (error) {
        console.error(`❌ Failed to migrate entry ${entryId}:`, error);
        failedCount++;
      }
    }

    console.log(`✅ Migration complete: ${migratedCount} migrated, ${failedCount} failed`);

    // If all entries were successfully migrated, we could optionally clear localStorage
    // But we'll keep it as a backup for now
    if (migratedCount > 0 && failedCount === 0) {
      console.log('🎉 All entries migrated successfully!');
    }

    return {
      success: true,
      migrated: migratedCount,
      failed: failedCount,
      total: entryIds.length
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message,
      migrated: 0,
      failed: 0,
      total: 0
    };
  }
};

/**
 * Check if user has local entries that need migration
 */
export const hasLocalEntriesToMigrate = () => {
  try {
    const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
    if (!savedEntries) return false;
    
    const localEntries = JSON.parse(savedEntries);
    return Object.keys(localEntries).length > 0;
  } catch (error) {
    console.error('Error checking local entries:', error);
    return false;
  }
};

/**
 * Get migration status and statistics
 */
export const getMigrationStats = () => {
  try {
    const savedEntries = localStorage.getItem('reflectWithin_journal_entries');
    if (!savedEntries) {
      return {
        hasLocalEntries: false,
        totalEntries: 0,
        totalWords: 0,
        dateRange: null
      };
    }

    const localEntries = JSON.parse(savedEntries);
    const entryIds = Object.keys(localEntries);
    
    if (entryIds.length === 0) {
      return {
        hasLocalEntries: false,
        totalEntries: 0,
        totalWords: 0,
        dateRange: null
      };
    }

    // Calculate statistics
    const totalWords = Object.values(localEntries).reduce((sum, entry) => {
      return sum + (entry.wordCount || 0);
    }, 0);

    // Get date range
    const dates = Object.values(localEntries).map(entry => new Date(entry.date));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    return {
      hasLocalEntries: true,
      totalEntries: entryIds.length,
      totalWords,
      dateRange: {
        earliest: earliestDate.toISOString().split('T')[0],
        latest: latestDate.toISOString().split('T')[0]
      }
    };
  } catch (error) {
    console.error('Error getting migration stats:', error);
    return {
      hasLocalEntries: false,
      totalEntries: 0,
      totalWords: 0,
      dateRange: null
    };
  }
}; 