// Supabase integration for retake requests
import { supabase } from './client';

export interface RetakeRequest {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  unit_code: string;
  unit_name: string;
  exam_type: 'supplementary' | 'special';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_date: string;
  exam_date?: string;
  exam_time?: string;
  venue?: string;
  lecturer_comments?: string;
  admin_comments?: string;
  processed_by?: string;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRetakeRequestData {
  student_id: string;
  student_name: string;
  student_email: string;
  unit_code: string;
  unit_name: string;
  exam_type: 'supplementary' | 'special';
  reason: string;
  requested_date: string;
}

export const createRetakeRequest = async (requestData: CreateRetakeRequestData) => {
  const { data, error } = await supabase
    .from('retake_requests')
    .insert({
      ...requestData,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getRetakeRequests = async (): Promise<RetakeRequest[]> => {
  const { data, error } = await supabase
    .from('retake_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getRetakeRequestById = async (requestId: string): Promise<RetakeRequest | null> => {
  const { data, error } = await supabase
    .from('retake_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getRetakeRequestsByStudent = async (studentId: string): Promise<RetakeRequest[]> => {
  const { data, error } = await supabase
    .from('retake_requests')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getRetakeRequestsByStatus = async (status: RetakeRequest['status']): Promise<RetakeRequest[]> => {
  const { data, error } = await supabase
    .from('retake_requests')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getRetakeRequestsByUnit = async (unitCode: string): Promise<RetakeRequest[]> => {
  const { data, error } = await supabase
    .from('retake_requests')
    .select('*')
    .eq('unit_code', unitCode)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const updateRetakeRequest = async (requestId: string, updates: Partial<RetakeRequest>) => {
  const { error } = await supabase
    .from('retake_requests')
    .update(updates)
    .eq('id', requestId);
  
  if (error) throw error;
};

export const approveRetakeRequest = async (
  requestId: string, 
  examDetails: {
    exam_date: string;
    exam_time: string;
    venue: string;
  },
  processedBy: string,
  adminComments?: string
) => {
  const { error } = await supabase
    .from('retake_requests')
    .update({
      status: 'approved',
      ...examDetails,
      processed_by: processedBy,
      processed_at: new Date().toISOString(),
      admin_comments: adminComments
    })
    .eq('id', requestId);
  
  if (error) throw error;
};

export const rejectRetakeRequest = async (
  requestId: string,
  processedBy: string,
  adminComments: string
) => {
  const { error } = await supabase
    .from('retake_requests')
    .update({
      status: 'rejected',
      processed_by: processedBy,
      processed_at: new Date().toISOString(),
      admin_comments: adminComments
    })
    .eq('id', requestId);
  
  if (error) throw error;
};

export const deleteRetakeRequest = async (requestId: string) => {
  const { error } = await supabase
    .from('retake_requests')
    .delete()
    .eq('id', requestId);
  
  if (error) throw error;
};

export const addLecturerComments = async (requestId: string, comments: string) => {
  const { error } = await supabase
    .from('retake_requests')
    .update({
      lecturer_comments: comments
    })
    .eq('id', requestId);
  
  if (error) throw error;
};

export const subscribeToRetakeRequests = (callback: (requests: RetakeRequest[]) => void) => {
  const subscription = supabase
    .channel('retake_requests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'retake_requests'
      },
      async () => {
        const requests = await getRetakeRequests();
        callback(requests);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const getPendingRetakeRequests = async (): Promise<RetakeRequest[]> => {
  return getRetakeRequestsByStatus('pending');
};

export const getApprovedRetakeRequests = async (): Promise<RetakeRequest[]> => {
  return getRetakeRequestsByStatus('approved');
};

export const getRejectedRetakeRequests = async (): Promise<RetakeRequest[]> => {
  return getRetakeRequestsByStatus('rejected');
};

export const getRetakeRequestStats = async () => {
  const { data, error } = await supabase
    .from('retake_requests')
    .select('status')
    .then(({ data, error }) => {
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0
      };
      
      return { data: stats, error: null };
    });
  
  if (error) throw error;
  return data;
};
