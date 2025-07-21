// Simple Offline Test - Tests basic network functionality without IndexedDB
// This is a fallback test when the full offline data manager has issues

export const SimpleOfflineTest = {
  // Test network status changes
  testNetworkStatus() {
    console.log('🧪 Testing network status changes...');
    
    // Store original online status
    const originalOnline = navigator.onLine;
    
    // Test offline simulation
    console.log('📱 Simulating offline mode...');
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    window.dispatchEvent(new Event('offline'));
    
    // Wait a moment
    setTimeout(() => {
      console.log('🌐 Simulating online mode...');
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
      
      // Restore original status
      setTimeout(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: originalOnline
        });
        console.log('✅ Network status test completed');
      }, 1000);
    }, 2000);
  },

  // Test service worker
  async testServiceWorker() {
    console.log('🧪 Testing service worker...');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service worker registered:', registration);
        return { success: true, registration };
      } else {
        console.log('❌ Service worker not supported');
        return { success: false, reason: 'Not supported' };
      }
    } catch (error) {
      console.error('❌ Service worker test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test localStorage (simpler than IndexedDB)
  testLocalStorage() {
    console.log('🧪 Testing localStorage...');
    
    try {
      // Test storing data
      const testData = {
        journalEntry: {
          title: 'Test Entry',
          content: 'Test content',
          timestamp: new Date().toISOString(),
          synced: false
        },
        chatMessage: {
          content: 'Test message',
          timestamp: new Date().toISOString(),
          synced: false
        }
      };
      
      localStorage.setItem('offlineTestData', JSON.stringify(testData));
      console.log('✅ Data stored in localStorage');
      
      // Test retrieving data
      const retrievedData = JSON.parse(localStorage.getItem('offlineTestData'));
      console.log('✅ Data retrieved from localStorage:', retrievedData);
      
      // Clean up
      localStorage.removeItem('offlineTestData');
      console.log('✅ Test data cleaned up');
      
      return { success: true, data: retrievedData };
    } catch (error) {
      console.error('❌ localStorage test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test basic offline simulation
  testOfflineSimulation() {
    console.log('🧪 Testing offline simulation...');
    
    const results = {
      networkStatus: false,
      eventDispatch: false,
      propertyOverride: false
    };
    
    try {
      // Test property override
      const originalOnline = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      results.propertyOverride = navigator.onLine === false;
      
      // Test event dispatch
      let eventReceived = false;
      const handleOffline = () => {
        eventReceived = true;
        console.log('📱 Offline event received');
      };
      
      window.addEventListener('offline', handleOffline);
      window.dispatchEvent(new Event('offline'));
      
      setTimeout(() => {
        results.eventDispatch = eventReceived;
        window.removeEventListener('offline', handleOffline);
        
        // Restore original state
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: originalOnline
        });
        
        console.log('✅ Offline simulation test completed:', results);
      }, 100);
      
      return results;
    } catch (error) {
      console.error('❌ Offline simulation test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Run all simple tests
  async runSimpleTests() {
    console.log('🚀 Running simple offline tests...');
    
    const results = {
      networkStatus: this.testOfflineSimulation(),
      serviceWorker: await this.testServiceWorker(),
      localStorage: this.testLocalStorage()
    };
    
    console.log('📊 Simple test results:', results);
    return results;
  },

  // Check browser capabilities
  checkBrowserCapabilities() {
    console.log('🔍 Checking browser capabilities...');
    
    const capabilities = {
      serviceWorker: 'serviceWorker' in navigator,
      indexedDB: 'indexedDB' in window,
      localStorage: 'localStorage' in window,
      onLine: 'onLine' in navigator,
      offline: 'offline' in navigator
    };
    
    console.log('📊 Browser capabilities:', capabilities);
    return capabilities;
  }
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.SimpleOfflineTest = SimpleOfflineTest;
  console.log('🧪 SimpleOfflineTest loaded! Try: window.SimpleOfflineTest.runSimpleTests()');
} 