/**
 * TVET Connect Kenya API Client Library
 * 
 * This library provides easy access to the TVET Connect Kenya API
 * for external applications that need to access student data, grades,
 * semester reports, and exam cards.
 */

class TVETApiClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    };
  }

  /**
   * Make HTTP request to API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication Methods
  async verifyLogin(email, password) {
    return this.request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getUserProfile(identifier) {
    return this.request(`/api/auth/profile/${identifier}`);
  }

  async validateToken(token) {
    return this.request('/api/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  // Student Methods
  async getStudents(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/students?${params}`);
  }

  async getStudent(identifier) {
    return this.request(`/api/students/${identifier}`);
  }

  async getStudentUnits(identifier) {
    return this.request(`/api/students/${identifier}/units`);
  }

  async getStudentSemesterReports(identifier) {
    return this.request(`/api/students/${identifier}/semester-reports`);
  }

  async updateStudent(identifier, updates) {
    return this.request(`/api/students/${identifier}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Grades Methods
  async getStudentGrades(studentId, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/grades/student/${studentId}?${params}`);
  }

  async getUnitGrades(unitId, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/grades/unit/${unitId}?${params}`);
  }

  async submitGrade(gradeData) {
    return this.request('/api/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  async getStudentTranscript(studentId) {
    return this.request(`/api/grades/transcript/${studentId}`);
  }

  // Semester Methods
  async reportSemester(semesterData) {
    return this.request('/api/semester/report', {
      method: 'POST',
      body: JSON.stringify(semesterData)
    });
  }

  async getStudentSemesterReports(studentId) {
    return this.request(`/api/semester/reports/${studentId}`);
  }

  async getCurrentSemester(studentId) {
    return this.request(`/api/semester/current/${studentId}`);
  }

  async registerUnits(registrationData) {
    return this.request('/api/semester/register-units', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });
  }

  async getUnitRegistrations(studentId, academicYear, year, semester) {
    return this.request(`/api/semester/registrations/${studentId}/${academicYear}/${year}/${semester}`);
  }

  // Exam Cards Methods
  async getExamCard(studentId, semester, year, academicYear) {
    const params = new URLSearchParams({ semester, year, academicYear });
    return this.request(`/api/exam-cards/${studentId}?${params}`);
  }

  async checkExamEligibility(studentId, semester, year, academicYear) {
    const params = new URLSearchParams({ semester, year, academicYear });
    return this.request(`/api/exam-cards/eligibility/${studentId}?${params}`);
  }

  async getExamSchedules(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/exam-cards/schedules?${params}`);
  }

  // Utility Methods
  async healthCheck() {
    return this.request('/health');
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TVETApiClient;
}

if (typeof window !== 'undefined') {
  window.TVETApiClient = TVETApiClient;
}

// Usage Examples:

/*
// Initialize client
const client = new TVETApiClient('http://localhost:3001', 'your-api-key-here');

// Verify student login
const loginResult = await client.verifyLogin('student@example.com', 'password');
console.log('Login successful:', loginResult.user);

// Get student information
const student = await client.getStudent('COMP/001/2024');
console.log('Student info:', student);

// Get student grades
const grades = await client.getStudentGrades('student-id', { 
  semester: 1, 
  academicYear: '2024/2025' 
});

// Generate exam card
const examCard = await client.getExamCard('student-id', 1, 2, '2024/2025');
console.log('Exam card:', examCard);

// Submit grades (requires write permissions)
const gradeSubmission = await client.submitGrade({
  studentId: 'student-id',
  unitId: 'unit-id',
  semester: 1,
  year: 2,
  academicYear: '2024/2025',
  marks: {
    cat1: 15,
    cat2: 18,
    assignment: 20,
    exam: 65
  },
  grade: 'B+',
  status: 'pass'
});
*/
