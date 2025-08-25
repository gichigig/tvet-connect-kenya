import { supabase } from './client';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber: string;
  course: string;
  level: 'certificate' | 'diploma';
  year: number;
  semester: number;
  status: 'active' | 'graduated' | 'withdrawn' | 'suspended';
  enrollmentDate: string;
  expectedGraduationDate: string;
  units: {
    unitId: string;
    unitCode: string;
    unitName: string;
    status: 'enrolled' | 'completed' | 'failed';
    grade?: string;
    semester: number;
    year: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export class StudentService {
  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Student | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...student,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapStudentFromDB(data),
      error: null 
    };
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ data: Student | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('students')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapStudentFromDB(data),
      error: null 
    };
  }

  async deleteStudent(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    return { error };
  }

  async getStudent(id: string): Promise<{ data: Student | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('students')
      .select('*, units:student_units(*)')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapStudentFromDB(data),
      error: null 
    };
  }

  async listStudents(filters?: {
    course?: string;
    level?: Student['level'];
    year?: number;
    semester?: number;
    status?: Student['status'];
  }): Promise<{ data: Student[]; error: Error | null }> {
    let query = supabase
      .from('students')
      .select('*, units:student_units(*)');

    if (filters?.course) {
      query = query.eq('course', filters.course);
    }
    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    if (filters?.semester) {
      query = query.eq('semester', filters.semester);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    return { 
      data: data.map(this.mapStudentFromDB),
      error: null 
    };
  }

  async enrollStudentInUnit(studentId: string, unitId: string, unitCode: string, unitName: string, semester: number, year: number): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('student_units')
      .insert([{
        student_id: studentId,
        unit_id: unitId,
        unit_code: unitCode,
        unit_name: unitName,
        status: 'enrolled',
        semester,
        year,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    return { error };
  }

  async updateUnitStatus(studentId: string, unitId: string, status: 'completed' | 'failed', grade?: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('student_units')
      .update({
        status,
        grade,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('unit_id', unitId);

    return { error };
  }

  private mapStudentFromDB(data: any): Student {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      admissionNumber: data.admission_number,
      course: data.course,
      level: data.level,
      year: data.year,
      semester: data.semester,
      status: data.status,
      enrollmentDate: data.enrollment_date,
      expectedGraduationDate: data.expected_graduation_date,
      units: data.units?.map((unit: any) => ({
        unitId: unit.unit_id,
        unitCode: unit.unit_code,
        unitName: unit.unit_name,
        status: unit.status,
        grade: unit.grade,
        semester: unit.semester,
        year: unit.year
      })) || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
