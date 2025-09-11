import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSemesterPlan } from '@/contexts/SemesterPlanContext';

interface DashboardContent {
  id: string;
  type: 'assignment' | 'notes' | 'exam' | 'cat' | 'attendance' | 'online-class';
  title: string;
  description: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  lecturerId?: string;
  studentId?: string;
  createdAt: string;
  status: string;
  isFromSemesterPlan?: boolean;
  // Assignment specific fields
  assignDate?: Date;
  dueDate?: Date;
  maxMarks?: number;
  instructions?: string;
  requiresAICheck?: boolean;
  // Exam specific fields
  examDate?: Date;
  examTime?: string;
  duration?: number;
  venue?: string;
  questions?: any[];
  // Material specific fields
  dayOfWeek?: string;
  releaseTime?: string;
  fileUrl?: string;
  fileName?: string;
  // Online class specific fields
  startTime?: string;
  endTime?: string;
  platform?: string;
  meetingLink?: string;
  meetingId?: string;
  passcode?: string;
  [key: string]: any;
}

export const useDashboardSync = (role: 'lecturer' | 'student') => {
  const { user, createdUnits } = useAuth();
  const { semesterPlans } = useSemesterPlan();
  const [syncedContent, setSyncedContent] = useState<DashboardContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract content from semester plans
  const extractContentFromSemesterPlans = () => {
    if (!user?.id || !createdUnits) return [];

    const content: DashboardContent[] = [];
    
    // Get units for current user (lecturer or student)
    const userUnits = role === 'lecturer' 
      ? createdUnits.filter(unit => unit.lecturerId === user.id)
      : createdUnits; // For students, show all units (simplified for now)

    userUnits.forEach(unit => {
      const semesterPlan = semesterPlans[unit.id];
      if (!semesterPlan?.weekPlans) return;

      semesterPlan.weekPlans.forEach(week => {
        // Extract assignments
        week.assignments?.forEach(assignment => {
          content.push({
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            description: assignment.description,
            unitId: unit.id,
            unitCode: unit.code,
            unitName: unit.name,
            lecturerId: unit.lecturerId,
            createdAt: assignment.assignDate?.toISOString() || new Date().toISOString(),
            status: 'active',
            isFromSemesterPlan: true,
            assignDate: assignment.assignDate,
            dueDate: assignment.dueDate,
            maxMarks: assignment.maxMarks,
            instructions: assignment.instructions,
            requiresAICheck: assignment.requiresAICheck,
            weekNumber: week.weekNumber,
            submissionType: assignment.type
          });
        });

        // Extract exams and CATs
        week.exams?.forEach(exam => {
          content.push({
            id: exam.id,
            type: exam.type as 'exam' | 'cat',
            title: exam.title,
            description: exam.description,
            unitId: unit.id,
            unitCode: unit.code,
            unitName: unit.name,
            lecturerId: unit.lecturerId,
            createdAt: exam.examDate?.toISOString() || new Date().toISOString(),
            status: exam.approvalStatus || 'draft',
            isFromSemesterPlan: true,
            examDate: exam.examDate,
            examTime: exam.examTime,
            duration: exam.duration,
            venue: exam.venue,
            maxMarks: exam.maxMarks,
            instructions: exam.instructions,
            questions: exam.questions,
            weekNumber: week.weekNumber,
            isLocked: exam.isLocked,
            approvalStatus: exam.approvalStatus
          });
        });

        // Extract notes/materials
        week.materials?.forEach(material => {
          content.push({
            id: material.id,
            type: 'notes',
            title: material.title,
            description: material.description,
            unitId: unit.id,
            unitCode: unit.code,
            unitName: unit.name,
            lecturerId: unit.lecturerId,
            createdAt: new Date().toISOString(),
            status: material.isVisible ? 'visible' : 'hidden',
            isFromSemesterPlan: true,
            dayOfWeek: material.dayOfWeek,
            releaseTime: material.releaseTime,
            fileUrl: material.fileUrl,
            fileName: material.fileName,
            weekNumber: week.weekNumber,
            materialType: material.type,
            isUploaded: material.isUploaded
          });
        });

        // Extract online classes
        week.onlineClasses?.forEach(onlineClass => {
          content.push({
            id: onlineClass.id,
            type: 'online-class',
            title: onlineClass.title,
            description: onlineClass.description,
            unitId: unit.id,
            unitCode: unit.code,
            unitName: unit.name,
            lecturerId: unit.lecturerId,
            createdAt: onlineClass.date?.toISOString() || new Date().toISOString(),
            status: onlineClass.isActive ? 'active' : 'inactive',
            isFromSemesterPlan: true,
            date: onlineClass.date,
            startTime: onlineClass.startTime,
            endTime: onlineClass.endTime,
            platform: onlineClass.platform,
            meetingLink: onlineClass.meetingLink,
            meetingId: onlineClass.meetingId,
            passcode: onlineClass.passcode,
            weekNumber: week.weekNumber
          });
        });

        // Extract attendance sessions
        week.attendanceSessions?.forEach(session => {
          // Ensure date is properly converted to Date object
          const sessionDate = session.date instanceof Date ? session.date : 
                              session.date ? new Date(session.date) : new Date();
          
          content.push({
            id: session.id,
            type: 'attendance',
            title: session.title,
            description: session.description,
            unitId: unit.id,
            unitCode: unit.code,
            unitName: unit.name,
            lecturerId: unit.lecturerId,
            createdAt: sessionDate.toISOString(),
            status: session.isActive ? 'active' : 'inactive',
            isFromSemesterPlan: true,
            date: sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            venue: session.venue,
            weekNumber: week.weekNumber
          });
        });
      });
    });

    return content;
  };

  // Load synced content from semester plans
  const loadSyncedContent = () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const content = extractContentFromSemesterPlans();
      setSyncedContent(content);
      console.log(`Loaded ${content.length} synced dashboard items for ${role}:`, user.id);
    } catch (error) {
      console.error('Error extracting synced dashboard content:', error);
      setSyncedContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload content when semester plans change
  useEffect(() => {
    if (!user?.id) return;
    
    loadSyncedContent();
  }, [user?.id, role, semesterPlans, createdUnits]);

  // Get content by type for specific dashboard tabs
  const getContentByType = (type: string) => {
    if (!Array.isArray(syncedContent)) {
      console.warn('syncedContent is not an array:', syncedContent);
      return [];
    }
    return syncedContent.filter(content => content.type === type);
  };

  // Get content for specific unit
  const getContentForUnit = (unitId: string) => {
    if (!Array.isArray(syncedContent)) {
      console.warn('syncedContent is not an array:', syncedContent);
      return [];
    }
    return syncedContent.filter(content => content.unitId === unitId);
  };

  // Mark content as seen/read (local storage for now)
  const markContentAsSeen = async (contentId: string) => {
    try {
      const seenKey = `seen_content_${user?.id}`;
      const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
      if (!seen.includes(contentId)) {
        seen.push(contentId);
        localStorage.setItem(seenKey, JSON.stringify(seen));
      }
    } catch (error) {
      console.error('Error marking content as seen:', error);
    }
  };

  // Force refresh synced content (useful for triggering manual sync)
  const refreshSyncedContent = () => {
    console.log('Forcing dashboard sync refresh...');
    loadSyncedContent();
  };

  return {
    syncedContent,
    isLoading,
    loadSyncedContent,
    refreshSyncedContent,
    getContentByType,
    getContentForUnit,
    markContentAsSeen
  };
};
