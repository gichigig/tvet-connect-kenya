import { User, AttendanceRecord, AttendanceLocation, Student, Teacher } from '@/types/attendance';

// Mock data storage using localStorage for demo purposes
export class StorageService {
  private static readonly KEYS = {
    CURRENT_USER: 'attendance_current_user',
    ATTENDANCE_RECORDS: 'attendance_records',
    LOCATIONS: 'attendance_locations',
    STUDENTS: 'attendance_students',
  };

  // User management
  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static logout(): void {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
  }

  // Attendance records
  static getAttendanceRecords(): AttendanceRecord[] {
    const records = localStorage.getItem(this.KEYS.ATTENDANCE_RECORDS);
    return records ? JSON.parse(records).map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp)
    })) : [];
  }

  static addAttendanceRecord(record: AttendanceRecord): void {
    const records = this.getAttendanceRecords();
    records.push(record);
    localStorage.setItem(this.KEYS.ATTENDANCE_RECORDS, JSON.stringify(records));
  }

  static getStudentAttendanceRecords(studentId: string): AttendanceRecord[] {
    return this.getAttendanceRecords().filter(r => r.studentId === studentId);
  }

  // Locations
  static getLocations(): AttendanceLocation[] {
    const locations = localStorage.getItem(this.KEYS.LOCATIONS);
    return locations ? JSON.parse(locations) : this.getDefaultLocations();
  }

  static saveLocations(locations: AttendanceLocation[]): void {
    localStorage.setItem(this.KEYS.LOCATIONS, JSON.stringify(locations));
  }

  static addLocation(location: AttendanceLocation): void {
    const locations = this.getLocations();
    locations.push(location);
    this.saveLocations(locations);
  }

  static updateLocation(locationId: string, updates: Partial<AttendanceLocation>): void {
    const locations = this.getLocations();
    const index = locations.findIndex(l => l.id === locationId);
    if (index !== -1) {
      locations[index] = { ...locations[index], ...updates };
      this.saveLocations(locations);
    }
  }

  static deleteLocation(locationId: string): void {
    const locations = this.getLocations().filter(l => l.id !== locationId);
    this.saveLocations(locations);
  }

  // Students
  static getStudents(): Student[] {
    const students = localStorage.getItem(this.KEYS.STUDENTS);
    return students ? JSON.parse(students) : this.getDefaultStudents();
  }

  static saveStudents(students: Student[]): void {
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
  }

  // Default mock data
  private static getDefaultLocations(): AttendanceLocation[] {
    // Don't create default locations - let lecturers create their own
    const locations: AttendanceLocation[] = [];
    this.saveLocations(locations);
    return locations;
  }

  private static getDefaultStudents(): Student[] {
    const students = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        studentId: 'STU001',
        course: 'Computer Science',
        year: 3
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        studentId: 'STU002',
        course: 'Engineering',
        year: 2
      }
    ];
    this.saveStudents(students);
    return students;
  }

  // Initialize demo user
  static initializeDemoUser(): void {
    if (!this.getCurrentUser()) {
      // Check URL for demo role
      const urlParams = new URLSearchParams(window.location.search);
      const demoRole = urlParams.get('role') || 'student';
      
      const demoUser: User = {
        id: '1',
        name: demoRole === 'teacher' ? 'Prof. Jane Smith' : 'John Doe',
        email: demoRole === 'teacher' ? 'jane.smith@university.edu' : 'john.doe@university.edu',
        role: demoRole as 'student' | 'teacher',
        student: demoRole === 'student' ? {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@university.edu',
          studentId: 'STU001',
          course: 'Computer Science',
          year: 3
        } : undefined,
        teacher: demoRole === 'teacher' ? {
          id: '2',
          name: 'Prof. Jane Smith',
          email: 'jane.smith@university.edu',
          employeeId: 'EMP002',
          department: 'Computer Science',
          subjects: ['Programming', 'Database Design', 'Software Engineering']
        } : undefined
      };
      this.setCurrentUser(demoUser);
    }
  }

  // Switch user role for demo purposes
  static switchRole(role: 'student' | 'teacher'): void {
    const demoUser: User = {
      id: role === 'teacher' ? '2' : '1',
      name: role === 'teacher' ? 'Prof. Jane Smith' : 'John Doe',
      email: role === 'teacher' ? 'jane.smith@university.edu' : 'john.doe@university.edu',
      role,
      student: role === 'student' ? {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        studentId: 'STU001',
        course: 'Computer Science',
        year: 3
      } : undefined,
      teacher: role === 'teacher' ? {
        id: '2',
        name: 'Prof. Jane Smith',
        email: 'jane.smith@university.edu',
        employeeId: 'EMP002',
        department: 'Computer Science',
        subjects: ['Programming', 'Database Design', 'Software Engineering']
      } : undefined
    };
    this.setCurrentUser(demoUser);
  }
}