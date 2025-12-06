const express = require('express');
const URLController = require('../controllers/url.controller');

const router = express.Router();

// GET /api/urls - Get all URLs
router.get('/', URLController.getAllURLs);

// POST /api/urls/check - Manually trigger indexation check
router.post('/check', URLController.checkAllURLs);

// GET /api/urls/status - Get check status and statistics
router.get('/status', URLController.getCheckStatus);

module.exports = router;