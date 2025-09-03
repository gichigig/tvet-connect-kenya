/**
 * Supabase Attendance Hook
 * Replaces Firebase attendance functionality with Supabase real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseAttendance, type AttendanceSession, type StudentAttendance } from '@/services/SupabaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useSupabaseAuth';

interface UseAttendanceReturn {
  attendanceSessions: AttendanceSession[];
  studentAttendance: StudentAttendance[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveAttendance: (attendanceData: {
    unitId: string;
    sessionDate: string;
    students: Array<{ studentId: string; present: boolean }>;
    location?: string;
    fingerprint?: string;
    geolocation?: { lat: number; lng: number };
  }) => Promise<AttendanceSession | null>;
  getAttendanceSessions: (unitId?: string) => Promise<void>;
  getStudentAttendance: (studentId: string, unitId?: string) => Promise<void>;
  getAttendanceReport: (unitId: string, startDate: string, endDate: string) => Promise<any>;
  refreshAttendance: () => Promise<void>;
}

export const useAttendance = (
  unitId?: string,
  autoRefresh: boolean = true
): UseAttendanceReturn => {
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const saveAttendance = useCallback(async (attendanceData: {
    unitId: string;
    sessionDate: string;
    students: Array<{ studentId: string; present: boolean }>;
    location?: string;
    fingerprint?: string;
    geolocation?: { lat: number; lng: number };
  }): Promise<AttendanceSession | null> => {
    if (!user || !userProfile) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to save attendance.',
        variant: 'destructive',
      });
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const session = await SupabaseAttendance.saveAttendance({
        ...attendanceData,
        lecturerId: user.id,
      });

      toast({
        title: 'Attendance Saved',
        description: `Attendance saved successfully for ${attendanceData.students.length} students.`,
      });

      // Refresh attendance sessions
      await getAttendanceSessions(unitId);

      return session;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save attendance';
      setError(errorMessage);
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setSaving(false);
    }
  }, [user, userProfile, unitId, toast]);

  const getAttendanceSessions = useCallback(async (filterUnitId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const lecturerId = userProfile?.role === 'lecturer' ? user?.id : undefined;
      const sessions = await SupabaseAttendance.getAttendanceSessions(
        filterUnitId || unitId,
        lecturerId
      );
      setAttendanceSessions(sessions);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load attendance sessions';
      setError(errorMessage);
      console.error('Error loading attendance sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [unitId, user?.id, userProfile?.role]);

  const getStudentAttendance = useCallback(async (studentId: string, filterUnitId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const attendance = await SupabaseAttendance.getStudentAttendance(
        studentId,
        filterUnitId || unitId
      );
      setStudentAttendance(attendance);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load student attendance';
      setError(errorMessage);
      console.error('Error loading student attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  const getAttendanceReport = useCallback(async (unitId: string, startDate: string, endDate: string) => {
    try {
      return await SupabaseAttendance.getAttendanceReport(unitId, startDate, endDate);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate attendance report';
      setError(errorMessage);
      toast({
        title: 'Report Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const refreshAttendance = useCallback(async () => {
    if (userProfile?.role === 'student' && user?.id) {
      await getStudentAttendance(user.id, unitId);
    } else {
      await getAttendanceSessions(unitId);
    }
  }, [getAttendanceSessions, getStudentAttendance, unitId, user?.id, userProfile?.role]);

  // Initial load
  useEffect(() => {
    if (user && userProfile) {
      refreshAttendance();
    }
  }, [user, userProfile, refreshAttendance]);

  // Set up real-time subscription
  useEffect(() => {
    if (!unitId || !autoRefresh) return;

    const channel = SupabaseAttendance.subscribeToAttendanceUpdates(unitId, (payload) => {
      console.log('Attendance update received:', payload);
      
      // Refresh attendance data when changes occur
      refreshAttendance();
      
      // Show toast notification for new attendance sessions
      if (payload.eventType === 'INSERT' && payload.new) {
        toast({
          title: 'New Attendance Session',
          description: 'A new attendance session has been created.',
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [unitId, autoRefresh, refreshAttendance, toast]);

  return {
    attendanceSessions,
    studentAttendance,
    loading,
    saving,
    error,
    saveAttendance,
    getAttendanceSessions,
    getStudentAttendance,
    getAttendanceReport,
    refreshAttendance,
  };
};
