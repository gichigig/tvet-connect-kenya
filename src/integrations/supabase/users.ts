// Supabase integration for user management
import { supabase } from './client';

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  studentId: string;
  course: string;
  yearOfStudy: number;
  intake: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'student' | 'lecturer' | 'hod' | 'registrar' | 'finance' | 'admin';
  studentId?: string;
  course?: string;
  yearOfStudy?: number;
  intake?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface LecturerData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  employeeId: string;
  department: string;
  specialization?: string;
  phoneNumber?: string;
  officeLocation?: string;
}

export interface AdminData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  employeeId: string;
  role: 'hod' | 'registrar' | 'finance' | 'admin';
  department?: string;
  phoneNumber?: string;
}

// Authentication functions
export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Profile management functions
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
};

export const deleteUserProfile = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
};

// Student-specific functions
export const createStudent = async (studentData: CreateStudentData, password: string) => {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: studentData.email,
    password,
  });
  
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Then create the profile
  const profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
    ...studentData,
    role: 'student'
  };

  return await createUserProfile(profile);
};

export const getStudents = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getStudentById = async (studentId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('studentId', studentId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getStudentsByIntake = async (intake: string): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .eq('intake', intake)
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getStudentsByCourse = async (course: string): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .eq('course', course)
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Lecturer-specific functions
export const createLecturer = async (lecturerData: LecturerData, password: string) => {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: lecturerData.email,
    password,
  });
  
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Then create the profile
  const profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
    ...lecturerData,
    role: 'lecturer'
  };

  return await createUserProfile(profile);
};

export const getLecturers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'lecturer')
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Admin-specific functions
export const createAdmin = async (adminData: AdminData, password: string) => {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminData.email,
    password,
  });
  
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Then create the profile
  const profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
    ...adminData,
    role: adminData.role
  };

  return await createUserProfile(profile);
};

export const getAdmins = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['hod', 'registrar', 'finance', 'admin'])
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// General user functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getUsersByRole = async (role: UserProfile['role']): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,studentId.ilike.%${searchTerm}%`)
    .order('lastName', { ascending: true });
  
  if (error) throw error;
  return data || [];
};
