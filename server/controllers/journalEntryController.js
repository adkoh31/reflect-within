const JournalEntry = require('../models/JournalEntry');
const { validateJournalEntry, validateSearchInput } = require('../middleware/validation');

// Save journal entry to database (requires auth)
const saveJournalEntry = async (req, res) => {
  try {
    const { date, content, topics = [], attachments = [], template, tags = [], mood, energy, wordCount } = req.body;
    const userId = req.user._id;

    if (!date || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Date and content are required'
      });
    }

    // Validate date format
    const entryDate = new Date(date);
    if (isNaN(entryDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please provide a valid date'
      });
    }

    const journalEntry = new JournalEntry({
      userId,
      date: entryDate,
      content,
      topics,
      attachments,
      template,
      tags,
      mood,
      energy,
      wordCount: wordCount || content.trim().split(/\s+/).filter(word => word.length > 0).length
    });

    await journalEntry.save();

    res.status(201).json({
      message: 'Journal entry saved successfully',
      entry: {
        id: journalEntry._id,
        date: journalEntry.date,
        content: journalEntry.content,
        topics: journalEntry.topics,
        attachments: journalEntry.attachments,
        template: journalEntry.template,
        tags: journalEntry.tags,
        mood: journalEntry.mood,
        energy: journalEntry.energy,
        wordCount: journalEntry.wordCount,
        createdAt: journalEntry.createdAt,
        updatedAt: journalEntry.updatedAt
      }
    });
  } catch (error) {
    console.error('Save journal entry error:', error);
    
    // Handle specific database errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'A journal entry for this date already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to save journal entry',
      message: 'Internal server error'
    });
  }
};

// Get journal entries for a user (requires auth)
const getJournalEntries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, limit = 50, skip = 0, searchQuery, dateRange, topics, hasAttachments } = req.query;

    let query = { userId };
    
    // Date filter
    if (date) {
      query.date = new Date(date);
    }
    
    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateRange) {
        case 'today':
          query.date = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          query.date = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          query.date = { $gte: monthAgo };
          break;
      }
    }
    
    // Topics filter
    if (topics && topics.length > 0) {
      query.topics = { $in: topics };
    }
    
    // Attachments filter
    if (hasAttachments === 'true') {
      query.attachments = { $exists: true, $ne: [] };
    }
    
    // Search query
    if (searchQuery) {
      query.$or = [
        { content: { $regex: searchQuery, $options: 'i' } },
        { topics: { $in: [new RegExp(searchQuery, 'i')] } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await JournalEntry.countDocuments(query);

    res.json({
      entries: entries.map(entry => ({
        id: entry._id,
        date: entry.date,
        content: entry.content,
        topics: entry.topics,
        attachments: entry.attachments,
        template: entry.template,
        tags: entry.tags,
        mood: entry.mood,
        energy: entry.energy,
        wordCount: entry.wordCount,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      })),
      total,
      hasMore: total > parseInt(skip) + entries.length
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({
      error: 'Failed to get journal entries',
      message: 'Internal server error'
    });
  }
};

// Get journal entry by ID (requires auth)
const getJournalEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const entry = await JournalEntry.findOne({ _id: id, userId });
    
    if (!entry) {
      return res.status(404).json({
        error: 'Journal entry not found',
        message: 'Entry does not exist or you do not have access to it'
      });
    }

    res.json({
      entry: {
        id: entry._id,
        date: entry.date,
        content: entry.content,
        topics: entry.topics,
        attachments: entry.attachments,
        template: entry.template,
        tags: entry.tags,
        mood: entry.mood,
        energy: entry.energy,
        wordCount: entry.wordCount,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({
      error: 'Failed to get journal entry',
      message: 'Internal server error'
    });
  }
};

// Update journal entry (requires auth)
const updateJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const entry = await JournalEntry.findOne({ _id: id, userId });
    
    if (!entry) {
      return res.status(404).json({
        error: 'Journal entry not found',
        message: 'Entry does not exist or you do not have access to it'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id' && key !== 'createdAt') {
        entry[key] = updateData[key];
      }
    });

    // Recalculate word count if content changed
    if (updateData.content) {
      entry.wordCount = updateData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    await entry.save();

    res.json({
      message: 'Journal entry updated successfully',
      entry: {
        id: entry._id,
        date: entry.date,
        content: entry.content,
        topics: entry.topics,
        attachments: entry.attachments,
        template: entry.template,
        tags: entry.tags,
        mood: entry.mood,
        energy: entry.energy,
        wordCount: entry.wordCount,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({
      error: 'Failed to update journal entry',
      message: 'Internal server error'
    });
  }
};

// Delete journal entry (requires auth)
const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const entry = await JournalEntry.findOneAndDelete({ _id: id, userId });
    
    if (!entry) {
      return res.status(404).json({
        error: 'Journal entry not found',
        message: 'Entry does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({
      error: 'Failed to delete journal entry',
      message: 'Internal server error'
    });
  }
};

// Get journal statistics (requires auth)
const getJournalStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const query = { userId, ...dateQuery };

    const stats = await JournalEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          averageWords: { $avg: '$wordCount' },
          uniqueDates: { $addToSet: '$date' }
        }
      },
      {
        $project: {
          _id: 0,
          totalEntries: 1,
          totalWords: 1,
          averageWords: { $round: ['$averageWords', 1] },
          uniqueDates: { $size: '$uniqueDates' }
        }
      }
    ]);

    // Get mood distribution
    const moodStats = await JournalEntry.aggregate([
      { $match: query },
      { $match: { mood: { $ne: null } } },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get topic distribution
    const topicStats = await JournalEntry.aggregate([
      { $match: query },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      stats: stats[0] || {
        totalEntries: 0,
        totalWords: 0,
        averageWords: 0,
        uniqueDates: 0
      },
      moodStats,
      topicStats
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({
      error: 'Failed to get journal statistics',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  saveJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats
}; 