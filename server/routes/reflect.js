const express = require('express');
const router = express.Router();
const reflectController = require('../controllers/reflectController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public route for basic reflection (no auth required)
router.post('/reflect', optionalAuth, reflectController.reflect);

// Protected route for AI journal entry generation (requires auth for user context)
router.post('/generate-journal-entry', authenticateToken, reflectController.generateJournalEntry);

// Protected routes for premium features
router.post('/save-reflection', authenticateToken, reflectController.saveReflection);
router.get('/reflections', authenticateToken, reflectController.getReflections);
router.delete('/reflections/:id', authenticateToken, reflectController.deleteReflection);

module.exports = router; 