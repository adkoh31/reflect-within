const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateJournalEntry, validateSearchInput } = require('../middleware/validation');
const { journalCreateLimiter, searchLimiter } = require('../middleware/rateLimit');
const {
  saveJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats
} = require('../controllers/journalEntryController');

// All routes require authentication
router.use(authenticateToken);

// CRUD operations for journal entries
router.post('/', journalCreateLimiter, validateJournalEntry, saveJournalEntry);
router.get('/', searchLimiter, validateSearchInput, getJournalEntries);
router.get('/stats', getJournalStats);
router.get('/:id', getJournalEntryById);
router.put('/:id', journalCreateLimiter, validateJournalEntry, updateJournalEntry);
router.delete('/:id', deleteJournalEntry);

module.exports = router; 