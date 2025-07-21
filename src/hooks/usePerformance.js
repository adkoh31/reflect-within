import { useEffect, useRef, useCallback, useMemo } from 'react';

export const usePerformance = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const memoryUsage = useRef([]);
  const slowRenders = useRef([]);

  // Track render performance
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
      
      // Track slow renders
      if (renderTime > 16) { // 60fps threshold
        slowRenders.current.push({
          renderNumber: renderCount.current,
          renderTime,
          timestamp: new Date().toISOString()
        });
        console.warn(`[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    lastRenderTime.current = currentTime;
  });

  // Track memory usage
  useEffect(() => {
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      memoryUsage.current.push({
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        timestamp: Date.now()
      });

      // Keep only last 100 memory readings
      if (memoryUsage.current.length > 100) {
        memoryUsage.current = memoryUsage.current.slice(-100);
      }
    }
  });

  // Measure function execution time
  const measureFunction = useCallback((fn, functionName) => {
    return (...args) => {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] ${functionName} took ${executionTime.toFixed(2)}ms`);
        
        // Warn for slow functions
        if (executionTime > 100) {
          console.warn(`[${componentName}] Slow function detected: ${functionName} took ${executionTime.toFixed(2)}ms`);
        }
      }
      
      return result;
    };
  }, [componentName]);

  // Get performance stats
  const getStats = useCallback(() => {
    const stats = {
      renderCount: renderCount.current,
      componentName,
      slowRenders: slowRenders.current.length,
      averageRenderTime: 0,
      memoryUsage: null
    };

    // Calculate average render time from slow renders
    if (slowRenders.current.length > 0) {
      const totalTime = slowRenders.current.reduce((sum, render) => sum + render.renderTime, 0);
      stats.averageRenderTime = totalTime / slowRenders.current.length;
    }

    // Get latest memory usage
    if (memoryUsage.current.length > 0) {
      const latest = memoryUsage.current[memoryUsage.current.length - 1];
      stats.memoryUsage = {
        used: latest.used,
        total: latest.total,
        limit: latest.limit,
        percentage: (latest.used / latest.limit) * 100
      };
    }

    return stats;
  }, [componentName]);

  // Clear performance data
  const clearStats = useCallback(() => {
    renderCount.current = 0;
    slowRenders.current = [];
    memoryUsage.current = [];
    lastRenderTime.current = performance.now();
  }, []);

  return {
    measureFunction,
    getStats,
    clearStats,
    renderCount: renderCount.current
  };
};

// Hook for measuring expensive operations
export const useMeasureOperation = (operationName) => {
  const measure = useCallback((operation) => {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${operationName}] took ${executionTime.toFixed(2)}ms`);
      
      // Warn for slow operations
      if (executionTime > 50) {
        console.warn(`[${operationName}] Slow operation detected: ${executionTime.toFixed(2)}ms`);
      }
    }
    
    return { result, executionTime };
  }, [operationName]);

  return measure;
};

// Hook for measuring async operations
export const useMeasureAsyncOperation = (operationName) => {
  const measure = useCallback(async (operation) => {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${operationName}] took ${executionTime.toFixed(2)}ms`);
      
      // Warn for slow async operations
      if (executionTime > 1000) {
        console.warn(`[${operationName}] Slow async operation detected: ${executionTime.toFixed(2)}ms`);
      }
    }
    
    return { result, executionTime };
  }, [operationName]);

  return measure;
};

// Hook for measuring render performance
export const useRenderPerformance = (componentName) => {
  const renderTimes = useRef([]);
  const lastRenderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - lastRenderStart.current;
    renderTimes.current.push(renderTime);

    // Keep only last 50 render times
    if (renderTimes.current.length > 50) {
      renderTimes.current = renderTimes.current.slice(-50);
    }

    if (process.env.NODE_ENV === 'development') {
      const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
      
      if (renderTime > 16) {
        console.warn(`[${componentName}] Slow render: ${renderTime.toFixed(2)}ms (avg: ${averageRenderTime.toFixed(2)}ms)`);
      }
    }
  });

  const getRenderStats = useCallback(() => {
    const times = renderTimes.current;
    if (times.length === 0) return null;

    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    const slowRenders = times.filter(time => time > 16).length;

    return {
      average: average.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      slowRenders,
      totalRenders: times.length,
      slowRenderPercentage: ((slowRenders / times.length) * 100).toFixed(1)
    };
  }, []);

  return { getRenderStats };
}; 