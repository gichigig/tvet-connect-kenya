import { db } from './config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';
import { getNextAdmissionNumber } from './counters';
import { firebaseApp } from './config';

const USERS_COLLECTION = 'users';
const STUDENTS_COLLECTION = 'students';

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  course: string;
  department: string;
  level: 'certificate' | 'diploma' | 'degree';
  year: number;
  semester: number;
  academicYear: string;
  enrollmentType: 'fulltime' | 'parttime' | 'online';
  institutionBranch: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  nationalId?: string;
  password?: string; // Add password field
}

export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string; // Keep for backward compatibility
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  course: string;
  department: string;
  level: 'certificate' | 'diploma' | 'degree';
  year: number;
  semester: number;
  academicYear: string;
  admissionNumber: string;
  role: 'student';
  status: 'active' | 'inactive' | 'suspended';
  approved?: boolean; // Approval status for the student
  accountActive?: boolean; // Whether the account can login
  guardianName?: string;
  guardianPhone?: string;
  campusId?: string; // Primary campus assignment
  campusName?: string;
  registeredCampuses?: string[]; // Multiple campuses where student is registered
  address?: string;
  nationalId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createStudent(studentData: CreateStudentData): Promise<Student> {
  try {
    console.log('🚀 Creating student with data:', studentData);
    
    // Generate admission number
    const admissionNumber = await getNextAdmissionNumber(studentData.department);
    console.log('📝 Generated admission number:', admissionNumber);
    
    const newStudent: Omit<Student, 'id'> = {
      ...studentData,
      admissionNumber,
      role: 'student',
      status: 'active',
      approved: true, // Students created by registrar are automatically approved
      accountActive: true, // Account is immediately active for login
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      email: studentData.email, // Use the provided email
    };

    // Store student in Firestore students collection
    const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), newStudent);
    console.log('✅ Student added to Firestore with ID:', docRef.id);
    
    // Store credentials in Firebase Realtime Database for authentication
    if (studentData.password) {
      console.log('🔐 Setting up authentication for student...');
      const database = getDatabase(firebaseApp);
      
      // Store in the format expected by the authentication system
      const { createUserInRealtimeDB } = await import('./realtimeAuth');
      const realtimeUserId = await createUserInRealtimeDB({
        username: studentData.username,
        email: studentData.email, // Use the provided email
        password: studentData.password,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        role: 'student',
        admissionNumber,
        department: studentData.department,
        courseId: studentData.course,
        phone: studentData.phoneNumber,
        approved: true, // Students created by registrar are automatically approved
        accountActive: true, // Account is immediately active for login
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Additional student fields
        nationalId: studentData.nationalId,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        guardianName: studentData.guardianName,
        guardianPhone: studentData.guardianPhone,
        academicYear: studentData.academicYear,
      });
      console.log('✅ Student created in Realtime DB with ID:', realtimeUserId);
      
      // Also store credentials in the legacy format for backward compatibility
      const credentialsRef = ref(database, `studentCredentials/${admissionNumber}`);
      await set(credentialsRef, {
        username: studentData.username,
        email: studentData.email, // Use the provided email
        password: studentData.password, // Store plain text for now (API server will handle both)
        admissionNumber,
        studentId: docRef.id,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ Student credentials stored for admission:', admissionNumber);
    }
    
    return {
      ...newStudent,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating student:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create student. Reason: ${errorMessage}`);
  }
}

export async function getStudentsByDepartment(department: string): Promise<Student[]> {
  try {
    const q = query(
      collection(db, STUDENTS_COLLECTION),
      where('department', '==', department)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Student[];
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }
}

export async function getAllStudents(): Promise<Student[]> {
  try {
    const querySnapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Student[];
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw new Error('Failed to fetch students');
  }
}

export async function updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await updateDoc(studentRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating student:', error);
    throw new Error('Failed to update student');
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentRef);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student');
  }
}

// General user update function for any user type
export async function updateUser(userId: string, updates: Partial<any>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

// Create user account (for student creation)
export async function createUserAccount(userData: any): Promise<any> {
  try {
    if (userData.role === 'student') {
      return await createStudent(userData);
    }
    
    // For other user types, use general creation
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);
    
    return {
      ...newUser,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error creating user account:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create user account. Reason: ${errorMessage}`);
  }
}
