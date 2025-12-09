const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const urlRoutes = require('./routes/url.routes');
const errorHandler = require('./middleware/errorHandler');
const { startScheduler } = require('./config/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for any frontend build)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/urls', urlRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'URL Indexation Checker API is running',
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('═'.repeat(60));
  console.log('🚀 URL Indexation Checker Backend');
  console.log('═'.repeat(60));
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('═'.repeat(60));
  
  // Start the scheduler for daily checks
  console.log('\n⏰ Starting Cron Scheduler...');
  startScheduler();
  console.log('');
});