import { realtimeDb } from './config';
import { ref, push, set, get, child, update } from 'firebase/database';

export interface UserCredentials {
  id?: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  admissionNumber?: string;
  department?: string;
  courseId?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional student fields
  phone?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  county?: string;
  subcounty?: string;
  ward?: string;
  postalAddress?: string;
  postalCode?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  guardianAddress?: string;
  academicYear?: string;
  semester?: string;
  previousEducation?: string;
  previousGrade?: string;
}

export const createUserInRealtimeDB = async (userData: UserCredentials): Promise<string> => {
  try {
    console.log('Creating user in Realtime DB:', userData);
    
    // Create user reference
    const usersRef = ref(realtimeDb, 'users');
    const newUserRef = push(usersRef);
    
    // Add the generated ID to the user data
    const userWithId = {
      ...userData,
      id: newUserRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to realtime database
    await set(newUserRef, userWithId);
    console.log('User saved to Realtime DB with ID:', newUserRef.key);
    
    // Also create an index by email for quick lookup
    if (userData.email) {
      const emailKey = userData.email.replace(/[.#$[\]]/g, '_');
      const emailIndexRef = ref(realtimeDb, `usersByEmail/${emailKey}`);
      await set(emailIndexRef, newUserRef.key);
      console.log('Email index created:', emailKey);
    }
    
    // Create index by admission number for students
    if (userData.role === 'student' && userData.admissionNumber) {
      const admissionRef = ref(realtimeDb, `usersByAdmission/${userData.admissionNumber}`);
      await set(admissionRef, newUserRef.key);
      console.log('Admission number index created:', userData.admissionNumber);
    }
    
    return newUserRef.key!;
  } catch (error) {
    console.error('Error creating user in realtime database:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<UserCredentials | null> => {
  try {
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    const emailIndexRef = ref(realtimeDb, `usersByEmail/${emailKey}`);
    const emailSnapshot = await get(emailIndexRef);
    
    if (!emailSnapshot.exists()) {
      return null;
    }
    
    const userId = emailSnapshot.val();
    const userRef = ref(realtimeDb, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      return null;
    }
    
    return userSnapshot.val() as UserCredentials;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const getUserByAdmissionNumber = async (admissionNumber: string): Promise<UserCredentials | null> => {
  try {
    const admissionRef = ref(realtimeDb, `usersByAdmission/${admissionNumber}`);
    const admissionSnapshot = await get(admissionRef);
    
    if (!admissionSnapshot.exists()) {
      return null;
    }
    
    const userId = admissionSnapshot.val();
    const userRef = ref(realtimeDb, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      return null;
    }
    
    return userSnapshot.val() as UserCredentials;
  } catch (error) {
    console.error('Error getting user by admission number:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserCredentials[]> => {
  try {
    const usersRef = ref(realtimeDb, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const usersData = snapshot.val();
    return Object.values(usersData) as UserCredentials[];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUser = async (userId: string, updates: Partial<UserCredentials>): Promise<void> => {
  try {
    const userRef = ref(realtimeDb, `users/${userId}`);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await update(userRef, updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const authenticateUser = async (email: string, password: string): Promise<UserCredentials | null> => {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    // Simple password check (in production, you should use proper hashing)
    if (user.password === password) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};
