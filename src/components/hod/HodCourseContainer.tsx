import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Users, GraduationCap, UserCheck, AlertCircle } from "lucide-react";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Unit } from "@/types/unitManagement";
import { Course } from "@/types/course";

interface HodCourseContainerProps {
  course: Course;
  onCourseUpdate?: (course: Course) => void;
}

export const HodCourseContainer = ({ course, onCourseUpdate }: HodCourseContainerProps) => {
  const { updateCreatedUnit, createdUnits } = useUnits();
  const { getAllUsers, user } = useAuth();
  const { toast } = useToast();
  
  const [isViewUnitsDialogOpen, setIsViewUnitsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Filter lecturers by department (HOD can only assign lecturers from their department)
  const lecturers = getAllUsers().filter(lecturer => 
    lecturer.role === 'lecturer' && 
    lecturer.approved && 
    lecturer.department === user?.department
  );

  // Get actual Unit objects for this course
  const courseUnits = createdUnits.filter(unit => 
    unit.course === course.code || unit.course === course.name
  );

  const assignedUnits = courseUnits.filter(unit => unit.lecturerId);
  const unassignedUnits = courseUnits.filter(unit => !unit.lecturerId);

  const handleAssignLecturer = async (unitId: string, lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    if (!lecturer) return;

    try {
      await updateCreatedUnit(unitId, {
        lecturerId: lecturer.id,
        lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
        lecturerEmail: lecturer.email
      });

      toast({
        title: "Lecturer Assigned",
        description: `${lecturer.firstName} ${lecturer.lastName} has been assigned to this unit.`,
      });

      // Don't update course.units since it should remain as string[] and courseUnits will update automatically
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      toast({
        title: "Error",
        description: "Failed to assign lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnassignLecturer = async (unitId: string) => {
    try {
      await updateCreatedUnit(unitId, {
        lecturerId: '',
        lecturerName: '',
        lecturerEmail: ''
      });

      toast({
        title: "Lecturer Unassigned", 
        description: "Lecturer has been removed from this unit.",
      });

      // Don't update course.units since it should remain as string[] and courseUnits will update automatically
    } catch (error) {
      console.error('Error unassigning lecturer:', error);
      toast({
        title: "Error",
        description: "Failed to unassign lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              {course.name}
            </CardTitle>
            <CardDescription>{course.code} Ã¢â‚¬Â¢ {course.department}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={course.isActive ? "default" : "secondary"}>
              {course.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {assignedUnits.length}/{courseUnits.length} Assigned
            </Badge>
            {unassignedUnits.length > 0 && (
              <Badge variant="destructive">
                {unassignedUnits.length} Unassigned
              </Badge>
            )}
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
            <span className="font-medium">Credits:</span>
            <p>{course.totalCredits}</p>
          </div>
          <div>
            <span className="font-medium">Units:</span>
            <p>{courseUnits.length}</p>
          </div>
          <div>
            <span className="font-medium">Students:</span>
            <p>{course.studentsEnrolled}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">{assignedUnits.length} Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">{unassignedUnits.length} Unassigned</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Dialog open={isViewUnitsDialogOpen} onOpenChange={setIsViewUnitsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Allocate Lecturers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{course.name} - Lecturer Allocation</DialogTitle>
                <DialogDescription>
                  Assign lecturers to units in {course.name} ({assignedUnits.length}/{courseUnits.length} assigned)
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{courseUnits.length}</div>
                    <div className="text-sm text-gray-600">Total Units</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{assignedUnits.length}</div>
                    <div className="text-sm text-gray-600">Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{unassignedUnits.length}</div>
                    <div className="text-sm text-gray-600">Unassigned</div>
                  </div>
                </div>

                {courseUnits.length > 1 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Ã°Å¸â€™Â¡ Tip:</strong> You can scroll down to see all {courseUnits.length} units and assign lecturers to each one.
                    </p>
                  </div>
                )}

                <ScrollArea className="max-h-[75vh] min-h-[400px] pr-4">
                  <div className="space-y-4 pb-4">
                    {courseUnits.length > 0 ? (
                      courseUnits.map((unit, index) => (
                        <div key={unit.id} className="border rounded-lg p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-lg">{unit.code}</h4>
                                <Badge variant={unit.lecturerId ? "default" : "secondary"}>
                                  {unit.lecturerId ? "Assigned" : "Unassigned"}
                                </Badge>
                                <Badge variant="outline">
                                  Y{unit.year} S{unit.semester}
                                </Badge>
                                <Badge variant="secondary">
                                  {unit.credits} Credits
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50">
                                  Unit #{index + 1}
                                </Badge>
                              </div>
                              <p className="text-gray-600">{unit.name}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{unit.course}</span>
                                <span>Capacity: {unit.enrolled}/{unit.capacity}</span>
                              </div>
                              {unit.description && (
                                <p className="text-sm text-gray-600 mt-2">{unit.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              {unit.lecturerId ? (
                                <div className="text-sm">
                                  <span className="text-gray-500">Assigned to:</span>
                                  <span className="font-medium ml-2">{unit.lecturerName}</span>
                                  {unit.lecturerEmail && (
                                    <span className="text-gray-500 ml-2">({unit.lecturerEmail})</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No lecturer assigned</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {unit.lecturerId ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnassignLecturer(unit.id)}
                                >
                                  Unassign
                                </Button>
                              ) : null}
                              
                              <Select
                                value={unit.lecturerId || ""}
                                onValueChange={(lecturerId) => {
                                  if (lecturerId) {
                                    handleAssignLecturer(unit.id, lecturerId);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Assign lecturer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {lecturers.map(lecturer => (
                                    <SelectItem key={lecturer.id} value={lecturer.id}>
                                      {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No units found for this course</p>
                        <p className="text-sm">Units need to be created by the registrar first.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant={unassignedUnits.length > 0 ? "default" : "outline"} 
            size="sm" 
            className="flex-1"
            onClick={() => setIsViewUnitsDialogOpen(true)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Units ({courseUnits.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
