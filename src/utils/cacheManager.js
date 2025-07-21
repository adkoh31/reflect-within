/**
 * Advanced Caching System with LRU eviction and TTL support
 * Optimizes data access and reduces redundant operations
 */

class CacheEntry {
  constructor(key, value, ttl = null) {
    this.key = key;
    this.value = value;
    this.createdAt = Date.now();
    this.lastAccessed = Date.now();
    this.ttl = ttl; // Time to live in milliseconds
    this.accessCount = 0;
  }

  isExpired() {
    if (!this.ttl) return false;
    return Date.now() - this.createdAt > this.ttl;
  }

  touch() {
    this.lastAccessed = Date.now();
    this.accessCount++;
  }
}

class LRUCache {
  constructor(maxSize = 100, maxMemory = 50 * 1024 * 1024) { // 50MB default
    this.maxSize = maxSize;
    this.maxMemory = maxMemory;
    this.cache = new Map();
    this.accessOrder = []; // Track access order for LRU
    this.currentMemory = 0;
  }

  set(key, value, ttl = null) {
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Check memory constraints
    const entrySize = this.estimateSize(value);
    if (entrySize > this.maxMemory) {
      console.warn(`Cache entry too large: ${entrySize} bytes`);
      return false;
    }

    // Evict if necessary
    while (this.currentMemory + entrySize > this.maxMemory || this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Add new entry
    const entry = new CacheEntry(key, value, ttl);
    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.currentMemory += entrySize;

    return true;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.isExpired()) {
      this.delete(key);
      return null;
    }

    // Update access order
    entry.touch();
    this.updateAccessOrder(key);

    return entry.value;
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.isExpired()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentMemory -= this.estimateSize(entry.value);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    }
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.currentMemory = 0;
  }

  evictLRU() {
    if (this.accessOrder.length === 0) return;
    
    const lruKey = this.accessOrder.shift();
    this.delete(lruKey);
  }

  updateAccessOrder(key) {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  estimateSize(value) {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 1024; // Default estimate
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.currentMemory,
      maxMemory: this.maxMemory,
      hitRate: this.calculateHitRate()
    };
  }

  calculateHitRate() {
    // This would need to be implemented with hit tracking
    return 0;
  }

  cleanup() {
    const expiredKeys = [];
    for (const [key, entry] of this.cache.entries()) {
      if (entry.isExpired()) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }
}

// Global cache instances
const dataCache = new LRUCache(200, 100 * 1024 * 1024); // 100MB for data
const uiCache = new LRUCache(50, 10 * 1024 * 1024); // 10MB for UI state
const apiCache = new LRUCache(100, 50 * 1024 * 1024); // 50MB for API responses

// Cache utilities
export const cacheUtils = {
  // Data caching
  cacheData: (key, data, ttl = 5 * 60 * 1000) => dataCache.set(key, data, ttl),
  getCachedData: (key) => dataCache.get(key),
  hasCachedData: (key) => dataCache.has(key),
  clearDataCache: () => dataCache.clear(),

  // UI state caching
  cacheUIState: (key, state, ttl = 30 * 60 * 1000) => uiCache.set(key, state, ttl),
  getCachedUIState: (key) => uiCache.get(key),
  hasCachedUIState: (key) => uiCache.has(key),
  clearUICache: () => uiCache.clear(),

  // API response caching
  cacheAPIResponse: (key, response, ttl = 10 * 60 * 1000) => apiCache.set(key, response, ttl),
  getCachedAPIResponse: (key) => apiCache.get(key),
  hasCachedAPIResponse: (key) => apiCache.has(key),
  clearAPICache: () => apiCache.clear(),

  // General utilities
  clearAllCaches: () => {
    dataCache.clear();
    uiCache.clear();
    apiCache.clear();
  },

  getCacheStats: () => ({
    data: dataCache.getStats(),
    ui: uiCache.getStats(),
    api: apiCache.getStats()
  }),

  cleanupExpired: () => ({
    data: dataCache.cleanup(),
    ui: uiCache.cleanup(),
    api: apiCache.cleanup()
  })
};

// React hook for caching
export const useCache = (cacheType = 'data') => {
  const getCache = () => {
    switch (cacheType) {
      case 'ui': return uiCache;
      case 'api': return apiCache;
      default: return dataCache;
    }
  };

  const cache = getCache();

  return {
    set: (key, value, ttl) => cache.set(key, value, ttl),
    get: (key) => cache.get(key),
    has: (key) => cache.has(key),
    delete: (key) => cache.delete(key),
    clear: () => cache.clear(),
    stats: () => cache.getStats()
  };
};

export default cacheUtils; 