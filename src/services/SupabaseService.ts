/**
 * Supabase Service Layer
 * Replaces Firebase services with Supabase equivalents
 */

import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Types (these should match your Supabase schema)
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance';
  admission_number?: string;
  employee_id?: string;
  course?: string;
  department?: string;
  level?: number;
  year_of_study?: number;
  phone?: string;
  approved: boolean;
  blocked: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSession {
  id: string;
  unit_id: string;
  lecturer_id: string;
  session_date: string;
  session_time?: string;
  location?: string;
  total_students: number;
  present_students: number;
  attendance_rate: number;
  fingerprint?: string;
  geolocation_lat?: number;
  geolocation_lng?: number;
  allowed_radius?: number;
  status: 'open' | 'closed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAttendance {
  id: string;
  attendance_session_id: string;
  student_id: string;
  present: boolean;
  marked_at: string;
  marked_by?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  description?: string;
  department_id?: string;
  lecturer_id?: string;
  level?: number;
  semester?: number;
  credit_hours: number;
  is_active: boolean;
}

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'attendance' | 'grade';
  data?: any;
  read_at?: string;
  created_at: string;
}

/**
 * Authentication Services
 */
export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await UserService.createProfile(data.user.id, {
        email,
        ...userData
      } as UserProfile);
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

/**
 * User Management Services
 */
export class UserService {
  static async createProfile(userId: string, userData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId, ...userData })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllUsers(role?: string): Promise<UserProfile[]> {
    let query = supabase.from('users').select('*');
    
    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,admission_number.ilike.%${searchTerm}%`)
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  static async getUsersByRole(role: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }
}

/**
 * Attendance Services (replaces Firebase attendance functions)
 */
export class AttendanceService {
  static async saveAttendance(attendanceData: {
    unitId: string;
    lecturerId: string;
    sessionDate: string;
    students: Array<{ studentId: string; present: boolean }>;
    location?: string;
    fingerprint?: string;
    geolocation?: { lat: number; lng: number };
  }): Promise<AttendanceSession> {
    
    // Create attendance session
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .insert({
        unit_id: attendanceData.unitId,
        lecturer_id: attendanceData.lecturerId,
        session_date: attendanceData.sessionDate,
        location: attendanceData.location,
        fingerprint: attendanceData.fingerprint,
        geolocation_lat: attendanceData.geolocation?.lat,
        geolocation_lng: attendanceData.geolocation?.lng,
        total_students: attendanceData.students.length,
        present_students: attendanceData.students.filter(s => s.present).length,
        attendance_rate: (attendanceData.students.filter(s => s.present).length / attendanceData.students.length) * 100
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Insert individual student attendance
    const studentAttendanceData = attendanceData.students.map(student => ({
      attendance_session_id: session.id,
      student_id: student.studentId,
      present: student.present
    }));

    const { error: attendanceError } = await supabase
      .from('student_attendance')
      .insert(studentAttendanceData);

    if (attendanceError) throw attendanceError;

    return session;
  }

  static async getAttendanceSessions(unitId?: string, lecturerId?: string): Promise<AttendanceSession[]> {
    let query = supabase
      .from('attendance_sessions')
      .select(`
        *,
        units:unit_id (code, name),
        lecturer:lecturer_id (first_name, last_name)
      `);

    if (unitId) query = query.eq('unit_id', unitId);
    if (lecturerId) query = query.eq('lecturer_id', lecturerId);

    const { data, error } = await query.order('session_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getStudentAttendance(studentId: string, unitId?: string): Promise<StudentAttendance[]> {
    let query = supabase
      .from('student_attendance')
      .select(`
        *,
        attendance_session:attendance_session_id (
          session_date,
          units:unit_id (code, name)
        )
      `)
      .eq('student_id', studentId);

    if (unitId) {
      // Join with attendance_sessions to filter by unit_id
      query = query.eq('attendance_sessions.unit_id', unitId);
    }

    const { data, error } = await query.order('marked_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getAttendanceReport(unitId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select(`
        *,
        student_attendance (
          student_id,
          present,
          users:student_id (first_name, last_name, admission_number)
        )
      `)
      .eq('unit_id', unitId)
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Real-time subscription for attendance updates
  static subscribeToAttendanceUpdates(unitId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`attendance_unit_${unitId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance_sessions',
        filter: `unit_id=eq.${unitId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_attendance'
      }, callback)
      .subscribe();
  }
}

/**
 * Notification Services (replaces Firestore notifications)
 */
export class NotificationService {
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId);

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .is('read_at', null);

    if (error) throw error;
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Real-time subscription for notifications
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

/**
 * Unit Management Services
 */
export class UnitService {
  static async getAllUnits(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        lecturer:lecturer_id (first_name, last_name),
        department:department_id (name, code)
      `)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  static async getUnitsByLecturer(lecturerId: string): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('lecturer_id', lecturerId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  static async getUnitsByStudent(studentId: string): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('student_unit_registrations')
      .select(`
        units (*)
      `)
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (error) throw error;
    return data?.map(reg => reg.units).filter(Boolean) || [];
  }

  static async createUnit(unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .insert(unitData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUnit(unitId: string, updates: Partial<Unit>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', unitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * File Services (integrates with R2 storage)
 */
export class FileService {
  static async saveFileMetadata(fileData: {
    name: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    storage_path: string;
    storage_bucket?: string;
    public_url?: string;
    category: 'assignment' | 'material' | 'submission' | 'notes' | 'document';
    uploaded_by: string;
    entity_id?: string;
    entity_type?: string;
    is_public?: boolean;
    description?: string;
  }) {
    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getFilesByEntity(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_visible', true);

    if (error) throw error;
    return data || [];
  }

  static async getUserFiles(userId: string) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('uploaded_by', userId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

// Export all services
export {
  AuthService as SupabaseAuth,
  UserService as SupabaseUsers,
  AttendanceService as SupabaseAttendance,
  NotificationService as SupabaseNotifications,
  UnitService as SupabaseUnits,
  FileService as SupabaseFiles
};
