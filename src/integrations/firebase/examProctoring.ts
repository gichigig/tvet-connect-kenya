import { db } from './config';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { uploadViolationImage as uploadViolationImageS3, uploadScreenRecording as uploadScreenRecordingS3 } from '../aws/storage';

const EXAM_SESSIONS_COLLECTION = 'examSessions';
const PROCTOR_VIOLATIONS_COLLECTION = 'proctorViolations';
const EXAM_RECORDINGS_COLLECTION = 'examRecordings';

export interface ExamSession {
  id?: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  startTime: string;
  endTime?: string;
  duration: number;
  answers: { [questionId: string]: number };
  score?: number;
  status: 'in_progress' | 'completed' | 'terminated';
  proctorImages: string[];
  screenRecordingUrls: string[];
  violations: ProctorViolation[];
  createdAt: string;
  updatedAt: string;
}

export interface ProctorViolation {
  id?: string;
  sessionId: string;
  studentId: string;
  examId: string;
  type: 'head_turn' | 'multiple_faces' | 'no_face' | 'tab_switch' | 'screen_blur' | 'unauthorized_app';
  timestamp: string;
  imageUrl?: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ExamRecording {
  id?: string;
  sessionId: string;
  studentId: string;
  examId: string;
  type: 'screen' | 'camera';
  recordingUrl: string;
  duration: number;
  timestamp: string;
  createdAt: string;
}

// Upload violation image to S3
export async function uploadViolationImage(
  blob: Blob,
  sessionId: string,
  violationType: string,
  timestamp: string
): Promise<string> {
  try {
    const result = await uploadViolationImageS3(blob, sessionId, violationType);
    
    if (!result.success || !result.url) {
      throw new Error(result.error || 'Failed to upload violation image');
    }
    
    return result.url;
  } catch (error) {
    console.error('Error uploading violation image:', error);
    throw new Error('Failed to upload violation image');
  }
}

// Upload screen recording to S3
export async function uploadScreenRecording(
  blob: Blob,
  sessionId: string,
  timestamp: string
): Promise<string> {
  try {
    const result = await uploadScreenRecordingS3(blob, sessionId);
    
    if (!result.success || !result.url) {
      throw new Error(result.error || 'Failed to upload screen recording');
    }
    
    return result.url;
  } catch (error) {
    console.error('Error uploading screen recording:', error);
    throw new Error('Failed to upload screen recording');
  }
}

// Save exam session
export async function saveExamSession(session: Omit<ExamSession, 'id'>): Promise<ExamSession> {
  try {
    const docRef = await addDoc(collection(db, EXAM_SESSIONS_COLLECTION), {
      ...session,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return {
      ...session,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error saving exam session:', error);
    throw new Error('Failed to save exam session');
  }
}

// Update exam session
export async function updateExamSession(sessionId: string, updates: Partial<ExamSession>): Promise<void> {
  try {
    const sessionRef = doc(db, EXAM_SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating exam session:', error);
    throw new Error('Failed to update exam session');
  }
}

// Save proctor violation
export async function saveProctorViolation(violation: Omit<ProctorViolation, 'id'>): Promise<ProctorViolation> {
  try {
    const docRef = await addDoc(collection(db, PROCTOR_VIOLATIONS_COLLECTION), violation);
    
    return {
      ...violation,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error saving proctor violation:', error);
    throw new Error('Failed to save proctor violation');
  }
}

// Get exam sessions for review (for lecturers and HODs)
export async function getExamSessionsForReview(examId?: string): Promise<ExamSession[]> {
  try {
    let q;
    if (examId) {
      q = query(
        collection(db, EXAM_SESSIONS_COLLECTION),
        where('examId', '==', examId),
        orderBy('startTime', 'desc')
      );
    } else {
      q = query(
        collection(db, EXAM_SESSIONS_COLLECTION),
        orderBy('startTime', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<ExamSession, 'id'>
    })) as ExamSession[];
  } catch (error) {
    console.error('Error fetching exam sessions:', error);
    throw new Error('Failed to fetch exam sessions');
  }
}

// Get violations for a specific session
export async function getViolationsForSession(sessionId: string): Promise<ProctorViolation[]> {
  try {
    const q = query(
      collection(db, PROCTOR_VIOLATIONS_COLLECTION),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<ProctorViolation, 'id'>
    })) as ProctorViolation[];
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw new Error('Failed to fetch violations');
  }
}

// Get violations for review (unreviewed violations)
export async function getViolationsForReview(examId?: string): Promise<ProctorViolation[]> {
  try {
    let q;
    if (examId) {
      q = query(
        collection(db, PROCTOR_VIOLATIONS_COLLECTION),
        where('examId', '==', examId),
        where('reviewed', '==', false),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, PROCTOR_VIOLATIONS_COLLECTION),
        where('reviewed', '==', false),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<ProctorViolation, 'id'>
    })) as ProctorViolation[];
  } catch (error) {
    console.error('Error fetching violations for review:', error);
    throw new Error('Failed to fetch violations for review');
  }
}

// Review violation (for lecturers and HODs)
export async function reviewViolation(
  violationId: string,
  reviewedBy: string,
  reviewNotes: string,
  severity?: 'low' | 'medium' | 'high'
): Promise<void> {
  try {
    const violationRef = doc(db, PROCTOR_VIOLATIONS_COLLECTION, violationId);
    await updateDoc(violationRef, {
      reviewed: true,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
      ...(severity && { severity }),
    });
  } catch (error) {
    console.error('Error reviewing violation:', error);
    throw new Error('Failed to review violation');
  }
}

// Get student exam sessions
export async function getStudentExamSessions(studentId: string): Promise<ExamSession[]> {
  try {
    const q = query(
      collection(db, EXAM_SESSIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('startTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExamSession[];
  } catch (error) {
    console.error('Error fetching student exam sessions:', error);
    throw new Error('Failed to fetch student exam sessions');
  }
}

// Save exam recording metadata
export async function saveExamRecording(recording: Omit<ExamRecording, 'id'>): Promise<ExamRecording> {
  try {
    const docRef = await addDoc(collection(db, EXAM_RECORDINGS_COLLECTION), {
      ...recording,
      createdAt: new Date().toISOString(),
    });
    
    return {
      ...recording,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error saving exam recording:', error);
    throw new Error('Failed to save exam recording');
  }
}

// Get recordings for a session
export async function getSessionRecordings(sessionId: string): Promise<ExamRecording[]> {
  try {
    const q = query(
      collection(db, EXAM_RECORDINGS_COLLECTION),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExamRecording[];
  } catch (error) {
    console.error('Error fetching session recordings:', error);
    throw new Error('Failed to fetch session recordings');
  }
}
