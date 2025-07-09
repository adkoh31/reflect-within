const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Add index for faster user queries
  },
  type: {
    type: String,
    required: true,
    default: 'CrossFit'
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: Number,
    reps: Number,
    weight: String,
    notes: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'okay', 'tough', 'challenging', 'intense'],
    default: 'okay'
  },
  mood: {
    type: String,
    enum: ['Tired', 'Energized', 'Grateful', 'Neutral', 'Stressed'],
    default: 'Neutral'
  },
  soreness: [{
    area: {
      type: String,
      required: true
    },
    intensity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    }
  }],
  notes: String,
  date: {
    type: Date,
    default: Date.now,
    index: true // Add index for date-based queries
  }
});

// Add compound indexes for common query patterns
workoutSchema.index({ userId: 1, date: -1 }); // For user's recent workouts
workoutSchema.index({ userId: 1, 'soreness.area': 1 }); // For soreness history
workoutSchema.index({ userId: 1, 'exercises.name': 1 }); // For exercise-specific queries

module.exports = mongoose.model('Workout', workoutSchema); 