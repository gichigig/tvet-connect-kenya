import { supabase } from './client';

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

export interface CreateInstitutionBranchData {
  name: string;
  code: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  created_by: string;
}

export class InstitutionBranchService {
  async createBranch(branch: CreateInstitutionBranchData): Promise<{ data: InstitutionBranch | null; error: Error | null }> {
    // Combine address, city, region for the institutions table
    const fullAddress = `${branch.address}, ${branch.city}${branch.region ? ', ' + branch.region : ''}`;
    
    const { data, error } = await supabase
      .from('institutions')
      .insert([{
        name: branch.name,
        type: 'branch',
        address: fullAddress,
        phone: branch.phone,
        email: branch.email,
        is_active: true,
        created_by: branch.created_by
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapBranchFromDB(data),
      error: null 
    };
  }

  async updateBranch(id: string, updates: Partial<InstitutionBranch>): Promise<{ data: InstitutionBranch | null; error: Error | null }> {
    // Map updates to institutions table structure
    const institutionUpdates: any = {};
    
    if (updates.name) institutionUpdates.name = updates.name;
    if (updates.phone) institutionUpdates.phone = updates.phone;
    if (updates.email) institutionUpdates.email = updates.email;
    if (updates.status) institutionUpdates.is_active = updates.status === 'active';
    
    // Combine address components if provided
    if (updates.address || updates.city || updates.region) {
      const addressParts = [
        updates.address || '',
        updates.city || '',
        updates.region || ''
      ].filter(part => part.trim() !== '');
      
      if (addressParts.length > 0) {
        institutionUpdates.address = addressParts.join(', ');
      }
    }

    const { data, error } = await supabase
      .from('institutions')
      .update(institutionUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapBranchFromDB(data),
      error: null 
    };
  }

  async deleteBranch(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', id);

    return { error };
  }

  async listBranches(filters?: { status?: string; city?: string; region?: string }): Promise<{ data: InstitutionBranch[]; error: Error | null }> {
    let query = supabase.from('institutions').select('*');

    // Filter by type to get only branches (not main institutions)
    query = query.eq('type', 'branch');

    if (filters?.status) {
      const isActive = filters.status === 'active';
      query = query.eq('is_active', isActive);
    }
    if (filters?.city) {
      query = query.ilike('address', `%${filters.city}%`);
    }
    if (filters?.region) {
      query = query.ilike('address', `%${filters.region}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    return { 
      data: data.map(item => this.mapBranchFromDB(item)),
      error: null 
    };
  }

  private mapBranchFromDB(data: any): InstitutionBranch {
    // Extract city and region from the combined address field
    const addressParts = data.address ? data.address.split(', ') : [];
    const mainAddress = addressParts[0] || '';
    const city = addressParts[1] || '';
    const region = addressParts[2] || '';

    return {
      id: data.id,
      name: data.name,
      code: data.name.substring(0, 3).toUpperCase(), // Generate code from name
      address: mainAddress,
      city: city,
      region: region,
      phone: data.phone || '',
      email: data.email || '',
      status: data.is_active ? 'active' : 'inactive',
      createdDate: data.created_at
    };
  }
}
