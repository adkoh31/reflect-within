const mongoose = require('mongoose');

// Model for storing chat conversations (user input + AI response)
// This is different from JournalEntry which stores structured journal entries
const reflectionSchema = new mongoose.Schema({
  userInput: { type: String, required: true },
  aiQuestion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }, // Add index for date-based queries
  userId: { type: String, default: 'default', index: true } // Add index for user queries
});

// Add compound index for user's recent reflections
reflectionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Reflection', reflectionSchema); 