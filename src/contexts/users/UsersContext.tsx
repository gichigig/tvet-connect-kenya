import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  approved?: boolean;
  blocked?: boolean;
  departmentId?: string;
  institutionId?: string;
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  examResults: any[];
  getUser: (id: string) => User | undefined;
  getUsersByRole: (role: string) => User[];
  getUsersByDepartment: (departmentId: string) => User[];
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllUsers } = useAuth();

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const getUser = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUsersByRole = (role: string): User[] => {
    return users.filter(user => user.role === role);
  };

  const getUsersByDepartment = (departmentId: string): User[] => {
    return users.filter(user => user.departmentId === departmentId);
  };

  const value: UsersContextType = {
    users,
    loading,
    examResults: [],
    getUser,
    getUsersByRole,
    getUsersByDepartment,
    refreshUsers
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
