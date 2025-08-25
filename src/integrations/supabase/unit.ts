import { supabase } from './client';

export interface Unit {
  id: string;
  code: string;
  name: string;
  description?: string;
  course: string;
  year: number;
  semester: number;
  lecturerId: string;
  lecturerName: string;
  department: string;
  credits: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export class UnitService {
  async createUnit(unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Unit | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('units')
      .insert([{
        ...unit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapUnitFromDB(data),
      error: null 
    };
  }

  async updateUnit(id: string, updates: Partial<Unit>): Promise<{ data: Unit | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('units')
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
      data: this.mapUnitFromDB(data),
      error: null 
    };
  }

  async deleteUnit(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    return { error };
  }

  async getUnit(id: string): Promise<{ data: Unit | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapUnitFromDB(data),
      error: null 
    };
  }

  async listUnits(filters?: {
    course?: string;
    year?: number;
    semester?: number;
    lecturerId?: string;
    department?: string;
    status?: Unit['status'];
  }): Promise<{ data: Unit[]; error: Error | null }> {
    let query = supabase.from('units').select('*');

    if (filters?.course) {
      query = query.eq('course', filters.course);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    if (filters?.semester) {
      query = query.eq('semester', filters.semester);
    }
    if (filters?.lecturerId) {
      query = query.eq('lecturer_id', filters.lecturerId);
    }
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    return { 
      data: data.map(this.mapUnitFromDB),
      error: null 
    };
  }

  private mapUnitFromDB(data: any): Unit {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      course: data.course,
      year: data.year,
      semester: data.semester,
      lecturerId: data.lecturer_id,
      lecturerName: data.lecturer_name,
      department: data.department,
      credits: data.credits,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
