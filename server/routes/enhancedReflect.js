const express = require('express');
const router = express.Router();
const { enhancedReflect } = require('../controllers/enhancedReflectController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * Enhanced AI Reflection Routes
 * Provides more sophisticated AI responses with better personalization
 */

// Enhanced reflection endpoint with improved AI capabilities
router.post('/enhanced-reflect', authenticateToken, enhancedReflect);

// Public enhanced reflection endpoint (for non-authenticated users)
router.post('/enhanced-reflect-public', optionalAuth, enhancedReflect);

module.exports = router; 