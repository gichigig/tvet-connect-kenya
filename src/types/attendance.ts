// For compatibility with components expecting StudentData
export interface StudentData {
  id: string;
  name?: string;
  email?: string;
  studentId?: string;
  course?: string;
  year?: number;
  profileImage?: string;
}
export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  course: string;
  year: number;
  profileImage?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  subjects: string[];
  profileImage?: string;
}

export interface AttendanceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  locationId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  status: 'present' | 'late' | 'absent';
  distance: number; // distance from allowed location in meters
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AttendanceStats {
  totalClasses: number;
  attended: number;
  late: number;
  absent: number;
  attendancePercentage: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'teacher';
  student?: Student;
  teacher?: Teacher;
}