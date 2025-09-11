import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  hodId?: string;
}

export class DepartmentService {
  // Get all departments
  static async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }

    return data || [];
  }

  // Create new department
  static async createDepartment(departmentData: CreateDepartmentData): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert(departmentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      throw error;
    }

    return data;
  }

  // Update department
  static async updateDepartment(id: string, updates: Partial<CreateDepartmentData>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      throw error;
    }

    return data;
  }

  // Delete department (soft delete)
  static async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .update({ isActive: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  // Get departments by registrar/admin who created them
  static async getDepartmentsByCreator(createdBy: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments by creator:', error);
      throw error;
    }

    return data || [];
  }
}
