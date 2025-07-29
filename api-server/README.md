# TVET Connect Kenya API Documentation

## Overview

The TVET Connect Kenya API provides secure access to student data, grades, semester reports, and exam cards for external applications. This API is designed to enable integration between the main TVET Connect system and external websites or applications.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All API endpoints (except health check and auth endpoints) require an API key for authentication.

### API Key Authentication

Include your API key in the request headers:

```http
x-api-key: your-api-key-here
```

Or as a Bearer token:

```http
Authorization: Bearer your-api-key-here
```

### Getting an API Key

API keys must be created by system administrators through the admin interface. Contact your system administrator to obtain an API key with appropriate permissions.

## API Key Permissions

API keys can have the following permissions:

- `students:read` - Read student information
- `students:write` - Update student information
- `grades:read` - Read grades and transcripts
- `grades:write` - Submit/update grades
- `semester:read` - Read semester reports
- `semester:write` - Create semester reports
- `units:read` - Read unit information
- `units:write` - Register units
- `examcards:read` - Generate exam cards

## Endpoints

### Health Check

#### GET /health
Check API server status (no authentication required).

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "TVET Connect Kenya API"
}
```

### Authentication

#### POST /api/auth/verify
Verify user login credentials.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login verified successfully",
  "user": {
    "id": "user-id",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "admissionNumber": "COMP/001/2024"
  },
  "token": "jwt-token-here"
}
```

#### GET /api/auth/profile/:identifier
Get user profile by ID or admission number.

### Students

#### GET /api/students
Get all students with optional filters.

**Query Parameters:**
- `department` (optional): Filter by department
- `course` (optional): Filter by course
- `year` (optional): Filter by year
- `semester` (optional): Filter by semester
- `status` (optional): Filter by status (active, inactive, suspended)

**Response:**
```json
{
  "students": [
    {
      "id": "student-id",
      "firstName": "John",
      "lastName": "Doe",
      "admissionNumber": "COMP/001/2024",
      "course": "Computer Science",
      "department": "ICT",
      "year": 2,
      "semester": 1
    }
  ],
  "count": 1,
  "filters": {}
}
```

#### GET /api/students/:identifier
Get specific student by ID or admission number.

#### GET /api/students/:identifier/units
Get units enrolled by a student.

#### PATCH /api/students/:identifier
Update student information (requires `students:write` permission).

### Grades

#### GET /api/grades/student/:studentId
Get grades for a specific student.

**Query Parameters:**
- `semester` (optional): Filter by semester
- `year` (optional): Filter by year
- `academicYear` (optional): Filter by academic year

#### GET /api/grades/unit/:unitId
Get all grades for a specific unit.

#### POST /api/grades
Submit or update grades (requires `grades:write` permission).

**Request Body:**
```json
{
  "studentId": "student-id",
  "unitId": "unit-id",
  "semester": 1,
  "year": 2,
  "academicYear": "2024/2025",
  "marks": {
    "cat1": 15,
    "cat2": 18,
    "assignment": 20,
    "exam": 65
  },
  "grade": "B+",
  "status": "pass"
}
```

#### GET /api/grades/transcript/:studentId
Get complete transcript for a student.

### Semester Reports

#### POST /api/semester/report
Report a new semester for a student (requires `semester:write` permission).

**Request Body:**
```json
{
  "studentId": "student-id",
  "semester": 1,
  "year": 2,
  "academicYear": "2024/2025",
  "course": "Computer Science"
}
```

#### GET /api/semester/reports/:studentId
Get all semester reports for a student.

#### GET /api/semester/current/:studentId
Get current active semester for a student.

#### POST /api/semester/register-units
Register units for a semester (requires `units:write` permission).

### Exam Cards

#### GET /api/exam-cards/:studentId
Generate exam card for a student.

**Query Parameters (required):**
- `semester`: Semester number (1-3)
- `year`: Year number (1-6)
- `academicYear`: Academic year (e.g., "2024/2025")

**Response:**
```json
{
  "examCard": {
    "studentInfo": {
      "admissionNumber": "COMP/001/2024",
      "firstName": "John",
      "lastName": "Doe",
      "course": "Computer Science"
    },
    "semesterInfo": {
      "semester": 1,
      "year": 2,
      "academicYear": "2024/2025"
    },
    "examUnits": [
      {
        "unitCode": "CS201",
        "unitName": "Data Structures",
        "examDate": "2024-12-15",
        "examTime": "09:00",
        "venue": "Lab 1",
        "duration": "3 hours"
      }
    ],
    "eligibility": {
      "feesCleared": true,
      "unitsRegistered": true,
      "eligible": true
    }
  }
}
```

#### GET /api/exam-cards/eligibility/:studentId
Check exam eligibility for a student.

#### GET /api/exam-cards/schedules
Get exam schedules with optional filters.

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Client Library

Use the provided JavaScript client library for easy integration:

```javascript
const client = new TVETApiClient('http://localhost:3001', 'your-api-key');

// Verify login
const login = await client.verifyLogin('student@example.com', 'password');

// Get student grades
const grades = await client.getStudentGrades('student-id', { semester: 1 });

// Generate exam card
const examCard = await client.getExamCard('student-id', 1, 2, '2024/2025');
```

## Security Considerations

1. **API Key Security**: Store API keys securely and never expose them in client-side code
2. **HTTPS**: Use HTTPS in production environments
3. **Rate Limiting**: Respect rate limits to avoid service disruption
4. **Data Validation**: Always validate data before sending requests
5. **Error Handling**: Implement proper error handling for all API calls

## Support

For API support, issues, or feature requests, contact the system administrator.
