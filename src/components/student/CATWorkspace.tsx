import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Clock, 
  Eye, 
  Camera, 
  Monitor, 
  Keyboard,
  AlertTriangle,
  CheckCircle,
  Circle,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: 'multiple_choice' | 'essay' | 'short_answer';
  options?: string[];
  correctAnswer?: string;
  marks: number;
  timeLimit?: number;
}

interface WeeklyExam {
  id: string;
  title: string;
  description: string;
  type: 'exam' | 'cat';
  examDate: Date;
  examTime: string;
  duration: number;
  venue?: string;
  maxMarks: number;
  instructions: string;
  isLocked: boolean;
  questions: ExamQuestion[];
}

interface CATWorkspaceProps {
  exam: WeeklyExam;
  unitId: string;
  onSubmit: (answers: Record<string, string>) => void;
  onExit: () => void;
}

interface ProctorPermissions {
  screenShare: boolean;
  webcam: boolean;
  keyboard: boolean;
}

export const CATWorkspace: React.FC<CATWorkspaceProps> = ({
  exam,
  unitId,
  onSubmit,
  onExit
}) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60); // Convert to seconds
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [permissions, setPermissions] = useState<ProctorPermissions>({
    screenShare: false,
    webcam: false,
    keyboard: false
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [keylogEnabled, setKeylogEnabled] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [startTime] = useState(new Date());
  const [isExamStarted, setIsExamStarted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const keyLogRef = useRef<string[]>([]);

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request screen sharing
  const requestScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      });
      
      screenStreamRef.current = stream;
      setPermissions(prev => ({ ...prev, screenShare: true }));
      
      // Monitor for screen share stop
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setPermissions(prev => ({ ...prev, screenShare: false }));
        toast({
          title: "Screen Sharing Stopped",
          description: "Please restart screen sharing to continue the exam",
          variant: "destructive"
        });
      });

      toast({
        title: "Screen Sharing Active",
        description: "Your screen is now being shared with the lecturer",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Screen Share Required",
        description: "Screen sharing is required to take this CAT",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Request webcam access
  const requestWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: false
      });
      
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setPermissions(prev => ({ ...prev, webcam: true }));
      
      toast({
        title: "Webcam Active",
        description: "Your camera is now accessible to the lecturer",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Webcam Required",
        description: "Webcam access is required to take this CAT",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enable keyboard monitoring
  const enableKeyboardMonitoring = useCallback(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Log key presses for proctoring
      keyLogRef.current.push(`${new Date().toISOString()}: ${event.key}`);
      
      // Prevent common cheating shortcuts
      if (
        (event.ctrlKey && (event.key === 'c' || event.key === 'v' || event.key === 'a')) ||
        (event.altKey && event.key === 'Tab') ||
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && event.key === 'I')
      ) {
        event.preventDefault();
        toast({
          title: "Action Blocked",
          description: "That action is not allowed during the exam",
          variant: "destructive"
        });
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('contextmenu', handleContextMenu);
    
    setKeylogEnabled(true);
    setPermissions(prev => ({ ...prev, keyboard: true }));

    toast({
      title: "Keyboard Monitoring Active",
      description: "Keyboard activity is being monitored",
      variant: "default"
    });

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [toast]);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      
      // Prevent exit fullscreen
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && isExamStarted) {
          toast({
            title: "Fullscreen Required",
            description: "Please return to fullscreen mode to continue the exam",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      toast({
        title: "Fullscreen Required",
        description: "Fullscreen mode is required for this CAT",
        variant: "destructive"
      });
    }
  }, [isExamStarted, toast]);

  // Start exam after all permissions
  const startExam = useCallback(async () => {
    const requiredPermissions = ['screenShare', 'webcam', 'keyboard'];
    const missingPermissions = requiredPermissions.filter(
      permission => !permissions[permission as keyof ProctorPermissions]
    );

    if (missingPermissions.length > 0) {
      toast({
        title: "Missing Permissions",
        description: `Please enable: ${missingPermissions.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    await enterFullscreen();
    setIsExamStarted(true);
    
    toast({
      title: "CAT Started",
      description: "Your exam has begun. Good luck!",
      variant: "default"
    });
  }, [permissions, enterFullscreen, toast]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Toggle question flag
  const toggleQuestionFlag = (questionNumber: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionNumber)) {
        newSet.delete(questionNumber);
      } else {
        newSet.add(questionNumber);
      }
      return newSet;
    });
  };

  // Navigate questions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < exam.questions.length) {
      setCurrentQuestion(index);
    }
  };

  // Auto submit when time runs out
  const handleAutoSubmit = () => {
    toast({
      title: "Time Up!",
      description: "Your exam has been automatically submitted",
      variant: "destructive"
    });
    handleSubmit();
  };

  // Submit exam
  const handleSubmit = () => {
    // Clean up streams
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    onSubmit(answers);
  };

  const currentQ = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeRemaining <= 300; // 5 minutes warning

  // Pre-exam permission setup screen
  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                CAT Setup - {exam.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Exam Instructions:</h3>
                  <p className="text-sm text-gray-700">{exam.instructions}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p>{exam.duration} minutes</p>
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span>
                      <p>{exam.questions.length}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Marks:</span>
                      <p>{exam.maxMarks}</p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p className="uppercase">{exam.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Required Permissions</h3>
                  <p className="text-sm text-gray-600">
                    This CAT requires the following permissions for proctoring purposes:
                  </p>
                  
                  <div className="grid gap-4">
                    <Card className={`p-4 ${permissions.screenShare ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">Screen Sharing</h4>
                            <p className="text-sm text-gray-600">Your screen will be monitored during the exam</p>
                          </div>
                        </div>
                        <Button 
                          onClick={requestScreenShare}
                          variant={permissions.screenShare ? "default" : "outline"}
                          disabled={permissions.screenShare}
                        >
                          {permissions.screenShare ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Active
                            </>
                          ) : (
                            'Enable'
                          )}
                        </Button>
                      </div>
                    </Card>

                    <Card className={`p-4 ${permissions.webcam ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Camera className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">Webcam Access</h4>
                            <p className="text-sm text-gray-600">Your camera will monitor you during the exam</p>
                          </div>
                        </div>
                        <Button 
                          onClick={requestWebcam}
                          variant={permissions.webcam ? "default" : "outline"}
                          disabled={permissions.webcam}
                        >
                          {permissions.webcam ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Active
                            </>
                          ) : (
                            'Enable'
                          )}
                        </Button>
                      </div>
                    </Card>

                    <Card className={`p-4 ${permissions.keyboard ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Keyboard className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">Keyboard Monitoring</h4>
                            <p className="text-sm text-gray-600">Keyboard activity will be monitored and restricted</p>
                          </div>
                        </div>
                        <Button 
                          onClick={enableKeyboardMonitoring}
                          variant={permissions.keyboard ? "default" : "outline"}
                          disabled={permissions.keyboard}
                        >
                          {permissions.keyboard ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Active
                            </>
                          ) : (
                            'Enable'
                          )}
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={onExit}>
                    Exit
                  </Button>
                  <Button 
                    onClick={startExam}
                    disabled={!permissions.screenShare || !permissions.webcam || !permissions.keyboard}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start CAT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main exam interface
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Questions</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{answeredCount}/{exam.questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((_, index) => {
              const isAnswered = answers[exam.questions[index].id];
              const isCurrent = index === currentQuestion;
              const isFlagged = flaggedQuestions.has(index + 1);
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToQuestion(index)}
                  className={`relative h-10 ${
                    isAnswered ? 'bg-green-100 border-green-500' : 
                    isCurrent ? '' : 'hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                  {isFlagged && (
                    <Bookmark className="w-3 h-3 absolute -top-1 -right-1 text-orange-500" />
                  )}
                  {isAnswered && !isCurrent && (
                    <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 text-gray-400" />
              <span>Not visited</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-3 h-3 text-orange-500" />
              <span>Flagged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <h1 className="font-semibold">{exam.title}</h1>
            <Badge variant="outline" className="ml-2">
              Question {currentQuestion + 1} of {exam.questions.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Proctoring Status */}
            <div className="flex items-center gap-2">
              <Eye className={`w-4 h-4 ${permissions.screenShare ? 'text-green-600' : 'text-red-600'}`} />
              <Camera className={`w-4 h-4 ${permissions.webcam ? 'text-green-600' : 'text-red-600'}`} />
              <Keyboard className={`w-4 h-4 ${permissions.keyboard ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 font-mono ${isTimeWarning ? 'text-red-600' : ''}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
            
            <Button onClick={handleSubmit} variant="destructive">
              Submit CAT
            </Button>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQ.questionNumber}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'})
                  </span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleQuestionFlag(currentQ.questionNumber)}
                  className={flaggedQuestions.has(currentQ.questionNumber) ? 'text-orange-600' : ''}
                >
                  {flaggedQuestions.has(currentQ.questionNumber) ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-gray-800 leading-relaxed">
                {currentQ.questionText}
              </div>
              
              {/* Answer Input Based on Question Type */}
              {currentQ.questionType === 'multiple_choice' && currentQ.options && (
                <RadioGroup
                  value={answers[currentQ.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                >
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {(currentQ.questionType === 'essay' || currentQ.questionType === 'short_answer') && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  className="min-h-[200px]"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toggleQuestionFlag(currentQ.questionNumber)}
            >
              {flaggedQuestions.has(currentQ.questionNumber) ? 'Unflag' : 'Flag'} Question
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestion + 1)}
            disabled={currentQuestion === exam.questions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Hidden webcam video for proctoring */}
      {permissions.webcam && (
        <video
          ref={videoRef}
          autoPlay
          muted
          className="fixed bottom-4 right-4 w-32 h-24 border-2 border-gray-300 rounded-lg bg-black"
        />
      )}
    </div>
  );
};

export default CATWorkspace;
