const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Add index for faster user queries
  },
  date: {
    type: String,
    required: true,
    index: true // Add index for date-based queries
  },
  content: {
    type: String,
    required: true
  },
  topics: [{
    type: String
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file']
    },
    url: String,
    filename: String,
    size: Number
  }],
  template: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  mood: {
    type: String,
    enum: ['excited', 'happy', 'calm', 'neutral', 'tired', 'stressed', 'frustrated'],
    default: null
  },
  energy: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  wordCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound indexes for common query patterns
journalEntrySchema.index({ userId: 1, date: -1 });
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, mood: 1 });
journalEntrySchema.index({ userId: 1, topics: 1 });

// Update the updatedAt field before saving
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema); 