const axios = require('axios');

/**
 * Indexation Service
 * Checks if a URL is indexed by Google
 * 
 * Method: We simulate Google "site:" search by:
 * 1. Validating URL format
 * 2. Making HTTP request to check if URL is accessible
 * 3. Based on HTTP status and response, determine indexation likelihood
 * 
 * Note: For production, use Google Search Console API or Custom Search API
 */
class IndexationService {
  /**
   * Check if URL is valid format
   */
  static isValidURL(url) {
    try {
      const urlObj = new URL(url);
      // Check if protocol is http or https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      // Check if hostname is valid
      if (!urlObj.hostname || urlObj.hostname.includes(' ')) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check indexation status of a single URL
   */
  static async checkIndexation(url) {
    // Step 1: Validate URL format
    if (!this.isValidURL(url)) {
      return {
        status: 'Invalid URL',
        notes: 'Invalid URL format'
      };
    }

    try {
      // Step 2: Make HTTP request to check if URL is accessible
      const response = await axios.get(url, {
        timeout: 10000, // 10 seconds timeout
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500; // Accept any status < 500
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URL-Indexation-Checker/1.0)'
        }
      });

      // Step 3: Determine indexation based on response
      if (response.status === 200) {
        // URL is accessible and returns content
        // In real scenario, we would check Google's index
        // For this demo, we assume accessible pages are likely indexed
        return {
          status: 'Indexed',
          notes: `HTTP ${response.status} - Page accessible`
        };
      } else if (response.status === 404) {
        return {
          status: 'Not Indexed',
          notes: 'HTTP 404 - Page not found'
        };
      } else if (response.status === 403) {
        return {
          status: 'Not Indexed',
          notes: 'HTTP 403 - Access forbidden'
        };
      } else if (response.status >= 400) {
        return {
          status: 'Not Indexed',
          notes: `HTTP ${response.status} - Client error`
        };
      } else {
        return {
          status: 'Not Indexed',
          notes: `HTTP ${response.status} - Unusual status`
        };
      }
    } catch (error) {
      // Handle network errors
      if (error.code === 'ENOTFOUND') {
        return {
          status: 'Invalid URL',
          notes: 'DNS not found - Domain does not exist'
        };
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        return {
          status: 'Not Indexed',
          notes: 'Connection timeout'
        };
      } else if (error.code === 'ECONNREFUSED') {
        return {
          status: 'Invalid URL',
          notes: 'Connection refused'
        };
      } else if (error.message.includes('Invalid URL')) {
        return {
          status: 'Invalid URL',
          notes: 'Malformed URL'
        };
      } else {
        return {
          status: 'Not Indexed',
          notes: `Error: ${error.message.substring(0, 50)}`
        };
      }
    }
  }

  /**
   * Check multiple URLs
   */
  static async checkMultipleURLs(urls) {
    const results = [];
    
    for (const urlData of urls) {
      console.log(`🔍 Checking: ${urlData.url}`);
      const result = await this.checkIndexation(urlData.url);
      results.push({
        url: urlData.url,
        status: result.status,
        notes: result.notes
      });
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }
}

module.exports = IndexationService;