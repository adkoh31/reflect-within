// Offline Data Manager
// Handles storing and syncing data when offline

class OfflineDataManager {
  constructor() {
    this.dbName = 'ReflectWithinOfflineDB';
    this.version = 2; // Increment version to force schema update
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize IndexedDB
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open offline database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('Offline database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('journalEntries')) {
          const journalStore = db.createObjectStore('journalEntries', { keyPath: 'id', autoIncrement: true });
          journalStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('chatMessages')) {
          const chatStore = db.createObjectStore('chatMessages', { keyPath: 'id', autoIncrement: true });
          chatStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('userProfile')) {
          const profileStore = db.createObjectStore('userProfile', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('pendingOperations')) {
          const operationsStore = db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
          operationsStore.createIndex('type', 'type', { unique: false });
          operationsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Store journal entry offline
  async storeJournalEntry(entry) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['journalEntries'], 'readwrite');
      const store = transaction.objectStore('journalEntries');
      
      const entryWithMeta = {
        ...entry,
        timestamp: new Date().toISOString(),
        synced: false,
        offlineId: Date.now() + Math.random()
      };

      const request = store.add(entryWithMeta);

      request.onsuccess = () => {
        console.log('Journal entry stored offline:', entry.title);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to store journal entry offline');
        reject(request.error);
      };
    });
  }

  // Store chat message offline
  async storeChatMessage(message) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chatMessages'], 'readwrite');
      const store = transaction.objectStore('chatMessages');
      
      const messageWithMeta = {
        ...message,
        timestamp: new Date().toISOString(),
        synced: false,
        offlineId: Date.now() + Math.random()
      };

      const request = store.add(messageWithMeta);

      request.onsuccess = () => {
        console.log('Chat message stored offline:', message.content);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to store chat message offline');
        reject(request.error);
      };
    });
  }

  // Store user profile update offline
  async storeUserProfile(profile) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userProfile'], 'readwrite');
      const store = transaction.objectStore('userProfile');
      
      const profileWithMeta = {
        ...profile,
        timestamp: new Date().toISOString(),
        synced: false
      };

      const request = store.put(profileWithMeta);

      request.onsuccess = () => {
        console.log('User profile stored offline');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to store user profile offline');
        reject(request.error);
      };
    });
  }

  // Get all unsynced journal entries
  async getUnsyncedJournalEntries() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['journalEntries'], 'readonly');
      const store = transaction.objectStore('journalEntries');
      
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter for unsynced entries
        const unsyncedEntries = request.result.filter(entry => !entry.synced);
        resolve(unsyncedEntries);
      };

      request.onerror = () => {
        console.error('Failed to get unsynced journal entries');
        reject(request.error);
      };
    });
  }

  // Get all unsynced chat messages
  async getUnsyncedChatMessages() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chatMessages'], 'readonly');
      const store = transaction.objectStore('chatMessages');
      
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter for unsynced messages
        const unsyncedMessages = request.result.filter(message => !message.synced);
        resolve(unsyncedMessages);
      };

      request.onerror = () => {
        console.error('Failed to get unsynced chat messages');
        reject(request.error);
      };
    });
  }

  // Get unsynced user profile
  async getUnsyncedUserProfile() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userProfile'], 'readonly');
      const store = transaction.objectStore('userProfile');
      
      const request = store.getAll();

      request.onsuccess = () => {
        // Filter for unsynced profiles
        const unsyncedProfiles = request.result.filter(profile => !profile.synced);
        resolve(unsyncedProfiles[0] || null);
      };

      request.onerror = () => {
        console.error('Failed to get unsynced user profile');
        reject(request.error);
      };
    });
  }

  // Mark journal entry as synced
  async markJournalEntrySynced(offlineId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['journalEntries'], 'readwrite');
      const store = transaction.objectStore('journalEntries');
      
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        const entry = entries.find(e => e.offlineId === offlineId);
        
        if (entry) {
          entry.synced = true;
          const updateRequest = store.put(entry);
          
          updateRequest.onsuccess = () => {
            console.log('Journal entry marked as synced:', entry.title);
            resolve();
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Mark chat message as synced
  async markChatMessageSynced(offlineId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['chatMessages'], 'readwrite');
      const store = transaction.objectStore('chatMessages');
      
      const request = store.getAll();

      request.onsuccess = () => {
        const messages = request.result;
        const message = messages.find(m => m.offlineId === offlineId);
        
        if (message) {
          message.synced = true;
          const updateRequest = store.put(message);
          
          updateRequest.onsuccess = () => {
            console.log('Chat message marked as synced:', message.content);
            resolve();
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Mark user profile as synced
  async markUserProfileSynced() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userProfile'], 'readwrite');
      const store = transaction.objectStore('userProfile');
      
      const request = store.getAll();

      request.onsuccess = () => {
        const profiles = request.result;
        if (profiles.length > 0) {
          const profile = profiles[0];
          profile.synced = true;
          const updateRequest = store.put(profile);
          
          updateRequest.onsuccess = () => {
            console.log('User profile marked as synced');
            resolve();
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get offline data summary
  async getOfflineDataSummary() {
    await this.init();
    
    const [journalEntries, chatMessages, userProfile] = await Promise.all([
      this.getUnsyncedJournalEntries(),
      this.getUnsyncedChatMessages(),
      this.getUnsyncedUserProfile()
    ]);

    return {
      journalEntries: journalEntries.length,
      chatMessages: chatMessages.length,
      userProfile: userProfile ? 1 : 0,
      total: journalEntries.length + chatMessages.length + (userProfile ? 1 : 0)
    };
  }

  // Clear all offline data (for testing/debugging)
  async clearAllData() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['journalEntries', 'chatMessages', 'userProfile', 'pendingOperations'], 'readwrite');
      
      const stores = ['journalEntries', 'chatMessages', 'userProfile', 'pendingOperations'];
      const clearPromises = stores.map(storeName => {
        return new Promise((res, rej) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });
      });

      Promise.all(clearPromises)
        .then(() => {
          console.log('All offline data cleared');
          resolve();
        })
        .catch(reject);
    });
  }

  // Check if service worker is available
  isServiceWorkerAvailable() {
    return 'serviceWorker' in navigator;
  }

  // Register background sync
  async registerBackgroundSync() {
    if (!this.isServiceWorkerAvailable()) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await registration.sync.register('background-sync');
        console.log('Background sync registered');
        return true;
      } else {
        console.log('Background sync not supported');
        return false;
      }
    } catch (error) {
      console.error('Failed to register background sync:', error);
      return false;
    }
  }
}

// Create singleton instance
const offlineDataManager = new OfflineDataManager();

export default offlineDataManager; 