/**
 * Comprehensive Performance Monitoring Utility
 * Tracks Core Web Vitals, custom metrics, and provides insights
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    this.reportQueue = [];
    this.maxQueueSize = 50;
  }

  // Initialize performance monitoring
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Core Web Vitals
      await this.initializeWebVitals();
      
      // Initialize custom metrics
      this.initializeCustomMetrics();
      
      // Initialize error tracking
      this.initializeErrorTracking();
      
      // Initialize memory monitoring
      this.initializeMemoryMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Performance monitoring initialized');
    } catch (error) {
      console.error('❌ Failed to initialize performance monitoring:', error);
    }
  }

  // Initialize Core Web Vitals
  async initializeWebVitals() {
    if (typeof window === 'undefined') return;

    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      const sendToAnalytics = (metric) => {
        this.recordMetric(`web-vital-${metric.name}`, {
          value: metric.value,
          id: metric.id,
          rating: this.getRating(metric.name, metric.value)
        });
      };
      
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    } catch (error) {
      console.warn('Web Vitals not available:', error);
    }
  }

  // Initialize custom metrics
  initializeCustomMetrics() {
    if (typeof window === 'undefined') return;

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordMetric('page-load-time', { value: loadTime });
    });

    // Track DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      const domReadyTime = performance.now();
      this.recordMetric('dom-ready-time', { value: domReadyTime });
    });

    // Track first paint
    if ('performance' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        this.recordMetric(`paint-${entry.name}`, { value: entry.startTime });
      });
    }
  }

  // Initialize error tracking
  initializeErrorTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.recordMetric('js-error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('unhandled-promise-rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  // Initialize memory monitoring
  initializeMemoryMonitoring() {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    setInterval(() => {
      const memory = performance.memory;
      this.recordMetric('memory-usage', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      });
    }, 30000); // Every 30 seconds
  }

  // Record a metric
  recordMetric(name, data) {
    const metric = {
      name,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.set(name, metric);
    this.reportQueue.push(metric);

    // Keep queue size manageable
    if (this.reportQueue.length > this.maxQueueSize) {
      this.reportQueue.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [Performance] ${name}:`, data);
    }
  }

  // Get rating for Web Vitals
  getRating(metricName, value) {
    const thresholds = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FID: { good: 100, needsImprovement: 300 },
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      TTFB: { good: 800, needsImprovement: 1800 }
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  // Measure function execution time
  measureFunction(name, fn) {
    return (...args) => {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      this.recordMetric(`function-${name}`, {
        executionTime,
        args: args.length
      });

      return result;
    };
  }

  // Measure async function execution time
  async measureAsyncFunction(name, fn) {
    return async (...args) => {
      const startTime = performance.now();
      const result = await fn(...args);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      this.recordMetric(`async-function-${name}`, {
        executionTime,
        args: args.length
      });

      return result;
    };
  }

  // Start a timer
  startTimer(name) {
    this.metrics.set(`timer-${name}`, {
      name: `timer-${name}`,
      startTime: performance.now(),
      timestamp: Date.now()
    });
  }

  // End a timer
  endTimer(name) {
    const timer = this.metrics.get(`timer-${name}`);
    if (timer) {
      const endTime = performance.now();
      const duration = endTime - timer.startTime;

      this.recordMetric(`timer-${name}`, {
        duration,
        startTime: timer.startTime,
        endTime
      });

      this.metrics.delete(`timer-${name}`);
    }
  }

  // Track component render performance
  trackComponentRender(componentName) {
    return {
      start: () => this.startTimer(`render-${componentName}`),
      end: () => this.endTimer(`render-${componentName}`)
    };
  }

  // Get performance report
  getReport() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: Array.from(this.metrics.values()),
      summary: this.getSummary()
    };

    return report;
  }

  // Get performance summary
  getSummary() {
    const webVitals = {};
    const functionMetrics = [];
    const timerMetrics = [];

    for (const [name, metric] of this.metrics) {
      if (name.startsWith('web-vital-')) {
        const vitalName = name.replace('web-vital-', '');
        webVitals[vitalName] = metric.data;
      } else if (name.startsWith('function-')) {
        functionMetrics.push(metric);
      } else if (name.startsWith('timer-')) {
        timerMetrics.push(metric);
      }
    }

    return {
      webVitals,
      functionMetrics: functionMetrics.slice(-10), // Last 10 function calls
      timerMetrics: timerMetrics.slice(-10), // Last 10 timers
      totalMetrics: this.metrics.size
    };
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
    this.reportQueue = [];
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: Array.from(this.metrics.values()),
      queue: this.reportQueue,
      summary: this.getSummary()
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  performanceMonitor.initialize();
}

export default performanceMonitor;

// Convenience functions
export const measurePerformance = (name, fn) => performanceMonitor.measureFunction(name, fn);
export const measureAsyncPerformance = (name, fn) => performanceMonitor.measureAsyncFunction(name, fn);
export const startTimer = (name) => performanceMonitor.startTimer(name);
export const endTimer = (name) => performanceMonitor.endTimer(name);
export const trackComponent = (componentName) => performanceMonitor.trackComponentRender(componentName);
export const getPerformanceReport = () => performanceMonitor.getReport(); 