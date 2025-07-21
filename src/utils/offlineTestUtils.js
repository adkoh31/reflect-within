// Offline Testing Utilities
// Helper functions to test offline functionality

import offlineDataManager from './offlineDataManager.js';

export const OfflineTestUtils = {
  // Simulate offline mode
  simulateOffline() {
    // Override navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    // Trigger offline event
    window.dispatchEvent(new Event('offline'));
    
    console.log('🔄 Simulated offline mode');
  },

  // Simulate online mode
  simulateOnline() {
    // Override navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Trigger online event
    window.dispatchEvent(new Event('online'));
    
    console.log('🔄 Simulated online mode');
  },

  // Test offline data storage
  async testOfflineStorage() {
    console.log('🧪 Testing offline data storage...');
    
    try {
      // Test journal entry storage
      const testEntry = {
        title: 'Test Journal Entry',
        content: 'This is a test entry created while offline',
        mood: 'neutral',
        tags: ['test', 'offline']
      };
      
      await offlineDataManager.storeJournalEntry(testEntry);
      console.log('✅ Journal entry stored offline');
      
      // Test chat message storage
      const testMessage = {
        content: 'Test chat message',
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      await offlineDataManager.storeChatMessage(testMessage);
      console.log('✅ Chat message stored offline');
      
      // Test user profile storage
      const testProfile = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        preferences: { theme: 'dark' }
      };
      
      await offlineDataManager.storeUserProfile(testProfile);
      console.log('✅ User profile stored offline');
      
      // Get summary
      const summary = await offlineDataManager.getOfflineDataSummary();
      console.log('📊 Offline data summary:', summary);
      
      return summary;
    } catch (error) {
      console.error('❌ Offline storage test failed:', error);
      throw error;
    }
  },

  // Test sync functionality
  async testSync() {
    console.log('🧪 Testing sync functionality...');
    
    try {
      // Get unsynced data
      const [journalEntries, chatMessages, userProfile] = await Promise.all([
        offlineDataManager.getUnsyncedJournalEntries(),
        offlineDataManager.getUnsyncedChatMessages(),
        offlineDataManager.getUnsyncedUserProfile()
      ]);
      
      console.log('📋 Unsynced data found:', {
        journalEntries: journalEntries.length,
        chatMessages: chatMessages.length,
        userProfile: userProfile ? 1 : 0
      });
      
      // Mark items as synced (simulate successful sync)
      for (const entry of journalEntries) {
        await offlineDataManager.markJournalEntrySynced(entry.offlineId);
      }
      
      for (const message of chatMessages) {
        await offlineDataManager.markChatMessageSynced(message.offlineId);
      }
      
      if (userProfile) {
        await offlineDataManager.markUserProfileSynced();
      }
      
      console.log('✅ Sync test completed');
      
      // Get updated summary
      const summary = await offlineDataManager.getOfflineDataSummary();
      console.log('📊 Updated summary:', summary);
      
      return summary;
    } catch (error) {
      console.error('❌ Sync test failed:', error);
      throw error;
    }
  },

  // Test service worker registration
  async testServiceWorker() {
    console.log('🧪 Testing service worker...');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service worker registered:', registration);
        
        // Test background sync registration
        const backgroundSyncSupported = await offlineDataManager.registerBackgroundSync();
        console.log('✅ Background sync supported:', backgroundSyncSupported);
        
        return { registration, backgroundSyncSupported };
      } else {
        console.log('❌ Service worker not supported');
        return { registration: null, backgroundSyncSupported: false };
      }
    } catch (error) {
      console.error('❌ Service worker test failed:', error);
      throw error;
    }
  },

  // Clear all test data
  async clearTestData() {
    console.log('🧹 Clearing test data...');
    
    try {
      await offlineDataManager.clearAllData();
      console.log('✅ Test data cleared');
    } catch (error) {
      console.error('❌ Failed to clear test data:', error);
      throw error;
    }
  },

  // Run comprehensive offline test
  async runComprehensiveTest() {
    console.log('🚀 Starting comprehensive offline test...');
    
    try {
      // Step 1: Test service worker
      const swResult = await this.testServiceWorker();
      
      // Step 2: Simulate offline mode
      this.simulateOffline();
      
      // Step 3: Test offline storage
      const storageResult = await this.testOfflineStorage();
      
      // Step 4: Simulate online mode
      this.simulateOnline();
      
      // Step 5: Test sync
      const syncResult = await this.testSync();
      
      console.log('🎉 Comprehensive test completed successfully!');
      
      return {
        serviceWorker: swResult,
        storage: storageResult,
        sync: syncResult
      };
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      throw error;
    }
  },

  // Test network status component
  testNetworkStatus() {
    console.log('🧪 Testing network status component...');
    
    // Test offline simulation
    this.simulateOffline();
    
    // Wait a moment, then test online simulation
    setTimeout(() => {
      this.simulateOnline();
    }, 2000);
    
    console.log('✅ Network status test completed');
  },

  // Get current network status
  getNetworkStatus() {
    return {
      isOnline: navigator.onLine,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      downlink: navigator.connection ? navigator.connection.downlink : 'unknown'
    };
  }
};

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.OfflineTestUtils = OfflineTestUtils;
  console.log('🧪 OfflineTestUtils loaded. Use window.OfflineTestUtils to test offline functionality.');
} 