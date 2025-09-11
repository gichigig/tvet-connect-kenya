// Supabase Student Creation Service
import { supabase } from '@/integrations/supabase/client';
import { createStudent, CreateStudentData } from '@/integrations/supabase/users';

export interface SupabaseStudentData extends CreateStudentData {
  password: string;
  confirmPassword?: string;
}

export interface SupabaseStudentCreationResult {
  success: boolean;
  student?: any;
  error?: string;
}

/**
 * Create a new student using Supabase
 */
export const createSupabaseStudent = async (
  studentData: SupabaseStudentData
): Promise<SupabaseStudentCreationResult> => {
  try {
    // Validate password confirmation if provided
    if (studentData.confirmPassword && studentData.password !== studentData.confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match'
      };
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', studentData.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email already exists'
      };
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', studentData.username)
      .single();

    if (existingUsername) {
      return {
        success: false,
        error: 'This username is already taken'
      };
    }

    // Check if student ID already exists
    const { data: existingStudentId } = await supabase
      .from('profiles')
      .select('studentId')
      .eq('studentId', studentData.studentId)
      .single();

    if (existingStudentId) {
      return {
        success: false,
        error: 'This student ID is already registered'
      };
    }

    // Create the student
    const student = await createStudent(studentData, studentData.password);

    return {
      success: true,
      student
    };

  } catch (error: any) {
    console.error('Error creating student:', error);
    return {
      success: false,
      error: error.message || 'Failed to create student'
    };
  }
};

/**
 * Get all students
 */
export const getAllStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('lastName', { ascending: true });

    if (error) throw error;
    return { success: true, students: data || [] };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch students',
      students: []
    };
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('studentId', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, student: data };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch student',
      student: null
    };
  }
};

/**
 * Update student information
 */
export const updateSupabaseStudent = async (
  id: string,
  updates: Partial<CreateStudentData>
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update student'
    };
  }
};

/**
 * Delete student
 */
export const deleteSupabaseStudent = async (id: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete student'
    };
  }
};

/**
 * Search students
 */
export const searchStudents = async (searchTerm: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .or(`firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,studentId.ilike.%${searchTerm}%`)
      .order('lastName', { ascending: true });

    if (error) throw error;
    return { success: true, students: data || [] };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to search students',
      students: []
    };
  }
};

/**
 * Get students by course
 */
export const getStudentsByCourse = async (course: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('course', course)
      .order('lastName', { ascending: true });

    if (error) throw error;
    return { success: true, students: data || [] };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch students',
      students: []
    };
  }
};

/**
 * Get students by intake
 */
export const getStudentsByIntake = async (intake: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('intake', intake)
      .order('lastName', { ascending: true });

    if (error) throw error;
    return { success: true, students: data || [] };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch students',
      students: []
    };
  }
};

/**
 * Bulk create students
 */
export const bulkCreateStudents = async (studentsData: SupabaseStudentData[]) => {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const studentData of studentsData) {
    const result = await createSupabaseStudent(studentData);
    if (result.success) {
      results.successful++;
    } else {
      results.failed++;
      results.errors.push(result.error || 'Unknown error');
    }
  }

  return results;
};

/**
 * Supabase Student Creation Service - Main export
 */
export const SupabaseStudentCreation = {
  createSupabaseStudent,
  getAllStudents,
  getStudentById,
  updateSupabaseStudent,
  deleteSupabaseStudent,
  searchStudents,
  getStudentsByCourse,
  getStudentsByIntake,
  bulkCreateStudents
};
