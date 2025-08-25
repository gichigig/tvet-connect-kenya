# CORS and API Connection Issues - Solution Guide

## 🚨 **Current Problems**
1. **CORS Error**: `Access to fetch at 'http://localhost:3001/api/auth/verify' from origin 'http://localhost:8081' has been blocked by CORS policy`
2. **Endpoint Errors**: "Endpoint not found" and "Invalid API key" errors
3. **Connection Issues**: Grade Vault cannot connect to API server

## ✅ **Solutions Applied**

### 1. **Fixed Environment Variables**
- **Problem**: Duplicate `VITE_API_KEY` in `.env` file
- **Solution**: Renamed Firebase API key to `VITE_FIREBASE_API_KEY`
- **File**: `grade-vault-tvet/.env`

### 2. **Enhanced CORS Configuration**
- **Problem**: CORS preflight requests not handled properly
- **Solution**: Added explicit CORS headers and preflight handling
- **File**: `api-server/server.js`
- **Changes**:
  ```javascript
  // Explicit preflight handling
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '3600');
    res.status(200).send();
  });
  ```

### 3. **Added Debug Logging**
- **Enhanced API Request Logging**: Added console logs to track API requests
- **Login Form Debugging**: Added detailed logging for login attempts
- **Files**: `grade-vault-tvet/src/utils/api.ts`, `grade-vault-tvet/src/components/LoginForm.tsx`

### 4. **Created Helper Scripts**
- **API Server Startup**: `start-api-server.bat`
- **Connection Test**: `test-api-connection.js`

## 🛠️ **How to Fix**

### **Step 1: Start the API Server**
```bash
# Option 1: Use the batch file
double-click "start-api-server.bat"

# Option 2: Manual start
cd C:\Users\billy\shiuy\tvet-connect-kenya\api-server
node server.js
```

### **Step 2: Verify API Server is Running**
- Check console output for: `🚀 TVET Connect Kenya API Server running on port 3001`
- Test health endpoint: `http://localhost:3001/health`

### **Step 3: Start Grade Vault**
```bash
cd C:\Users\billy\shiuy\tvet-connect-kenya\grade-vault-tvet
npm run dev
```

### **Step 4: Check Browser Console**
- Open Developer Tools (F12)
- Look for detailed API request logs
- Verify environment variables are loaded correctly

## 🔍 **Troubleshooting Steps**

### **If CORS Issues Persist:**
1. Clear browser cache completely
2. Try incognito/private mode
3. Check that API server shows CORS preflight logs
4. Verify Grade Vault is running on expected port (8080/8081)

### **If API Key Issues:**
1. Check `.env` file has correct `VITE_API_KEY=tvet_1fd0f562039f427aac9bf7bdf515b804`
2. Restart Grade Vault after changing `.env`
3. Verify API key in browser console logs

### **If Endpoints Not Found:**
1. Verify API server is running on port 3001
2. Check API server logs for incoming requests
3. Test individual endpoints with the test script

## 📋 **Expected API Endpoints**
- `POST /api/auth/verify` - Student login
- `GET /api/me/profile` - Student profile
- `GET /api/me/grades` - Student grades
- `GET /api/me/available-units` - Available units
- `GET /api/me/registered-units` - Registered units
- `POST /api/me/register-semester-units` - Register for semester

## 🎯 **Test Login Credentials**
Try using existing student credentials from your database or create test credentials.

## 📞 **Next Steps**
1. Start both servers
2. Check browser console for detailed logs
3. Test login with valid student credentials
4. Verify API endpoints are responding correctly

The enhanced logging will show exactly where the connection is failing, making it easier to diagnose and fix any remaining issues.
