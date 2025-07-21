const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// Security middleware configuration
const securityMiddleware = [
  // Basic security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://www.googletagmanager.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'", 
          "https://api.openai.com",
          "https://www.google-analytics.com",
          "https://o4501234567890.ingest.sentry.io"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'", "blob:"],
        manifestSrc: ["'self'"],
        prefetchSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      },
      reportOnly: false
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    xssFilter: true,
    ieNoOpen: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' }
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? req.user._id.toString() : req.ip;
    }
  }),

  // Specific rate limits for sensitive endpoints
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many authentication attempts',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip,
    skip: (req) => !req.path.includes('/auth/')
  }),

  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: ['topics', 'tags', 'mood', 'energy'] // Allow these parameters to be arrays
  }),

  // CORS configuration
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://reflect-within.vercel.app',
        'https://reflect-within-git-main-adkoh31.vercel.app',
        'https://reflect-within-adkoh31.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
  }),

  // Request size limits
  (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Payload too large',
        message: 'Request body exceeds maximum size of 10MB'
      });
    }
    next();
  },

  // Security headers middleware
  (req, res, next) => {
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
  },

  // Request logging for security monitoring
  (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };
      
      // Log suspicious requests
      if (res.statusCode >= 400 || duration > 5000) {
        console.warn('Suspicious request detected:', logData);
      } else {
        console.log('Request processed:', logData);
      }
    });
    
    next();
  },

  // Input sanitization middleware
  (req, res, next) => {
    // Sanitize request body
    if (req.body) {
      const sanitizeObject = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            // Remove potential XSS vectors
            obj[key] = obj[key]
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
              .trim();
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      };
      
      sanitizeObject(req.body);
    }
    
    next();
  },

  // API key validation middleware
  (req, res, next) => {
    // Validate OpenAI API key if present
    if (req.path.includes('/api/reflect') && !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured for reflection endpoint');
    }
    
    next();
  }
];

// Error handling for security middleware
const securityErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-origin request not allowed'
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds maximum size'
    });
  }
  
  // Log security-related errors
  console.error('Security middleware error:', {
    error: err.message,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// Health check endpoint with security info
const securityHealthCheck = (req, res) => {
  const securityInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: {
      helmet: 'enabled',
      rateLimit: 'enabled',
      cors: 'configured',
      hpp: 'enabled',
      csp: 'enabled',
      hsts: 'enabled'
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(securityInfo);
};

module.exports = {
  securityMiddleware,
  securityErrorHandler,
  securityHealthCheck
}; 