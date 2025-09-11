import { supabase } from '@/integrations/supabase/client';
import { InstitutionBranchService, CreateInstitutionBranchData } from '@/integrations/supabase/institutionBranch';

export interface Institution {
  id: string;
  name: string;
  type: 'main' | 'branch';
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface InstitutionBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdDate: string;
}

// Interface for components to use when creating branches
export interface CreateInstitutionBranchFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
}

export class InstitutionService {
  private static branchService = new InstitutionBranchService();

  // Get all institutions (for backward compatibility)
  static async getInstitutions(): Promise<Institution[]> {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching institutions:', error);
        return [];
      }
      
      return data.map(inst => ({
        id: inst.id,
        name: inst.name,
        type: inst.type,
        address: inst.address,
        phone: inst.phone || '',
        email: inst.email || '',
        isActive: inst.is_active,
        createdAt: inst.created_at
      }));
    } catch (error) {
      console.error('Error in getInstitutions:', error);
      return [];
    }
  }

  // Get all institution branches from database
  static async getBranchesByCreator(createdBy: string): Promise<InstitutionBranch[]> {
    try {
      const { data, error } = await this.branchService.listBranches({ status: 'active' });
      if (error) {
        console.error('Error fetching branches:', error);
        return [];
      }
      console.log('🏢 Loaded institution branches from database:', data);
      return data;
    } catch (error) {
      console.error('Error in getBranchesByCreator:', error);
      return [];
    }
  }

  // Create new institution branch in database
  static async createBranch(branchData: CreateInstitutionBranchFormData, createdBy: string): Promise<InstitutionBranch> {
    try {
      const { data, error } = await this.branchService.createBranch({
        ...branchData,
        created_by: createdBy
      });

      if (error) {
        console.error('Error creating branch:', error);
        throw new Error('Failed to create institution branch');
      }

      if (!data) {
        throw new Error('No data returned from branch creation');
      }

      console.log('✅ Institution branch created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createBranch:', error);
      throw error;
    }
  }

  // Update institution branch in database
  static async updateBranch(id: string, updates: Partial<CreateInstitutionBranchFormData>, createdBy: string): Promise<InstitutionBranch> {
    try {
      const { data, error } = await this.branchService.updateBranch(id, updates);

      if (error) {
        console.error('Error updating branch:', error);
        throw new Error('Failed to update institution branch');
      }

      if (!data) {
        throw new Error('No data returned from branch update');
      }

      console.log('✅ Institution branch updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in updateBranch:', error);
      throw error;
    }
  }

  // Delete institution branch from database
  static async deleteBranch(id: string, createdBy: string): Promise<void> {
    try {
      const { error } = await this.branchService.deleteBranch(id);

      if (error) {
        console.error('Error deleting branch:', error);
        throw new Error('Failed to delete institution branch');
      }

      console.log('✅ Institution branch deleted successfully');
    } catch (error) {
      console.error('Error in deleteBranch:', error);
      throw error;
    }
  }
}
