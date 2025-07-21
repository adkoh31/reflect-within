// Monitoring and Observability Utilities
// Provides error tracking, performance monitoring, and analytics

import config, { isProduction, isStaging, log } from '../config/environment.js';

// Initialize Sentry for error tracking
let Sentry = null;

export const initializeMonitoring = async () => {
  try {
    if (isProduction() || isStaging()) {
      // Dynamically import Sentry to avoid bundle size impact in development
      const SentryModule = await import('@sentry/react');
      Sentry = SentryModule.default;
      
      if (config.SENTRY_DSN) {
        Sentry.init({
          dsn: config.SENTRY_DSN,
          environment: config.NODE_ENV,
          integrations: [
            new Sentry.BrowserTracing({
              tracePropagationTargets: ['localhost', config.API_URL],
            }),
            new Sentry.Replay({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          tracesSampleRate: isProduction() ? 0.1 : 1.0,
          replaysSessionSampleRate: isProduction() ? 0.1 : 1.0,
          replaysOnErrorSampleRate: 1.0,
          beforeSend(event) {
            // Filter out certain errors in production
            if (isProduction()) {
              // Don't send console errors
              if (event.exception && event.exception.values) {
                const isConsoleError = event.exception.values.some(
                  exception => exception.value && exception.value.includes('console.error')
                );
                if (isConsoleError) return null;
              }
            }
            return event;
          },
        });
        
        log('info', 'Sentry initialized successfully', { environment: config.NODE_ENV });
      } else {
        log('warn', 'Sentry DSN not configured, error tracking disabled');
      }
    }
  } catch (error) {
    log('error', 'Failed to initialize Sentry', { error: error.message });
  }
};

// Error tracking
export const captureError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  // Log to console in all environments
  log('error', 'Error captured', errorInfo);
  
  // Send to Sentry in production/staging
  if (Sentry && (isProduction() || isStaging())) {
    try {
      Sentry.captureException(error, {
        extra: context,
        tags: {
          component: context.component || 'unknown',
          action: context.action || 'unknown'
        }
      });
    } catch (sentryError) {
      log('error', 'Failed to send error to Sentry', { error: sentryError.message });
    }
  }
};

// Performance monitoring
export const initializePerformanceMonitoring = async () => {
  try {
    if (isProduction()) {
      // Web Vitals monitoring
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      const sendToAnalytics = (metric) => {
        log('info', 'Web Vital captured', {
          name: metric.name,
          value: metric.value,
          id: metric.id
        });
        
        // Send to analytics service if configured
        if (window.gtag) {
          window.gtag('event', metric.name, {
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            non_interaction: true,
          });
        }
      };
      
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
      
      log('info', 'Performance monitoring initialized');
    }
  } catch (error) {
    log('error', 'Failed to initialize performance monitoring', { error: error.message });
  }
};

// User analytics
export const initializeAnalytics = () => {
  try {
    if (config.ANALYTICS_ID && (isProduction() || isStaging())) {
      // Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ANALYTICS_ID}`;
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', config.ANALYTICS_ID, {
        page_title: document.title,
        page_location: window.location.href
      });
      
      log('info', 'Analytics initialized successfully');
    }
  } catch (error) {
    log('error', 'Failed to initialize analytics', { error: error.message });
  }
};

// Custom event tracking
export const trackEvent = (eventName, parameters = {}) => {
  const eventData = {
    event: eventName,
    parameters,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  log('info', 'Event tracked', eventData);
  
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
  
  // Send to Sentry as breadcrumb
  if (Sentry) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: eventName,
      data: parameters,
      level: 'info'
    });
  }
};

// Page view tracking
export const trackPageView = (pageName, pageData = {}) => {
  const pageViewData = {
    page_name: pageName,
    page_data: pageData,
    timestamp: new Date().toISOString()
  };
  
  log('info', 'Page view tracked', pageViewData);
  
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('config', config.ANALYTICS_ID, {
      page_title: pageName,
      page_location: window.location.href,
      custom_map: pageData
    });
  }
};

// Performance measurement
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    const duration = end - start;
    
    log('debug', 'Performance measurement', {
      name,
      duration: `${duration.toFixed(2)}ms`
    });
    
    // Track slow operations
    if (duration > 100) {
      log('warn', 'Slow operation detected', {
        name,
        duration: `${duration.toFixed(2)}ms`
      });
      
      if (Sentry) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Slow operation: ${name}`,
          data: { duration },
          level: 'warning'
        });
      }
    }
    
    return result;
  };
};

// Health check
export const healthCheck = () => {
  const health = {
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    sentry: !!Sentry,
    analytics: !!window.gtag,
    performance: 'performance' in window,
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  log('info', 'Health check completed', health);
  return health;
};

// Initialize all monitoring
export const initializeAllMonitoring = async () => {
  log('info', 'Initializing monitoring systems');
  
  await initializeMonitoring();
  await initializePerformanceMonitoring();
  initializeAnalytics();
  
  log('info', 'All monitoring systems initialized');
};

// Export for use in components
export default {
  captureError,
  trackEvent,
  trackPageView,
  measurePerformance,
  healthCheck,
  initializeAllMonitoring
}; 