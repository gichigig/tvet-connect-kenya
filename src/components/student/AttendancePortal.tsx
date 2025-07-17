import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  Timer,
  AlertCircle,
  FileText,
  MapPin,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export const AttendancePortal = () => {
  const { toast } = useToast();
  const { user, pendingUnitRegistrations } = useAuth();
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [activeQuizzes, setActiveQuizzes] = useState<QuizAttendance[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttendance | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [attendanceCode, setAttendanceCode] = useState("");

  // Get student's enrolled units
  const enrolledUnits = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Mock data - in real app, this would come from the backend
  useEffect(() => {
    const mockSessions: AttendanceSession[] = [
      {
        id: "sess1",
        unitCode: "CS101",
        unitName: "Introduction to Computer Science",
        lecturer: "Dr. Jane Smith",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "10:30",
        type: "manual",
        isActive: true,
        attendanceCode: "CS101-TODAY",
        description: "Regular lecture attendance"
      },
      {
        id: "sess2",
        unitCode: "MATH201",
        unitName: "Advanced Mathematics",
        lecturer: "Prof. John Doe",
        date: new Date().toISOString().split('T')[0],
        startTime: "14:00",
        endTime: "15:30",
        type: "manual",
        isActive: true,
        locationRequired: true,
        latitude: -1.2921,
        longitude: 36.8219,
        radius: 100,
        attendanceCode: "MATH201-LOC",
        description: "Location-based attendance required"
      }
    ];

    const mockQuizzes: QuizAttendance[] = [
      {
        id: "quiz1",
        title: "Programming Fundamentals Quiz",
        unitCode: "CS101",
        unitName: "Introduction to Computer Science",
        timeLimit: 10,
        isActive: true,
        startTime: new Date(),
        timeRemaining: 600, // 10 minutes
        questions: [
          {
            id: "q1",
            question: "What is the output of print('Hello World')?",
            options: ["Hello World", "hello world", "HELLO WORLD", "Error"],
            correctAnswer: 0
          },
          {
            id: "q2",
            question: "Which of the following is a programming language?",
            options: ["HTML", "CSS", "Python", "JSON"],
            correctAnswer: 2
          }
        ]
      }
    ];

    setActiveSessions(mockSessions);
    setActiveQuizzes(mockQuizzes);
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        toast({
          title: "Location Obtained",
          description: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleMarkAttendance = (session: AttendanceSession) => {
    if (!user) return;

    // Check location if required
    if (session.locationRequired && session.latitude && session.longitude) {
      if (!currentLocation) {
        toast({
          title: "Location Required",
          description: "Please share your location to mark attendance.",
          variant: "destructive",
        });
        return;
      }

      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        session.latitude,
        session.longitude
      );

      if (distance > (session.radius || 100)) {
        toast({
          title: "Location Check Failed",
          description: `You are ${Math.round(distance)}m away from the allowed location (${session.radius}m radius).`,
          variant: "destructive",
        });
        return;
      }
    }

    // Check attendance code if provided
    if (session.attendanceCode && attendanceCode !== session.attendanceCode) {
      toast({
        title: "Invalid Attendance Code",
        description: "Please enter the correct attendance code.",
        variant: "destructive",
      });
      return;
    }

    // Mark attendance
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      sessionId: session.id,
      unitCode: session.unitCode,
      unitName: session.unitName,
      date: session.date,
      status: 'present',
      timestamp: new Date().toISOString(),
      type: session.type
    };

    setAttendanceHistory([newRecord, ...attendanceHistory]);
    setAttendanceCode("");
    
    toast({
      title: "Attendance Marked",
      description: `Your attendance has been recorded for ${session.unitCode}`,
    });
  };

  const handleSubmitQuiz = (quiz: QuizAttendance) => {
    if (!user) return;

    const allAnswered = quiz.questions.every(q => quizAnswers[q.id] !== undefined);
    if (!allAnswered) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Calculate score
    const correctAnswers = quiz.questions.filter(q => quizAnswers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    const newRecord: AttendanceRecord = {
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

    setAttendanceHistory([newRecord, ...attendanceHistory]);
    setSelectedQuiz(null);
    setQuizAnswers({});
    
    toast({
      title: "Quiz Submitted",
      description: `Score: ${score}% - ${score >= 60 ? 'Attendance marked' : 'Below attendance threshold'}`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Portal</h2>
          <p className="text-gray-600">Mark your attendance for classes and quizzes</p>
        </div>
        <Users className="w-8 h-8 text-blue-600" />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Attendance</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <Card key={session.id} className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{session.unitCode}</CardTitle>
                    <Badge variant="default" className="bg-green-600">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>{session.unitName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{session.lecturer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                    {session.locationRequired && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Location verification required</span>
                      </div>
                    )}
                  </div>

                  {session.description && (
                    <p className="text-sm text-gray-600">{session.description}</p>
                  )}

                  {session.locationRequired && (
                    <div className="space-y-2">
                      <Button 
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {isGettingLocation ? "Getting Location..." : "Share Location"}
                      </Button>
                      {currentLocation && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                        </Badge>
                      )}
                    </div>
                  )}

                  {session.attendanceCode && (
                    <div className="space-y-2">
                      <Label htmlFor="attendance-code">Attendance Code</Label>
                      <Input
                        id="attendance-code"
                        value={attendanceCode}
                        onChange={(e) => setAttendanceCode(e.target.value)}
                        placeholder="Enter attendance code"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={() => handleMarkAttendance(session)}
                    className="w-full"
                    disabled={
                      (session.locationRequired && !currentLocation) ||
                      (session.attendanceCode && !attendanceCode)
                    }
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Attendance
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeSessions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                <p className="text-gray-500">
                  No active attendance sessions at the moment. Check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {selectedQuiz ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedQuiz.title}</CardTitle>
                  <Badge variant="secondary">
                    Time: {formatTime(selectedQuiz.timeRemaining || 0)}
                  </Badge>
                </div>
                <CardDescription>{selectedQuiz.unitCode} - {selectedQuiz.unitName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedQuiz.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.question}
                    </Label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${question.id}-${optionIndex}`}
                            name={question.id}
                            value={optionIndex}
                            onChange={() => setQuizAnswers({
                              ...quizAnswers,
                              [question.id]: optionIndex
                            })}
                            checked={quizAnswers[question.id] === optionIndex}
                            className="w-4 h-4"
                          />
                          <label
                            htmlFor={`${question.id}-${optionIndex}`}
                            className="text-sm cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSubmitQuiz(selectedQuiz)}
                    className="flex-1"
                  >
                    Submit Quiz
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedQuiz(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuizzes.map((quiz) => (
                <Card key={quiz.id} className="border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <Badge variant="default" className="bg-blue-600">
                        <Timer className="w-3 h-3 mr-1" />
                        {formatTime(quiz.timeRemaining || 0)}
                      </Badge>
                    </div>
                    <CardDescription>{quiz.unitCode} - {quiz.unitName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Questions: {quiz.questions.length}</span>
                        <span>Time Limit: {quiz.timeLimit} minutes</span>
                      </div>
                      <Button 
                        onClick={() => setSelectedQuiz(quiz)}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Take Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeQuizzes.length === 0 && !selectedQuiz && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Quizzes</h3>
                <p className="text-gray-500">
                  No quiz-based attendance sessions available at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {attendanceHistory.map((record) => (
              <Card key={record.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{record.unitCode} - {record.unitName}</h3>
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                        <Badge variant="outline">
                          {record.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                        {record.score && <span>Score: {record.score}%</span>}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {record.status === 'present' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {attendanceHistory.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance History</h3>
                <p className="text-gray-500">
                  Your attendance records will appear here once you start marking attendance.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};