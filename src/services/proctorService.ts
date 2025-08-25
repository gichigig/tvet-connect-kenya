/**
 * CAT Proctoring Service
 * Handles real-time monitoring and security for online CATs
 */

export interface ProctorData {
  studentId: string;
  examId: string;
  unitId: string;
  timestamp: Date;
  eventType: 'start' | 'screen_share' | 'webcam_start' | 'key_log' | 'focus_loss' | 'fullscreen_exit' | 'submit';
  data?: any;
}

export interface ProctorSession {
  id: string;
  studentId: string;
  examId: string;
  unitId: string;
  startTime: Date;
  endTime?: Date;
  screenStream?: MediaStream;
  webcamStream?: MediaStream;
  keyLogs: string[];
  violations: ProctorViolation[];
  status: 'active' | 'completed' | 'terminated';
}

export interface ProctorViolation {
  id: string;
  type: 'focus_loss' | 'fullscreen_exit' | 'forbidden_key' | 'multiple_tabs' | 'copy_paste' | 'external_device';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
  screenshot?: string;
}

class CATProctorService {
  private static instance: CATProctorService;
  private sessions = new Map<string, ProctorSession>();
  private eventListeners = new Map<string, EventListener[]>();

  static getInstance(): CATProctorService {
    if (!CATProctorService.instance) {
      CATProctorService.instance = new CATProctorService();
    }
    return CATProctorService.instance;
  }

  // Start a proctoring session
  async startSession(studentId: string, examId: string, unitId: string): Promise<ProctorSession> {
    const sessionId = `${studentId}-${examId}-${Date.now()}`;
    
    const session: ProctorSession = {
      id: sessionId,
      studentId,
      examId,
      unitId,
      startTime: new Date(),
      keyLogs: [],
      violations: [],
      status: 'active'
    };

    this.sessions.set(sessionId, session);
    
    // Log session start
    await this.logEvent({
      studentId,
      examId,
      unitId,
      timestamp: new Date(),
      eventType: 'start',
      data: { sessionId }
    });

    return session;
  }

  // Request screen sharing
  async requestScreenShare(sessionId: string): Promise<MediaStream | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      });

      session.screenStream = stream;
      
      // Monitor for screen share stop
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.recordViolation(sessionId, {
          type: 'external_device',
          severity: 'high',
          description: 'Screen sharing was stopped during exam'
        });
      });

      await this.logEvent({
        studentId: session.studentId,
        examId: session.examId,
        unitId: session.unitId,
        timestamp: new Date(),
        eventType: 'screen_share',
        data: { status: 'started' }
      });

      return stream;
    } catch (error) {
      await this.logEvent({
        studentId: session.studentId,
        examId: session.examId,
        unitId: session.unitId,
        timestamp: new Date(),
        eventType: 'screen_share',
        data: { status: 'failed', error: error.message }
      });
      return null;
    }
  }

  // Request webcam access
  async requestWebcam(sessionId: string): Promise<MediaStream | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: false
      });

      session.webcamStream = stream;

      await this.logEvent({
        studentId: session.studentId,
        examId: session.examId,
        unitId: session.unitId,
        timestamp: new Date(),
        eventType: 'webcam_start'
      });

      return stream;
    } catch (error) {
      return null;
    }
  }

  // Enable keyboard monitoring
  enableKeyboardMonitoring(sessionId: string): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) return () => {};

    const handleKeyPress = (event: KeyboardEvent) => {
      // Log all key presses
      session.keyLogs.push(`${new Date().toISOString()}: ${event.key}`);
      
      // Check for forbidden key combinations
      const forbiddenCombinations = [
        { ctrl: true, key: 'c' }, // Copy
        { ctrl: true, key: 'v' }, // Paste
        { ctrl: true, key: 'a' }, // Select all
        { alt: true, key: 'Tab' }, // Alt+Tab
        { key: 'F12' }, // Developer tools
        { ctrl: true, shift: true, key: 'I' }, // Developer tools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { ctrl: true, key: 'u' }, // View source
      ];

      const isForbidden = forbiddenCombinations.some(combo => {
        return (!combo.ctrl || event.ctrlKey) &&
               (!combo.shift || event.shiftKey) &&
               (!combo.alt || event.altKey) &&
               event.key.toLowerCase() === combo.key.toLowerCase();
      });

      if (isForbidden) {
        event.preventDefault();
        this.recordViolation(sessionId, {
          type: 'forbidden_key',
          severity: 'medium',
          description: `Attempted forbidden key combination: ${event.key}`
        });
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      this.recordViolation(sessionId, {
        type: 'forbidden_key',
        severity: 'low',
        description: 'Right-click attempted'
      });
    };

    const handleFocusLoss = () => {
      this.recordViolation(sessionId, {
        type: 'focus_loss',
        severity: 'medium',
        description: 'Browser lost focus during exam'
      });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        this.recordViolation(sessionId, {
          type: 'fullscreen_exit',
          severity: 'high',
          description: 'Exited fullscreen mode during exam'
        });
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleFocusLoss);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleFocusLoss);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }

  // Record a violation
  private recordViolation(sessionId: string, violation: Omit<ProctorViolation, 'id' | 'timestamp'>) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const fullViolation: ProctorViolation = {
      id: `violation-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date(),
      ...violation
    };

    session.violations.push(fullViolation);
    console.warn('Proctoring violation recorded:', fullViolation);
    
    // In a real implementation, you would send this to your backend
    this.logEvent({
      studentId: session.studentId,
      examId: session.examId,
      unitId: session.unitId,
      timestamp: new Date(),
      eventType: 'key_log',
      data: fullViolation
    });
  }

  // End a proctoring session
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.status = 'completed';

    // Stop media streams
    if (session.screenStream) {
      session.screenStream.getTracks().forEach(track => track.stop());
    }
    if (session.webcamStream) {
      session.webcamStream.getTracks().forEach(track => track.stop());
    }

    // Log session end
    await this.logEvent({
      studentId: session.studentId,
      examId: session.examId,
      unitId: session.unitId,
      timestamp: new Date(),
      eventType: 'submit',
      data: {
        sessionId,
        duration: session.endTime.getTime() - session.startTime.getTime(),
        violations: session.violations.length,
        keyLogs: session.keyLogs.length
      }
    });
  }

  // Get session data
  getSession(sessionId: string): ProctorSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Get all violations for a session
  getViolations(sessionId: string): ProctorViolation[] {
    const session = this.sessions.get(sessionId);
    return session?.violations || [];
  }

  // Log an event
  private async logEvent(data: ProctorData): Promise<void> {
    // In a real implementation, send to backend
    console.log('Proctoring event:', data);
    
    // For now, just store locally
    const events = JSON.parse(localStorage.getItem('proctoring_events') || '[]');
    events.push(data);
    localStorage.setItem('proctoring_events', JSON.stringify(events));
  }

  // Get lecturer view of all active sessions
  getActiveSessionsForLecturer(unitId: string): ProctorSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.unitId === unitId && session.status === 'active'
    );
  }

  // Force terminate a session (lecturer action)
  terminateSession(sessionId: string, reason: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'terminated';
    session.endTime = new Date();
    
    this.recordViolation(sessionId, {
      type: 'external_device',
      severity: 'high',
      description: `Session terminated by lecturer: ${reason}`
    });
  }
}

export const proctorService = CATProctorService.getInstance();
