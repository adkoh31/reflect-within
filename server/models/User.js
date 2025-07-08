const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  // New fitness and personalization fields
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String,
    enum: ['strength', 'flexibility', 'endurance', 'balance', 'weight_loss', 'muscle_gain', 'general_fitness', 'recovery', 'stress_relief', 'competition_prep', 'injury_prevention', 'consistency']
  }],
  primaryActivities: [{
    type: String,
    enum: ['CrossFit', 'Yoga', 'Running', 'Weightlifting', 'Cardio', 'Stretching']
  }],
  activityLevel: {
    type: String,
    enum: ['just_starting', '1_2_times_week', '2_3_times_week', '4_plus_times_week'],
    default: null
  },
  experienceLevel: {
    type: String,
    enum: ['less_than_6_months', '6_months_1_year', '1_3_years', '3_plus_years'],
    default: null
  },
  // Track if fitness profile has been collected
  fitnessProfileCollected: {
    type: Boolean,
    default: false
  },
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 