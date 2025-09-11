// Supabase integration for attendance management
import { supabase } from './client';

export interface AttendanceRecord {
  id: string;
  unit_code: string;
  unit_name: string;
  class_date: string;
  class_time: string;
  lecturer_id: string;
  lecturer_name: string;
  class_type: 'lecture' | 'practical' | 'tutorial' | 'lab';
  topic?: string;
  students: AttendanceEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceEntry {
  student_id: string;
  student_name: string;
  student_number: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  time_in?: string;
  remarks?: string;
}

export interface AttendanceCreateData {
  unit_code: string;
  unit_name: string;
  class_date: string;
  class_time: string;
  lecturer_id: string;
  lecturer_name: string;
  class_type: 'lecture' | 'practical' | 'tutorial' | 'lab';
  topic?: string;
  students: AttendanceEntry[];
}

export const saveAttendance = async (attendanceData: AttendanceCreateData) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert(attendanceData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('class_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAttendanceByUnit = async (unitCode: string): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('unit_code', unitCode)
    .order('class_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAttendanceByLecturer = async (lecturerId: string): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('lecturer_id', lecturerId)
    .order('class_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAttendanceByStudent = async (studentId: string): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .contains('students', [{ student_id: studentId }])
    .order('class_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getAttendanceByDateRange = async (
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .gte('class_date', startDate)
    .lte('class_date', endDate)
    .order('class_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const updateAttendanceRecord = async (
  recordId: string,
  updates: Partial<AttendanceRecord>
) => {
  const { error } = await supabase
    .from('attendance')
    .update(updates)
    .eq('id', recordId);
  
  if (error) throw error;
};

export const deleteAttendanceRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', recordId);
  
  if (error) throw error;
};

export const getAttendanceStats = async (unitCode?: string, lecturerId?: string) => {
  let query = supabase
    .from('attendance')
    .select('students');

  if (unitCode) {
    query = query.eq('unit_code', unitCode);
  }

  if (lecturerId) {
    query = query.eq('lecturer_id', lecturerId);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  // Calculate attendance statistics
  const stats = {
    totalClasses: data?.length || 0,
    totalStudentEntries: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0
  };

  data?.forEach(record => {
    if (record.students && Array.isArray(record.students)) {
      record.students.forEach((student: AttendanceEntry) => {
        stats.totalStudentEntries++;
        switch (student.status) {
          case 'present':
            stats.presentCount++;
            break;
          case 'absent':
            stats.absentCount++;
            break;
          case 'late':
            stats.lateCount++;
            break;
          case 'excused':
            stats.excusedCount++;
            break;
        }
      });
    }
  });

  return stats;
};

export const getStudentAttendanceRate = async (studentId: string, unitCode?: string) => {
  let query = supabase
    .from('attendance')
    .select('students');

  if (unitCode) {
    query = query.eq('unit_code', unitCode);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  let totalClasses = 0;
  let attendedClasses = 0;

  data?.forEach(record => {
    if (record.students && Array.isArray(record.students)) {
      const studentEntry = record.students.find((s: AttendanceEntry) => s.student_id === studentId);
      if (studentEntry) {
        totalClasses++;
        if (studentEntry.status === 'present' || studentEntry.status === 'late') {
          attendedClasses++;
        }
      }
    }
  });

  return {
    totalClasses,
    attendedClasses,
    attendanceRate: totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0
  };
};

export const subscribeToAttendance = (callback: (records: AttendanceRecord[]) => void) => {
  const subscription = supabase
    .channel('attendance_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendance'
      },
      async () => {
        const records = await getAttendanceRecords();
        callback(records);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
