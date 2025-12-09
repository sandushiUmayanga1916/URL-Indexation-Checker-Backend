# URL Indexation Checker - Backend API

RESTful API backend for URL indexation monitoring with automated daily checks, CSV storage, and comprehensive error handling.

---

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **node-cron** - Task scheduler
- **axios** - HTTP client
- **csv-parser** - Read CSV files
- **csv-writer** - Write CSV files
- **cors** - Cross-origin support

---

## 📁 Project Structure

```
backend/
├── config/
│   └── scheduler.js          # Cron job configuration (9 AM IST)
├── controllers/
│   └── urlController.js      # Request handlers
├── middleware/
│   └── errorHandler.js       # Error handling middleware
├── models/
│   └── urlModel.js           # CSV data operations
├── routes/
│   └── urlRoutes.js          # API route definitions
├── services/
│   └── indexationService.js  # URL validation & checking logic
├── data/
│   └── urls.csv              # URL data storage (auto-generated)
├── server.js                 # Express app entry point
└── package.json              # Dependencies
```

---

## 🚀 Installation

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create folder structure** (if not exists)
```bash
mkdir -p config controllers middleware models routes services data
```

4. **Start the server**
```bash
npm start
```

The server will start on `http://localhost:5000`

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "csv-parser": "^3.0.0",
    "csv-writer": "^1.6.0",
    "node-cron": "^3.0.3",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

Install all at once:
```bash
npm install express cors csv-parser csv-writer node-cron axios
npm install --save-dev nodemon
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 1. Get All URLs
```http
GET /api/urls
```

**Response:**
```json
{
  "success": true,
  "count": 30,
  "data": [
    {
      "url": "https://example.com",
      "status": "Indexed",
      "lastChecked": "06/12/2025, 10:30:00 AM",
      "notes": "HTTP 200 - Page accessible"
    }
  ]
}
```

### 2. Trigger Manual Check
```http
POST /api/urls/check
```

**Response:**
```json
{
  "success": true,
  "message": "Indexation check completed successfully",
  "timestamp": "06/12/2025, 10:30:00 AM",
  "data": [...]
}
```

### 3. Get Statistics
```http
GET /api/urls/status
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 30,
    "indexed": 10,
    "notIndexed": 15,
    "invalid": 5,
    "pending": 0,
    "lastCheck": "06/12/2025, 10:30:00 AM"
  }
}
```

### 4. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## ⏰ Scheduler Configuration

### Current Schedule
- **Time**: 9:00 AM IST (Daily)
- **File**: `config/scheduler.js`
- **Timezone**: Asia/Kolkata

### Change Schedule Time

Edit `config/scheduler.js`:

```javascript
const cronExpression = '0 9 * * *'; // Change this line
```

### Common Schedule Examples

| Schedule | Cron Expression |
|----------|----------------|
| 9:00 AM daily | `0 9 * * *` |
| 2:30 PM daily | `30 14 * * *` |
| Every 6 hours | `0 */6 * * *` |
| 9 AM weekdays | `0 9 * * 1-5` |
| Every hour | `0 * * * *` |

**Cron Format:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 7)
│ │ │ │ │
* * * * *
```

Test expressions: https://crontab.guru/

---

## 📝 Data Management

### CSV File Location
```
backend/data/urls.csv
```

### CSV Format
```csv
URL,Status,Last Checked Date,Notes
https://example.com,Indexed,06/12/2025 10:30:00 AM,HTTP 200 - Page accessible
https://test.com,Not Indexed,06/12/2025 10:30:15 AM,HTTP 404 - Page not found
https://invalid,Invalid URL,06/12/2025 10:30:20 AM,Invalid URL format
```

### Update URLs

**Method 1: Edit CSV directly**
```csv
URL,Status,Last Checked Date,Notes
https://yoursite.com,Pending,Not yet checked,
```

**Method 2: Modify sample data**
Edit `models/urlModel.js` → `createSampleData()` function

### Status Types
- **Indexed** - HTTP 200 OK
- **Not Indexed** - 404, 403, timeout
- **Invalid URL** - Malformed, DNS error
- **Pending** - Not yet checked

---

## 🔍 Indexation Check Logic

### Process Flow
1. Validate URL format (protocol, hostname)
2. Make HTTP GET request (10s timeout)
3. Analyze response status code
4. Handle errors gracefully
5. Update CSV with results

### Implementation
File: `services/indexationService.js`

**What it checks:**
- ✅ URL format validation
- ✅ HTTP accessibility
- ✅ Response status codes
- ✅ DNS resolution
- ✅ Connection timeouts

**What it determines:**
- `200 OK` → Indexed
- `404/403` → Not Indexed
- `DNS Error` → Invalid URL
- `Timeout` → Not Indexed

---

## ⚙️ Configuration

### Port Configuration
Default: `5000`

Change in `server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

### CORS Configuration
Default: Allows all origins

Restrict in `server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com']
}));
```

### Environment Variables
Create `.env` file:
```env
PORT=5000
NODE_ENV=production
```

---

## 🧪 Testing

### Manual Testing
```bash
# Start server
npm start

# Test health endpoint
curl http://localhost:5000/health

# Get all URLs
curl http://localhost:5000/api/urls

# Trigger check
curl -X POST http://localhost:5000/api/urls/check

# Get statistics
curl http://localhost:5000/api/urls/status
```

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Module not found
```bash
npm install
```

### CSV not updating
- Close Excel if file is open
- Check `data/` folder exists
- Verify file permissions

### Scheduler not running
- Check console for error messages
- Verify cron expression
- Ensure server runs continuously

---

## 🚀 Development

### Run with auto-restart
```bash
npm run dev
```

### Project Scripts
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 📦 Sample Data

The backend includes 30 pre-configured URLs:
- 10 popular websites (likely indexed)
- 10 obscure pages (likely not indexed)
- 10 invalid URLs (malformed/fake)

Generated automatically on first run.

---

## 🔐 Security Notes

- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Error handling prevents crashes
- No sensitive data stored

**For Production:**
- Add authentication (JWT)
- Rate limiting
- Environment variables
- Database migration
- HTTPS enforcement

---

## 📄 Architecture

### MVC Pattern
- **Models** - Data operations (CSV)
- **Views** - JSON responses
- **Controllers** - Request handlers
- **Services** - Business logic
- **Routes** - Endpoint definitions
- **Middleware** - Error handling
- **Config** - Scheduler setup

---

## 🤝 Integration

### Frontend Integration

**CORS Setup:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

**API Base URL:**
```
http://localhost:5000/api
```

---

## 📊 Performance

- Handles 30+ URLs efficiently
- 500ms delay between checks
- 10s timeout per URL
- Async/await for non-blocking operations

---

## 🔄 Deployment

### Heroku
```bash
heroku create
git push heroku main
```

### Render
1. Connect GitHub repo
2. Build: `npm install`
3. Start: `npm start`

### Railway
```bash
railway init
railway up
```

---

## 📞 Support

- Check console logs for errors
- Verify all files exist
- Ensure dependencies installed
- Test endpoints with curl/Postman

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [node-cron Guide](https://github.com/node-cron/node-cron)
- [CSV Parser Docs](https://csv.js.org/)
- [Cron Expression Tester](https://crontab.guru/)

---

**Version**: 1.0.0  
**License**: MIT  
**Node Version**: >=16.0.0
