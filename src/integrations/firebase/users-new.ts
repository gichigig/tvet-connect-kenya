// Supabase integration for user management (migrated from Firebase)
import { supabase } from '../supabase/client';

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
  role: 'student' | 'lecturer' | 'admin' | 'registrar' | 'hod' | 'finance';
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
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Create a new student
export const createStudent = async (studentData: CreateStudentData, password: string): Promise<string> => {
  try {
    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: studentData.email,
      password: password,
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('Failed to create user');
    }

    // Create user profile in Supabase
    const profileData = {
      ...studentData,
      user_id: userId,
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) {
      throw profileError;
    }

    return userId;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Get user profile by user ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      email: data.email,
      username: data.username,
      role: data.role,
      studentId: data.studentId || data.student_id,
      course: data.course,
      yearOfStudy: data.yearOfStudy || data.year_of_study,
      intake: data.intake,
      phoneNumber: data.phoneNumber || data.phone_number,
      address: data.address,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      emergencyContact: data.emergencyContact || data.emergency_contact,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user profile by email
export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      email: data.email,
      username: data.username,
      role: data.role,
      studentId: data.studentId || data.student_id,
      course: data.course,
      yearOfStudy: data.yearOfStudy || data.year_of_study,
      intake: data.intake,
      phoneNumber: data.phoneNumber || data.phone_number,
      address: data.address,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      emergencyContact: data.emergencyContact || data.emergency_contact,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile by email:', error);
    throw error;
  }
};

// Get user profile by username
export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      email: data.email,
      username: data.username,
      role: data.role,
      studentId: data.studentId || data.student_id,
      course: data.course,
      yearOfStudy: data.yearOfStudy || data.year_of_study,
      intake: data.intake,
      phoneNumber: data.phoneNumber || data.phone_number,
      address: data.address,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      emergencyContact: data.emergencyContact || data.emergency_contact,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile by username:', error);
    throw error;
  }
};

// Get all students
export const getAllStudents = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('is_active', true)
      .order('first_name');
    
    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      firstName: item.firstName || item.first_name,
      lastName: item.lastName || item.last_name,
      email: item.email,
      username: item.username,
      role: item.role,
      studentId: item.studentId || item.student_id,
      course: item.course,
      yearOfStudy: item.yearOfStudy || item.year_of_study,
      intake: item.intake,
      phoneNumber: item.phoneNumber || item.phone_number,
      address: item.address,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : undefined,
      gender: item.gender,
      emergencyContact: item.emergencyContact || item.emergency_contact,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      isActive: item.is_active
    } as UserProfile));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Get students by course
export const getStudentsByCourse = async (course: string): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('course', course)
      .eq('is_active', true)
      .order('first_name');
    
    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      firstName: item.firstName || item.first_name,
      lastName: item.lastName || item.last_name,
      email: item.email,
      username: item.username,
      role: item.role,
      studentId: item.studentId || item.student_id,
      course: item.course,
      yearOfStudy: item.yearOfStudy || item.year_of_study,
      intake: item.intake,
      phoneNumber: item.phoneNumber || item.phone_number,
      address: item.address,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : undefined,
      gender: item.gender,
      emergencyContact: item.emergencyContact || item.emergency_contact,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      isActive: item.is_active
    } as UserProfile));
  } catch (error) {
    console.error('Error fetching students by course:', error);
    throw error;
  }
};

// Get students by intake
export const getStudentsByIntake = async (intake: string): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('intake', intake)
      .eq('is_active', true)
      .order('first_name');
    
    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      firstName: item.firstName || item.first_name,
      lastName: item.lastName || item.last_name,
      email: item.email,
      username: item.username,
      role: item.role,
      studentId: item.studentId || item.student_id,
      course: item.course,
      yearOfStudy: item.yearOfStudy || item.year_of_study,
      intake: item.intake,
      phoneNumber: item.phoneNumber || item.phone_number,
      address: item.address,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : undefined,
      gender: item.gender,
      emergencyContact: item.emergencyContact || item.emergency_contact,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      isActive: item.is_active
    } as UserProfile));
  } catch (error) {
    console.error('Error fetching students by intake:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profileId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Deactivate user (soft delete)
export const deactivateUser = async (profileId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

// Reactivate user
export const reactivateUser = async (profileId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role: UserProfile['role']): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('first_name');
    
    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      firstName: item.firstName || item.first_name,
      lastName: item.lastName || item.last_name,
      email: item.email,
      username: item.username,
      role: item.role,
      studentId: item.studentId || item.student_id,
      course: item.course,
      yearOfStudy: item.yearOfStudy || item.year_of_study,
      intake: item.intake,
      phoneNumber: item.phoneNumber || item.phone_number,
      address: item.address,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : undefined,
      gender: item.gender,
      emergencyContact: item.emergencyContact || item.emergency_contact,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      isActive: item.is_active
    } as UserProfile));
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Search users by name
export const searchUsersByName = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
      .order('first_name');
    
    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      firstName: item.firstName || item.first_name,
      lastName: item.lastName || item.last_name,
      email: item.email,
      username: item.username,
      role: item.role,
      studentId: item.studentId || item.student_id,
      course: item.course,
      yearOfStudy: item.yearOfStudy || item.year_of_study,
      intake: item.intake,
      phoneNumber: item.phoneNumber || item.phone_number,
      address: item.address,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : undefined,
      gender: item.gender,
      emergencyContact: item.emergencyContact || item.emergency_contact,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      isActive: item.is_active
    } as UserProfile));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Send password reset email
export const sendUserPasswordReset = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
