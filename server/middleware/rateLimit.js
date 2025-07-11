// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  // Journal entry creation: 10 per hour per user
  'journal-create': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many journal entries created. Please wait before creating more.'
  },
  // General API calls: 100 per hour per IP
  'api-general': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: 'Too many requests. Please wait before making more requests.'
  },
  // Search requests: 50 per hour per user
  'search': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: 'Too many search requests. Please wait before searching again.'
  },
  // Authentication attempts: 5 per 15 minutes per IP
  'auth': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please wait before trying again.'
  }
};

// Clean up expired entries
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.timestamp > data.windowMs) {
      rateLimitStore.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

// Create rate limiter middleware
const createRateLimiter = (type) => {
  return (req, res, next) => {
    const limit = RATE_LIMITS[type];
    if (!limit) {
      return next();
    }

    // Get identifier (user ID if authenticated, IP if not)
    const identifier = req.user ? req.user._id.toString() : req.ip;
    const key = `${type}:${identifier}`;
    
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    // Get existing data
    const existing = rateLimitStore.get(key);
    
    if (existing) {
      // Filter out old requests
      const recentRequests = existing.requests.filter(timestamp => timestamp > windowStart);
      
      if (recentRequests.length >= limit.maxRequests) {
        // Rate limit exceeded
        const oldestRequest = Math.min(...recentRequests);
        const resetTime = oldestRequest + limit.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        res.set({
          'X-RateLimit-Limit': limit.maxRequests,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': retryAfter
        });
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: limit.message,
          retryAfter: retryAfter,
          resetTime: new Date(resetTime).toISOString()
        });
      }
      
      // Add current request
      recentRequests.push(now);
      rateLimitStore.set(key, {
        requests: recentRequests,
        timestamp: now,
        windowMs: limit.windowMs
      });
      
      // Set headers
      res.set({
        'X-RateLimit-Limit': limit.maxRequests,
        'X-RateLimit-Remaining': limit.maxRequests - recentRequests.length,
        'X-RateLimit-Reset': new Date(now + limit.windowMs).toISOString()
      });
    } else {
      // First request
      rateLimitStore.set(key, {
        requests: [now],
        timestamp: now,
        windowMs: limit.windowMs
      });
      
      // Set headers
      res.set({
        'X-RateLimit-Limit': limit.maxRequests,
        'X-RateLimit-Remaining': limit.maxRequests - 1,
        'X-RateLimit-Reset': new Date(now + limit.windowMs).toISOString()
      });
    }
    
    next();
  };
};

// Specific rate limiters
const journalCreateLimiter = createRateLimiter('journal-create');
const apiGeneralLimiter = createRateLimiter('api-general');
const searchLimiter = createRateLimiter('search');
const authLimiter = createRateLimiter('auth');

// Rate limit by IP (for unauthenticated requests)
const ipRateLimiter = (req, res, next) => {
  const limit = RATE_LIMITS['api-general'];
  const key = `ip:${req.ip}`;
  
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  const existing = rateLimitStore.get(key);
  
  if (existing) {
    const recentRequests = existing.requests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= limit.maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = oldestRequest + limit.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP. Please wait before making more requests.',
        retryAfter: retryAfter
      });
    }
    
    recentRequests.push(now);
    rateLimitStore.set(key, {
      requests: recentRequests,
      timestamp: now,
      windowMs: limit.windowMs
    });
  } else {
    rateLimitStore.set(key, {
      requests: [now],
      timestamp: now,
      windowMs: limit.windowMs
    });
  }
  
  next();
};

module.exports = {
  journalCreateLimiter,
  apiGeneralLimiter,
  searchLimiter,
  authLimiter,
  ipRateLimiter,
  createRateLimiter
}; 