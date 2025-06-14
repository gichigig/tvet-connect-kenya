import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface PendingUnitRegistration {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  unitCode: string;
  unitName: string;
  course: string;
  year: number;
  semester: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  approved: boolean;
  course?: string;
  level?: string;
  year?: number;
  semester?: number;
  admissionNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  users: User[];
  updateUserApproval: (userId: string, approved: boolean) => void;
  getPendingUsers: () => User[];
  getAllUsers: () => User[];
  pendingUnitRegistrations: PendingUnitRegistration[];
  addPendingUnitRegistration: (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => void;
  updateUnitRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => void;
  getPendingUnitRegistrations: () => PendingUnitRegistration[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  
  const [pendingUnitRegistrations, setPendingUnitRegistrations] = useState<PendingUnitRegistration[]>([
    {
      id: "1",
      studentId: "1",
      studentName: "John Doe",
      studentEmail: "john.doe@student.edu",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      course: "Computer Science",
      year: 1,
      semester: 1,
      submittedDate: "2024-01-15",
      status: 'pending'
    }
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch users from local storage
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    };

    fetchUsers();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        if (userData.approved) {
          setUser({ id: firebaseUser.uid, ...userData });
          navigate('/');
        } else {
          signOut(auth);
          throw new Error('Your account is not yet approved. Please wait for admin approval.');
        }
      } else {
        throw new Error('User data not found in Firestore.');
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const { email, password, firstName, lastName, role, course, level, year, semester, admissionNumber } = userData;
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      await sendEmailVerification(firebaseUser);
      
      const newUser: User = {
        id: firebaseUser.uid,
        firstName,
        lastName,
        email,
        role,
        approved: role === 'admin',
        course,
        level,
        year,
        semester,
        admissionNumber
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      setUsers(prevUsers => [...prevUsers, newUser]);
      localStorage.setItem('users', JSON.stringify([...users, newUser]));

      setUser(newUser);
      navigate('/');
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  const updateUserApproval = (userId: string, approved: boolean) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, approved };
        }
        return user;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const getPendingUsers = () => {
    return users.filter(user => !user.approved);
  };

  const getAllUsers = () => {
    return users;
  };

  const addPendingUnitRegistration = (registration: Omit<PendingUnitRegistration, 'id' | 'submittedDate' | 'status'>) => {
    const newRegistration: PendingUnitRegistration = {
      ...registration,
      id: Date.now().toString(),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setPendingUnitRegistrations(prev => [...prev, newRegistration]);
  };

  const updateUnitRegistrationStatus = (registrationId: string, status: 'approved' | 'rejected') => {
    setPendingUnitRegistrations(prev =>
      prev.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
      )
    );
  };

  const getPendingUnitRegistrations = () => {
    return pendingUnitRegistrations.filter(reg => reg.status === 'pending');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    users,
    updateUserApproval,
    getPendingUsers,
    getAllUsers,
    pendingUnitRegistrations,
    addPendingUnitRegistration,
    updateUnitRegistrationStatus,
    getPendingUnitRegistrations
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
