const express = require('express');
const router = express.Router();
const { saveReflectionHandler } = require('../controllers/journalController');

router.post('/save-reflection', saveReflectionHandler);
 
module.exports = router; 