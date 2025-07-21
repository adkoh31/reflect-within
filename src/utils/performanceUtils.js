/**
 * Performance Optimization Utilities
 * Collection of utilities to improve app performance
 */

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Simple cache implementation
export class SimpleCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Memoization utility with cache size limit
export const memoize = (fn, maxSize = 100) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Remove oldest entry if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Performance measurement utility
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Async performance measurement utility
export const measureAsyncPerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Batch operations utility
export const batchOperations = (operations, batchSize = 10) => {
  const batches = [];
  for (let i = 0; i < operations.length; i += batchSize) {
    batches.push(operations.slice(i, i + batchSize));
  }
  return batches;
};

// Process batches with delay to prevent blocking
export const processBatches = async (batches, processFn, delay = 16) => {
  const results = [];
  
  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
    
    // Add delay between batches to prevent blocking
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Resize Observer utility
export const createResizeObserver = (callback) => {
  return new ResizeObserver(entries => {
    entries.forEach(entry => {
      callback(entry);
    });
  });
};

// Request Animation Frame utility with cleanup
export const createRAF = (callback) => {
  let rafId = null;
  
  const start = () => {
    if (rafId) return;
    
    const animate = () => {
      callback();
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
  };
  
  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  return { start, stop };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = performance.memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

// Performance monitoring class
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  startTimer(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  getMetrics() {
    const results = {};
    for (const [name, metric] of this.metrics) {
      results[name] = {
        duration: metric.duration,
        startTime: metric.startTime,
        endTime: metric.endTime
      };
    }
    return results;
  }

  clear() {
    this.metrics.clear();
  }
}

// Export default instance
export const performanceMonitor = new PerformanceMonitor(); 