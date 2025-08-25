import { User, AttendanceRecord, AttendanceLocation, Student, Teacher } from '@/types/attendance';

// In-memory data storage (no localStorage usage)
export class StorageService {
  private static currentUser: User | null = null;
  private static attendanceRecords: AttendanceRecord[] = [];
  private static locations: AttendanceLocation[] = [];
  private static students: Student[] = [];

  // User management
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  static logout(): void {
    this.currentUser = null;
  }

  // Attendance records
  static getAttendanceRecords(): AttendanceRecord[] {
    return this.attendanceRecords.map(r => ({
      ...r,
      timestamp: new Date(r.timestamp)
    }));
  }

  static addAttendanceRecord(record: AttendanceRecord): void {
    this.attendanceRecords.push(record);
  }

  static getStudentAttendanceRecords(studentId: string): AttendanceRecord[] {
    return this.getAttendanceRecords().filter(r => r.studentId === studentId);
  }

  // Locations
  static getLocations(): AttendanceLocation[] {
    if (this.locations.length === 0) {
      // Initialize with empty array - lecturers can create their own
      this.locations = [];
    }
    return this.locations;
  }

  static saveLocations(locations: AttendanceLocation[]): void {
    this.locations = locations;
  }

  static addLocation(location: AttendanceLocation): void {
    this.locations.push(location);
  }

  static updateLocation(locationId: string, updates: Partial<AttendanceLocation>): void {
    const index = this.locations.findIndex(l => l.id === locationId);
    if (index !== -1) {
      this.locations[index] = { ...this.locations[index], ...updates };
    }
  }

  static deleteLocation(locationId: string): void {
    this.locations = this.locations.filter(l => l.id !== locationId);
  }

  // Students
  static getStudents(): Student[] {
    if (this.students.length === 0) {
      // Initialize with default students
      this.students = this.getDefaultStudents();
    }
    return this.students;
  }

  static saveStudents(students: Student[]): void {
    this.students = students;
  }

  // Default mock data
  private static getDefaultStudents(): Student[] {
    return [
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