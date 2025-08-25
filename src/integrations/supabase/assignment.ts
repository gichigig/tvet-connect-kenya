import { supabase } from './client';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  lecturerId: string;
  dueDate: string;
  assignmentType: 'file_upload' | 'multiple_choice' | 'question_file';
  acceptedFormats?: string[];
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  files?: {
    url: string;
    name: string;
    type: string;
    size: number;
  }[];
  createdAt: string;
  updatedAt: string;
  isVisible: boolean;
  maxScore: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  files?: {
    url: string;
    name: string;
    type: string;
    size: number;
  }[];
  answers?: {
    questionIndex: number;
    selectedAnswer: number;
  }[];
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded';
  gradedBy?: string;
  gradedAt?: string;
}

export class AssignmentService {
  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Assignment | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        ...assignment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapAssignmentFromDB(data),
      error: null 
    };
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<{ data: Assignment | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('assignments')
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
      data: this.mapAssignmentFromDB(data),
      error: null 
    };
  }

  async deleteAssignment(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);

    return { error };
  }

  async getAssignment(id: string): Promise<{ data: Assignment | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapAssignmentFromDB(data),
      error: null 
    };
  }

  async listAssignments(filters?: {
    unitId?: string;
    lecturerId?: string;
    isVisible?: boolean;
  }): Promise<{ data: Assignment[]; error: Error | null }> {
    let query = supabase.from('assignments').select('*');

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
      data: data.map(this.mapAssignmentFromDB),
      error: null 
    };
  }

  async submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>): Promise<{ data: AssignmentSubmission | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert([{
        ...submission,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapSubmissionFromDB(data),
      error: null 
    };
  }

  async gradeSubmission(submissionId: string, score: number, feedback: string, graderId: string): Promise<{ data: AssignmentSubmission | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        score,
        feedback,
        graded_by: graderId,
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapSubmissionFromDB(data),
      error: null 
    };
  }

  async getSubmission(submissionId: string): Promise<{ data: AssignmentSubmission | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { 
      data: this.mapSubmissionFromDB(data),
      error: null 
    };
  }

  async listSubmissions(filters: {
    assignmentId?: string;
    studentId?: string;
    status?: AssignmentSubmission['status'];
  }): Promise<{ data: AssignmentSubmission[]; error: Error | null }> {
    let query = supabase.from('assignment_submissions').select('*');

    if (filters.assignmentId) {
      query = query.eq('assignment_id', filters.assignmentId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return { data: [], error };
    }

    return { 
      data: data.map(this.mapSubmissionFromDB),
      error: null 
    };
  }

  private mapAssignmentFromDB(data: any): Assignment {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      unitId: data.unit_id,
      unitCode: data.unit_code,
      unitName: data.unit_name,
      lecturerId: data.lecturer_id,
      dueDate: data.due_date,
      assignmentType: data.assignment_type,
      acceptedFormats: data.accepted_formats,
      questions: data.questions,
      files: data.files,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isVisible: data.is_visible,
      maxScore: data.max_score
    };
  }

  private mapSubmissionFromDB(data: any): AssignmentSubmission {
    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      studentName: data.student_name,
      studentEmail: data.student_email,
      submittedAt: data.submitted_at,
      files: data.files,
      answers: data.answers,
      score: data.score,
      feedback: data.feedback,
      status: data.status,
      gradedBy: data.graded_by,
      gradedAt: data.graded_at
    };
  }
}
