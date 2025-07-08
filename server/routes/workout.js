const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authenticateToken } = require('../middleware/auth');

// All workout routes require authentication
router.use(authenticateToken);

// Save workout from user message
router.post('/save-from-message', workoutController.saveWorkoutFromMessage);

// Get user's workout history
router.get('/history', workoutController.getWorkoutHistory);

// Get workout statistics
router.get('/stats', workoutController.getWorkoutStats);

// Delete workout
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router; 