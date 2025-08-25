import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSemesterPlan, WeekPlan } from '@/contexts/SemesterPlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  PenTool, 
  GraduationCap, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  MapPin
} from 'lucide-react';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';

interface StudentSemesterViewProps {
  unitId: string;
  unitCode: string;
  unitName: string;
}

export const StudentSemesterView: React.FC<StudentSemesterViewProps> = ({
  unitId,
  unitCode,
  unitName
}) => {
  const { user } = useAuth();
  const { getStudentSemesterPlan, isLoading } = useSemesterPlan();
  const { toast } = useToast();
  
  const [semesterPlan, setSemesterPlan] = useState<{
    semesterStart?: Date;
    semesterWeeks: number;
    weekPlans: WeekPlan[];
  } | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  useEffect(() => {
    const loadSemesterPlan = async () => {
      if (!user?.id) return;
      
      try {
        const plan = await getStudentSemesterPlan(unitId, user.id);
        setSemesterPlan(plan);
        
        // Calculate current week
        if (plan.semesterStart) {
          const today = new Date();
          const weeksDiff = Math.floor((today.getTime() - plan.semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          setCurrentWeek(Math.max(1, Math.min(weeksDiff + 1, plan.semesterWeeks)));
        }
      } catch (error) {
        console.error('Failed to load semester plan:', error);
        toast({
          title: "Failed to Load",
          description: "Could not load semester plan. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadSemesterPlan();
  }, [unitId, user?.id, getStudentSemesterPlan]);

  const getWeekStatus = (week: WeekPlan) => {
    const today = new Date();
    const weekStart = week.startDate;
    const weekEnd = week.endDate;
    
    if (isBefore(today, weekStart)) {
      return 'upcoming';
    } else if (isAfter(today, weekEnd)) {
      return 'completed';
    } else {
      return 'current';
    }
  };

  const getAssignmentStatus = (assignment: any) => {
    const today = new Date();
    const dueDate = assignment.dueDate;
    const assignDate = assignment.assignDate;
    
    if (isBefore(today, assignDate)) {
      return 'not_released';
    } else if (isAfter(today, dueDate)) {
      return 'overdue';
    } else if (isToday(dueDate) || isBefore(addDays(today, 1), dueDate)) {
      return 'due_soon';
    } else {
      return 'active';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateProgress = () => {
    if (!semesterPlan) return 0;
    const completedWeeks = semesterPlan.weekPlans.filter(week => getWeekStatus(week) === 'completed').length;
    return (completedWeeks / semesterPlan.semesterWeeks) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!semesterPlan || semesterPlan.weekPlans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Semester Plan Available</h3>
          <p className="text-gray-500 text-center">
            The lecturer hasn't published the semester plan for this unit yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {unitCode}: {unitName}
              </CardTitle>
              <CardDescription>
                Semester Plan • Week {currentWeek} of {semesterPlan.semesterWeeks}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(calculateProgress())}% Complete
            </Badge>
          </div>
          <Progress value={calculateProgress()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>
        
        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          <Accordion type="single" collapsible defaultValue={`week-${currentWeek}`}>
            {semesterPlan.weekPlans.map((week) => {
              const status = getWeekStatus(week);
              return (
                <AccordionItem key={week.weekNumber} value={`week-${week.weekNumber}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h3 className="font-medium">Week {week.weekNumber}</h3>
                        <p className="text-sm text-gray-500">
                          {format(week.startDate, 'MMM dd')} - {format(week.endDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge variant={
                        status === 'completed' ? 'default' :
                        status === 'current' ? 'destructive' : 'secondary'
                      } className="ml-auto">
                        {status === 'completed' ? 'Completed' :
                         status === 'current' ? 'Current' : 'Upcoming'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {week.weekMessage && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">{week.weekMessage}</p>
                        </div>
                      )}
                      
                      {/* Materials */}
                      {week.materials.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Materials
                          </h4>
                          <div className="space-y-2">
                            {week.materials.map((material) => (
                              <div key={material.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-sm">{material.title}</h5>
                                    <p className="text-xs text-gray-500">{material.description}</p>
                                    <p className="text-xs text-gray-400">
                                      {material.dayOfWeek} at {material.releaseTime}
                                    </p>
                                  </div>
                                  {material.fileUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(material.fileUrl, '_blank')}
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Material Documents */}
                                {material.documents && material.documents.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <h6 className="text-xs font-medium text-gray-600">Documents:</h6>
                                    {material.documents.map((doc) => (
                                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <div>
                                          <p className="text-xs font-medium">{doc.title}</p>
                                          <p className="text-xs text-gray-500">
                                            {doc.fileName} • {formatFileSize(doc.fileSize)}
                                          </p>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => window.open(doc.fileUrl, '_blank')}
                                        >
                                          <Download className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Assignments */}
                      {week.assignments.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <PenTool className="w-4 h-4" />
                            Assignments
                          </h4>
                          <div className="space-y-2">
                            {week.assignments.map((assignment) => {
                              const assignmentStatus = getAssignmentStatus(assignment);
                              return (
                                <div key={assignment.id} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-sm">{assignment.title}</h5>
                                    <Badge variant={
                                      assignmentStatus === 'overdue' ? 'destructive' :
                                      assignmentStatus === 'due_soon' ? 'default' :
                                      assignmentStatus === 'active' ? 'secondary' : 'outline'
                                    }>
                                      {assignmentStatus === 'overdue' ? 'Overdue' :
                                       assignmentStatus === 'due_soon' ? 'Due Soon' :
                                       assignmentStatus === 'active' ? 'Active' : 'Not Released'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-2">{assignment.description}</p>
                                  <div className="text-xs text-gray-400 space-y-1">
                                    <p>Assigned: {format(assignment.assignDate, 'MMM dd, yyyy')}</p>
                                    <p>Due: {format(assignment.dueDate, 'MMM dd, yyyy')}</p>
                                    <p>Max Marks: {assignment.maxMarks}</p>
                                  </div>
                                  
                                  {/* Assignment Documents */}
                                  {assignment.documents && assignment.documents.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <h6 className="text-xs font-medium text-gray-600">Resources:</h6>
                                      {assignment.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                          <div>
                                            <p className="text-xs font-medium">{doc.title}</p>
                                            <p className="text-xs text-gray-500">
                                              {doc.fileName} • {formatFileSize(doc.fileSize)}
                                            </p>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(doc.fileUrl, '_blank')}
                                          >
                                            <Download className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Exams */}
                      {week.exams.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Exams
                          </h4>
                          <div className="space-y-2">
                            {week.exams.map((exam) => (
                              <div key={exam.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-sm">{exam.title}</h5>
                                  <Badge variant={exam.type === 'exam' ? 'destructive' : 'default'}>
                                    {exam.type.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{exam.description}</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(exam.examDate, 'MMM dd, yyyy')}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {exam.examTime} ({exam.duration} minutes)
                                  </p>
                                  {exam.venue && (
                                    <p className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {exam.venue}
                                    </p>
                                  )}
                                  <p>Max Marks: {exam.maxMarks}</p>
                                </div>
                                {exam.instructions && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-xs text-yellow-800">{exam.instructions}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>
        
        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="grid gap-4">
            {semesterPlan.weekPlans.flatMap(week => 
              week.materials.map(material => (
                <Card key={material.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{material.title}</CardTitle>
                      <Badge variant="outline">Week {week.weekNumber}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {material.dayOfWeek} at {material.releaseTime}
                      </p>
                      {material.fileUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(material.fileUrl, '_blank')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="grid gap-4">
            {semesterPlan.weekPlans.flatMap(week => 
              week.assignments.map(assignment => {
                const status = getAssignmentStatus(assignment);
                return (
                  <Card key={assignment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{assignment.title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">Week {week.weekNumber}</Badge>
                          <Badge variant={
                            status === 'overdue' ? 'destructive' :
                            status === 'due_soon' ? 'default' : 'secondary'
                          }>
                            {status === 'overdue' ? 'Overdue' :
                             status === 'due_soon' ? 'Due Soon' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {assignment.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Due: {format(assignment.dueDate, 'MMM dd, yyyy')}</p>
                        <p>Max Marks: {assignment.maxMarks}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
        
        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          <div className="grid gap-4">
            {semesterPlan.weekPlans.flatMap(week => 
              week.exams.map(exam => (
                <Card key={exam.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{exam.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">Week {week.weekNumber}</Badge>
                        <Badge variant={exam.type === 'exam' ? 'destructive' : 'default'}>
                          {exam.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {exam.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(exam.examDate, 'MMM dd, yyyy')}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exam.examTime} ({exam.duration} minutes)
                      </p>
                      {exam.venue && (
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {exam.venue}
                        </p>
                      )}
                      <p>Max Marks: {exam.maxMarks}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
