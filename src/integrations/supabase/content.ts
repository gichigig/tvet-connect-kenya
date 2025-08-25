import { supabase } from './client';
import { Database } from './types';

export interface Content {
  id: string;
  type: 'notes' | 'assignment';
  title: string;
  description?: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  lecturerId: string;
  files?: {
    url: string;
    name: string;
    type: string;
    size: number;
  }[];
  createdAt: string;
  updatedAt: string;
  isVisible: boolean;
  topic?: string;
  dueDate?: string;
  assignmentType?: 'file_upload' | 'multiple_choice' | 'question_file';
  acceptedFormats?: string[];
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export class ContentService {
  async createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Content | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('content')
      .insert([{
        ...content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapContentFromDB(data),
      error: null 
    };
  }

  async updateContent(id: string, updates: Partial<Content>): Promise<{ data: Content | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('content')
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
      data: this.mapContentFromDB(data),
      error: null 
    };
  }

  async deleteContent(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    return { error };
  }

  async getContent(id: string): Promise<{ data: Content | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapContentFromDB(data),
      error: null 
    };
  }

  async listContent(filters?: {
    type?: Content['type'];
    unitId?: string;
    lecturerId?: string;
    isVisible?: boolean;
  }): Promise<{ data: Content[]; error: Error | null }> {
    let query = supabase.from('content').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.unitId) {
      query = query.eq('unit_id', filters.unitId);
    }
    if (filters?.lecturerId) {
      query = query.eq('lecturer_id', filters.lecturerId);
    }
    if (filters?.isVisible !== undefined) {
      query = query.eq('is_visible', filters.isVisible);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    return { 
      data: data.map(this.mapContentFromDB),
      error: null 
    };
  }

  private mapContentFromDB(data: any): Content {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      unitId: data.unit_id,
      unitCode: data.unit_code,
      unitName: data.unit_name,
      lecturerId: data.lecturer_id,
      files: data.files,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isVisible: data.is_visible,
      topic: data.topic,
      dueDate: data.due_date,
      assignmentType: data.assignment_type,
      acceptedFormats: data.accepted_formats,
      questions: data.questions
    };
  }
}
