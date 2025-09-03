import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, BookOpen, FileText, PenTool, Brain, Clock, Download, Eye, Users, Video, MapPin, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentAssignmentUpload } from "./StudentAssignmentUpload";
import { AssignmentWorkplace } from "./AssignmentWorkplace";

interface StudentSemesterPlanProps {
  unitId: string;
  unitCode: string;
  unitName: string;
}

interface WeekMaterial {
  id: string;
  title: string;
  description: string;
  type: 'notes' | 'assignment' | 'exam' | 'cat';
  dayOfWeek: string;
  releaseTime: string;
  isVisible: boolean;
  documents?: {
    id: string;
    title: string;
    description: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadDate: Date;
  }[];
  dueDate?: Date;
  examDate?: Date;
  points?: number;
  duration?: number;
}

interface OnlineClass {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  platform: string;
  meetingLink?: string;
}

interface WeekPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  topic: string;
  objectives: string[];
  materials: WeekMaterial[];
  assignments: any[];
  exams: any[];
  attendanceSessions?: {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    venue: string;
    locationRestriction?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  }[];
  onlineClasses?: OnlineClass[];
}

interface StudentSemesterPlan {
  semesterStart?: Date;
  semesterWeeks: number;
  weekPlans: WeekPlan[];
}

export const StudentSemesterPlanView = ({ unitId, unitCode, unitName }: StudentSemesterPlanProps) => {
  const { user } = useAuth();
  const { getStudentSemesterPlan } = useSemesterPlan();
  const { toast } = useToast();
  const [semesterPlan, setSemesterPlan] = useState<StudentSemesterPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WeekPlan | null>(null);
  const [isWeekDialogOpen, setIsWeekDialogOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  // Track essay submissions for disabling workspace button
  const [essaySubmissions, setEssaySubmissions] = useState<Map<string, any>>(new Map());
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Load submissions from API
  const loadEssaySubmissions = async () => {
    if (!user?.id) return;
    
    setSubmissionsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const API_KEY = import.meta.env.VITE_API_KEY;
      
      const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/student/${user.id}/unit/${unitId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
      });

      if (response.ok) {
        const submissions = await response.json();
        const submissionsMap = new Map();
        submissions.forEach((submission: any) => {
          submissionsMap.set(submission.assignmentId, submission);
        });
        setEssaySubmissions(submissionsMap);
      } else {
        console.log('No submissions found or API error');
        setEssaySubmissions(new Map());
      }
    } catch (error) {
      console.error('Failed to load essay submissions:', error);
      setEssaySubmissions(new Map());
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Save submissions to API
  const saveEssaySubmission = async (assignmentId: string, submission: any) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const API_KEY = import.meta.env.VITE_API_KEY;
      
      const submissionData = {
        assignmentId,
        studentId: user?.id,
        unitId,
        submissionType: 'essay',
        content: submission.content || submission.essayContent || '',
        title: submission.title || submission.essayTitle || '',
        submittedAt: submission.submittedAt || new Date().toISOString(),
        status: submission.status || 'submitted',
        wordCount: submission.wordCount || 0,
        aiCheckResult: submission.aiCheckResult || null,
        metadata: submission.metadata || {}
      };

      const response = await fetch(`${API_BASE_URL}/api/assignments/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const savedSubmission = await response.json();
        const newSubmissions = new Map(essaySubmissions.set(assignmentId, savedSubmission));
        setEssaySubmissions(newSubmissions);
        return savedSubmission;
      } else {
        throw new Error('Failed to save submission to server');
      }
    } catch (error) {
      console.error('Failed to save essay submission:', error);
      toast({
        title: "Submission Warning",
        description: "Submission saved locally but may not sync with server. Please check your connection.",
        variant: "destructive"
      });
      // Fallback: still update local state
      const newSubmissions = new Map(essaySubmissions.set(assignmentId, submission));
      setEssaySubmissions(newSubmissions);
      throw error;
    }
  };

  const checkApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const API_KEY = import.meta.env.VITE_API_KEY;
      
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('API_KEY present:', !!API_KEY);
      
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
        },
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);
      
      if (response.ok || response.status === 404) {
        setApiStatus('connected');
        const data = await response.json();
        console.log('API Response data:', data);
      } else {
        setApiStatus('error');
        const errorData = await response.json();
        console.log('API Error data:', errorData);
      }
    } catch (error) {
      console.error('API Connection failed:', error);
      setApiStatus('error');
    }
  };

  useEffect(() => {
    loadSemesterPlan();
    checkApiConnection();
    loadEssaySubmissions(); // Load submissions from API
  }, [unitId, user?.id]);

  const loadSemesterPlan = async () => {
    setIsLoading(true);
    try {
      // Load semester plan from context using student-specific function
      console.log('StudentSemesterPlanView - Loading plan for unit:', unitId, 'student:', user?.id);
      console.log('StudentSemesterPlanView - Unit details:', { unitCode, unitName, unitId });
      
      const planData = await getStudentSemesterPlan(unitId, user?.id || '');
      
      console.log('StudentSemesterPlanView - Plan data received:', planData);
      console.log('StudentSemesterPlanView - Plan data type:', typeof planData);
      console.log('StudentSemesterPlanView - Plan has weekPlans:', planData?.weekPlans ? 'YES' : 'NO');
      console.log('StudentSemesterPlanView - WeekPlans length:', planData?.weekPlans?.length || 0);
      
      if (planData && planData.weekPlans && planData.weekPlans.length > 0) {
        console.log('StudentSemesterPlanView - Processing week plans...');
        // Convert context data to student-friendly format
        const studentPlan: StudentSemesterPlan = {
          semesterStart: planData.semesterStart,
          semesterWeeks: planData.semesterWeeks,
          weekPlans: planData.weekPlans.map((week: any, index: number) => {
            console.log(`Week ${index + 1} data:`, week);
            return {
              weekNumber: week.weekNumber,
              startDate: new Date(week.startDate),
              endDate: new Date(week.endDate),
              topic: week.topic || week.weekMessage || `Week ${week.weekNumber}`,
              objectives: week.objectives || [],
              materials: week.materials || [],
              assignments: week.assignments || [],
              exams: week.exams || [],
              attendanceSessions: week.attendanceSessions || [],
              onlineClasses: week.onlineClasses || []
            };
          })
        };
        setSemesterPlan(studentPlan);
        console.log('StudentSemesterPlanView - Semester plan set successfully:', studentPlan);
      } else {
        console.log('StudentSemesterPlanView - No semester plan found for unit:', unitId);
        console.log('StudentSemesterPlanView - Reasons could be:');
        console.log('  1. No plan exists in database');
        console.log('  2. Plan exists but has no week plans');
        console.log('  3. Plan exists but student has no access');
        console.log('  4. Error in getStudentSemesterPlan function');
        setSemesterPlan(null);
      }
    } catch (error) {
      console.error('StudentSemesterPlanView - Failed to load semester plan:', error);
      console.error('StudentSemesterPlanView - Error details:', error.message);
      setSemesterPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openWeekDialog = (week: WeekPlan) => {
    setSelectedWeek(week);
    setIsWeekDialogOpen(true);
  };

  const getCurrentWeek = () => {
    if (!semesterPlan?.semesterStart || !semesterPlan.weekPlans.length) return null;
    
    const today = new Date();
    return semesterPlan.weekPlans.find(week => {
      return today >= week.startDate && today <= week.endDate;
    });
  };

  const getWeekStatus = (week: WeekPlan) => {
    const today = new Date();
    if (today < week.startDate) return 'upcoming';
    if (today > week.endDate) return 'completed';
    return 'current';
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'notes': return <FileText className="h-4 w-4" />;
      case 'assignment': return <PenTool className="h-4 w-4" />;
      case 'exam': return <Brain className="h-4 w-4" />;
      case 'cat': return <Clock className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case 'notes': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'cat': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-pulse">Loading semester plan...</div>
        </CardContent>
      </Card>
    );
  }

  if (!semesterPlan || semesterPlan.weekPlans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Semester Plan Available</h3>
          <p className="text-gray-600 mb-4">
            The lecturer hasn't published a semester plan for {unitCode} yet.
          </p>
          <div className="text-xs text-gray-500 mb-4 space-y-1">
            <div>Debug Info:</div>
            <div>Unit ID: {unitId}</div>
            <div>Unit Code: {unitCode}</div>
            <div>Unit Name: {unitName}</div>
            <div>Student ID: {user?.id}</div>
            <div>API Status: {apiStatus}</div>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={loadSemesterPlan} disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Again"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('=== MANUAL DEBUG START ===');
                console.log('Unit Details:', { unitId, unitCode, unitName });
                console.log('User:', user);
                console.log('Current semesterPlan state:', semesterPlan);
                console.log('API Status:', apiStatus);
                console.log('=== MANUAL DEBUG END ===');
              }}
            >
              Debug Console
            </Button>
            <Button 
              variant="outline" 
              onClick={checkApiConnection}
              className="bg-blue-50 text-blue-700"
            >
              Test API
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentWeek = getCurrentWeek();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {unitCode} - {unitName} Semester Plan
          </CardTitle>
          <CardDescription>
            {semesterPlan.semesterWeeks} weeks • 
            {semesterPlan.semesterStart && (
              <span className="ml-1">
                Started {format(semesterPlan.semesterStart, 'MMMM d, yyyy')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        {currentWeek && (
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-1">Current Week</h4>
              <p className="text-blue-700">
                Week {currentWeek.weekNumber}: {currentWeek.topic}
              </p>
              <p className="text-sm text-blue-600">
                {formatDateRange(currentWeek.startDate, currentWeek.endDate)}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Week Timeline */}
      <div className="grid gap-4">
        {semesterPlan.weekPlans.map((week) => {
          const status = getWeekStatus(week);
          const isCurrent = currentWeek?.weekNumber === week.weekNumber;
          
          return (
            <Card 
              key={week.weekNumber} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                isCurrent ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => openWeekDialog(week)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Week {week.weekNumber}: {week.topic}
                      {isCurrent && (
                        <Badge variant="default" className="bg-blue-500">
                          Current
                        </Badge>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatDateRange(week.startDate, week.endDate)}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      status === 'current' ? 'border-blue-500 text-blue-700' :
                      status === 'completed' ? 'border-green-500 text-green-700' :
                      'border-gray-400 text-gray-600'
                    }
                  >
                    {status === 'current' ? 'In Progress' : 
                     status === 'completed' ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>

                {/* Materials Summary */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {week.materials.map((material, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getMaterialColor(material.type)}`}
                    >
                      {getMaterialIcon(material.type)}
                      <span>{material.type.charAt(0).toUpperCase() + material.type.slice(1)}</span>
                    </div>
                  ))}
                  {week.assignments.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <PenTool className="h-3 w-3" />
                      <span>{week.assignments.length} Assignment{week.assignments.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {week.exams.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      <Brain className="h-3 w-3" />
                      <span>{week.exams.length} Exam{week.exams.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {week.attendanceSessions && week.attendanceSessions.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      <Users className="h-3 w-3" />
                      <span>{week.attendanceSessions.length} Attendance Session{week.attendanceSessions.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {week.onlineClasses && week.onlineClasses.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      <Video className="h-3 w-3" />
                      <span>{week.onlineClasses.length} Online Class{week.onlineClasses.length > 1 ? 'es' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Learning Objectives */}
                {week.objectives.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Learning Objectives:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {week.objectives.slice(0, 2).map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                      {week.objectives.length > 2 && (
                        <li className="text-blue-600 text-xs">
                          +{week.objectives.length - 2} more objectives
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Week Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Week Details Dialog */}
      <Dialog open={isWeekDialogOpen} onOpenChange={setIsWeekDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedWeek && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Week {selectedWeek.weekNumber}: {selectedWeek.topic}
                </DialogTitle>
                <DialogDescription>
                  {formatDateRange(selectedWeek.startDate, selectedWeek.endDate)}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="exams">Exams</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="online">Online Classes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedWeek.objectives.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedWeek.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No learning objectives specified for this week.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                  {selectedWeek.materials.length > 0 ? (
                    selectedWeek.materials.map((material, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              {getMaterialIcon(material.type)}
                              {material.title}
                            </h4>
                            <Badge className={getMaterialColor(material.type)}>
                              {material.type}
                            </Badge>
                          </div>
                          {material.description && (
                            <p className="text-gray-700 text-sm mb-3">{material.description}</p>
                          )}
                          {material.documents && material.documents.length > 0 && (
                            <div className="space-y-2">
                              {material.documents.map((doc, docIndex) => (
                                <div key={docIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm">{doc.fileName}</span>
                                    <span className="text-xs text-gray-500">
                                      ({(doc.fileSize / (1024 * 1024)).toFixed(1)} MB)
                                    </span>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (doc.fileUrl) {
                                        // Create a temporary download link
                                        const link = document.createElement('a');
                                        link.href = doc.fileUrl;
                                        link.download = doc.fileName;
                                        link.target = '_blank';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      } else {
                                        console.error('No file URL available for document:', doc);
                                      }
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No materials available for this week.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  {selectedWeek.assignments.length > 0 ? (
                    selectedWeek.assignments.map((assignment, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{assignment.title}</h4>
                            <Badge variant="outline">
                              {assignment.points} points
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{assignment.description}</p>
                          {assignment.documents && assignment.documents.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-800 mb-2">Assignment Documents:</h5>
                              <div className="space-y-2">
                                {assignment.documents.map((doc, docIndex) => (
                                  <div key={docIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm">{doc.name || doc.fileName}</span>
                                      <span className="text-xs text-gray-500">
                                        ({((doc.size || doc.fileSize) / (1024 * 1024)).toFixed(1)} MB)
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        Uploaded: {format(new Date(doc.uploadedAt || doc.uploadDate), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={async () => {
                                        const downloadUrl = doc.url || doc.fileUrl;
                                        const fileName = doc.name || doc.fileName;
                                        
                                        if (downloadUrl) {
                                          try {
                                            // Create a temporary download link
                                            const link = document.createElement('a');
                                            link.href = downloadUrl;
                                            link.download = fileName;
                                            link.target = '_blank';
                                            link.rel = 'noopener noreferrer';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            
                                            toast({
                                              title: "Download Started",
                                              description: `Downloading ${fileName}...`,
                                            });
                                          } catch (error) {
                                            console.error('Download failed:', error);
                                            toast({
                                              title: "Download Failed",
                                              description: `Failed to download ${fileName}. Please try again.`,
                                              variant: "destructive",
                                            });
                                          }
                                        } else {
                                          console.error('No download URL available for document:', doc);
                                          toast({
                                            title: "Download Unavailable",
                                            description: `No download link available for ${fileName}.`,
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                            <span>Type: {(assignment.studentType || assignment.type) === 'essay' ? 'Essay' : 'Document Upload'}</span>
                          </div>

                          {/* Assignment Interface - Different for Essay vs Document */}
                          {(assignment.studentType || assignment.type) === 'essay' ? (
                            submissionsLoading ? (
                              <div className="mt-4">
                                <Button disabled className="w-full">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                                  Loading submission status...
                                </Button>
                              </div>
                            ) : essaySubmissions.has(assignment.id) ? (
                              <div className="mt-4">
                                <Button disabled className="w-full">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Already Submitted
                                </Button>
                                <p className="text-center text-sm text-gray-600 mt-2">
                                  Essay submitted on {format(essaySubmissions.get(assignment.id)?.submittedAt ? new Date(essaySubmissions.get(assignment.id).submittedAt) : new Date(), 'MMM d, yyyy p')}
                                </p>
                              </div>
                            ) : (
                              (() => {
                                const finalType = (assignment.studentType || assignment.type || 'document') as 'essay' | 'document';
                                console.log('🔍 ASSIGNMENT TAB DEBUG:', {
                                  assignmentId: assignment.id,
                                  title: assignment.title,
                                  originalType: assignment.studentType === 'essay' ? 'essay' : 'document',
                                  studentType: assignment.studentType,
                                  finalType,
                                  isEssay: finalType === 'essay',
                                  willShowEssayTab: finalType === 'essay',
                                  fullAssignment: assignment
                                });
                                return null;
                              })(),
                              
                              <AssignmentWorkplace
                                key={`assignment-${assignment.id}`}
                                assignment={{
                                  id: assignment.id,
                                  title: assignment.title,
                                  description: assignment.description,
                                  type: (assignment.studentType || assignment.type) === 'essay' ? 'essay' : 'document',
                                  assignDate: new Date(assignment.assignDate),
                                  dueDate: new Date(assignment.dueDate),
                                  maxMarks: assignment.maxMarks,
                                  instructions: assignment.instructions || assignment.description,
                                  requiresAICheck: assignment.requiresAICheck || false,
                                  unitId: unitId,
                                  unitCode: unitCode,
                                  unitName: unitName,
                                  documents: assignment.documents || []
                                }}
                                onSubmissionComplete={async (submission) => {
                                  try {
                                    // Track the submission in API storage
                                    await saveEssaySubmission(assignment.id, submission);
                                    toast({
                                      title: "Essay Submitted",
                                      description: "Your essay has been submitted successfully",
                                    });
                                  } catch (error) {
                                    // Error already handled in saveEssaySubmission
                                  }
                                }}
                                trigger={
                                  <Button className="w-full mt-4">
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Open Essay Workspace
                                  </Button>
                                }
                              />
                            )
                          ) : (
                            <StudentAssignmentUpload
                              assignmentId={assignment.id}
                              assignmentTitle={assignment.title}
                              dueDate={new Date(assignment.dueDate)}
                              maxMarks={assignment.maxMarks}
                              unitId={unitId}
                              unitCode={unitCode}
                              lecturerId={assignment.lecturerId || 'lecturer-001'}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <PenTool className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No assignments for this week.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="exams" className="space-y-4">
                  {selectedWeek.exams.length > 0 ? (
                    selectedWeek.exams.map((exam, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{exam.title}</h4>
                            <Badge variant="outline">
                              {exam.duration} minutes
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{exam.description}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Date: {format(new Date(exam.examDate), 'MMM d, yyyy')}</span>
                            <span>Type: {exam.type}</span>
                            <span>Total: {exam.totalMarks} marks</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No exams scheduled for this week.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  {selectedWeek.attendanceSessions && selectedWeek.attendanceSessions.length > 0 ? (
                    selectedWeek.attendanceSessions.map((session, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold">{session.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-orange-50">
                                <Users className="h-3 w-3 mr-1" />
                                Attendance Required
                              </Badge>
                              {session.locationRestriction && (
                                <Badge variant="outline" className="bg-red-50">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Location Restricted
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{session.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <span>Date: {format(new Date(session.date), 'MMM d, yyyy')}</span>
                            <span>Time: {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}</span>
                            <span>Duration: {session.duration} minutes</span>
                            <span>Venue: {session.venue}</span>
                          </div>
                          {session.locationRestriction && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <p className="text-sm text-red-700 font-medium">Location Restriction Active</p>
                              <p className="text-xs text-red-600 mt-1">
                                Attendance can only be marked within {session.locationRestriction.radius}m of the venue
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No attendance sessions scheduled for this week.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="online" className="space-y-4">
                  {selectedWeek.onlineClasses && selectedWeek.onlineClasses.length > 0 ? (
                    selectedWeek.onlineClasses.map((onlineClass, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold">{onlineClass.title}</h4>
                            <Badge variant="outline" className="bg-purple-50">
                              <Video className="h-3 w-3 mr-1" />
                              Online Class
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{onlineClass.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <span>Date: {format(new Date(onlineClass.date), 'MMM d, yyyy')}</span>
                            <span>Time: {format(new Date(onlineClass.startTime), 'h:mm a')} - {format(new Date(onlineClass.endTime), 'h:mm a')}</span>
                            <span>Duration: {onlineClass.duration} minutes</span>
                            <span>Platform: {onlineClass.platform}</span>
                          </div>
                          {onlineClass.meetingLink && (
                            <div className="bg-purple-50 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <p className="text-sm text-purple-700 font-medium">Join Online Class</p>
                                <p className="text-xs text-purple-600 mt-1">Click to join the online session</p>
                              </div>
                              <Button 
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => window.open(onlineClass.meetingLink, '_blank')}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join Class
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No online classes scheduled for this week.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
