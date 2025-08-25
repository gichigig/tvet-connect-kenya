import { realtimeDb } from './config';
import { ref, push, set, get, child, update } from 'firebase/database';

export interface UserCredentials {
  id?: string;
  email: string;
  username?: string; // New field for username-based login
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  admissionNumber?: string;
  department?: string;
  courseId?: string;
  approved: boolean;
  accountActive?: boolean;
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
    console.log('🔧 Creating user in Realtime DB:', {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      admissionNumber: userData.admissionNumber
    });
    
    // Determine the correct collection based on role
    const collectionName = userData.role === 'student' ? 'students' : 'users';
    const collectionRef = ref(realtimeDb, collectionName);
    const newUserRef = push(collectionRef);
    
    console.log('🆔 Generated user ID:', newUserRef.key);
    
    // Add the generated ID to the user data
    const userWithId = {
      ...userData,
      id: newUserRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to realtime database
    await set(newUserRef, userWithId);
    console.log(`✅ User saved to Realtime DB ${collectionName} with ID:`, newUserRef.key);
    
    // Create appropriate index based on role
    if (userData.email) {
      const emailKey = userData.email.replace(/[.#$[\]]/g, '_');
      console.log('📧 Creating email index:', {
        originalEmail: userData.email,
        emailKey: emailKey,
        userId: newUserRef.key,
        role: userData.role
      });
      
      if (userData.role === 'student') {
        // For students, create index in studentsByEmail
        const emailIndexRef = ref(realtimeDb, `studentsByEmail/${emailKey}`);
        await set(emailIndexRef, newUserRef.key);
        console.log('✅ Student email index created:', emailKey);
        
        // Verify the index was created
        const verifySnapshot = await get(emailIndexRef);
        if (verifySnapshot.exists()) {
          console.log('✅ Student email index verification successful:', verifySnapshot.val());
        } else {
          console.error('❌ Student email index not found after creation!');
        }
      } else {
        // For non-students, create index in usersByEmail
        const emailIndexRef = ref(realtimeDb, `usersByEmail/${emailKey}`);
        await set(emailIndexRef, newUserRef.key);
        console.log('✅ User email index created:', emailKey);
        
        // Verify the index was created
        const verifySnapshot = await get(emailIndexRef);
        if (verifySnapshot.exists()) {
          console.log('✅ User email index verification successful:', verifySnapshot.val());
        } else {
          console.error('❌ User email index not found after creation!');
        }
      }
    } else {
      console.error('❌ No email provided for user!');
    }
    
    // Create username index if username is provided
    if (userData.username) {
      const usernameKey = userData.username.replace(/[.#$[\]]/g, '_');
      console.log('👤 Creating username index:', {
        originalUsername: userData.username,
        usernameKey: usernameKey,
        userId: newUserRef.key,
        role: userData.role
      });
      
      if (userData.role === 'student') {
        // For students, create index in studentsByUsername
        const usernameIndexRef = ref(realtimeDb, `studentsByUsername/${usernameKey}`);
        await set(usernameIndexRef, newUserRef.key);
        console.log('✅ Student username index created:', usernameKey);
        
        // Verify the index was created
        const verifySnapshot = await get(usernameIndexRef);
        if (verifySnapshot.exists()) {
          console.log('✅ Student username index verification successful:', verifySnapshot.val());
        } else {
          console.error('❌ Student username index not found after creation!');
        }
      } else {
        // For non-students, create index in usersByUsername
        const usernameIndexRef = ref(realtimeDb, `usersByUsername/${usernameKey}`);
        await set(usernameIndexRef, newUserRef.key);
        console.log('✅ User username index created:', usernameKey);
        
        // Verify the index was created
        const verifySnapshot = await get(usernameIndexRef);
        if (verifySnapshot.exists()) {
          console.log('✅ User username index verification successful:', verifySnapshot.val());
        } else {
          console.error('❌ User username index not found after creation!');
        }
      }
    } else {
      console.log('ℹ️ No username provided for user');
    }
    
    // Create index by admission number for students
    if (userData.role === 'student' && userData.admissionNumber) {
      const admissionRef = ref(realtimeDb, `studentsByAdmission/${userData.admissionNumber}`);
      await set(admissionRef, newUserRef.key);
      console.log('✅ Student admission number index created:', userData.admissionNumber);
      
      // Verify the admission index was created
      const verifyAdmissionSnapshot = await get(admissionRef);
      if (verifyAdmissionSnapshot.exists()) {
        console.log('✅ Admission index verification successful:', verifyAdmissionSnapshot.val());
      } else {
        console.error('❌ Admission index not found after creation!');
      }
    }
    
    return newUserRef.key!;
  } catch (error) {
    console.error('❌ Error creating user in realtime database:', error);
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

export const getUserByUsername = async (username: string): Promise<UserCredentials | null> => {
  try {
    const usernameKey = username.replace(/[.#$[\]]/g, '_');
    const usernameIndexRef = ref(realtimeDb, `usersByUsername/${usernameKey}`);
    const usernameSnapshot = await get(usernameIndexRef);
    
    if (!usernameSnapshot.exists()) {
      return null;
    }
    
    const userId = usernameSnapshot.val();
    const userRef = ref(realtimeDb, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      return null;
    }
    
    return userSnapshot.val() as UserCredentials;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

export const getStudentByEmail = async (email: string): Promise<UserCredentials | null> => {
  try {
    console.log('🔍 Looking up student by email:', email);
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    console.log('🔧 Email key for lookup:', emailKey);
    
    const emailIndexRef = ref(realtimeDb, `studentsByEmail/${emailKey}`);
    const emailSnapshot = await get(emailIndexRef);
    
    if (!emailSnapshot.exists()) {
      console.log('❌ No email index found for:', emailKey);
      
      // Let's also check if there are any similar keys
      const allEmailsRef = ref(realtimeDb, 'studentsByEmail');
      const allEmailsSnapshot = await get(allEmailsRef);
      if (allEmailsSnapshot.exists()) {
        const allKeys = Object.keys(allEmailsSnapshot.val());
        console.log('📧 Available email keys in index (first 10):', allKeys.slice(0, 10));
        
        // Look for similar keys
        const similarKeys = allKeys.filter(key => key.includes(email.split('@')[0]));
        if (similarKeys.length > 0) {
          console.log('🔍 Found similar email keys:', similarKeys);
        }
      } else {
        console.log('❌ No email index collection found at all!');
      }
      
      return null;
    }
    
    const studentId = emailSnapshot.val();
    console.log('✅ Found student ID from email index:', studentId);
    
    const studentRef = ref(realtimeDb, `students/${studentId}`);
    const studentSnapshot = await get(studentRef);
    
    if (!studentSnapshot.exists()) {
      console.log('❌ Student not found in students collection with ID:', studentId);
      return null;
    }
    
    const userData = studentSnapshot.val() as UserCredentials;
    console.log('✅ Retrieved student data:', {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      admissionNumber: userData.admissionNumber,
      approved: userData.approved,
      accountActive: userData.accountActive
    });
    
    return userData;
  } catch (error) {
    console.error('❌ Error getting student by email:', error);
    return null;
  }
};

export const getStudentByUsername = async (username: string): Promise<UserCredentials | null> => {
  try {
    console.log('🔍 Looking up student by username:', username);
    const usernameKey = username.replace(/[.#$[\]]/g, '_');
    console.log('🔧 Username key for lookup:', usernameKey);
    
    const usernameIndexRef = ref(realtimeDb, `studentsByUsername/${usernameKey}`);
    const usernameSnapshot = await get(usernameIndexRef);
    
    if (!usernameSnapshot.exists()) {
      console.log('❌ No username index found for:', usernameKey);
      return null;
    }
    
    const studentId = usernameSnapshot.val();
    console.log('✅ Found student ID from username index:', studentId);
    
    const studentRef = ref(realtimeDb, `students/${studentId}`);
    const studentSnapshot = await get(studentRef);
    
    if (!studentSnapshot.exists()) {
      console.log('❌ Student not found in students collection with ID:', studentId);
      return null;
    }
    
    const userData = studentSnapshot.val() as UserCredentials;
    console.log('✅ Retrieved student data by username:', {
      username: userData.username || username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      admissionNumber: userData.admissionNumber,
      approved: userData.approved,
      accountActive: userData.accountActive
    });
    
    return userData;
  } catch (error) {
    console.error('❌ Error getting student by username:', error);
    return null;
  }
};

export const getUserByAdmissionNumber = async (admissionNumber: string): Promise<UserCredentials | null> => {
  try {
    // First check in students collection
    const studentAdmissionRef = ref(realtimeDb, `studentsByAdmission/${admissionNumber}`);
    const studentAdmissionSnapshot = await get(studentAdmissionRef);
    
    if (studentAdmissionSnapshot.exists()) {
      const studentId = studentAdmissionSnapshot.val();
      const studentRef = ref(realtimeDb, `students/${studentId}`);
      const studentSnapshot = await get(studentRef);
      
      if (studentSnapshot.exists()) {
        return studentSnapshot.val() as UserCredentials;
      }
    }
    
    // Fallback to users collection for backwards compatibility
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

export const authenticateUser = async (identifier: string, password: string): Promise<UserCredentials | null> => {
  try {
    console.log('🔐 Authenticating user with identifier:', identifier);
    
    // First try to find user by email
    let user = await getUserByEmail(identifier);
    
    // If not found by email, try username for users
    if (!user) {
      user = await getUserByUsername(identifier);
    }
    
    // If not found in users, check in students collection by email
    if (!user) {
      user = await getStudentByEmail(identifier);
    }
    
    // If not found by email in students, try username in students
    if (!user) {
      user = await getStudentByUsername(identifier);
    }
    
    if (!user) {
      console.log('❌ User not found with identifier:', identifier);
      return null;
    }
    
    // Check if account is approved and active
    if (!user.approved) {
      console.log('User account not approved:', identifier);
      return null;
    }
    
    if (user.accountActive === false) {
      console.log('User account not active:', identifier);
      return null;
    }
    
    // Simple password check (in production, you should use proper hashing)
    if (user.password === password) {
      console.log('✅ Authentication successful for:', identifier);
      return user;
    }
    
    console.log('❌ Password mismatch for:', identifier);
    return null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};
