// Supabase exams integration
import { supabase } from './client';

export interface Exam {
  id: string;
  title: string;
  type: 'supplementary' | 'special';
  unit_code: string;
  unit_name: string;
  date: string;
  time: string;
  duration: number;
  venue: string;
  students: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

export const addExam = async (exam: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('exams')
    .insert(exam)
    .select()
    .single();
  
  if (error) throw error;
  return data.id;
};

export const fetchExams = async (): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const updateExam = async (examId: string, updates: Partial<Exam>) => {
  const { error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', examId);
  
  if (error) throw error;
};

export const deleteExam = async (examId: string) => {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId);
  
  if (error) throw error;
};

export const subscribeToExams = (callback: (exams: Exam[]) => void) => {
  const subscription = supabase
    .channel('exams_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'exams'
      },
      async () => {
        const exams = await fetchExams();
        callback(exams);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const getExamsByUnit = async (unitCode: string): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('unit_code', unitCode)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getExamsByStudent = async (studentId: string): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .contains('students', [studentId])
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getExamsByStatus = async (status: Exam['status']): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('status', status)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};
