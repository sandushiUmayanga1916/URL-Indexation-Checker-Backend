const express = require('express');
const cors = require('cors');
const urlRoutes = require('./routes/url.routes');
const errorHandler = require('./middleware/errorHandler');
const { startScheduler } = require('./config/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/urls', urlRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`⏰ Starting daily scheduler...`);
  
  // Start the cron scheduler
  startScheduler();
});

module.exports = app;