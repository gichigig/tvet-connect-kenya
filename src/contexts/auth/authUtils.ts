import { User } from './types';

export const createNewUser = (userData: any): User => {
  const { email, password, firstName, lastName, role, course, level, year, semester, admissionNumber, intake, phone } = userData;
  
  return {
    id: Date.now().toString(),
    firstName,
    lastName,
    email,
    role,
    approved: role === 'admin',
    course,
    level,
    intake,
    phone,
    year,
    semester,
    admissionNumber
  };
};

export const findUserByEmail = (users: User[], email: string): User | undefined => {
  return users.find(u => u.email === email);
};

export const findUserByUsername = (users: User[], username: string): User | undefined => {
  return users.find(u => u.username === username);
};

export const findUserByEmailOrUsername = (users: User[], identifier: string): User | undefined => {
  // Try to find by email first, then by username
  return users.find(u => u.email === identifier || u.username === identifier);
};

export const updateUserInList = (users: User[], userId: string, updates: Partial<User>): User[] => {
  return users.map(user => 
    user.id === userId ? { ...user, ...updates } : user
  );
};

export const removeUserFromList = (users: User[], userId: string): User[] => {
  return users.filter(user => user.id !== userId);
};

export const getPendingUsers = (users: User[]): User[] => {
  return users.filter(user => !user.approved);
};
