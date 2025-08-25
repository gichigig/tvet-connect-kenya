export interface Campus {
  id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  address: string;
  phoneNumber: string;
  email: string;
  capacity: number;
  currentEnrollment: number;
  status: 'active' | 'inactive';
  createdBy: string; // Lecturer ID who created the campus
  createdDate: string;
  facilities: string[];
  departments: string[];
  courses: string[];
}

export interface CreateCampusData {
  name: string;
  code: string;
  description: string;
  location: string;
  address: string;
  phoneNumber: string;
  email: string;
  capacity: number;
  facilities: string[];
  departments: string[];
  courses: string[];
}

export interface CampusUnitRegistration {
  id: string;
  studentId: string;
  unitId: string;
  campusId: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
  semester: number;
  year: number;
  academicYear: string;
}

export interface StudentCampusInfo {
  campusId: string;
  campusName: string;
  campusCode: string;
  registrationDate: string;
  units: {
    unitId: string;
    unitCode: string;
    unitName: string;
    credits: number;
    status: 'registered' | 'approved' | 'completed';
  }[];
}
