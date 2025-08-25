# Grade Vault TVET Frontend Integration Guide

## 🚨 Problem Resolution

The errors you're seeing indicate authentication and API endpoint issues. Here's how to fix them:

### Error 1: "Failed to fetch user profile"
**Root Cause**: Wrong endpoint or missing JWT token

**Solution**: 
1. **Login First**: Call `/api/auth/student-login` to get JWT token
2. **Use Correct Endpoint**: Call `/api/me/profile` (not whatever endpoint was being used)
3. **Include JWT Token**: Add `Authorization: Bearer <token>` header

### Error 2: "Invalid API key"
**Root Cause**: Either wrong endpoint or missing authentication

**Solution**:
1. **For Student Data**: Use JWT authentication instead of API key
2. **Use Student Endpoints**: Call `/api/me/grades` with JWT token
3. **Remove API Key Requirement**: Student endpoints use JWT, not API keys

## 🔧 Frontend Code Examples

### 1. Login and Store Token
```javascript
// Login first
const loginResponse = await fetch('http://localhost:3001/api/auth/student-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'development-key-2024' // Only needed for login
  },
  body: JSON.stringify({
    email: 'read.student@tvet.ac.ke',
    password: 'student123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Store token in localStorage or state management
localStorage.setItem('authToken', token);
```

### 2. Fetch Student Profile
```javascript
// Get stored token
const token = localStorage.getItem('authToken');

// Fetch profile with JWT authentication
const profileResponse = await fetch('http://localhost:3001/api/me/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

if (profileResponse.ok) {
  const profileData = await profileResponse.json();
  const student = profileData.student;
  // Use student data...
} else {
  // Handle error - maybe token expired, redirect to login
}
```

### 3. Fetch Student Grades
```javascript
// Get stored token
const token = localStorage.getItem('authToken');

// Fetch grades with JWT authentication
const gradesResponse = await fetch('http://localhost:3001/api/me/grades', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

if (gradesResponse.ok) {
  const gradesData = await gradesResponse.json();
  const grades = gradesData.grades;
  // Use grades data...
} else {
  // Handle error
}
```

### 4. Combined Profile + Grades
```javascript
// Get both profile and grades in one call
const detailsResponse = await fetch('http://localhost:3001/api/me/details', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

if (detailsResponse.ok) {
  const data = await detailsResponse.json();
  const profile = data.profile;
  const grades = data.grades;
  // Use both...
}
```

## 📋 API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/student-login` | POST | API Key | Login and get JWT token |
| `/api/me/profile` | GET | JWT Token | Get student profile |
| `/api/me/grades` | GET | JWT Token | Get student grades |
| `/api/me/details` | GET | JWT Token | Get profile + grades |

## 🔑 Authentication Flow

1. **Login**: POST to `/api/auth/student-login` with API key
2. **Store Token**: Save JWT token from login response
3. **API Calls**: Use `Authorization: Bearer <token>` for all subsequent calls
4. **Handle Expiry**: If 401 error, redirect to login

## 🌐 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Alternative Vite)
- `http://localhost:8080` (Your Grade Vault TVET)
- `http://127.0.0.1:8080` (Alternative localhost)

## 🧪 Test Credentials

Use these for testing:
- **Email**: `read.student@tvet.ac.ke`
- **Password**: `student123`
- **Course**: `read` (registrar-created)

## 🚨 Common Issues & Fixes

### Issue: CORS Errors
**Fix**: Make sure you're calling `http://localhost:3001` (not 3000)

### Issue: 401 Unauthorized
**Fix**: Check that JWT token is included in Authorization header

### Issue: 404 Not Found
**Fix**: Verify endpoint URLs match the table above

### Issue: Token Expired
**Fix**: Implement token refresh or redirect to login

## 🔍 Debugging

1. **Check Network Tab**: Verify requests are going to correct endpoints
2. **Check Headers**: Ensure Authorization header is present
3. **Check Response**: Look at actual error messages
4. **Test with curl**: 
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/student-login \
  -H "Content-Type: application/json" \
  -H "x-api-key: development-key-2024" \
  -d '{"email": "read.student@tvet.ac.ke", "password": "student123"}'

# Test profile (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/me/profile \
  -H "Authorization: Bearer TOKEN"
```

## ✅ Expected Results

After implementing these changes:
- ✅ Login should return JWT token
- ✅ Profile fetch should return student data
- ✅ Grades fetch should return grades array (may be empty)
- ✅ No more "Invalid API key" errors
- ✅ No more "Failed to fetch user profile" errors

---

**Last Updated**: August 3, 2025  
**API Server**: http://localhost:3001  
**Status**: Ready for testing
