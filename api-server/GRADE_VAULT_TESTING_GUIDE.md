# Grade Vault TVET Testing Guide

## 🎯 Test Objective
Verify that students created with registrar courses can successfully log into the Grade Vault TVET system.

## 🔧 Prerequisites
1. ✅ API Server running on port 3001
2. ✅ Students created with registrar courses
3. ✅ Database properly configured
4. ✅ Frontend available at http://localhost:5174

## 👥 Test Student Accounts

### 1. Read Course Student
- **Email**: `read.student@tvet.ac.ke`
- **Password**: `student123`
- **Course**: `read` (Registrar-created course)
- **Status**: ✅ Ready for testing

### 2. Computer Science Student
- **Email**: `john.doe@tvet.ac.ke`
- **Password**: `student123`
- **Course**: `Computer Science`
- **Status**: ✅ Ready for testing

### 3. Information Technology Student
- **Email**: `jane.smith@tvet.ac.ke`
- **Password**: `student123`
- **Course**: `Information Technology`
- **Status**: ✅ Ready for testing

## 🧪 Testing Steps

### Step 1: API Server Verification
```bash
# Check server health
curl http://localhost:3001/health

# Test login endpoint
curl -X POST http://localhost:3001/api/auth/student-login \
  -H "Content-Type: application/json" \
  -H "x-api-key: development-key-2024" \
  -d '{"email": "read.student@tvet.ac.ke", "password": "student123"}'
```

### Step 2: Frontend Testing
1. Open browser and navigate to: `http://localhost:5174`
2. Find the Grade Vault TVET login page
3. Test each student account:
   - Enter email and password
   - Click login
   - Verify successful authentication
   - Check dashboard access
   - Verify course information displays correctly

### Step 3: Automated Testing
```bash
# Run comprehensive login tests
node test-grade-vault-login.js

# Run database-level tests
node test-student-login.js

# Run API endpoint tests
node test-api-login.js
```

## ✅ Expected Results

### Successful Login Should Show:
- ✅ Login successful message
- ✅ Student dashboard loaded
- ✅ Correct student name displayed
- ✅ Correct course information
- ✅ Navigation menu accessible
- ✅ JWT token stored (check browser dev tools)

### Database Verification:
- ✅ Student stored in `/students` collection
- ✅ Student indexed in `/studentsByEmail`
- ✅ Credentials stored in `/studentCredentials`
- ✅ Course matches registrar-created course

## 🚨 Troubleshooting

### If Login Fails:
1. **Check API Server**: Ensure `node server.js` is running
2. **Verify Database**: Run `node test-student-login.js`
3. **Check Student Creation**: Run `node create-test-student.js`
4. **Verify Courses**: Check Firestore for registrar courses

### Common Issues:
- **CORS Error**: Check API server CORS configuration
- **Token Error**: Verify JWT_SECRET in environment
- **Database Error**: Check Firebase configuration
- **Course Not Found**: Verify registrar created courses exist

## 📊 Test Results Status

### API Tests:
- [ ] Server health check
- [ ] /auth/verify endpoint
- [ ] /auth/student-login endpoint
- [ ] JWT token generation
- [ ] CORS headers

### Database Tests:
- [ ] Student authentication
- [ ] Password verification
- [ ] Course assignment
- [ ] Data retrieval

### Frontend Tests:
- [ ] Login form submission
- [ ] Authentication response
- [ ] Dashboard loading
- [ ] User session management
- [ ] Navigation functionality

## 🎉 Success Criteria

The Grade Vault TVET system is working correctly when:
1. ✅ All three test students can log in successfully
2. ✅ JWT tokens are generated and valid
3. ✅ Course information displays correctly
4. ✅ Dashboard loads without errors
5. ✅ Students are stored in correct database collections

## 🔗 Next Steps

After successful testing:
1. Create additional test students with other registrar courses
2. Test grade management functionality
3. Test exam card generation
4. Verify semester management
5. Test profile updates and notifications

---

**Last Updated**: August 3, 2025
**Test Environment**: Development
**API Endpoint**: http://localhost:3001/api
**Frontend URL**: http://localhost:5174
