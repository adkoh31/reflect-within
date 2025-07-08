import { useEffect, useRef, useCallback } from 'react';

export const usePerformance = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  // Track render performance
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
      
      // Warn if render takes too long
      if (renderTime > 16) { // 60fps threshold
        console.warn(`[${componentName}] Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    lastRenderTime.current = currentTime;
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
      }
      
      return result;
    };
  }, [componentName]);

  // Get performance stats
  const getStats = useCallback(() => ({
    renderCount: renderCount.current,
    componentName
  }), [componentName]);

  return {
    measureFunction,
    getStats,
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
    }
    
    return { result, executionTime };
  }, [operationName]);

  return measure;
}; 