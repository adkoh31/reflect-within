const express = require('express');
const router = express.Router();
const { insightsHandler } = require('../controllers/insightsController');

router.post('/', insightsHandler);

module.exports = router; 