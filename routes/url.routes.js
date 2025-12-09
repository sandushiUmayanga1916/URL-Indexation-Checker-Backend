const express = require('express');
const URLController = require('../controllers/url.controller');

const router = express.Router();

// GET /api/urls - Get all URLs
router.get('/', URLController.getAllURLs);

// POST /api/urls/upload - Upload CSV file with URLs
router.post('/upload', URLController.getUploadMiddleware(), URLController.uploadCSV);

// GET /api/urls/download - Download current URLs as CSV
router.get('/download', URLController.downloadCSV);

// POST /api/urls/check - Manually trigger indexation check
router.post('/check', URLController.checkAllURLs);

// GET /api/urls/status - Get check status and statistics
router.get('/status', URLController.getCheckStatus);

module.exports = router;