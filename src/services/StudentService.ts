import { supabase } from '@/integrations/supabase/client';

export interface StudentProfile {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  guardianPhone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  institutionBranch: string;
  department: string;
  course: string;
  level: string;
  semester?: string;
  academicYear?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  guardianPhone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  institutionBranch: string;
  department: string;
  course: string;
  level: string;
  semester?: string;
  academicYear?: string;
}

export class StudentService {
  // Generate admission number
  static async generateAdmissionNumber(departmentCode: string, year?: string): Promise<string> {
    const currentYear = year || new Date().getFullYear().toString().slice(-2);
    
    // Get the count of students in this department for this year
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .like('admissionNumber', `${departmentCode}/${currentYear}/%`);

    if (error) {
      console.error('Error counting students:', error);
      throw error;
    }

    const nextNumber = (count || 0) + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    
    return `${departmentCode}/${currentYear}/${paddedNumber}`;
  }

  // Create new student
  static async createStudent(studentData: CreateStudentData, createdBy: string): Promise<StudentProfile> {
    // First, get department code for admission number
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('code')
      .eq('name', studentData.department)
      .single();

    if (deptError || !department) {
      throw new Error('Department not found');
    }

    // Generate admission number
    const admissionNumber = await this.generateAdmissionNumber(department.code);

    const { data, error } = await supabase
      .from('students')
      .insert({
        ...studentData,
        admissionNumber,
        isActive: true,
        createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      throw error;
    }

    return data;
  }

  // Get all students
  static async getStudents(): Promise<StudentProfile[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    return data || [];
  }

  // Get student by admission number
  static async getStudentByAdmissionNumber(admissionNumber: string): Promise<StudentProfile | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('admissionNumber', admissionNumber)
      .eq('isActive', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching student:', error);
      throw error;
    }

    return data;
  }

  // Update student
  static async updateStudent(id: string, updates: Partial<CreateStudentData>): Promise<StudentProfile> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    return data;
  }

  // Delete student (soft delete)
  static async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ isActive: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Get students by department
  static async getStudentsByDepartment(department: string): Promise<StudentProfile[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('department', department)
      .eq('isActive', true)
      .order('admissionNumber');

    if (error) {
      console.error('Error fetching students by department:', error);
      throw error;
    }

    return data || [];
  }
}
