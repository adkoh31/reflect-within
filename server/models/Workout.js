const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['CrossFit', 'Yoga', 'Running', 'Weightlifting', 'Cardio', 'Stretching'],
    required: true
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: Number,
    reps: Number,
    weight: String, // e.g., "135 lbs", "53 lbs"
    duration: String, // e.g., "35 min", "18 min"
    notes: String
  }],
  difficulty: {
    type: String,
    enum: ['tough', 'challenging', 'intense', 'solid', 'great', 'amazing', 'okay', 'grueling', 'exhausting'],
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
      enum: ['quads', 'shoulders', 'legs', 'core', 'calves', 'wrists', 'hamstrings', 'hips', 'lower back']
    },
    intensity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    }
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
workoutSchema.index({ userId: 1, date: -1 });
workoutSchema.index({ userId: 1, 'exercises.name': 1 });

module.exports = mongoose.model('Workout', workoutSchema); 