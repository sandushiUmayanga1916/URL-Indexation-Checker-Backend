const URLModel = require('../models/url.model');
const IndexationService = require('../services/indexation.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

// Configure multer for CSV file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'uploaded-urls-' + Date.now() + '.csv');
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class URLController {
  /**
   * Get multer upload middleware
   */
  static getUploadMiddleware() {
    return upload.single('csvFile');
  }

  /**
   * Upload CSV file with URLs
   * POST /api/urls/upload
   */
  static async uploadCSV(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a CSV file.'
        });
      }

      console.log('📁 Processing uploaded CSV file:', req.file.originalname);

      // Read and parse the uploaded CSV
      const urls = [];
      const filePath = req.file.path;

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Support multiple column name variations
            const url = row.URL || row.url || row.Url || row.link || row.Link;
            
            if (url && url.trim()) {
              urls.push({
                url: url.trim(),
                status: 'Pending',
                lastChecked: 'Not yet checked',
                notes: ''
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      if (urls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid URLs found in the CSV file. Make sure the CSV has a "URL" column.'
        });
      }

      // Limit to 30 URLs as per requirements
      if (urls.length > 1000) {
        return res.status(400).json({
          success: false,
          message: `Too many URLs. Maximum 30 URLs allowed. Your file contains ${urls.length} URLs.`
        });
      }

      // Replace existing URLs with uploaded ones
      await URLModel.writeAllURLs(urls);

      console.log(`✅ Successfully imported ${urls.length} URLs from CSV`);

      res.json({
        success: true,
        message: `Successfully imported ${urls.length} URLs. Run a check to see their indexation status.`,
        count: urls.length,
        data: urls
      });

    } catch (error) {
      console.error('❌ Error uploading CSV:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      next(error);
    }
  }

  /**
   * Download current URLs as CSV
   * GET /api/urls/download
   */
  static async downloadCSV(req, res, next) {
    try {
      const urls = await URLModel.readAllURLs();
      
      // Create CSV content
      let csvContent = 'URL,Status,Last Checked Date,Notes\n';
      
      urls.forEach(urlData => {
        // Escape commas and quotes in data
        const url = `"${urlData.url.replace(/"/g, '""')}"`;
        const status = `"${urlData.status.replace(/"/g, '""')}"`;
        const lastChecked = `"${urlData.lastChecked.replace(/"/g, '""')}"`;
        const notes = `"${(urlData.notes || '').replace(/"/g, '""')}"`;
        
        csvContent += `${url},${status},${lastChecked},${notes}\n`;
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="url-indexation-report-${Date.now()}.csv"`);
      
      res.send(csvContent);

    } catch (error) {
      console.error('❌ Error downloading CSV:', error);
      next(error);
    }
  }

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
          message: 'No URLs to check. Please upload a CSV file with URLs first.',
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
        lastCheck: urls.length > 0 && urls[0].lastChecked !== 'Not yet checked' 
          ? urls[0].lastChecked 
          : 'Never'
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