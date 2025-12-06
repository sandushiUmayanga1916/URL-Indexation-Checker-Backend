const URLModel = require('../models/url.model');
const IndexationService = require('../services/indexation.service');


class URLController {
  /**
   * Get all URLs
   * GET /api/urls
   */
  static async getAllURLs(req, res, next) {
    try {
      const urls = await URLModel.readAllURLs();
      res.json({
        success: true,
        count: urls.length,
        data: urls
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger indexation check for all URLs
   * POST /api/urls/check
   */
  static async checkAllURLs(req, res, next) {
    try {
      console.log('🚀 Manual indexation check started...');
      
      // Get all URLs from CSV
      const urls = await URLModel.readAllURLs();
      
      if (urls.length === 0) {
        return res.json({
          success: true,
          message: 'No URLs to check',
          data: []
        });
      }

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

      console.log('✅ Indexation check completed');
      
      res.json({
        success: true,
        message: 'Indexation check completed successfully',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        data: updatedUrls
      });
    } catch (error) {
      console.error('❌ Error during indexation check:', error);
      next(error);
    }
  }

  /**
   * Get last check status
   * GET /api/urls/status
   */
  static async getCheckStatus(req, res, next) {
    try {
      const urls = await URLModel.readAllURLs();
      
      // Calculate statistics
      const stats = {
        total: urls.length,
        indexed: urls.filter(u => u.status === 'Indexed').length,
        notIndexed: urls.filter(u => u.status === 'Not Indexed').length,
        invalid: urls.filter(u => u.status === 'Invalid URL').length,
        pending: urls.filter(u => u.status === 'Pending').length,
        lastCheck: urls.length > 0 ? urls[0].lastChecked : 'Never'
      };

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = URLController;