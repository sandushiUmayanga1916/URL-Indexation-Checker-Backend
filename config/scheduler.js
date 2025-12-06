const cron = require('node-cron');
const URLModel = require('../models/url.model');
const IndexationService = require('../services/indexation.service');

/**
 * Scheduler Configuration
 * Runs indexation check daily at 9:00 AM IST
 */

/**
 * Perform scheduled indexation check
 */
async function performScheduledCheck() {
  try {
    console.log('\n⏰ Scheduled indexation check started at:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    
    // Get all URLs
    const urls = await URLModel.readAllURLs();
    
    if (urls.length === 0) {
      console.log('⚠️ No URLs to check');
      return;
    }

    console.log(`📋 Checking ${urls.length} URLs...`);
    
    // Check indexation for each URL
    const results = await IndexationService.checkMultipleURLs(urls);
    
    // Update CSV with results
    const updatedUrls = urls.map((urlData, index) => ({
      url: urlData.url,
      status: results[index].status,
      lastChecked: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      notes: results[index].notes
    }));

    await URLModel.writeAllURLs(updatedUrls);

    // Log summary
    const indexed = results.filter(r => r.status === 'Indexed').length;
    const notIndexed = results.filter(r => r.status === 'Not Indexed').length;
    const invalid = results.filter(r => r.status === 'Invalid URL').length;

    console.log('✅ Scheduled check completed!');
    console.log(`📊 Results: ${indexed} Indexed | ${notIndexed} Not Indexed | ${invalid} Invalid`);
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error during scheduled check:', error.message);
  }
}

/**
 * Start the cron scheduler
 */
function startScheduler() {
  // Cron expression: '0 9 * * *' = Every day at 9:00 AM
  // Format: minute hour day month weekday
  // Timezone: Asia/Kolkata (IST)
  
  const cronExpression = '0 9 * * *'; // 9:00 AM daily
  
  const task = cron.schedule(
    cronExpression,
    performScheduledCheck,
    {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    }
  );

  console.log('✅ Scheduler configured:');
  console.log(`   - Time: 9:00 AM IST (Daily)`);
  console.log(`   - Cron: ${cronExpression}`);
  console.log(`   - Timezone: Asia/Kolkata`);
  console.log('─'.repeat(60));

  // Optional: Run check immediately on startup (for testing)
  // Uncomment the line below to run check on server start
  // setTimeout(performScheduledCheck, 5000); // Run after 5 seconds
  
  return task;
}

module.exports = { startScheduler };