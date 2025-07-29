# TVET Connect Kenya API Server Setup Guide

## Overview

This guide will help you set up the API server to enable external websites to access student data, grades, semester reports, and exam cards from your TVET Connect Kenya system.

## Prerequisites

- Node.js 18 or higher
- Access to your Firebase project
- Admin access to TVET Connect Kenya system

## Installation

### 1. Install Dependencies

```bash
cd api-server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-results-website.com

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# API Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
API_KEY_SECRET=your-api-key-encryption-secret-minimum-32-characters

# External Database (if using)
EXTERNAL_DB_URL=your-external-database-url
EXTERNAL_DB_API_KEY=your-external-db-api-key
```

### 3. Firebase Service Account Setup

1. Go to your Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file
5. Extract the following values for your `.env` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the newlines as \\n)

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## Creating API Keys

### 1. Add API Key Management to Admin Dashboard

Add the API Key Management component to your admin dashboard:

```tsx
import { ApiKeyManagement } from '@/components/admin/ApiKeyManagement';

// In your AdminDashboard component
<TabsContent value="api-keys">
  <ApiKeyManagement />
</TabsContent>
```

### 2. Create Your First API Key

1. Login as an admin to your TVET Connect system
2. Navigate to Admin Dashboard > API Keys
3. Click "Create API Key"
4. Fill in the details:
   - **Name**: "Results Website API"
   - **Description**: "API access for the external results website"
   - **Scope**: "Read & Write" (depending on your needs)
   - **Permissions**: Select the permissions your external website needs:
     - `students:read` - To access student information
     - `grades:read` - To view grades and transcripts
     - `grades:write` - To submit grades (if needed)
     - `semester:read` - To view semester reports
     - `semester:write` - To create semester reports
     - `examcards:read` - To generate exam cards
5. Click "Create API Key"
6. **IMPORTANT**: Copy the API key immediately and store it securely

## Integrating with Your External Website

### 1. Install the Client Library

Copy the client library to your external website:

```bash
# Copy the client library file
cp api-server/client/tvet-api-client.js /path/to/your/website/js/
```

### 2. Initialize the Client

```javascript
// Initialize the API client
const tvetApi = new TVETApiClient('http://localhost:3001', 'your-api-key-here');

// Test the connection
tvetApi.healthCheck()
  .then(result => console.log('API connected:', result))
  .catch(error => console.error('API connection failed:', error));
```

### 3. Common Use Cases

#### Student Login Verification
```javascript
async function verifyStudentLogin(email, password) {
  try {
    const result = await tvetApi.verifyLogin(email, password);
    console.log('Student logged in:', result.user);
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

#### Get Student Grades
```javascript
async function getStudentGrades(studentId, semester, year, academicYear) {
  try {
    const grades = await tvetApi.getStudentGrades(studentId, {
      semester,
      year,
      academicYear
    });
    return grades;
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    throw error;
  }
}
```

#### Generate Exam Card
```javascript
async function generateExamCard(studentId, semester, year, academicYear) {
  try {
    const examCard = await tvetApi.getExamCard(studentId, semester, year, academicYear);
    return examCard;
  } catch (error) {
    console.error('Failed to generate exam card:', error);
    throw error;
  }
}
```

#### Register New Semester
```javascript
async function registerSemester(studentId, semester, year, academicYear, course) {
  try {
    const result = await tvetApi.reportSemester({
      studentId,
      semester,
      year,
      academicYear,
      course
    });
    return result;
  } catch (error) {
    console.error('Failed to register semester:', error);
    throw error;
  }
}
```

## Security Best Practices

### 1. API Key Security
- Never expose API keys in client-side JavaScript
- Store API keys in environment variables on your server
- Use HTTPS in production
- Regularly rotate API keys
- Monitor API key usage

### 2. Server Security
- Use reverse proxy (nginx) in production
- Enable rate limiting
- Implement proper logging
- Regular security updates
- Monitor for suspicious activity

### 3. Data Protection
- Validate all input data
- Sanitize output data
- Implement proper error handling
- Log access attempts
- Regular backups

## Production Deployment

### 1. Using PM2 (Recommended)

Install PM2:
```bash
npm install -g pm2
```

Create ecosystem file (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'tvet-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t tvet-api .
docker run -d -p 3001:3001 --env-file .env tvet-api
```

### 3. Nginx Reverse Proxy

Create nginx configuration:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Maintenance

### 1. Health Checks
```bash
# Check if API is running
curl http://localhost:3001/health
```

### 2. Log Monitoring
```bash
# View logs with PM2
pm2 logs tvet-api

# View real-time logs
pm2 logs tvet-api --lines 100
```

### 3. Performance Monitoring
```bash
# Monitor PM2 processes
pm2 monit

# Check resource usage
pm2 list
```

## Troubleshooting

### Common Issues

1. **API Key Authentication Failed**
   - Check API key is correctly set
   - Verify API key has required permissions
   - Check API key is active and not expired

2. **Firebase Connection Issues**
   - Verify Firebase credentials in `.env`
   - Check Firebase project ID
   - Ensure service account has proper permissions

3. **CORS Issues**
   - Add your domain to `ALLOWED_ORIGINS`
   - Check request headers
   - Verify protocol (http/https)

4. **Rate Limiting**
   - Check if you're exceeding rate limits
   - Implement exponential backoff
   - Contact admin to increase limits

### Getting Help

1. Check the API documentation in `README.md`
2. Review server logs for error details
3. Test endpoints using curl or Postman
4. Contact system administrator for support

## API Endpoints Quick Reference

- **Health**: `GET /health`
- **Auth**: `POST /api/auth/verify`
- **Students**: `GET /api/students`
- **Grades**: `GET /api/grades/student/:id`
- **Transcripts**: `GET /api/grades/transcript/:id`
- **Semester**: `POST /api/semester/report`
- **Exam Cards**: `GET /api/exam-cards/:id`

For complete API documentation, see the main README.md file.
