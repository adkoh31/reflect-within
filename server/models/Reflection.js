const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userInput: { type: String, required: true },
  aiQuestion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, default: 'default' }
});

module.exports = mongoose.model('Reflection', reflectionSchema); 