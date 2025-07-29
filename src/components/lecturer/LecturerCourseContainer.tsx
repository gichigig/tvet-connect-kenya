import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, GraduationCap, Users, FileText, Video, MessageSquare, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { Unit } from "@/types/unitManagement";
import { Course } from "@/types/course";

interface LecturerCourseContainerProps {
  course: Course;
  onUnitClick?: (unit: Unit) => void;
}

export const LecturerCourseContainer = ({ course, onUnitClick }: LecturerCourseContainerProps) => {
  const { user } = useAuth();
  const { createdUnits } = useUnits();
  const [isViewUnitsDialogOpen, setIsViewUnitsDialogOpen] = useState(false);

  // Get actual Unit objects for this course and filter by current lecturer
  const courseUnits = createdUnits.filter(unit => 
    unit.course === course.code || unit.course === course.name
  );
  const myUnits = courseUnits.filter(unit => unit.lecturerId === user?.id);

  const getUnitStats = (unit: Unit) => {
    // These would typically come from actual data
    return {
      notes: 3, // Number of notes/materials
      assignments: 2, // Number of assignments
      exams: 1, // Number of exams/CATs
      onlineClasses: 4 // Number of online class links
    };
  };

  const handleUnitClick = (unit: Unit) => {
    if (onUnitClick) {
      onUnitClick(unit);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              {course.name}
            </CardTitle>
            <CardDescription>{course.code} • {course.department}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={course.isActive ? "default" : "secondary"}>
              {course.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {myUnits.length} Unit{myUnits.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{course.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Duration:</span>
            <p>{course.duration} Year{course.duration > 1 ? 's' : ''}</p>
          </div>
          <div>
            <span className="font-medium">My Units:</span>
            <p>{myUnits.length}</p>
          </div>
          <div>
            <span className="font-medium">Students:</span>
            <p>{myUnits.reduce((total, unit) => total + unit.enrolled, 0)}</p>
          </div>
          <div>
            <span className="font-medium">Credits:</span>
            <p>{myUnits.reduce((total, unit) => total + unit.credits, 0)}</p>
          </div>
        </div>

        {myUnits.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Your Allocated Units</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {myUnits.slice(0, 4).map(unit => (
                <div key={unit.id} className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span className="font-medium">{unit.code}</span>
                  <span className="text-gray-600">Y{unit.year}S{unit.semester}</span>
                </div>
              ))}
              {myUnits.length > 4 && (
                <div className="text-sm text-gray-500">
                  +{myUnits.length - 4} more units
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Dialog open={isViewUnitsDialogOpen} onOpenChange={setIsViewUnitsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                View My Units ({myUnits.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{course.name} - My Allocated Units</DialogTitle>
                <DialogDescription>
                  Manage content for units allocated to you in {course.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{myUnits.length}</div>
                    <div className="text-sm text-gray-600">My Units</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {myUnits.reduce((total, unit) => total + unit.enrolled, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {myUnits.reduce((total, unit) => total + unit.credits, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {myUnits.filter(unit => unit.whatsappLink).length}
                    </div>
                    <div className="text-sm text-gray-600">WhatsApp Groups</div>
                  </div>
                </div>

                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-4">
                    {myUnits.length > 0 ? (
                      myUnits.map(unit => {
                        const stats = getUnitStats(unit);
                        return (
                          <Card key={unit.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleUnitClick(unit)}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-medium text-lg">{unit.code}</h4>
                                      <Badge variant="outline">
                                        Year {unit.year}, Semester {unit.semester}
                                      </Badge>
                                      <Badge variant="secondary">
                                        {unit.credits} Credits
                                      </Badge>
                                    </div>
                                    <p className="text-gray-600">{unit.name}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span>Students: {unit.enrolled}/{unit.capacity}</span>
                                      {unit.schedule && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {unit.schedule}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Content Stats */}
                                <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium">{stats.notes}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">Notes</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Calendar className="w-4 h-4 text-green-600" />
                                      <span className="font-medium">{stats.assignments}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">Assignments</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <BookOpen className="w-4 h-4 text-purple-600" />
                                      <span className="font-medium">{stats.exams}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">Exams/CATs</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Video className="w-4 h-4 text-orange-600" />
                                      <span className="font-medium">{stats.onlineClasses}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">Online Classes</div>
                                  </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    {unit.whatsappLink && (
                                      <Badge variant="default" className="text-xs">
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        WhatsApp Active
                                      </Badge>
                                    )}
                                    {unit.hasDiscussionGroup && (
                                      <Badge variant="secondary" className="text-xs">
                                        Discussion Group
                                      </Badge>
                                    )}
                                  </div>
                                  <Button size="sm" onClick={() => handleUnitClick(unit)}>
                                    Manage Content
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No units allocated to you in this course</p>
                        <p className="text-sm">Contact the HOD to get units assigned to you.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            disabled={myUnits.length === 0}
            onClick={() => myUnits.length > 0 && handleUnitClick(myUnits[0])}
          >
            <Users className="w-4 h-4 mr-2" />
            {myUnits.length > 0 ? 'Manage Units' : 'No Units Assigned'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
