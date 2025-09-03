import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSemesterPlan, WeekPlan, WeeklyMaterial, WeeklyAssignment, WeeklyExam, AttendanceSession, OnlineClass } from '@/contexts/SemesterPlanContext';
import { DocumentManager } from '@/components/lecturer/DocumentManager';
import { ExamQuestionManager } from '@/components/lecturer/ExamQuestionManager';
import { CATMonitoringDashboard } from '@/components/lecturer/CATMonitoringDashboard';
import { 
  CalendarIcon, 
  Plus, 
  Edit3, 
  FileText, 
  PenTool, 
  GraduationCap, 
  Clock, 
  Lock, 
  Unlock,
  Upload,
  Save,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Users,
  Video,
  Monitor,
  Camera,
  Keyboard,
  MapPin,
  Navigation,
  Target,
  X
} from 'lucide-react';
import { format, addWeeks, isAfter, isBefore, parseISO } from 'date-fns';

interface SemesterPlannerProps {
  unit: {
    id: string;
    code: string;
    name: string;
  };
}

export const SemesterPlanner: React.FC<SemesterPlannerProps> = ({ unit }) => {
  const { user } = useAuth();
  const { addContent } = useCourseContent();
  const { toast } = useToast();
  const { getSemesterPlan, setSemesterPlan, clearSemesterPlan, activateAttendance, addOnlineClass, isLoading } = useSemesterPlan();
  
  const [semesterStart, setSemesterStartLocal] = useState<Date | undefined>();
  const [semesterWeeks, setSemesterWeeksLocal] = useState(15);
  const [weekPlans, setWeekPlansLocal] = useState<WeekPlan[]>([]);
  
  const [selectedWeek, setSelectedWeek] = useState<WeekPlan | null>(null);
  const [activeTab, setActiveTab] = useState('weekly-schedule');
  const [editingWeekMessage, setEditingWeekMessage] = useState<number | null>(null);
  const [tempWeekMessage, setTempWeekMessage] = useState('');

  // Load semester plan on component mount
  useEffect(() => {
    const loadSemesterPlan = async () => {
      try {
        const plan = await getSemesterPlan(unit.id);
        setSemesterStartLocal(plan.semesterStart);
        setSemesterWeeksLocal(plan.semesterWeeks);
        setWeekPlansLocal(plan.weekPlans);
      } catch (error) {
        console.error('Failed to load semester plan:', error);
        // Don't show error toast for missing plans - just use defaults
        // The context already returns default values on error
      }
    };

    loadSemesterPlan();
  }, [unit.id]); // Removed getSemesterPlan to prevent unnecessary re-renders

  // Sync with backend whenever local state changes (debounced)
  useEffect(() => {
    const saveToBackend = async () => {
      try {
        await setSemesterPlan(unit.id, {
          semesterStart,
          semesterWeeks,
          weekPlans
        });
      } catch (error) {
        console.error('Failed to sync semester plan:', error);
        // Don't show error toast for auto-save failures
      }
    };

    // Only save if we have a valid plan with data
    if (weekPlans.length > 0 || semesterStart) {
      const timeoutId = setTimeout(saveToBackend, 1000); // 1 second debounce
      return () => clearTimeout(timeoutId);
    }
  }, [semesterStart, semesterWeeks, weekPlans, unit.id]); // Removed setSemesterPlan to prevent infinite loop

  // Helper functions to update local state
  const setSemesterStart = (date: Date | undefined) => {
    setSemesterStartLocal(date);
  };

  const setSemesterWeeks = (weeks: number) => {
    setSemesterWeeksLocal(weeks);
  };

  const setWeekPlans = (plans: WeekPlan[] | ((prev: WeekPlan[]) => WeekPlan[])) => {
    if (typeof plans === 'function') {
      setWeekPlansLocal(prev => {
        const newPlans = plans(prev);
        return newPlans;
      });
    } else {
      setWeekPlansLocal(plans);
    }
  };

  // Material visibility toggle function
  const toggleMaterialVisibility = (materialId: string) => {
    setWeekPlans(prev => prev.map(week => ({
      ...week,
      materials: week.materials.map(material => 
        material.id === materialId 
          ? { ...material, isVisible: !material.isVisible }
          : material
      )
    })));

    // Find the material to show appropriate toast
    const material = weekPlans.flatMap(w => w.materials).find(m => m.id === materialId);
    if (material) {
      toast({
        title: material.isVisible ? "Material Hidden" : "Material Published",
        description: material.isVisible 
          ? "Material is now hidden from students" 
          : "Material is now visible to students"
      });
    }
  };
  
  // Material form states
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: 'notes' as 'notes' | 'material',
    dayOfWeek: 'monday',
    releaseTime: '08:00'
  });
  
  // Assignment form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'essay',
    assignDate: new Date(),
    dueDate: new Date(),
    maxMarks: 100,
    instructions: '',
    requiresAICheck: false
  });
  
  // Exam form states
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    type: 'cat' as 'exam' | 'cat',
    examDate: new Date(),
    examTime: '09:00',
    duration: 90,
    venue: '',
    maxMarks: 100,
    instructions: ''
  });

  // Attendance form states
  const [attendanceForm, setAttendanceForm] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '08:00',
    endTime: '10:00',
    venue: '',
    locationRestriction: {
      enabled: false,
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      radius: 100,
      locationName: ''
    }
  });

  // Online class form states
  const [onlineClassForm, setOnlineClassForm] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '08:00',
    endTime: '10:00',
    platform: 'zoom' as 'zoom' | 'teams' | 'meet' | 'bbb' | 'other',
    meetingLink: '',
    meetingId: '',
    passcode: '',
    instructions: ''
  });

  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isCreateAttendanceOpen, setIsCreateAttendanceOpen] = useState(false);
  const [isCreateOnlineClassOpen, setIsCreateOnlineClassOpen] = useState(false);
  
  // Location restriction states
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Edit mode states
  const [editingMaterial, setEditingMaterial] = useState<WeeklyMaterial | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<WeeklyAssignment | null>(null);
  const [editingExam, setEditingExam] = useState<WeeklyExam | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceSession | null>(null);
  const [editingOnlineClass, setEditingOnlineClass] = useState<OnlineClass | null>(null);

  // CAT monitoring state
  const [showCATMonitoring, setShowCATMonitoring] = useState(false);
  const [selectedExamForMonitoring, setSelectedExamForMonitoring] = useState<{examId: string, unitId: string} | null>(null);

  // Document states for creation forms
  const [materialDocuments, setMaterialDocuments] = useState<any[]>([]);
  const [assignmentDocuments, setAssignmentDocuments] = useState<any[]>([]);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);

  // Generate semester plan
  const generateSemesterPlan = () => {
    if (!semesterStart) {
      toast({
        title: "Missing Information",
        description: "Please select a semester start date",
        variant: "destructive"
      });
      return;
    }

    const plans: WeekPlan[] = [];
    for (let i = 1; i <= semesterWeeks; i++) {
      const weekStart = addWeeks(semesterStart, i - 1);
      const weekEnd = addWeeks(weekStart, 1);
      
      plans.push({
        weekNumber: i,
        startDate: weekStart,
        endDate: weekEnd,
        weekMessage: '', // Initialize with empty message
        materials: [],
        assignments: [],
        exams: []
      });
    }
    
    setWeekPlans(plans);
    toast({
      title: "Semester Plan Generated",
      description: `Created ${semesterWeeks} week plan starting ${format(semesterStart, 'PPP')}`
    });
  };

  // Reset/delete the entire semester plan
  const resetSemesterPlan = async () => {
    try {
      setWeekPlans([]);
      setSelectedWeek(null);
      setEditingWeekMessage(null);
      setTempWeekMessage('');
      setSemesterStart(undefined);
      setSemesterWeeks(15);
      
      // Clear from backend
      await clearSemesterPlan(unit.id);
      
      toast({
        title: "Plan Reset",
        description: "Semester plan has been cleared. You can create a new one."
      });
    } catch (error) {
      console.error('Failed to clear semester plan:', error);
      toast({
        title: "Error",
        description: "Failed to clear semester plan",
        variant: "destructive"
      });
    }
  };

  // Update week message
  const updateWeekMessage = (weekNumber: number, message: string) => {
    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === weekNumber
        ? { ...week, weekMessage: message }
        : week
    ));
    
    // Update selected week if it's the same week being edited
    if (selectedWeek && selectedWeek.weekNumber === weekNumber) {
      setSelectedWeek(prev => prev ? { ...prev, weekMessage: message } : null);
    }
    
    setEditingWeekMessage(null);
    setTempWeekMessage('');
    
    toast({
      title: "Week Message Updated",
      description: `Updated message for Week ${weekNumber}`
    });
  };

  // Add material to selected week
  const addMaterialToWeek = () => {
    if (!selectedWeek || !materialForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newMaterial: WeeklyMaterial = {
      id: `material-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      title: materialForm.title,
      description: materialForm.description,
      type: materialForm.type,
      dayOfWeek: materialForm.dayOfWeek,
      releaseTime: materialForm.releaseTime,
      isUploaded: materialDocuments.length > 0, // Set uploaded if documents exist
      isVisible: true, // Default to visible so students can see it immediately
      documents: materialDocuments // Add documents to material
    };

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? { ...week, materials: [...week.materials, newMaterial] }
        : week
    ));

    // Reset form and documents
    setMaterialForm({
      title: '',
      description: '',
      type: 'notes',
      dayOfWeek: 'monday',
      releaseTime: '08:00'
    });
    setMaterialDocuments([]); // Clear documents
    
    setIsCreateMaterialOpen(false);
    toast({
      title: "Material Added",
      description: `Added "${newMaterial.title}" to Week ${selectedWeek.weekNumber}${materialDocuments.length > 0 ? ` with ${materialDocuments.length} document(s)` : ''}`
    });
  };

  // Edit material
  const editMaterial = (material: WeeklyMaterial) => {
    setEditingMaterial(material);
    setMaterialForm({
      title: material.title,
      description: material.description,
      type: material.type,
      dayOfWeek: material.dayOfWeek,
      releaseTime: material.releaseTime
    });
    setMaterialDocuments(material.documents || []);
    setIsCreateMaterialOpen(true);
  };

  // Update material
  const updateMaterial = () => {
    if (!selectedWeek || !editingMaterial || !materialForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedMaterial: WeeklyMaterial = {
      ...editingMaterial,
      title: materialForm.title,
      description: materialForm.description,
      type: materialForm.type,
      dayOfWeek: materialForm.dayOfWeek,
      releaseTime: materialForm.releaseTime,
      isUploaded: materialDocuments.length > 0,
      documents: materialDocuments
    };

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            materials: week.materials.map(material => 
              material.id === editingMaterial.id ? updatedMaterial : material
            )
          }
        : week
    ));

    // Reset form and edit state
    setMaterialForm({
      title: '',
      description: '',
      type: 'notes',
      dayOfWeek: 'monday',
      releaseTime: '08:00'
    });
    setMaterialDocuments([]);
    setEditingMaterial(null);
    setIsCreateMaterialOpen(false);
    
    toast({
      title: "Material Updated",
      description: `Updated "${updatedMaterial.title}" in Week ${selectedWeek.weekNumber}`
    });
  };

  // Delete material
  const deleteMaterial = (materialId: string) => {
    if (!selectedWeek) return;

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            materials: week.materials.filter(material => material.id !== materialId)
          }
        : week
    ));

    toast({
      title: "Material Deleted",
      description: "Material has been removed from the week"
    });
  };

  // Add assignment to selected week
  const addAssignmentToWeek = () => {
    if (!selectedWeek || !assignmentForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newAssignment: WeeklyAssignment = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      title: assignmentForm.title,
      description: assignmentForm.description,
      type: assignmentForm.type,
      assignDate: assignmentForm.assignDate,
      dueDate: assignmentForm.dueDate,
      maxMarks: assignmentForm.maxMarks,
      instructions: assignmentForm.instructions,
      isUploaded: assignmentDocuments.length > 0, // Set uploaded if documents exist
      requiresAICheck: assignmentForm.type === 'essay' || assignmentForm.requiresAICheck,
      documents: assignmentDocuments // Add documents to assignment
    };

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? { ...week, assignments: [...week.assignments, newAssignment] }
        : week
    ));

    // Reset form and documents
    setAssignmentForm({
      title: '',
      description: '',
      type: 'document',
      assignDate: new Date(),
      dueDate: new Date(),
      maxMarks: 100,
      instructions: '',
      requiresAICheck: false
    });
    setAssignmentDocuments([]); // Clear documents
    
    setIsCreateAssignmentOpen(false);
    toast({
      title: "Assignment Added",
      description: `Added "${newAssignment.title}" to Week ${selectedWeek.weekNumber}${assignmentDocuments.length > 0 ? ` with ${assignmentDocuments.length} document(s)` : ''}`
    });
  };

  // Edit assignment
  const editAssignment = (assignment: WeeklyAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      assignDate: assignment.assignDate,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      instructions: assignment.instructions,
      requiresAICheck: assignment.requiresAICheck
    });
    setAssignmentDocuments(assignment.documents || []);
    setIsCreateAssignmentOpen(true);
  };

  // Update assignment
  const updateAssignment = () => {
    if (!selectedWeek || !editingAssignment || !assignmentForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedAssignment: WeeklyAssignment = {
      ...editingAssignment,
      title: assignmentForm.title,
      description: assignmentForm.description,
      type: assignmentForm.type,
      assignDate: assignmentForm.assignDate,
      dueDate: assignmentForm.dueDate,
      maxMarks: assignmentForm.maxMarks,
      instructions: assignmentForm.instructions,
      requiresAICheck: assignmentForm.type === 'essay' || assignmentForm.requiresAICheck,
      isUploaded: assignmentDocuments.length > 0,
      documents: assignmentDocuments
    };

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            assignments: week.assignments.map(assignment => 
              assignment.id === editingAssignment.id ? updatedAssignment : assignment
            )
          }
        : week
    ));

    // Reset form and edit state
    setAssignmentForm({
      title: '',
      description: '',
      type: 'document',
      assignDate: new Date(),
      dueDate: new Date(),
      maxMarks: 100,
      instructions: '',
      requiresAICheck: false
    });
    setAssignmentDocuments([]);
    setEditingAssignment(null);
    setIsCreateAssignmentOpen(false);
    
    toast({
      title: "Assignment Updated",
      description: `Updated "${updatedAssignment.title}" in Week ${selectedWeek.weekNumber}`
    });
  };

  // Delete assignment
  const deleteAssignment = (assignmentId: string) => {
    if (!selectedWeek) return;

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            assignments: week.assignments.filter(assignment => assignment.id !== assignmentId)
          }
        : week
    ));

    toast({
      title: "Assignment Deleted",
      description: "Assignment has been removed from the week"
    });
  };

  // Add exam to selected week
  const addExamToWeek = () => {
    if (!selectedWeek || !examForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newExam: WeeklyExam = {
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      title: examForm.title,
      description: examForm.description,
      type: examForm.type,
      examDate: examForm.examDate,
      examTime: examForm.examTime,
      duration: examForm.duration,
      venue: examForm.venue,
      maxMarks: examForm.maxMarks,
      instructions: examForm.instructions,
      isLocked: true, // Exams are locked by default until date
      questions: examQuestions, // Initialize with created questions
      approvalStatus: 'draft' // Initialize as draft
    };

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? { ...week, exams: [...week.exams, newExam] }
        : week
    ));

    // Reset form and questions
    setExamForm({
      title: '',
      description: '',
      type: 'cat',
      examDate: new Date(),
      examTime: '09:00',
      duration: 90,
      venue: '',
      maxMarks: 100,
      instructions: ''
    });
    setExamQuestions([]); // Clear questions
    
    setIsCreateExamOpen(false);
    toast({
      title: "Exam Added",
      description: `Added "${newExam.title}" to Week ${selectedWeek.weekNumber}${examQuestions.length > 0 ? ` with ${examQuestions.length} question(s)` : ''}`
    });
  };

  // Edit exam
  const editExam = (exam: WeeklyExam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description,
      type: exam.type,
      examDate: exam.examDate,
      examTime: exam.examTime,
      duration: exam.duration,
      venue: exam.venue,
      maxMarks: exam.maxMarks,
      instructions: exam.instructions
    });
    setExamQuestions(exam.questions || []);
    setIsCreateExamOpen(true);
  };

  // Update exam
  const updateExam = () => {
    if (!selectedWeek || !editingExam || !examForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedExam: WeeklyExam = {
      ...editingExam,
      title: examForm.title,
      description: examForm.description,
      type: examForm.type,
      examDate: examForm.examDate,
      examTime: examForm.examTime,
      duration: examForm.duration,
      venue: examForm.venue,
      maxMarks: examForm.maxMarks,
      instructions: examForm.instructions,
      questions: examQuestions
    };

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            exams: week.exams.map(exam => 
              exam.id === editingExam.id ? updatedExam : exam
            )
          }
        : week
    ));

    // Reset form and edit state
    setExamForm({
      title: '',
      description: '',
      type: 'cat',
      examDate: new Date(),
      examTime: '09:00',
      duration: 90,
      venue: '',
      maxMarks: 100,
      instructions: ''
    });
    setExamQuestions([]);
    setEditingExam(null);
    setIsCreateExamOpen(false);
    
    toast({
      title: "Exam Updated",
      description: `Updated "${updatedExam.title}" in Week ${selectedWeek.weekNumber}`
    });
  };

  // Delete exam
  const deleteExam = (examId: string) => {
    if (!selectedWeek) return;

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            exams: week.exams.filter(exam => exam.id !== examId)
          }
        : week
    ));

    toast({
      title: "Exam Deleted",
      description: "Exam has been removed from the week"
    });
  };

  // Location restriction functions
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setAttendanceForm(prev => ({
          ...prev,
          locationRestriction: {
            ...prev.locationRestriction,
            latitude,
            longitude,
            locationName: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
          }
        }));
        setIsGettingLocation(false);
        toast({
          title: "Location Retrieved",
          description: "Current location has been set for attendance restriction"
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Unable to get current location. Please check location permissions.",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const clearLocationRestriction = () => {
    setAttendanceForm(prev => ({
      ...prev,
      locationRestriction: {
        enabled: false,
        latitude: undefined,
        longitude: undefined,
        radius: 100,
        locationName: ''
      }
    }));
    setCurrentLocation(null);
    toast({
      title: "Location Cleared",
      description: "Location restriction has been removed"
    });
  };

  // Add attendance session to selected week
  const addAttendanceToWeek = async () => {
    if (!selectedWeek || !attendanceForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate location restriction if enabled
    if (attendanceForm.locationRestriction.enabled && 
        (!attendanceForm.locationRestriction.latitude || !attendanceForm.locationRestriction.longitude)) {
      toast({
        title: "Location Required",
        description: "Please set a location for attendance restriction or disable location restriction",
        variant: "destructive"
      });
      return;
    }

    try {
      await activateAttendance(unit.id, selectedWeek.weekNumber, {
        title: attendanceForm.title,
        description: attendanceForm.description,
        date: attendanceForm.date,
        startTime: attendanceForm.startTime,
        endTime: attendanceForm.endTime,
        venue: attendanceForm.venue,
        locationRestriction: attendanceForm.locationRestriction
      });

      // Reset form
      setAttendanceForm({
        title: '',
        description: '',
        date: new Date(),
        startTime: '08:00',
        endTime: '10:00',
        venue: '',
        locationRestriction: {
          enabled: false,
          latitude: undefined,
          longitude: undefined,
          radius: 100,
          locationName: ''
        }
      });
      setCurrentLocation(null);
      
      setIsCreateAttendanceOpen(false);
      toast({
        title: "Attendance Activated",
        description: `Attendance session "${attendanceForm.title}" activated for Week ${selectedWeek.weekNumber} and synced to Attendance tab`
      });

      // Reload the semester plan to show the new attendance session
      const plan = await getSemesterPlan(unit.id);
      setWeekPlansLocal(plan.weekPlans);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate attendance session",
        variant: "destructive"
      });
    }
  };

  // Edit attendance session
  const editAttendance = (attendance: AttendanceSession) => {
    setEditingAttendance(attendance);
    setAttendanceForm({
      title: attendance.title,
      description: attendance.description,
      date: attendance.date,
      startTime: attendance.startTime,
      endTime: attendance.endTime,
      venue: attendance.venue || '',
      locationRestriction: {
        enabled: attendance.locationRestriction?.enabled || false,
        latitude: attendance.locationRestriction?.latitude,
        longitude: attendance.locationRestriction?.longitude,
        radius: attendance.locationRestriction?.radius || 100,
        locationName: attendance.locationRestriction?.locationName || ''
      }
    });
    
    // Set current location if there's a location restriction
    if (attendance.locationRestriction?.latitude && attendance.locationRestriction?.longitude) {
      setCurrentLocation({
        lat: attendance.locationRestriction.latitude,
        lng: attendance.locationRestriction.longitude
      });
    }
    
    setIsCreateAttendanceOpen(true);
  };

  // Update attendance session
  const updateAttendance = async () => {
    if (!selectedWeek || !editingAttendance || !attendanceForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate location restriction if enabled
    if (attendanceForm.locationRestriction.enabled && 
        (!attendanceForm.locationRestriction.latitude || !attendanceForm.locationRestriction.longitude)) {
      toast({
        title: "Location Required",
        description: "Please set a location for attendance restriction or disable location restriction",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedAttendance: AttendanceSession = {
        ...editingAttendance,
        title: attendanceForm.title,
        description: attendanceForm.description,
        date: attendanceForm.date,
        startTime: attendanceForm.startTime,
        endTime: attendanceForm.endTime,
        venue: attendanceForm.venue,
        locationRestriction: attendanceForm.locationRestriction
      };

      setWeekPlans(prev => prev.map(week => 
        week.weekNumber === selectedWeek.weekNumber
          ? {
              ...week,
              attendanceSessions: week.attendanceSessions.map(session => 
                session.id === editingAttendance.id ? updatedAttendance : session
              )
            }
          : week
      ));

      // Reset form and edit state
      setAttendanceForm({
        title: '',
        description: '',
        date: new Date(),
        startTime: '08:00',
        endTime: '10:00',
        venue: '',
        locationRestriction: {
          enabled: false,
          latitude: undefined,
          longitude: undefined,
          radius: 100,
          locationName: ''
        }
      });
      setCurrentLocation(null);
      setEditingAttendance(null);
      setIsCreateAttendanceOpen(false);
      
      toast({
        title: "Attendance Updated",
        description: `Updated "${updatedAttendance.title}" in Week ${selectedWeek.weekNumber}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance session",
        variant: "destructive"
      });
    }
  };

  // Delete attendance session
  const deleteAttendance = (attendanceId: string) => {
    if (!selectedWeek) return;

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            attendanceSessions: week.attendanceSessions.filter(session => session.id !== attendanceId)
          }
        : week
    ));

    toast({
      title: "Attendance Deleted",
      description: "Attendance session has been removed from the week"
    });
  };

  // Add online class to selected week
  const addOnlineClassToWeek = async () => {
    if (!selectedWeek || !onlineClassForm.title || !onlineClassForm.meetingLink) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including meeting link",
        variant: "destructive"
      });
      return;
    }

    try {
      await addOnlineClass(unit.id, selectedWeek.weekNumber, {
        title: onlineClassForm.title,
        description: onlineClassForm.description,
        date: onlineClassForm.date,
        startTime: onlineClassForm.startTime,
        endTime: onlineClassForm.endTime,
        platform: onlineClassForm.platform,
        meetingLink: onlineClassForm.meetingLink,
        meetingId: onlineClassForm.meetingId,
        passcode: onlineClassForm.passcode,
        instructions: onlineClassForm.instructions
      });

      // Reset form
      setOnlineClassForm({
        title: '',
        description: '',
        date: new Date(),
        startTime: '08:00',
        endTime: '10:00',
        platform: 'zoom',
        meetingLink: '',
        meetingId: '',
        passcode: '',
        instructions: ''
      });
      
      setIsCreateOnlineClassOpen(false);
      toast({
        title: "Online Class Added",
        description: `Online class "${onlineClassForm.title}" added to Week ${selectedWeek.weekNumber} and synced to Online Classes tab`
      });

      // Reload the semester plan to show the new online class
      const plan = await getSemesterPlan(unit.id);
      setWeekPlansLocal(plan.weekPlans);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add online class",
        variant: "destructive"
      });
    }
  };

  // Edit online class
  const editOnlineClass = (onlineClass: OnlineClass) => {
    setEditingOnlineClass(onlineClass);
    setOnlineClassForm({
      title: onlineClass.title,
      description: onlineClass.description,
      date: onlineClass.date,
      startTime: onlineClass.startTime,
      endTime: onlineClass.endTime,
      platform: onlineClass.platform,
      meetingLink: onlineClass.meetingLink,
      meetingId: onlineClass.meetingId,
      passcode: onlineClass.passcode,
      instructions: onlineClass.instructions
    });
    setIsCreateOnlineClassOpen(true);
  };

  // Update online class
  const updateOnlineClass = async () => {
    if (!selectedWeek || !editingOnlineClass || !onlineClassForm.title || !onlineClassForm.meetingLink) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including meeting link",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedOnlineClass: OnlineClass = {
        ...editingOnlineClass,
        title: onlineClassForm.title,
        description: onlineClassForm.description,
        date: onlineClassForm.date,
        startTime: onlineClassForm.startTime,
        endTime: onlineClassForm.endTime,
        platform: onlineClassForm.platform,
        meetingLink: onlineClassForm.meetingLink,
        meetingId: onlineClassForm.meetingId,
        passcode: onlineClassForm.passcode,
        instructions: onlineClassForm.instructions
      };

      setWeekPlans(prev => prev.map(week => 
        week.weekNumber === selectedWeek.weekNumber
          ? {
              ...week,
              onlineClasses: week.onlineClasses.map(onlineClass => 
                onlineClass.id === editingOnlineClass.id ? updatedOnlineClass : onlineClass
              )
            }
          : week
      ));

      // Reset form and edit state
      setOnlineClassForm({
        title: '',
        description: '',
        date: new Date(),
        startTime: '08:00',
        endTime: '10:00',
        platform: 'zoom',
        meetingLink: '',
        meetingId: '',
        passcode: '',
        instructions: ''
      });
      setEditingOnlineClass(null);
      setIsCreateOnlineClassOpen(false);
      
      toast({
        title: "Online Class Updated",
        description: `Updated "${updatedOnlineClass.title}" in Week ${selectedWeek.weekNumber}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update online class",
        variant: "destructive"
      });
    }
  };

  // Delete online class
  const deleteOnlineClass = (onlineClassId: string) => {
    if (!selectedWeek) return;

    setWeekPlans(prev => prev.map(week => 
      week.weekNumber === selectedWeek.weekNumber
        ? {
            ...week,
            onlineClasses: week.onlineClasses.filter(onlineClass => onlineClass.id !== onlineClassId)
          }
        : week
    ));

    toast({
      title: "Online Class Deleted",
      description: "Online class has been removed from the week"
    });
  };

  // Check if content should be available (date-based release)
  const isContentAvailable = (releaseDate: Date, releaseTime?: string) => {
    const now = new Date();
    if (releaseTime) {
      const [hours, minutes] = releaseTime.split(':').map(Number);
      const releaseDateTime = new Date(releaseDate);
      releaseDateTime.setHours(hours, minutes, 0, 0);
      return isAfter(now, releaseDateTime);
    }
    return isAfter(now, releaseDate);
  };

  // Get day of week from date
  const getDayOfWeek = (date: Date, dayName: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    const diff = targetDay - date.getDay();
    const resultDate = new Date(date);
    resultDate.setDate(date.getDate() + diff);
    return resultDate;
  };

  // Helper function to organize activities by day of week
  const organizeActivitiesByDay = (week: WeekPlan) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const activitiesByDay: Record<string, {
      materials: WeeklyMaterial[];
      assignments: WeeklyAssignment[];
      exams: WeeklyExam[];
      attendanceSessions: AttendanceSession[];
      onlineClasses: OnlineClass[];
    }> = {};

    // Initialize each day
    days.forEach(day => {
      activitiesByDay[day] = {
        materials: [],
        assignments: [],
        exams: [],
        attendanceSessions: [],
        onlineClasses: []
      };
    });

    // Group materials by day
    week.materials.forEach(material => {
      const day = material.dayOfWeek.toLowerCase();
      if (activitiesByDay[day]) {
        activitiesByDay[day].materials.push(material);
      }
    });

    // Group assignments by assign date day
    week.assignments.forEach(assignment => {
      const assignDay = format(assignment.assignDate, 'EEEE').toLowerCase();
      if (activitiesByDay[assignDay]) {
        activitiesByDay[assignDay].assignments.push(assignment);
      }
    });

    // Group exams by exam date day
    week.exams.forEach(exam => {
      const examDay = format(exam.examDate, 'EEEE').toLowerCase();
      if (activitiesByDay[examDay]) {
        activitiesByDay[examDay].exams.push(exam);
      }
    });

    // Group attendance sessions by date day
    week.attendanceSessions?.forEach(session => {
      const sessionDay = format(session.date, 'EEEE').toLowerCase();
      if (activitiesByDay[sessionDay]) {
        activitiesByDay[sessionDay].attendanceSessions.push(session);
      }
    });

    // Group online classes by date day
    week.onlineClasses?.forEach(onlineClass => {
      const classDay = format(onlineClass.date, 'EEEE').toLowerCase();
      if (activitiesByDay[classDay]) {
        activitiesByDay[classDay].onlineClasses.push(onlineClass);
      }
    });

    return activitiesByDay;
  };

  // Get day name for display
  const getDayDisplayName = (dayName: string) => {
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  };

  // Check if day has any activities
  const dayHasActivities = (dayActivities: {
    materials: WeeklyMaterial[];
    assignments: WeeklyAssignment[];
    exams: WeeklyExam[];
    attendanceSessions: AttendanceSession[];
    onlineClasses: OnlineClass[];
  }) => {
    return dayActivities.materials.length > 0 ||
           dayActivities.assignments.length > 0 ||
           dayActivities.exams.length > 0 ||
           dayActivities.attendanceSessions.length > 0 ||
           dayActivities.onlineClasses.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Semester Planner</h2>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">{unit.code} - {unit.name}</p>
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1 animate-spin" />
                Saving...
              </Badge>
            )}
          </div>
        </div>
        {weekPlans.length > 0 && (
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Delete Entire Semester Plan?
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently delete your entire semester plan including all {weekPlans.length} weeks, 
                    materials, assignments, and exams. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      resetSemesterPlan();
                      // Close dialog by triggering outside click
                      document.body.click();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Semester Setup */}
      {weekPlans.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Semester Plan</CardTitle>
            <CardDescription>
              Configure your semester timeline and generate weekly structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {semesterStart ? format(semesterStart, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={semesterStart}
                      onSelect={setSemesterStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Number of Weeks</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={semesterWeeks}
                  onChange={(e) => setSemesterWeeks(parseInt(e.target.value) || 15)}
                />
              </div>
            </div>
            
            <Button onClick={generateSemesterPlan} className="w-full" disabled={!semesterStart}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Generate Semester Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Week Plans Overview */}
      {weekPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Weekly Schedule</h3>
            <Badge variant="outline">
              {weekPlans.length} weeks planned
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekPlans.map((week) => (
              <Card 
                key={week.weekNumber}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWeek?.weekNumber === week.weekNumber ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWeek(week)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Week {week.weekNumber}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
                    </Badge>
                  </div>
                  
                  {/* Week Message Display/Edit */}
                  <div className="mt-2">
                    {editingWeekMessage === week.weekNumber ? (
                      <div className="flex flex-col gap-2">
                        <Input
                          value={tempWeekMessage}
                          onChange={(e) => setTempWeekMessage(e.target.value)}
                          placeholder="e.g., Lessons Week, Revision Week, Exams Week"
                          className="text-sm"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateWeekMessage(week.weekNumber, tempWeekMessage);
                            } else if (e.key === 'Escape') {
                              setEditingWeekMessage(null);
                              setTempWeekMessage('');
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateWeekMessage(week.weekNumber, tempWeekMessage);
                            }}
                            className="text-xs h-6 px-2"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWeekMessage(null);
                              setTempWeekMessage('');
                            }}
                            className="text-xs h-6 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center justify-between group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {week.weekMessage ? (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {week.weekMessage}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Add week message</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWeekMessage(week.weekNumber);
                            setTempWeekMessage(week.weekMessage || '');
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Materials: {week.materials.length}
                    </span>
                    <span className="text-green-600">
                      {week.materials.filter(m => m.isUploaded).length} uploaded
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3 h-3" />
                      Assignments: {week.assignments.length}
                    </span>
                    <span className="text-orange-600">
                      {week.assignments.filter(a => a.isUploaded).length} uploaded
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Exams: {week.exams.length}
                    </span>
                    <span className="text-red-600">
                      {week.exams.filter(e => !e.isLocked).length} unlocked
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Week Details */}
      {selectedWeek && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Week {selectedWeek.weekNumber} Details</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{format(selectedWeek.startDate, 'PPPP')} - {format(selectedWeek.endDate, 'PPPP')}</span>
                  {selectedWeek.weekMessage && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {selectedWeek.weekMessage}
                      </Badge>
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={isCreateMaterialOpen} onOpenChange={(open) => {
                  setIsCreateMaterialOpen(open);
                  if (!open) {
                    setEditingMaterial(null);
                    setMaterialDocuments([]);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMaterial ? 'Edit Material' : 'Add Material to Week'} {selectedWeek.weekNumber}
                      </DialogTitle>
                      <DialogDescription>
                        Schedule course materials for specific days and times
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={materialForm.title}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Introduction to Software Engineering"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={materialForm.description}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the material"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select 
                            value={materialForm.type} 
                            onValueChange={(value: 'notes' | 'material') => 
                              setMaterialForm(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="notes">Lecture Notes</SelectItem>
                              <SelectItem value="material">Course Material</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Day of Week</Label>
                          <Select 
                            value={materialForm.dayOfWeek} 
                            onValueChange={(value) => 
                              setMaterialForm(prev => ({ ...prev, dayOfWeek: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">Wednesday</SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Release Time</Label>
                        <Input
                          type="time"
                          value={materialForm.releaseTime}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, releaseTime: e.target.value }))}
                        />
                      </div>
                      
                      {/* Document Upload Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4" />
                          <Label className="text-sm font-medium">Attach Documents (Optional)</Label>
                        </div>
                        <DocumentManager
                          unitId={unit.id}
                          weekNumber={selectedWeek?.weekNumber || 0}
                          itemId="temp-material"
                          itemType="material"
                          title={materialForm.title || "New Material"}
                          documents={materialDocuments}
                          onDocumentsChange={setMaterialDocuments}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsCreateMaterialOpen(false);
                          setEditingMaterial(null);
                          setMaterialDocuments([]);
                        }} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                        <Button onClick={editingMaterial ? updateMaterial : addMaterialToWeek} className="w-full sm:w-auto">
                          {editingMaterial ? 'Update Material' : 'Add Material'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isCreateAssignmentOpen} onOpenChange={(open) => {
                  setIsCreateAssignmentOpen(open);
                  if (!open) {
                    setEditingAssignment(null);
                    setAssignmentDocuments([]);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAssignment ? 'Edit Assignment' : 'Add Assignment to Week'} {selectedWeek.weekNumber}
                      </DialogTitle>
                      <DialogDescription>
                        Create document or essay assignments with due dates
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={assignmentForm.title}
                          onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Data Structures Essay"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={assignmentForm.description}
                          onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Assignment description and requirements"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Assignment Type</Label>
                          <Select 
                            value={assignmentForm.type} 
                            onValueChange={(value: 'document' | 'essay') => 
                              setAssignmentForm(prev => ({ 
                                ...prev, 
                                type: value,
                                requiresAICheck: value === 'essay'
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document Upload</SelectItem>
                              <SelectItem value="essay">Text Essay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Maximum Marks</Label>
                          <Input
                            type="number"
                            min="1"
                            value={assignmentForm.maxMarks}
                            onChange={(e) => setAssignmentForm(prev => ({ 
                              ...prev, 
                              maxMarks: parseInt(e.target.value) || 100 
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Assign Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(assignmentForm.assignDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={assignmentForm.assignDate}
                                onSelect={(date) => date && setAssignmentForm(prev => ({ 
                                  ...prev, 
                                  assignDate: date 
                                }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(assignmentForm.dueDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={assignmentForm.dueDate}
                                onSelect={(date) => date && setAssignmentForm(prev => ({ 
                                  ...prev, 
                                  dueDate: date 
                                }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Instructions</Label>
                        <Textarea
                          value={assignmentForm.instructions}
                          onChange={(e) => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Detailed instructions for students"
                          rows={3}
                        />
                      </div>
                      
                      {/* Document Upload Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4" />
                          <Label className="text-sm font-medium">Attach Supporting Documents (Optional)</Label>
                        </div>
                        <DocumentManager
                          unitId={unit.id}
                          weekNumber={selectedWeek?.weekNumber || 0}
                          itemId="temp-assignment"
                          itemType="assignment"
                          title={assignmentForm.title || "New Assignment"}
                          documents={assignmentDocuments}
                          onDocumentsChange={setAssignmentDocuments}
                        />
                      </div>
                      
                      {assignmentForm.type === 'essay' && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <input
                            type="checkbox"
                            id="aiCheck"
                            checked={assignmentForm.requiresAICheck}
                            onChange={(e) => setAssignmentForm(prev => ({ 
                              ...prev, 
                              requiresAICheck: e.target.checked 
                            }))}
                          />
                          <Label htmlFor="aiCheck" className="text-sm">
                            Enable AI plagiarism detection for essay submissions
                          </Label>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                          setIsCreateAssignmentOpen(false);
                          setEditingAssignment(null);
                          setAssignmentDocuments([]);
                        }} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                        <Button onClick={editingAssignment ? updateAssignment : addAssignmentToWeek} className="w-full sm:w-auto">
                          {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isCreateExamOpen} onOpenChange={(open) => {
                  setIsCreateExamOpen(open);
                  if (!open) {
                    setEditingExam(null);
                    setExamQuestions([]);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingExam ? 'Edit Exam' : 'Add Exam to Week'} {selectedWeek.weekNumber}
                      </DialogTitle>
                      <DialogDescription>
                        Schedule exams or CATs with automatic time-based locking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-1">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={examForm.title}
                          onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., CAT 1 - Data Structures"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={examForm.description}
                          onChange={(e) => setExamForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Exam description and topics covered"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Exam Type</Label>
                          <Select 
                            value={examForm.type} 
                            onValueChange={(value: 'exam' | 'cat') => 
                              setExamForm(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cat">CAT</SelectItem>
                              <SelectItem value="exam">Final Exam</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Maximum Marks</Label>
                          <Input
                            type="number"
                            min="1"
                            value={examForm.maxMarks}
                            onChange={(e) => setExamForm(prev => ({ 
                              ...prev, 
                              maxMarks: parseInt(e.target.value) || 100 
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Exam Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(examForm.examDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={examForm.examDate}
                                onSelect={(date) => date && setExamForm(prev => ({ 
                                  ...prev, 
                                  examDate: date 
                                }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Exam Time</Label>
                          <Input
                            type="time"
                            value={examForm.examTime}
                            onChange={(e) => setExamForm(prev => ({ ...prev, examTime: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            min="15"
                            max="300"
                            value={examForm.duration}
                            onChange={(e) => setExamForm(prev => ({ 
                              ...prev, 
                              duration: parseInt(e.target.value) || 90 
                            }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Venue (Optional)</Label>
                          <Input
                            value={examForm.venue}
                            onChange={(e) => setExamForm(prev => ({ ...prev, venue: e.target.value }))}
                            placeholder="e.g., Room 101"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Instructions</Label>
                        <Textarea
                          value={examForm.instructions}
                          onChange={(e) => setExamForm(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Exam instructions and rules"
                          rows={3}
                        />
                      </div>

                      {/* CAT-Specific Features */}
                      {examForm.type === 'cat' && (
                        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            CAT Proctoring Features
                          </h4>
                          <div className="text-sm text-blue-700 space-y-2">
                            <p className="font-medium">This CAT will automatically require:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                                <Monitor className="w-4 h-4 text-blue-600" />
                                <span>Screen Sharing</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                                <Camera className="w-4 h-4 text-green-600" />
                                <span>Webcam Access</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                                <Keyboard className="w-4 h-4 text-orange-600" />
                                <span>Keyboard Monitoring</span>
                              </div>
                            </div>
                            <div className="mt-3 p-3 bg-blue-100 rounded">
                              <p className="text-xs">
                                <strong>Student Experience:</strong> Students will access a full-page workspace with a collapsible sidebar 
                                showing question numbers. The exam will automatically enforce security measures including 
                                fullscreen mode, disabled copy/paste, and real-time proctoring.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Exam Questions Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4" />
                          <Label className="text-sm font-medium">
                            {examForm.type === 'cat' ? 'Create CAT Questions' : 'Create Exam Questions'} (Optional)
                          </Label>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <ExamQuestionManager
                            unitId={unit.id}
                            weekNumber={selectedWeek?.weekNumber || 0}
                            exam={{
                              id: "temp-exam",
                              title: examForm.title || "New Exam",
                              type: examForm.type,
                              questions: examQuestions,
                              approvalStatus: 'draft'
                            } as any}
                            isCreationMode={true}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                          setIsCreateExamOpen(false);
                          setEditingExam(null);
                          setExamQuestions([]);
                        }} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                        <Button onClick={editingExam ? updateExam : addExamToWeek} className="w-full sm:w-auto">
                          {editingExam ? 'Update Exam' : 'Add Exam'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="weekly-schedule">
                  Weekly Schedule
                </TabsTrigger>
                <TabsTrigger value="materials">
                  Materials ({selectedWeek.materials.length})
                </TabsTrigger>
                <TabsTrigger value="assignments">
                  Assignments ({selectedWeek.assignments.length})
                </TabsTrigger>
                <TabsTrigger value="exams">
                  Exams ({selectedWeek.exams.length})
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  Attendance ({selectedWeek.attendanceSessions?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="online-classes">
                  Online Classes ({selectedWeek.onlineClasses?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly-schedule" className="space-y-4">
                {(() => {
                  const activitiesByDay = organizeActivitiesByDay(selectedWeek);
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  
                  return (
                    <div className="space-y-4">
                      {/* Quick Actions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-blue-800">Quick Actions for Week {selectedWeek.weekNumber}</h4>
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            {format(selectedWeek.startDate, 'MMM d')} - {format(selectedWeek.endDate, 'MMM d, yyyy')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <Dialog open={isCreateMaterialOpen} onOpenChange={(open) => {
                            setIsCreateMaterialOpen(open);
                            if (!open) {
                              setEditingMaterial(null);
                              setMaterialDocuments([]);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                                <FileText className="w-4 h-4 mr-2" />
                                Add Material
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <Dialog open={isCreateAssignmentOpen} onOpenChange={(open) => {
                            setIsCreateAssignmentOpen(open);
                            if (!open) {
                              setEditingAssignment(null);
                              setAssignmentDocuments([]);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                <PenTool className="w-4 h-4 mr-2" />
                                Add Assignment
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <Dialog open={isCreateExamOpen} onOpenChange={(open) => {
                            setIsCreateExamOpen(open);
                            if (!open) {
                              setEditingExam(null);
                              setExamQuestions([]);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Add Exam
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <Dialog open={isCreateAttendanceOpen} onOpenChange={(open) => {
                            setIsCreateAttendanceOpen(open);
                            if (!open) {
                              setEditingAttendance(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                                <Users className="w-4 h-4 mr-2" />
                                Add Attendance
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <Dialog open={isCreateOnlineClassOpen} onOpenChange={(open) => {
                            setIsCreateOnlineClassOpen(open);
                            if (!open) {
                              setEditingOnlineClass(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                <Video className="w-4 h-4 mr-2" />
                                Add Online Class
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </div>
                      
                      {/* Days of the Week */}
                      {days.map(day => {
                        const dayActivities = activitiesByDay[day];
                        const hasActivities = dayHasActivities(dayActivities);
                        const dayDate = getDayOfWeek(selectedWeek.startDate, day);
                        
                        return (
                          <Card key={day} className={`p-4 ${hasActivities ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-gray-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  {getDayDisplayName(day)}
                                  <Badge variant="outline" className="text-xs">
                                    {format(dayDate, 'MMM d')}
                                  </Badge>
                                </h3>
                              </div>
                              <div className="text-sm text-gray-500">
                                {hasActivities ? (
                                  <span className="text-blue-600 font-medium">
                                    {dayActivities.materials.length + 
                                     dayActivities.assignments.length + 
                                     dayActivities.exams.length + 
                                     dayActivities.attendanceSessions.length + 
                                     dayActivities.onlineClasses.length} activities
                                  </span>
                                ) : (
                                  <span className="text-gray-400">No activities</span>
                                )}
                              </div>
                            </div>
                            
                            {hasActivities ? (
                              <div className="space-y-3">
                                {/* Materials */}
                                {dayActivities.materials.map(material => (
                                  <div key={`material-${material.id}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-green-800">{material.title}</span>
                                        <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                          {material.type}
                                        </Badge>
                                        <span className="text-xs text-green-600">at {material.releaseTime}</span>
                                      </div>
                                      <p className="text-sm text-green-700 mt-1">{material.description}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => editMaterial(material)}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {/* Assignments */}
                                {dayActivities.assignments.map(assignment => (
                                  <div key={`assignment-${assignment.id}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <PenTool className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-blue-800">{assignment.title}</span>
                                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                          {assignment.type}
                                        </Badge>
                                        <span className="text-xs text-blue-600">Due: {format(assignment.dueDate, 'MMM d')}</span>
                                      </div>
                                      <p className="text-sm text-blue-700 mt-1">{assignment.description}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => editAssignment(assignment)}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {/* Exams */}
                                {dayActivities.exams.map(exam => (
                                  <div key={`exam-${exam.id}`} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <GraduationCap className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-purple-800">{exam.title}</span>
                                        <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                                          {exam.type}
                                        </Badge>
                                        <span className="text-xs text-purple-600">at {exam.examTime}</span>
                                      </div>
                                      <p className="text-sm text-purple-700 mt-1">{exam.venue && `Venue: ${exam.venue}`}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => editExam(exam)}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {/* Attendance Sessions */}
                                {dayActivities.attendanceSessions.map(session => (
                                  <div key={`attendance-${session.id}`} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                      <Users className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-orange-800">{session.title}</span>
                                        <Badge variant={session.isActive ? "default" : "secondary"} className="text-xs">
                                          {session.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                        <span className="text-xs text-orange-600">{session.startTime} - {session.endTime}</span>
                                      </div>
                                      <p className="text-sm text-orange-700 mt-1">{session.venue && `Venue: ${session.venue}`}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => editAttendance(session)}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {/* Online Classes */}
                                {dayActivities.onlineClasses.map(onlineClass => (
                                  <div key={`online-${onlineClass.id}`} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                      <Video className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-indigo-800">{onlineClass.title}</span>
                                        <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-700">
                                          {onlineClass.platform}
                                        </Badge>
                                        <span className="text-xs text-indigo-600">{onlineClass.startTime} - {onlineClass.endTime}</span>
                                      </div>
                                      <p className="text-sm text-indigo-700 mt-1">{onlineClass.description}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => editOnlineClass(onlineClass)}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <CalendarIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm">No activities scheduled for {getDayDisplayName(day)}</p>
                                <p className="text-xs mt-1">Add materials, assignments, or classes for this day</p>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="materials" className="space-y-4">
                {selectedWeek.materials.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWeek.materials.map((material) => {
                      const releaseDate = getDayOfWeek(selectedWeek.startDate, material.dayOfWeek);
                      const isAvailable = isContentAvailable(releaseDate, material.releaseTime);
                      
                      return (
                        <Card key={material.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{material.title}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {material.type}
                                </Badge>
                                {isAvailable ? (
                                  <Badge variant="secondary" className="text-green-600">
                                    <Unlock className="w-3 h-3 mr-1" />
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-orange-600">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Locked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <span className="capitalize">{material.dayOfWeek} at {material.releaseTime}</span>
                                <span>{format(releaseDate, 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {material.isVisible ? (
                                <Badge variant="default" className="bg-green-600 text-white">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-400 text-gray-600">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Draft
                                </Badge>
                              )}
                              <Button 
                                size="sm" 
                                variant={material.isVisible ? "default" : "outline"}
                                onClick={() => toggleMaterialVisibility(material.id)}
                                className={material.isVisible ? "bg-green-600 hover:bg-green-700" : "border-green-600 text-green-600 hover:bg-green-50"}
                              >
                                {material.isVisible ? (
                                  <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              {material.isUploaded ? (
                                <Badge variant="secondary" className="text-green-600">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Uploaded
                                </Badge>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => editMaterial(material)}>
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteMaterial(material.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Document Manager for this material */}
                          <div className="mt-4 border-t pt-4">
                            <DocumentManager
                              unitId={unit.id}
                              weekNumber={selectedWeek.weekNumber}
                              itemId={material.id}
                              itemType="material"
                              title={material.title}
                              documents={material.documents || []}
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No materials scheduled for this week</p>
                    <p className="text-sm">Click "Add Material" to schedule course content</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="assignments" className="space-y-4">
                {selectedWeek.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWeek.assignments.map((assignment) => (
                      <Card key={assignment.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{assignment.title}</h4>
                              <Badge variant="outline" className="capitalize">
                                {assignment.type}
                              </Badge>
                              {assignment.requiresAICheck && (
                                <Badge variant="secondary" className="text-blue-600">
                                  AI Check
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span>Assigned: {format(assignment.assignDate, 'MMM d')}</span>
                              <span>Due: {format(assignment.dueDate, 'MMM d')}</span>
                              <span>Marks: {assignment.maxMarks}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignment.isUploaded ? (
                              <Badge variant="secondary" className="text-green-600">
                                <FileText className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline">
                                <Upload className="w-3 h-3 mr-1" />
                                Upload
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => editAssignment(assignment)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteAssignment(assignment.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Document Manager for this assignment */}
                        <div className="mt-4 border-t pt-4">
                          <DocumentManager
                            unitId={unit.id}
                            weekNumber={selectedWeek.weekNumber}
                            itemId={assignment.id}
                            itemType="assignment"
                            title={assignment.title}
                            documents={assignment.documents || []}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No assignments scheduled for this week</p>
                    <p className="text-sm">Click "Add Assignment" to create assignments</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="exams" className="space-y-4">
                {selectedWeek.exams.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWeek.exams.map((exam) => {
                      const isExamAvailable = isContentAvailable(exam.examDate, exam.examTime);
                      
                      return (
                        <Card key={exam.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{exam.title}</h4>
                                <Badge variant="outline" className="capitalize">
                                  {exam.type}
                                </Badge>
                                {exam.approvalStatus && (
                                  <Badge variant={
                                    exam.approvalStatus === 'approved' ? 'default' :
                                    exam.approvalStatus === 'pending_approval' ? 'secondary' :
                                    exam.approvalStatus === 'rejected' ? 'destructive' : 'outline'
                                  }>
                                    {exam.approvalStatus === 'approved' ? 'Approved' :
                                     exam.approvalStatus === 'pending_approval' ? 'Pending' :
                                     exam.approvalStatus === 'rejected' ? 'Rejected' : 'Draft'}
                                  </Badge>
                                )}
                                {exam.isLocked && !isExamAvailable ? (
                                  <Badge variant="secondary" className="text-red-600">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Locked
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-green-600">
                                    <Unlock className="w-3 h-3 mr-1" />
                                    Available
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <span>{format(exam.examDate, 'MMM d, yyyy')} at {exam.examTime}</span>
                                <span>{exam.duration} minutes</span>
                                <span>Marks: {exam.maxMarks}</span>
                                {exam.venue && <span>Venue: {exam.venue}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  // Toggle lock status
                                  setWeekPlans(prev => prev.map(week => 
                                    week.weekNumber === selectedWeek.weekNumber
                                      ? {
                                          ...week,
                                          exams: week.exams.map(e => 
                                            e.id === exam.id ? { ...e, isLocked: !e.isLocked } : e
                                          )
                                        }
                                      : week
                                  ));
                                }}
                              >
                                {exam.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              </Button>
                              {exam.type === 'cat' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedExamForMonitoring({ examId: exam.id, unitId: unit.id });
                                    setShowCATMonitoring(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Monitor className="w-3 h-3 mr-1" />
                                  Monitor
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => editExam(exam)}>
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteExam(exam.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Exam Question Manager */}
                          <div className="mt-4 border-t pt-4">
                            <ExamQuestionManager
                              unitId={unit.id}
                              weekNumber={selectedWeek.weekNumber}
                              exam={exam}
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No exams scheduled for this week</p>
                    <p className="text-sm">Click "Add Exam" to schedule exams or CATs</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                {selectedWeek.attendanceSessions && selectedWeek.attendanceSessions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWeek.attendanceSessions.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{session.title}</h4>
                              <Badge variant={session.isActive ? "default" : "secondary"}>
                                {session.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {session.locationRestriction?.enabled && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Location Restricted
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span>{format(session.date, 'MMM d, yyyy')}</span>
                              <span>{session.startTime} - {session.endTime}</span>
                              {session.venue && <span>Venue: {session.venue}</span>}
                            </div>
                            {session.locationRestriction?.enabled && session.locationRestriction?.locationName && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                <div className="flex items-center gap-1 text-blue-700">
                                  <MapPin className="w-3 h-3" />
                                  <span className="font-medium">Location Restriction:</span>
                                </div>
                                <p className="text-blue-600 mt-1">{session.locationRestriction.locationName}</p>
                                <p className="text-blue-500">
                                  Radius: {session.locationRestriction.radius}m
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => editAttendance(session)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteAttendance(session.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No attendance sessions scheduled for this week</p>
                    <p className="text-sm">Click "Activate Attendance" to create attendance sessions</p>
                  </div>
                )}
                
                <Dialog open={isCreateAttendanceOpen} onOpenChange={(open) => {
                  setIsCreateAttendanceOpen(open);
                  if (!open) {
                    setEditingAttendance(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Activate Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAttendance ? 'Edit Attendance Session' : 'Activate Attendance Session'}
                      </DialogTitle>
                      <DialogDescription>
                        Create an attendance session for Week {selectedWeek.weekNumber}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="attendance-title">Session Title *</Label>
                        <Input
                          id="attendance-title"
                          value={attendanceForm.title}
                          onChange={(e) => setAttendanceForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Week 1 Lecture Attendance"
                        />
                      </div>
                      <div>
                        <Label htmlFor="attendance-description">Description</Label>
                        <Textarea
                          id="attendance-description"
                          value={attendanceForm.description}
                          onChange={(e) => setAttendanceForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description for the attendance session"
                        />
                      </div>
                      <div>
                        <Label htmlFor="attendance-date">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {attendanceForm.date ? format(attendanceForm.date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={attendanceForm.date}
                              onSelect={(date) => date && setAttendanceForm(prev => ({ ...prev, date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="attendance-start-time">Start Time</Label>
                          <Input
                            id="attendance-start-time"
                            type="time"
                            value={attendanceForm.startTime}
                            onChange={(e) => setAttendanceForm(prev => ({ ...prev, startTime: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="attendance-end-time">End Time</Label>
                          <Input
                            id="attendance-end-time"
                            type="time"
                            value={attendanceForm.endTime}
                            onChange={(e) => setAttendanceForm(prev => ({ ...prev, endTime: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="attendance-venue">Venue</Label>
                        <Input
                          id="attendance-venue"
                          value={attendanceForm.venue}
                          onChange={(e) => setAttendanceForm(prev => ({ ...prev, venue: e.target.value }))}
                          placeholder="e.g., Room 101, Lab A"
                        />
                      </div>
                      
                      {/* Location Restriction Section */}
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="location-restriction"
                            checked={attendanceForm.locationRestriction.enabled}
                            onCheckedChange={(enabled) => 
                              setAttendanceForm(prev => ({
                                ...prev,
                                locationRestriction: {
                                  ...prev.locationRestriction,
                                  enabled
                                }
                              }))
                            }
                          />
                          <Label htmlFor="location-restriction" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Enable Location Restriction
                          </Label>
                        </div>
                        
                        {attendanceForm.locationRestriction.enabled && (
                          <div className="space-y-4 pl-6 border-l-2 border-blue-100">
                            <div className="flex flex-col gap-2">
                              <Label className="text-sm text-gray-600">
                                Students must be within the specified location to mark attendance
                              </Label>
                              
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={getCurrentLocation}
                                  disabled={isGettingLocation}
                                  className="flex-1"
                                >
                                  {isGettingLocation ? (
                                    <>
                                      <Target className="w-4 h-4 mr-2 animate-spin" />
                                      Getting Location...
                                    </>
                                  ) : (
                                    <>
                                      <Navigation className="w-4 h-4 mr-2" />
                                      Use Current Location
                                    </>
                                  )}
                                </Button>
                                
                                {(currentLocation || (attendanceForm.locationRestriction.latitude && attendanceForm.locationRestriction.longitude)) && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearLocationRestriction}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {attendanceForm.locationRestriction.locationName && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <Label className="text-sm font-medium text-blue-800">
                                  Selected Location
                                </Label>
                                <p className="text-sm text-blue-600 mt-1">
                                  {attendanceForm.locationRestriction.locationName}
                                </p>
                                {attendanceForm.locationRestriction.latitude && attendanceForm.locationRestriction.longitude && (
                                  <p className="text-xs text-blue-500 mt-1">
                                    Lat: {attendanceForm.locationRestriction.latitude.toFixed(6)}, 
                                    Lng: {attendanceForm.locationRestriction.longitude.toFixed(6)}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <Label className="text-sm">
                                Allowed Distance: {attendanceForm.locationRestriction.radius}m
                              </Label>
                              <Slider
                                value={[attendanceForm.locationRestriction.radius || 100]}
                                onValueChange={(value) => 
                                  setAttendanceForm(prev => ({
                                    ...prev,
                                    locationRestriction: {
                                      ...prev.locationRestriction,
                                      radius: value[0]
                                    }
                                  }))
                                }
                                max={500}
                                min={10}
                                step={10}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>10m</span>
                                <span>500m</span>
                              </div>
                            </div>
                            
                            {!attendanceForm.locationRestriction.latitude && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-amber-800 font-medium">
                                      Location Required
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                      Click "Use Current Location" to set the attendance location
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button onClick={editingAttendance ? updateAttendance : addAttendanceToWeek} className="w-full">
                        {editingAttendance ? 'Update Attendance Session' : 'Activate Attendance Session'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="online-classes" className="space-y-4">
                {selectedWeek.onlineClasses && selectedWeek.onlineClasses.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWeek.onlineClasses.map((onlineClass) => (
                      <Card key={onlineClass.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{onlineClass.title}</h4>
                              <Badge variant="outline" className="capitalize">
                                {onlineClass.platform}
                              </Badge>
                              <Badge variant={onlineClass.isActive ? "default" : "secondary"}>
                                {onlineClass.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{onlineClass.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span>{format(onlineClass.date, 'MMM d, yyyy')}</span>
                              <span>{onlineClass.startTime} - {onlineClass.endTime}</span>
                              {onlineClass.meetingId && <span>ID: {onlineClass.meetingId}</span>}
                            </div>
                            <div className="mt-2">
                              <a 
                                href={onlineClass.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                Join Meeting
                              </a>
                              {onlineClass.passcode && (
                                <span className="ml-4 text-xs text-gray-500">
                                  Passcode: {onlineClass.passcode}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => editOnlineClass(onlineClass)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteOnlineClass(onlineClass.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No online classes scheduled for this week</p>
                    <p className="text-sm">Click "Add Online Class" to schedule virtual sessions</p>
                  </div>
                )}
                
                <Dialog open={isCreateOnlineClassOpen} onOpenChange={(open) => {
                  setIsCreateOnlineClassOpen(open);
                  if (!open) {
                    setEditingOnlineClass(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Online Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOnlineClass ? 'Edit Online Class' : 'Add Online Class'}
                      </DialogTitle>
                      <DialogDescription>
                        Schedule an online class for Week {selectedWeek.weekNumber}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="online-class-title">Class Title *</Label>
                        <Input
                          id="online-class-title"
                          value={onlineClassForm.title}
                          onChange={(e) => setOnlineClassForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Week 1 Virtual Lecture"
                        />
                      </div>
                      <div>
                        <Label htmlFor="online-class-description">Description</Label>
                        <Textarea
                          id="online-class-description"
                          value={onlineClassForm.description}
                          onChange={(e) => setOnlineClassForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description of the online class content"
                        />
                      </div>
                      <div>
                        <Label htmlFor="online-class-date">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {onlineClassForm.date ? format(onlineClassForm.date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={onlineClassForm.date}
                              onSelect={(date) => date && setOnlineClassForm(prev => ({ ...prev, date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="online-class-start-time">Start Time</Label>
                          <Input
                            id="online-class-start-time"
                            type="time"
                            value={onlineClassForm.startTime}
                            onChange={(e) => setOnlineClassForm(prev => ({ ...prev, startTime: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="online-class-end-time">End Time</Label>
                          <Input
                            id="online-class-end-time"
                            type="time"
                            value={onlineClassForm.endTime}
                            onChange={(e) => setOnlineClassForm(prev => ({ ...prev, endTime: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="online-class-platform">Platform</Label>
                        <Select
                          value={onlineClassForm.platform}
                          onValueChange={(value: any) => setOnlineClassForm(prev => ({ ...prev, platform: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="teams">Microsoft Teams</SelectItem>
                            <SelectItem value="meet">Google Meet</SelectItem>
                            <SelectItem value="bbb">BigBlueButton</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="online-class-link">Meeting Link *</Label>
                        <Input
                          id="online-class-link"
                          value={onlineClassForm.meetingLink}
                          onChange={(e) => setOnlineClassForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                          placeholder="https://zoom.us/j/123456789"
                        />
                      </div>
                      <div>
                        <Label htmlFor="online-class-meeting-id">Meeting ID</Label>
                        <Input
                          id="online-class-meeting-id"
                          value={onlineClassForm.meetingId}
                          onChange={(e) => setOnlineClassForm(prev => ({ ...prev, meetingId: e.target.value }))}
                          placeholder="123-456-789"
                        />
                      </div>
                      <div>
                        <Label htmlFor="online-class-passcode">Passcode</Label>
                        <Input
                          id="online-class-passcode"
                          value={onlineClassForm.passcode}
                          onChange={(e) => setOnlineClassForm(prev => ({ ...prev, passcode: e.target.value }))}
                          placeholder="Optional meeting passcode"
                        />
                      </div>
                      <div>
                        <Label htmlFor="online-class-instructions">Instructions</Label>
                        <Textarea
                          id="online-class-instructions"
                          value={onlineClassForm.instructions}
                          onChange={(e) => setOnlineClassForm(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Special instructions for joining the class"
                        />
                      </div>
                      <Button onClick={editingOnlineClass ? updateOnlineClass : addOnlineClassToWeek} className="w-full">
                        {editingOnlineClass ? 'Update Online Class' : 'Add Online Class'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* CAT Monitoring Dashboard */}
      {showCATMonitoring && selectedExamForMonitoring && (
        <CATMonitoringDashboard 
          examId={selectedExamForMonitoring.examId}
          unitId={selectedExamForMonitoring.unitId}
          onClose={() => {
            setShowCATMonitoring(false);
            setSelectedExamForMonitoring(null);
          }}
        />
      )}
    </div>
  );
};
