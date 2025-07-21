// Quick Test Script for Offline Functionality
// Run this in the browser console to test offline features

export const QuickTest = {
  // Quick offline test
  async quickOfflineTest() {
    console.log('🚀 Starting Quick Offline Test...');
    
    try {
      // Step 1: Check if test utilities are available
      if (!window.OfflineTestUtils) {
        console.log('❌ OfflineTestUtils not found. Loading...');
        // Try to load it manually
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!window.OfflineTestUtils) {
          throw new Error('OfflineTestUtils not available');
        }
      }
      
      console.log('✅ Test utilities loaded');
      
      // Step 2: Test network status
      console.log('📡 Testing network status...');
      const networkStatus = window.OfflineTestUtils.getNetworkStatus();
      console.log('Current network status:', networkStatus);
      
      // Step 3: Simulate offline
      console.log('🔄 Going offline...');
      window.OfflineTestUtils.simulateOffline();
      
      // Step 4: Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 5: Test offline storage
      console.log('💾 Testing offline storage...');
      const storageResult = await window.OfflineTestUtils.testOfflineStorage();
      console.log('Storage test result:', storageResult);
      
      // Step 6: Simulate online
      console.log('🔄 Going online...');
      window.OfflineTestUtils.simulateOnline();
      
      // Step 7: Wait for sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 8: Test sync
      console.log('🔄 Testing sync...');
      const syncResult = await window.OfflineTestUtils.testSync();
      console.log('Sync test result:', syncResult);
      
      console.log('🎉 Quick test completed successfully!');
      
      return {
        networkStatus,
        storageResult,
        syncResult
      };
      
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      throw error;
    }
  },

  // Test network switching
  testNetworkSwitching() {
    console.log('🔄 Testing network switching...');
    
    // Go offline
    window.OfflineTestUtils.simulateOffline();
    console.log('📱 App should now show offline indicators');
    
    // Go online after 3 seconds
    setTimeout(() => {
      window.OfflineTestUtils.simulateOnline();
      console.log('🌐 App should now show online indicators and sync');
    }, 3000);
  },

  // Test offline data creation
  async testOfflineDataCreation() {
    console.log('📝 Testing offline data creation...');
    
    // Go offline
    window.OfflineTestUtils.simulateOffline();
    
    // Create test data
    const result = await window.OfflineTestUtils.testOfflineStorage();
    console.log('✅ Test data created while offline:', result);
    
    // Go online to trigger sync
    setTimeout(() => {
      window.OfflineTestUtils.simulateOnline();
      console.log('🔄 Sync should start automatically');
    }, 2000);
  },

  // Check current status
  checkStatus() {
    console.log('📊 Current Status:');
    console.log('- Network:', window.OfflineTestUtils.getNetworkStatus());
    console.log('- Test utilities available:', !!window.OfflineTestUtils);
    console.log('- Service worker:', 'serviceWorker' in navigator);
    console.log('- IndexedDB:', 'indexedDB' in window);
  }
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.QuickTest = QuickTest;
  console.log('🧪 QuickTest loaded! Try: window.QuickTest.quickOfflineTest()');
} 