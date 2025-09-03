import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, SupplyRequest, StudentFee, ClearanceForm, PendingUnitRegistration, ActivityLog, StudentCard, FeeStructure } from './auth/types';
import { getPendingUsers } from './auth/authUtils';
import { useAuthHelpers } from './auth/AuthHelpers';
import { UsersProvider, useUsers } from './users/UsersContext';
import { UnitsProvider, useUnits } from './units/UnitsContext';
import { FinanceProvider, useFinance } from './finance/FinanceContext';
import { Unit } from '@/types/unitManagement';
import { supabase, getCurrentProfile } from '@/integrations/supabase/config';
import { AuthService } from '@/integrations/auth/supabase';
import { DataService } from '@/integrations/data/supabase';
import { saveUserToStorage, getUserFromStorage, removeUserFromStorage } from '@/utils/authPersistence';
// Firebase imports for auth state management
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { firebaseApp, auth } from '@/integrations/firebase/config';

export interface AuthContextType {
  user: User | null;
  loading: boolean; // Add loading state
  supplyRequests: SupplyRequest[]; // <-- Add this line
  studentFees: StudentFee[];
  updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => void;
  login: (identifier: string, password: string, role?: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
  getPendingUsers: () => User[];
  getAllUsers: () => User[];
  getActivityLogs: () => ActivityLog[];
  createdUnits: Unit[];
  addCreatedUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  updateCreatedUnit: (unitId: string, updates: Partial<Unit>) => void;
  deleteCreatedUnit: (unitId: string) => void;
  addStudentFee: (fee: any) => void; // Replace 'any' with actual type
  clearanceForms: ClearanceForm  []; // Placeholder for clearance forms, replace with actual type
  approveUser: (userId: string) => void;
  approveStudent: (userId: string) => void;
  rejectUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  feeStructures:any[];
  addFeeStructure: (feeStructure: any) => void;
  updateFeeStructure: (id: string, updates: any) => void; // Replace 'any' with actual type
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateProfilePicture?: (file: File) => Promise<string>;
  createdContent: any[]; // Placeholder for created content, replace 'any' with actual type when available
  profilePicture?: string;
  updateUserApproval: (userId: string, approved: boolean) => void;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  createUserAccount: (userData: any) => Promise<void>;
  changePassword?: (userId: string, newPassword: string) => Promise<void>;
  getPendingUnitRegistrations?: () => PendingUnitRegistration[]; // <-- Add this line if needed
  pendingUnitRegistrations: PendingUnitRegistration[];
  getStudentCard: (studentId: string) => StudentCard | undefined;
  studentCards: StudentCard[];
  activateStudentCard: (studentId: string, activatedBy: string) => void;
  deactivateStudentCard: (studentId: string, deactivatedBy: string) => void;
  getAvailableUnits: (course: string, year: number, semester: number) => Unit[];
  getFirebaseAuthToken: () => Promise<string | null>;
addPendingUnitRegistration: (registration: {
    studentId: string;
    studentName?: string;
    studentEmail?: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    course?: string;
    year?: number;
    semester?: number;
    status?: string;
    id?: string;
    dateRegistered?: string;
    approvedAt?: string;
    approvedBy?: string;
    remarks?: string;
}) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage on app start
    return getUserFromStorage();
  });
  const [loading, setLoading] = useState(true); // Add loading state
  const { login: loginHelper, signup: signupHelper, logout: logoutHelper } = useAuthHelpers();

  // Enhanced setUser function that also saves to localStorage
  const setUserWithPersistence = (newUser: User | null | ((prev: User | null) => User | null)) => {
    if (typeof newUser === 'function') {
      setUser(prev => {
        const updatedUser = newUser(prev);
        if (updatedUser) {
          saveUserToStorage(updatedUser);
        } else {
          removeUserFromStorage();
        }
        return updatedUser;
      });
    } else {
      setUser(newUser);
      if (newUser) {
        saveUserToStorage(newUser);
      } else {
        removeUserFromStorage();
      }
    }
  };
  
  // Listen for Firebase Auth state changes with automatic token refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase Auth state changed:', firebaseUser?.uid);
      setLoading(true); // Set loading to true when auth state changes
      
      if (firebaseUser) {
        // Check if token is valid and refresh if needed
        try {
          await firebaseUser.getIdToken(true); // Force refresh token
          console.log('Token refreshed successfully');
        } catch (tokenError) {
          console.error('Token refresh failed:', tokenError);
          // If token refresh fails, log out the user
          setUserWithPersistence(null);
          setLoading(false);
          return;
        }

        // Firebase user is authenticated, try to get user profile from Firestore
        try {
          const db = getFirestore(firebaseApp);
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userProfile: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              role: userData.role || 'student',
              approved: userData.approved || false,
              blocked: userData.blocked || false,
              phone: userData.phone,
              profilePicture: userData.profilePicture,
              ...userData
            };
            setUserWithPersistence(userProfile);
            console.log('User profile loaded from Firestore:', userProfile);
          } else {
            console.log('No user profile found in Firestore for:', firebaseUser.uid);
            // Create a basic user profile from Firebase Auth data
            const basicUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: '',
              lastName: '',
              role: 'student',
              approved: false
            };
            setUserWithPersistence(basicUser);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fall back to basic Firebase user data
          const basicUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: '',
            lastName: '',
            role: 'student',
            approved: false
          };
          setUserWithPersistence(basicUser);
        }
      } else {
        // No Firebase user - only clear if we don't have a realtime DB user
        const storedUser = getUserFromStorage();
        if (storedUser && storedUser.id && !storedUser.id.startsWith('firebase-')) {
          // This might be a realtime DB user, keep them logged in
          console.log('Keeping realtime DB user logged in:', storedUser.email);
          setUser(storedUser);
        } else {
          // Clear Firebase-based users
          console.log('No Firebase user, clearing user state');
          setUserWithPersistence(null);
        }
      }
      
      setLoading(false); // Set loading to false after processing auth state
    });

    // Set up periodic token refresh (every 45 minutes)
    const tokenRefreshInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }
    }, 45 * 60 * 1000); // 45 minutes

    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  // Use the separated contexts
  const {
    users,
    setUsers,
    updateUserApproval,
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getAllUsers,
    pendingUnitRegistrations,
    setPendingUnitRegistrations,
  } = useUsers();

  // Update profile picture with automatic deletion of old picture
  const updateProfilePicture = async (file: File) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { updateUserProfilePicture } = await import('@/integrations/firebase/profile');
      const newImageUrl = await updateUserProfilePicture(user.id, file);
      
      // Update the user state with new profile picture
      setUserWithPersistence(prev => prev ? { ...prev, profilePicture: newImageUrl } : null);
      
      return newImageUrl;
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const login = async (identifier: string, password: string, role?: string) => {
    return loginHelper(identifier, password, role, users, setUserWithPersistence);
  };

  const signup = async (userData: any) => {
    return signupHelper(userData, setUsers, setUserWithPersistence);
  };
  const logout = async () => {
    return logoutHelper(setUserWithPersistence);
  };

  // Student cards array with sample data - should be replaced with Firebase integration
  const [studentCards, setStudentCards] = useState<StudentCard[]>([
    {
      id: 'card1',
      studentId: 'STU001',
      studentName: 'John Doe',
      admissionNumber: 'ADM/2024/001',
      course: 'Electrical Engineering',
      year: 1,
      semester: 1,
      academicYear: '2024/2025',
      isActive: true,
      status: 'active',
      createdDate: '2024-01-10T08:00:00Z',
      activatedBy: 'finance_admin',
      activatedDate: '2024-01-15T10:00:00Z'
    },
    {
      id: 'card2',
      studentId: 'STU002',
      studentName: 'Jane Smith',
      admissionNumber: 'ADM/2024/002',
      course: 'Computer Science',
      year: 2,
      semester: 1,
      academicYear: '2024/2025',
      isActive: false,
      status: 'inactive',
      createdDate: '2024-01-11T08:00:00Z',
      deactivatedBy: 'finance_admin',
      deactivatedDate: '2024-02-01T14:30:00Z'
    },
    {
      id: 'card3',
      studentId: 'STU003',
      studentName: 'Bob Johnson',
      admissionNumber: 'ADM/2024/003',
      course: 'Mechanical Engineering',
      year: 1,
      semester: 2,
      academicYear: '2024/2025',
      isActive: true,
      status: 'active',
      createdDate: '2024-01-12T08:00:00Z',
      activatedBy: 'finance_admin',
      activatedDate: '2024-01-20T09:15:00Z'
    }
  ]);

  // Dummy implementation for getStudentCard; replace with real logic as needed
  const getStudentCard = (studentId: string) => {
    // TODO: Implement actual logic to retrieve a student card
    return studentCards.find(card => card.studentId === studentId);
  };

  // Implementation for activateStudentCard
  const activateStudentCard = (studentId: string, activatedBy: string) => {
    setStudentCards(prev => prev.map(card => 
      card.studentId === studentId 
        ? { ...card, isActive: true, status: 'active' as const, activatedBy, activatedDate: new Date().toISOString() }
        : card
    ));
  };

  // Implementation for deactivateStudentCard
  const deactivateStudentCard = (studentId: string, deactivatedBy: string) => {
    setStudentCards(prev => prev.map(card => 
      card.studentId === studentId 
        ? { ...card, isActive: false, status: 'inactive' as const, deactivatedBy, deactivatedDate: new Date().toISOString() }
        : card
    ));
  };

  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  const getAvailableUnits = (course: string, year: number, semester: number) => {
    // TODO: Implement actual logic to fetch available units
    return availableUnits.filter(unit => 
      unit.course === course && 
      unit.year === year && 
      unit.semester === semester
    );
  };

  const addPendingUnitRegistration = (registration: {
    studentId: string;
    studentName?: string;
    studentEmail?: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    course?: string;
    year?: number;
    semester?: number;
    status?: string;
    id?: string;
    dateRegistered?: string;
    approvedAt?: string;
    approvedBy?: string;
    remarks?: string;
  }) => {
    // Create a new registration with all required fields
    const newRegistration: PendingUnitRegistration = {
      id: registration.id || `temp-${Date.now()}-${Math.random()}`,
      studentId: registration.studentId,
      studentName: registration.studentName || 'Unknown',
      studentEmail: registration.studentEmail || '',
      unitId: registration.unitId,
      unitCode: registration.unitCode,
      unitName: registration.unitName,
      course: registration.course || 'Unknown',
      year: registration.year || 1,
      semester: registration.semester || 1,
      status: (registration.status === 'approved' || registration.status === 'pending' || registration.status === 'rejected')
        ? registration.status
        : 'pending',
      submittedDate: registration.dateRegistered || registration.approvedAt || new Date().toISOString(),
    };

    console.log('Adding pending unit registration:', newRegistration);
    
    setPendingUnitRegistrations(prev => {
      // Check if registration already exists to avoid duplicates
      const existingIndex = prev.findIndex(reg => 
        reg.studentId === newRegistration.studentId && 
        reg.unitCode === newRegistration.unitCode
      );
      
      if (existingIndex >= 0) {
        // Update existing registration
        const updated = [...prev];
        updated[existingIndex] = newRegistration;
        console.log('Updated existing registration:', newRegistration);
        return updated;
      } else {
        // Add new registration
        console.log('Added new registration:', newRegistration);
        return [...prev, newRegistration];
      }
    });
  };

  const [createdUnits, setCreatedUnits] = useState<Unit[]>([]);

  // Real-time sync with Firestore
  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, 'units'), (snapshot) => {
      setCreatedUnits(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Unit) })));
    });
    return () => unsubscribe();
  }, []);

  const addCreatedUnit = async (unit: Omit<Unit, 'id'>) => {
    const saved = await saveUnitToFirebase(unit);
    setCreatedUnits(prev => [...prev, saved]);
  };

  const updateCreatedUnit = async (unitId: string, updates: Partial<Unit>) => {
    await updateUnitInFirebase(unitId, updates);
    setCreatedUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, ...updates } : unit
    ));
  };

  const deleteCreatedUnit = async (unitId: string) => {
    await deleteUnitFromFirebase(unitId);
    setCreatedUnits(prev => prev.filter(unit => unit.id !== unitId));
  };

  // Get Firebase Auth token for authenticated requests
  const getFirebaseAuthToken = async (): Promise<string | null> => {
    const firebaseUser = auth.currentUser;
    
    console.log('getFirebaseAuthToken debug:', {
      hasAuth: !!auth,
      hasFirebaseUser: !!firebaseUser,
      firebaseUserId: firebaseUser?.uid,
      firebaseUserEmail: firebaseUser?.email,
      contextUser: user?.id,
      contextUserEmail: user?.email
    });
    
    if (!firebaseUser) {
      if (user) {
        console.log('Firebase Auth not available but user authenticated through other means:', user.email);
        console.log('Consider implementing custom JWT tokens or alternative upload method');
        return null; // Return null instead of throwing error
      } else {
        console.log('No Firebase user and no context user found');
        return null;
      }
    }
    
    try {
      const token = await firebaseUser.getIdToken();
      console.log('Successfully got Firebase Auth token');
      return token;
    } catch (error) {
      console.error('Failed to get Firebase Auth token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    users,
    setUsers,
    updateUserApproval,
    addCreatedUnit,
    updateCreatedUnit,
    deleteCreatedUnit,
    updateFeeStatus: (feeId: string, status: StudentFee['status'], paidDate?: string, paidAmount?: number, paymentMethod?: string, receiptNumber?: string) => {
      // TODO: Implement fee status update logic
    },
    getAvailableUnits,
    addPendingUnitRegistration,
    addStudentFee: (fee: any) => {
      // TODO: Implement addStudentFee logic
    },
    approveUser,
    approveStudent,
    rejectUser,
    blockUser,
    unblockUser,
    getPendingUsers: () => getPendingUsers(users),
    getAllUsers,
    getActivityLogs: () => {
      // TODO: Implement getActivityLogs logic
      return [];
    },
    updateProfilePicture,
    pendingUnitRegistrations,
    supplyRequests: [], // Provide default empty array or fetch from context if available
    studentFees: [], // Provide default empty array or fetch from context if available
    clearanceForms: [],
    isAdmin: !!user && user.role === 'admin',
    isAuthenticated: !!user,
    feeStructures: [],
    addFeeStructure: (feeStructure: any) => {
      // TODO: Implement addFeeStructure logic
    },
    updateFeeStructure: (id: string, updates: any) => {
      // TODO: Implement updateFeeStructure logic
    },
    // Provide mock units and content for lecturers for dashboard demo
    createdUnits,
    createdContent: user?.role === 'lecturer' ? [
      {
        id: 'exam1',
        type: 'exam',
        title: 'Midterm Exam',
        lecturerId: user?.id,
        unitId: 'unit1',
        unitName: 'Introduction to Computer Science',
        unitCode: 'CS101',
        isVisible: true,
        createdAt: '2025-02-01',
        scheduledDate: '2025-07-20T10:00:00',
        duration: 90,
        venue: 'Room 101',
        status: 'approved',
        questions: [],
        totalMarks: 100,
      },
      {
        id: 'cat1',
        type: 'cat',
        title: 'CAT 1',
        lecturerId: user?.id,
        unitId: 'unit2',
        unitName: 'Data Structures',
        unitCode: 'CS201',
        isVisible: true,
        createdAt: '2025-02-10',
        scheduledDate: '2025-07-25T14:00:00',
        duration: 60,
        venue: 'Room 202',
        status: 'approved',
        questions: [],
        totalMarks: 50,
      },
    ] : [],
    getStudentCard,
    studentCards,
    activateStudentCard,
    deactivateStudentCard,
    getPendingUnitRegistrations,
    updateUser: async (userId: string, updates: Partial<User>) => {
      // Update in local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      
      // TODO: Update in Firebase/backend
      try {
        const { updateUser } = await import('@/integrations/firebase/users');
        await updateUser(userId, updates);
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    },
    createUserAccount: async (userData: any) => {
      try {
        // First, create in Firestore (for courses and academic data)
        const { createStudent } = await import('@/integrations/firebase/users');
        await createStudent(userData);
        
        // Also save to Realtime Database for authentication and credentials
        const { createUserInRealtimeDB } = await import('@/integrations/firebase/realtimeAuth');
        const realtimeUserId = await createUserInRealtimeDB({
          email: userData.email,
          password: userData.password,
          role: userData.role || 'student',
          firstName: userData.firstName,
          lastName: userData.lastName,
          admissionNumber: userData.admissionNumber,
          department: userData.department,
          courseId: userData.courseId,
          approved: userData.approved || true,
          phone: userData.phone,
          nationalId: userData.nationalId,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          nationality: userData.nationality,
          county: userData.county,
          subcounty: userData.subcounty,
          ward: userData.ward,
          postalAddress: userData.postalAddress,
          postalCode: userData.postalCode,
          guardianName: userData.guardianName,
          guardianPhone: userData.guardianPhone,
          guardianEmail: userData.guardianEmail,
          guardianRelationship: userData.guardianRelationship,
          guardianAddress: userData.guardianAddress,
          academicYear: userData.academicYear,
          semester: userData.semester,
          previousEducation: userData.previousEducation,
          previousGrade: userData.previousGrade,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        console.log('User created in both Firestore and Realtime DB:', realtimeUserId);
        
        // Add to local state
        const newUser: User = {
          id: realtimeUserId,
          ...userData,
          approved: true, // Ensure newly created users are marked as approved
          courseName: userData.course, // Map course to courseName for ApprovedStudents component
          createdAt: new Date().toISOString()
        };
        console.log('Adding user to local state:', newUser);
        setUsers(prev => [...prev, newUser]);
      } catch (error) {
        console.error('Failed to create user account:', error);
        throw error;
      }
    },
    getFirebaseAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export interface AdditionalAuthContextProps {
  user: User | null;
  pendingUnitRegistrations: any[];
  getAvailableUnits: (course: string, year: number, semester: number) => any[];
  addPendingUnitRegistration: (registration: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    course: string;
    year: number;
    semester: number;
  }) => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UsersProvider>
    <UnitsProvider>
      <FinanceProvider>
        <AuthProviderInner>{children}</AuthProviderInner>
      </FinanceProvider>
    </UnitsProvider>
  </UsersProvider>
);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types for convenience
export type { User, PendingUnitRegistration, ExamResult, Guardian } from './auth/types';
