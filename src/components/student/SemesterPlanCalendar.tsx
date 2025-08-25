import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, FileText, PenTool, Brain, Users, Video, MapPin, Clock, Calendar as CalendarIcon } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'material' | 'assignment' | 'exam' | 'attendance' | 'online-class';
  unitCode: string;
  unitName: string;
  dueDate?: Date;
  examDate?: Date;
  venue?: string;
  duration?: number;
  locationRestricted?: boolean;
  meetingLink?: string;
  platform?: string;
}

export const SemesterPlanCalendar = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const { getStudentSemesterPlan } = useSemesterPlan();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDayActivities, setSelectedDayActivities] = useState<ActivityItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Helper function to calculate duration in minutes
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const loadActivities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get user's enrolled units from pendingUnitRegistrations
      const enrolledUnits = pendingUnitRegistrations.filter(
        reg => reg.studentId === user.id && reg.status === 'approved'
      );
      const allActivities: ActivityItem[] = [];

      for (const unitReg of enrolledUnits) {
        try {
          const semesterPlan = await getStudentSemesterPlan(unitReg.unitId, user.id);
          if (!semesterPlan || !semesterPlan.weekPlans) continue;

          // Get unit details - we need to find the unit info
          const unitCode = unitReg.unitCode || 'Unknown';
          const unitName = unitReg.unitName || 'Unknown Unit';

          // Extract activities from all weeks
          semesterPlan.weekPlans.forEach(week => {
            // Materials
            week.materials?.forEach(material => {
              if (material.releaseTime) {
                allActivities.push({
                  id: `material-${material.id}`,
                  title: material.title,
                  description: material.description,
                  date: new Date(material.releaseTime),
                  type: 'material',
                  unitCode,
                  unitName,
                });
              }
            });

            // Assignments
            week.assignments?.forEach(assignment => {
              if (assignment.dueDate) {
                allActivities.push({
                  id: `assignment-${assignment.id}`,
                  title: assignment.title,
                  description: assignment.description,
                  date: new Date(assignment.dueDate),
                  type: 'assignment',
                  unitCode,
                  unitName,
                  dueDate: new Date(assignment.dueDate),
                });
              }
            });

            // Exams
            week.exams?.forEach(exam => {
              if (exam.examDate) {
                allActivities.push({
                  id: `exam-${exam.id}`,
                  title: exam.title,
                  description: exam.description,
                  date: new Date(exam.examDate),
                  type: 'exam',
                  unitCode,
                  unitName,
                  examDate: new Date(exam.examDate),
                  duration: exam.duration,
                });
              }
            });

            // Attendance Sessions
            week.attendanceSessions?.forEach(session => {
              allActivities.push({
                id: `attendance-${session.id}`,
                title: session.title,
                description: session.description,
                date: new Date(session.date),
                type: 'attendance',
                unitCode,
                unitName,
                venue: session.venue,
                duration: calculateDuration(session.startTime, session.endTime),
                locationRestricted: session.locationRestriction?.enabled || false,
              });
            });

            // Online Classes
            week.onlineClasses?.forEach(onlineClass => {
              allActivities.push({
                id: `online-${onlineClass.id}`,
                title: onlineClass.title,
                description: onlineClass.description,
                date: new Date(onlineClass.date),
                type: 'online-class',
                unitCode,
                unitName,
                duration: calculateDuration(onlineClass.startTime, onlineClass.endTime),
                meetingLink: onlineClass.meetingLink,
                platform: onlineClass.platform,
              });
            });
          });

        } catch (error) {
          console.error(`Error loading semester plan for unit ${unitReg.unitId}:`, error);
        }
      }

      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user, pendingUnitRegistrations]);

  // Filter activities for the selected date
  useEffect(() => {
    const dayActivities = activities.filter(activity => 
      isSameDay(activity.date, selectedDate)
    );
    setSelectedDayActivities(dayActivities);
  }, [activities, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dayActivities = activities.filter(activity => 
        isSameDay(activity.date, date)
      );
      if (dayActivities.length > 0) {
        setSelectedDayActivities(dayActivities);
        setIsDialogOpen(true);
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'material': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <PenTool className="h-4 w-4" />;
      case 'exam': return <Brain className="h-4 w-4" />;
      case 'attendance': return <Users className="h-4 w-4" />;
      case 'online-class': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'material': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-yellow-100 text-yellow-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'attendance': return 'bg-orange-100 text-orange-800';
      case 'online-class': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if a date has activities
  const dateHasActivities = (date: Date) => {
    return activities.some(activity => isSameDay(activity.date, date));
  };

  const modifiers = {
    hasActivities: (date: Date) => dateHasActivities(date)
  };

  const modifiersStyles = {
    hasActivities: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid #3b82f6',
      borderRadius: '50%'
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Academic Calendar
          </CardTitle>
          <CardDescription>
            View your semester plan activities across all enrolled units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Materials
                </Badge>
                <Badge variant="outline" className="bg-yellow-50">
                  <PenTool className="h-3 w-3 mr-1" />
                  Assignments
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  <Brain className="h-3 w-3 mr-1" />
                  Exams
                </Badge>
                <Badge variant="outline" className="bg-orange-50">
                  <Users className="h-3 w-3 mr-1" />
                  Attendance
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  <Video className="h-3 w-3 mr-1" />
                  Online Classes
                </Badge>
              </div>
            </div>

            {/* Selected Day Activities */}
            <div>
              <h3 className="font-semibold mb-3">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              {selectedDayActivities.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayActivities.map(activity => (
                    <Card key={activity.id} className="p-3">
                      <div className="flex items-start gap-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getActivityColor(activity.type)}>
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{activity.unitCode}</span>
                          </div>
                          <h4 className="font-medium text-sm mt-1">{activity.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                          {activity.venue && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{activity.venue}</span>
                            </div>
                          )}
                          {activity.duration && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{activity.duration} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activities scheduled for this day</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Activities for {format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDayActivities.map(activity => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <h3 className="font-semibold">{activity.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getActivityColor(activity.type)}>
                        {activity.type}
                      </Badge>
                      <Badge variant="outline">
                        {activity.unitCode}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{activity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <span>Unit: {activity.unitName}</span>
                    <span>Date: {format(activity.date, 'MMM d, yyyy')}</span>
                    {activity.venue && <span>Venue: {activity.venue}</span>}
                    {activity.duration && <span>Duration: {activity.duration} minutes</span>}
                    {activity.platform && <span>Platform: {activity.platform}</span>}
                  </div>
                  
                  {activity.locationRestricted && (
                    <div className="mt-3 bg-red-50 p-2 rounded">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">Location Restricted</span>
                      </div>
                    </div>
                  )}
                  
                  {activity.meetingLink && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.open(activity.meetingLink, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Class
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
