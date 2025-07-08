const Reflection = require('../models/Reflection');

// POST /api/save-reflection
exports.saveReflectionHandler = async (req, res) => {
  try {
    const { userInput, aiQuestion } = req.body;
    if (!userInput || !aiQuestion) {
      return res.status(400).json({ error: 'User input and AI question are required' });
    }
    const reflection = new Reflection({
      userInput,
      aiQuestion,
      timestamp: new Date()
    });
    await reflection.save();
    res.json({ success: true, id: reflection._id });
  } catch (error) {
    console.error('Error saving reflection:', error);
    res.status(500).json({ error: 'Failed to save reflection' });
  }
}; 