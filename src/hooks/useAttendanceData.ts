import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkDeviceAttendanceEligibility, recordDeviceAttendanceRestriction,cleanupOldDeviceRestrictions } from "@/utils/deviceFingerprinting";  
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface AttendanceSession {
  id: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'manual' | 'quiz';
  isActive: boolean;
  locationRequired?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  attendanceCode?: string;
  description?: string;
}

interface QuizAttendance {
  id: string;
  title: string;
  unitCode: string;
  unitName: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  timeLimit: number;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  timeRemaining?: number;
}

interface AttendanceRecord {
  id: string;
  sessionId: string;
  unitCode: string;
  unitName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  type: 'manual' | 'quiz';
  score?: number;
}

export const useAttendanceData = () => {
  const { user } = useAuth();
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [activeQuizzes, setActiveQuizzes] = useState<QuizAttendance[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active attendance sessions from backend
  const loadActiveSessions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${user.id}/attendance-sessions`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.sessions || []);
        console.log(`Loaded ${data.sessions?.length || 0} attendance sessions for student:`, user.id);
      } else {
        console.error('Failed to load attendance sessions:', response.status);
        setError('Failed to load attendance sessions');
        setActiveSessions([]);
      }
    } catch (error) {
      console.error('Error loading attendance sessions:', error);
      setError('Error loading attendance sessions');
      setActiveSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load attendance history from local storage or backend
  const loadAttendanceHistory = () => {
    if (!user?.id) return;
    
    try {
      const storedHistory = localStorage.getItem(`attendance_history_${user.id}`);
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        setAttendanceHistory(history);
      }
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  // Save attendance record
  const saveAttendanceRecord = (record: AttendanceRecord) => {
    if (!user?.id) return;
    
    const updatedHistory = [record, ...attendanceHistory];
    setAttendanceHistory(updatedHistory);
    
    // Save to local storage
    try {
      localStorage.setItem(`attendance_history_${user.id}`, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving attendance history:', error);
    }
  };

  // Mark attendance for a session
  const markAttendance = async (sessionId: string, attendanceCode?: string, location?: { lat: number; lng: number }) => {
    if (!user?.id) return null;
    
    try {
      // Check device eligibility first
      const eligibility = await checkDeviceAttendanceEligibility(sessionId, user.id);
      
      if (!eligibility.allowed) {
        throw new Error(eligibility.reason || 'Device not eligible for attendance marking');
      }

      // Find the session
      const session = activeSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Record device restriction to prevent abuse
      await recordDeviceAttendanceRestriction(sessionId, user.id, location);

      // Create attendance record
      const record: AttendanceRecord = {
        id: Date.now().toString(),
        sessionId: sessionId,
        unitCode: session.unitCode,
        unitName: session.unitName,
        date: session.date,
        status: 'present',
        timestamp: new Date().toISOString(),
        type: session.type
      };

      // Save the record
      saveAttendanceRecord(record);

      // TODO: Send to backend API for persistence
      // await fetch(`${API_BASE_URL}/api/attendance/mark`, {
      //   method: 'POST',
      //   headers: {
      //     'x-api-key': import.meta.env.VITE_API_KEY,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     sessionId,
      //     studentId: user.id,
      //     attendanceCode,
      //     location
      //   })
      // });

      return record;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  };

  // Submit quiz and mark attendance
  const submitQuizAttendance = (quiz: QuizAttendance, answers: { [key: string]: number }) => {
    if (!user?.id) return null;

    // Calculate score
    const correctAnswers = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Create attendance record
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      sessionId: quiz.id,
      unitCode: quiz.unitCode,
      unitName: quiz.unitName,
      date: new Date().toISOString().split('T')[0],
      status: score >= 60 ? 'present' : 'absent',
      timestamp: new Date().toISOString(),
      type: 'quiz',
      score: score
    };

    // Save the record
    saveAttendanceRecord(record);

    return { record, score };
  };

  // Set up real-time updates
  useEffect(() => {
    if (!user?.id) return;
    
    loadActiveSessions();
    loadAttendanceHistory();
    
    // Clean up old device restrictions on initialization
    cleanupOldDeviceRestrictions();
    
    // Poll for updates every 2 minutes
    const interval = setInterval(loadActiveSessions, 120000);
    
    // Clean up device restrictions every hour
    const cleanupInterval = setInterval(() => {
      cleanupOldDeviceRestrictions();
    }, 60 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [user?.id]);

  return {
    activeSessions,
    activeQuizzes,
    attendanceHistory,
    isLoading,
    error,
    markAttendance,
    submitQuizAttendance,
    refreshSessions: loadActiveSessions,
    saveAttendanceRecord
  };
};
