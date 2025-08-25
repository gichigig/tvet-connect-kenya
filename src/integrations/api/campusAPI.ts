import { Campus, CreateCampusData, CampusUnitRegistration } from '@/types/campus';

// Mock data for development - replace with actual API calls
const mockCampuses: Campus[] = [];

export const CampusAPI = {
  // Get all campuses for a lecturer
  async getCampusesByLecturer(lecturerId: string): Promise<Campus[]> {
    // Mock implementation - replace with actual API call
    return mockCampuses.filter(campus => campus.createdBy === lecturerId);
  },

  // Get all campuses (for students to see available campuses)
  async getAllCampuses(): Promise<Campus[]> {
    // Mock implementation - replace with actual API call
    return mockCampuses.filter(campus => campus.status === 'active');
  },

  // Create a new campus
  async createCampus(lecturerId: string, campusData: CreateCampusData): Promise<Campus> {
    const newCampus: Campus = {
      id: `campus-${Date.now()}`,
      ...campusData,
      currentEnrollment: 0,
      status: 'active',
      createdBy: lecturerId,
      createdDate: new Date().toISOString(),
    };

    mockCampuses.push(newCampus);
    
    // In real implementation, make API call to backend
    console.log('Creating campus:', newCampus);
    
    return newCampus;
  },

  // Update campus
  async updateCampus(campusId: string, updates: Partial<Campus>): Promise<Campus> {
    const campusIndex = mockCampuses.findIndex(campus => campus.id === campusId);
    if (campusIndex === -1) {
      throw new Error('Campus not found');
    }

    mockCampuses[campusIndex] = { ...mockCampuses[campusIndex], ...updates };
    
    // In real implementation, make API call to backend
    console.log('Updating campus:', mockCampuses[campusIndex]);
    
    return mockCampuses[campusIndex];
  },

  // Delete campus
  async deleteCampus(campusId: string): Promise<void> {
    const campusIndex = mockCampuses.findIndex(campus => campus.id === campusId);
    if (campusIndex === -1) {
      throw new Error('Campus not found');
    }

    mockCampuses.splice(campusIndex, 1);
    
    // In real implementation, make API call to backend
    console.log('Deleted campus:', campusId);
  },

  // Get campus by ID
  async getCampusById(campusId: string): Promise<Campus | null> {
    const campus = mockCampuses.find(campus => campus.id === campusId);
    return campus || null;
  },

  // Register student for unit at specific campus
  async registerStudentForCampusUnit(
    studentId: string, 
    unitId: string, 
    campusId: string
  ): Promise<CampusUnitRegistration> {
    const registration: CampusUnitRegistration = {
      id: `reg-${Date.now()}`,
      studentId,
      unitId,
      campusId,
      registrationDate: new Date().toISOString(),
      status: 'pending',
      semester: new Date().getMonth() < 6 ? 1 : 2, // Simple semester logic
      year: new Date().getFullYear(),
      academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    };

    // In real implementation, save to backend
    console.log('Campus unit registration:', registration);
    
    return registration;
  },

  // Get student's campus registrations
  async getStudentCampusRegistrations(studentId: string): Promise<CampusUnitRegistration[]> {
    // Mock implementation - replace with actual API call
    // In real implementation, fetch from backend
    return [];
  },

  // Get campus registrations for approval (HOD/Lecturer view)
  async getCampusRegistrationsForApproval(campusId: string): Promise<CampusUnitRegistration[]> {
    // Mock implementation - replace with actual API call
    return [];
  },

  // Approve/reject campus unit registration
  async updateRegistrationStatus(
    registrationId: string, 
    status: 'approved' | 'rejected',
    approvedBy: string
  ): Promise<CampusUnitRegistration> {
    // Mock implementation - replace with actual API call
    const registration: CampusUnitRegistration = {
      id: registrationId,
      studentId: '',
      unitId: '',
      campusId: '',
      registrationDate: new Date().toISOString(),
      status,
      approvedBy,
      approvalDate: new Date().toISOString(),
      semester: 1,
      year: new Date().getFullYear(),
      academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    };

    console.log('Updated registration status:', registration);
    return registration;
  }
};
