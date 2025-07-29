import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, Monitor, AlertTriangle, Eye, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ExamSession {
  id: string;
  studentId: string;
  examId: string;
  startTime: string;
  endTime?: string;
  answers: { [questionId: string]: number };
  proctorImages: string[];
  screenRecordings: string[];
  violations: ProctorViolation[];
}

interface ProctorViolation {
  id: string;
  type: 'head_turn' | 'multiple_faces' | 'no_face' | 'tab_switch' | 'screen_blur';
  timestamp: string;
  imageUrl?: string;
  description: string;
}

interface OnlineExamProps {
  examId: string;
  examTitle: string;
  duration: number; // in minutes
  questions: Question[];
  onExamComplete: (session: ExamSession) => void;
}

export const OnlineExam: React.FC<OnlineExamProps> = ({
  examId,
  examTitle,
  duration,
  questions,
  onExamComplete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  
  // Proctoring state
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    screen: false,
    microphone: false,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);

  // Request permissions for camera, microphone, and screen sharing
  const requestPermissions = async () => {
    try {
      // Request camera and microphone
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
      cameraStreamRef.current = cameraStream;
      
      // Request screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = screenStream;
      
      setPermissionsGranted({
        camera: true,
        screen: true,
        microphone: true,
      });
      
      toast({
        title: 'Permissions Granted',
        description: 'Camera and screen sharing access granted. You can now start the exam.',
      });
      
    } catch (error) {
      console.error('Permission denied:', error);
      toast({
        title: 'Permission Required',
        description: 'Camera and screen sharing permissions are required to take this exam.',
        variant: 'destructive',
      });
    }
  };

  // Capture photo when violation detected
  const captureViolationPhoto = useCallback(async (violationType: ProctorViolation['type'], description: string) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Convert to blob and upload to Firebase
      canvas.toBlob(async (blob) => {
        if (blob && examSession) {
          try {
            // Create form data for upload
            const formData = new FormData();
            formData.append('image', blob, `violation_${Date.now()}.jpg`);
            formData.append('studentId', user?.id || '');
            formData.append('examId', examId);
            formData.append('violationType', violationType);
            formData.append('timestamp', new Date().toISOString());
            
            // Here you would upload to your storage service
            // For now, we'll create a local URL
            const imageUrl = URL.createObjectURL(blob);
            
            const violation: ProctorViolation = {
              id: `violation_${Date.now()}`,
              type: violationType,
              timestamp: new Date().toISOString(),
              imageUrl,
              description,
            };
            
            setViolations(prev => [...prev, violation]);
            
            // Update exam session
            setExamSession(prev => prev ? {
              ...prev,
              violations: [...prev.violations, violation],
              proctorImages: [...prev.proctorImages, imageUrl],
            } : null);
            
            toast({
              title: 'Violation Detected',
              description: description,
              variant: 'destructive',
            });
            
          } catch (error) {
            console.error('Failed to upload violation photo:', error);
          }
        }
      }, 'image/jpeg', 0.8);
    }
  }, [examSession, examId, user?.id, toast]);

  // Face detection and monitoring
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current) return;
    
    // This is a simplified face detection - in a real implementation,
    // you would use a library like face-api.js or MediaPipe
    const detectFace = () => {
      if (!videoRef.current || !isMonitoring) return;
      
      // Simulated face detection logic
      // In reality, you would analyze the video frame for:
      // - Face presence
      // - Head orientation
      // - Number of faces
      // - Eye gaze direction
      
      const random = Math.random();
      
      // Simulate head turn detection (5% chance)
      if (random < 0.05) {
        captureViolationPhoto('head_turn', 'Student turned head away from screen');
      }
      
      // Simulate multiple faces detection (2% chance)
      if (random > 0.98) {
        captureViolationPhoto('multiple_faces', 'Multiple faces detected in frame');
      }
      
      // Simulate no face detection (3% chance)
      if (random > 0.97 && random <= 0.98) {
        captureViolationPhoto('no_face', 'No face detected in frame');
      }
    };
    
    faceDetectionIntervalRef.current = setInterval(detectFace, 2000); // Check every 2 seconds
  }, [isMonitoring, captureViolationPhoto]);

  // Start screen recording
  const startScreenRecording = useCallback(() => {
    if (!screenStreamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(screenStreamRef.current);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      
      setExamSession(prev => prev ? {
        ...prev,
        screenRecordings: [...prev.screenRecordings, videoUrl],
      } : null);
    };
    
    mediaRecorder.start(10000); // Record in 10-second chunks
    screenRecorderRef.current = mediaRecorder;
  }, []);

  // Start exam
  const startExam = () => {
    if (!permissionsGranted.camera || !permissionsGranted.screen) {
      toast({
        title: 'Permissions Required',
        description: 'Please grant camera and screen sharing permissions before starting the exam.',
        variant: 'destructive',
      });
      return;
    }
    
    const session: ExamSession = {
      id: `exam_session_${Date.now()}`,
      studentId: user?.id || '',
      examId,
      startTime: new Date().toISOString(),
      answers: {},
      proctorImages: [],
      screenRecordings: [],
      violations: [],
    };
    
    setExamSession(session);
    setExamStarted(true);
    setIsMonitoring(true);
    
    // Start proctoring
    startFaceDetection();
    startScreenRecording();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExamSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
    
    setExamSession(prev => prev ? {
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answerIndex,
      },
    } : null);
  };

  // Submit exam
  const handleExamSubmit = () => {
    if (!examSession) return;
    
    // Stop monitoring
    setIsMonitoring(false);
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
    }
    if (screenRecorderRef.current) {
      screenRecorderRef.current.stop();
    }
    
    // Stop streams
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    const finalSession: ExamSession = {
      ...examSession,
      endTime: new Date().toISOString(),
      answers,
      violations,
    };
    
    onExamComplete(finalSession);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!examStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {examTitle}
          </CardTitle>
          <CardDescription>
            Duration: {duration} minutes | Questions: {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This exam requires camera and screen sharing permissions for proctoring. 
              Your activities will be monitored throughout the exam.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Permissions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Camera Access</span>
                <Badge variant={permissionsGranted.camera ? "default" : "secondary"}>
                  {permissionsGranted.camera ? "Granted" : "Required"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>Screen Sharing</span>
                <Badge variant={permissionsGranted.screen ? "default" : "secondary"}>
                  {permissionsGranted.screen ? "Granted" : "Required"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Proctoring Active</span>
                <Badge variant="outline">Monitoring</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={requestPermissions}
                disabled={permissionsGranted.camera && permissionsGranted.screen}
                className="w-full"
              >
                Grant Permissions
              </Button>
              
              <Button 
                onClick={startExam}
                disabled={!permissionsGranted.camera || !permissionsGranted.screen}
                className="w-full"
                variant={permissionsGranted.camera && permissionsGranted.screen ? "default" : "secondary"}
              >
                Start Exam
              </Button>
            </div>
          </div>
          
          {/* Hidden video element for camera */}
          <video
            ref={videoRef}
            autoPlay
            muted
            className="hidden"
          />
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{examTitle}</CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {questions.length}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Badge variant={violations.length > 0 ? "destructive" : "default"}>
                Violations: {violations.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {questions[currentQuestion]?.question}
              </h3>
              
              <div className="space-y-3">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`question_${questions[currentQuestion].id}`}
                      value={index}
                      checked={answers[questions[currentQuestion].id] === index}
                      onChange={() => handleAnswerSelect(questions[currentQuestion].id, index)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleExamSubmit} variant="default">
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proctoring Monitor (small video display) */}
      <div className="fixed bottom-4 right-4 w-48 h-36 border-2 border-gray-300 rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="destructive" className="text-xs">
            RECORDING
          </Badge>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default OnlineExam;
