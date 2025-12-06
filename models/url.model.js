const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const CSV_FILE_PATH = path.join(__dirname, '../data/urls.csv');

/**
 * URL Model - Handles CSV data operations
 */
class URLModel {
  /**
   * Read all URLs from CSV file
   */
  static async readAllURLs() {
    return new Promise((resolve, reject) => {
      const urls = [];
      
      // Check if file exists
      if (!fs.existsSync(CSV_FILE_PATH)) {
        // Create sample data if file doesn't exist
        this.createSampleData().then(() => {
          this.readAllURLs().then(resolve).catch(reject);
        });
        return;
      }

      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
          urls.push({
            url: row.URL || row.url,
            status: row.Status || row.status || 'Pending',
            lastChecked: row['Last Checked Date'] || row.lastChecked || 'Not yet checked',
            notes: row.Notes || row.notes || ''
          });
        })
        .on('end', () => {
          resolve(urls);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Write all URLs to CSV file
   */
  static async writeAllURLs(urls) {
    const csvWriter = createCsvWriter({
      path: CSV_FILE_PATH,
      header: [
        { id: 'url', title: 'URL' },
        { id: 'status', title: 'Status' },
        { id: 'lastChecked', title: 'Last Checked Date' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    return csvWriter.writeRecords(urls);
  }

  /**
   * Update single URL status
   */
  static async updateURLStatus(urlToUpdate, status, notes = '') {
    const urls = await this.readAllURLs();
    const updatedUrls = urls.map(urlData => {
      if (urlData.url === urlToUpdate) {
        return {
          ...urlData,
          status,
          lastChecked: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          notes
        };
      }
      return urlData;
    });

    await this.writeAllURLs(updatedUrls);
    return updatedUrls;
  }

  /**
   * Create sample data with indexed, not indexed, and invalid URLs
   */
  static async createSampleData() {
    // Ensure data directory exists
    const dataDir = path.dirname(CSV_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const sampleURLs = [
      // Indexed URLs (popular websites)
      { url: 'https://www.google.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.wikipedia.org', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.github.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.stackoverflow.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.youtube.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.amazon.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.facebook.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.twitter.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.linkedin.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.reddit.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },

      // Not indexed URLs (obscure or deep pages)
      { url: 'https://www.example.com/very/deep/page/12345', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.testsite123456789.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.myunknownwebsite.org', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://subdomain.rarely-visited-site.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.obscure-tech-blog.io/post/99999', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.hidden-portfolio.net/projects', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://staging.example-company.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.personal-blog-2024.com/archives', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://beta.newstartup.tech', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://www.niche-hobby-forum.com/thread/54321', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },

      // Invalid URLs
      { url: 'http://thisisnotavalidurl', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://999.999.999.999', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'htp://wrong-protocol.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'www.missing-protocol.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://nonexistent-domain-12345678.xyz', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://fake website.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'not-a-url-at-all', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'https://localhost:99999', status: 'Pending', lastChecked: 'Not yet checked', notes: '' },
      { url: 'ftp://wrong-scheme.com', status: 'Pending', lastChecked: 'Not yet checked', notes: '' }
    ];

    await this.writeAllURLs(sampleURLs);
    console.log('✅ Sample data created in urls.csv');
  }
}

module.exports = URLModel;