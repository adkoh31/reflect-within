const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ipRateLimiter } = require('./middleware/rateLimit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Check if .env is loaded
console.log('🔍 Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT || 'Using default 3001');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://reflect-within.vercel.app',
      'https://reflect-within-git-main-adkoh31.vercel.app',
      'https://reflect-within-adkoh31.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow for now, log for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(ipRateLimiter); // Apply rate limiting to all routes

// Import routes
const reflectRoutes = require('./routes/reflect');
const authRoutes = require('./routes/auth');
const insightsRoutes = require('./routes/insights');
const journalRoutes = require('./routes/journal');
const journalEntriesRoutes = require('./routes/journalEntries');
const workoutRoutes = require('./routes/workout');

// Use routes
app.use('/api', reflectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/journal-entries', journalEntriesRoutes);
app.use('/api/workout', workoutRoutes);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reflectwithin';

console.log('🔗 Attempting to connect to MongoDB...');
console.log('URI:', MONGODB_URI.substring(0, 50) + '...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 To enable premium features, set up MongoDB Atlas and add MONGODB_URI to your .env file');
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReflectWithin API is running',
    timestamp: new Date().toISOString(),
    security: {
      rateLimiting: 'enabled',
      contentValidation: 'enabled',
      cors: 'configured'
    }
  });
});

// Debug endpoint to test auth routes
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working',
    routes: {
      auth: '/api/auth',
      register: '/api/auth/register',
      login: '/api/auth/login'
    },
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
app.post('/api/test', (req, res) => {
  res.json({
    message: 'POST request working',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ReflectWithin server running on port ${PORT}`);
  console.log(`📱 Frontend should be running on http://localhost:3000`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  console.log(`🔒 Security features: Rate limiting, Content validation, CORS enabled`);
}); 