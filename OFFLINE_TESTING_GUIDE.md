# 🔌 Offline Functionality Testing Guide

## 🎯 Overview
This guide will help you test the comprehensive offline functionality we've implemented in ReflectWithin.

## 🚀 Quick Start Testing

### 1. **Open Browser Console**
1. Open your browser's developer tools (F12)
2. Go to the Console tab
3. The app should be running at `http://localhost:3000`

### 2. **Run Automated Tests**
In the console, run these commands:

```javascript
// Run comprehensive test
await window.OfflineTestUtils.runComprehensiveTest()

// Or run individual tests
await window.OfflineTestUtils.testOfflineStorage()
await window.OfflineTestUtils.testSync()
await window.OfflineTestUtils.testServiceWorker()
```

## 🧪 Manual Testing Steps

### **Test 1: Network Status Component**

#### Step 1: Check Online Status
- ✅ Look for the green "Online" indicator in the top-right corner
- ✅ Should show "AI Ready" and "Analytics" indicators in header

#### Step 2: Simulate Offline Mode
```javascript
// In browser console
window.OfflineTestUtils.simulateOffline()
```

**Expected Results:**
- 🔴 Red "Offline" indicator appears
- 📱 Offline notification appears on the left
- ⚠️ Shows what features are available offline
- 🔄 Sync status shows "failed"

#### Step 3: Simulate Online Mode
```javascript
// In browser console
window.OfflineTestUtils.simulateOnline()
```

**Expected Results:**
- 🟢 Green "Online" indicator returns
- 🔄 Sync automatically starts
- ✅ "Data synced successfully" toast appears

### **Test 2: Offline Data Storage**

#### Step 1: Go Offline
```javascript
window.OfflineTestUtils.simulateOffline()
```

#### Step 2: Create Journal Entry
1. Navigate to the Journal tab
2. Create a new journal entry
3. Add title and content
4. Save the entry

**Expected Results:**
- ✅ Entry saves locally
- 📊 Pending operations indicator shows "1 pending"
- 🔄 Entry is queued for sync

#### Step 3: Send Chat Message
1. Navigate to the Chat tab
2. Type a message and send it

**Expected Results:**
- ✅ Message appears in chat
- 📊 Pending operations increases to "2 pending"
- 🤖 AI responds with offline message

#### Step 4: Update Profile
1. Navigate to Profile tab
2. Make a change to your profile
3. Save the changes

**Expected Results:**
- ✅ Profile changes saved locally
- 📊 Pending operations increases to "3 pending"

### **Test 3: Sync Process**

#### Step 1: Go Online
```javascript
window.OfflineTestUtils.simulateOnline()
```

**Expected Results:**
- 🔄 Sync progress bar appears
- 📊 Shows "3 pending operations"
- 🏷️ Shows operation types: "journal entry", "chat message", "user profile"
- ✅ Progress bar fills to 100%
- 🎉 "Data synced successfully" toast

#### Step 2: Check Sync Status
```javascript
// Check current network status
window.OfflineTestUtils.getNetworkStatus()

// Check offline data summary
const summary = await window.OfflineTestUtils.testOfflineStorage()
console.log('Offline data summary:', summary)
```

### **Test 4: AI Offline Handling**

#### Step 1: Go Offline
```javascript
window.OfflineTestUtils.simulateOffline()
```

#### Step 2: Test AI Features
1. **Chat Tab:** Send a message
   - Expected: AI responds with offline message
   - Message is queued for later processing

2. **Journal Tab:** Use AI assistant
   - Expected: Shows offline assistant message
   - Request is queued

3. **Insights Tab:** Generate insights
   - Expected: Shows offline insights message
   - Request is queued

### **Test 5: Service Worker & Caching**

#### Step 1: Check Service Worker
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Worker Registrations:', registrations)
})
```

#### Step 2: Test Caching
1. Go offline
2. Refresh the page
3. App should still load (cached)

#### Step 3: Test Background Sync
```javascript
// Register background sync
await window.OfflineTestUtils.testServiceWorker()
```

## 🔍 Visual Indicators to Watch For

### **Network Status Indicators:**
- 🟢 **Green indicator:** Online mode
- 🔴 **Red indicator:** Offline mode
- 🔄 **Spinning icon:** Syncing in progress
- ✅ **Checkmark:** Sync completed
- ⚠️ **Alert icon:** Sync failed

### **Progress Indicators:**
- 📊 **Progress bar:** Shows sync progress percentage
- 🏷️ **Operation badges:** Shows types of data being synced
- 📱 **Pending count:** Shows number of unsynced operations

### **Toast Notifications:**
- 🎉 **Success toast:** "Data synced successfully"
- ⚠️ **Warning toast:** "Sync failed"
- 📊 **Info toast:** Pending operations count

## 🐛 Troubleshooting

### **Common Issues:**

#### Issue: Network status not updating
```javascript
// Force refresh network status
window.dispatchEvent(new Event('online'))
window.dispatchEvent(new Event('offline'))
```

#### Issue: Sync not working
```javascript
// Check offline data
const summary = await window.OfflineTestUtils.testOfflineStorage()
console.log('Offline data:', summary)

// Clear test data if needed
await window.OfflineTestUtils.clearTestData()
```

#### Issue: Service worker not registering
```javascript
// Check service worker support
console.log('Service Worker supported:', 'serviceWorker' in navigator)

// Manually register
navigator.serviceWorker.register('/sw.js').then(registration => {
  console.log('SW registered:', registration)
})
```

### **Debug Commands:**
```javascript
// Get all test utilities
console.log('Available test functions:', Object.keys(window.OfflineTestUtils))

// Check current state
window.OfflineTestUtils.getNetworkStatus()

// Run specific tests
await window.OfflineTestUtils.testOfflineStorage()
await window.OfflineTestUtils.testSync()
```

## ✅ Success Criteria

### **Offline Mode:**
- ✅ App works without internet connection
- ✅ Data is saved locally
- ✅ Clear offline indicators
- ✅ Graceful AI feature degradation

### **Sync Process:**
- ✅ Automatic sync when connection returns
- ✅ Visual progress indicators
- ✅ Operation queuing and retry
- ✅ Data integrity maintained

### **User Experience:**
- ✅ Clear status indicators
- ✅ Non-blocking notifications
- ✅ Smooth transitions
- ✅ Helpful offline messaging

## 🎉 Test Completion

Once you've completed all tests successfully, you should see:
- ✅ All offline features working
- ✅ Sync process functioning correctly
- ✅ Clear visual feedback throughout
- ✅ Data integrity maintained
- ✅ Smooth user experience

**Congratulations!** 🎉 The offline functionality is working correctly. 