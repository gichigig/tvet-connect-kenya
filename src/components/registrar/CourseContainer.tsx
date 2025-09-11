import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Plus, GraduationCap, Users, Clock, Edit, Trash2 } from "lucide-react";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Unit } from "@/types/unitManagement";
import { Course } from "@/types/course";
import { SupabaseUser } from "@/contexts/SupabaseAuthContext";

interface CourseContainerProps {
  course: Course;
  onCourseUpdate?: (course: Course) => void;
}

export const CourseContainer = ({ course, onCourseUpdate }: CourseContainerProps) => {
  const { addUnit, updateUnit, deleteUnit, units, getUnitsByCourse } = useUnits();
  const { deleteCourse } = useCoursesContext();
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  
  const [isCreateUnitDialogOpen, setIsCreateUnitDialogOpen] = useState(false);
  const [isViewUnitsDialogOpen, setIsViewUnitsDialogOpen] = useState(false);
  const [isEditUnitDialogOpen, setIsEditUnitDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [lecturers, setLecturers] = useState<SupabaseUser[]>([]);

  // Load lecturers
  useEffect(() => {
    const loadLecturers = async () => {
      try {
        const allUsers = await getAllUsers();
        const lecturersList = allUsers.filter(user => user.role === 'lecturer' && user.approved);
        setLecturers(lecturersList);
      } catch (error) {
        console.error('Error loading lecturers:', error);
      }
    };
    loadLecturers();
  }, [getAllUsers]);

  // Get actual Unit objects for this course
  const courseUnits = getUnitsByCourse(course.code) || [];
  
  const [newUnit, setNewUnit] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    year: 1,
    semester: 1,
    prerequisites: [] as string[],
    capacity: 50,
    schedule: '',
    whatsappLink: '',
    hasDiscussionGroup: false
  });

  const handleCreateUnit = async () => {
    if (!newUnit.code || !newUnit.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const unitData: Omit<Unit, 'id'> = {
        ...newUnit,
        department: course.department,
        course: course.name,
        lecturerId: '',
        lecturerName: '',
        lecturerEmail: '',
        enrolled: 0,
        createdBy: 'registrar',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      await addUnit(unitData);

      setNewUnit({
        code: '',
        name: '',
        description: '',
        credits: 3,
        year: 1,
        semester: 1,
        prerequisites: [],
        capacity: 50,
        schedule: '',
        whatsappLink: '',
        hasDiscussionGroup: false
      });
      
      setIsCreateUnitDialogOpen(false);

      toast({
        title: "Unit Created",
        description: `${unitData.code} has been added to ${course.name}.`,
      });

      // Don't update course.units since it should remain as string[] according to Course type
      // The courseUnits will automatically update when createdUnits changes
    } catch (error) {
      console.error('Error creating unit:', error);
      toast({
        title: "Error",
        description: "Failed to create unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnit = async (unitId: string, unitCode: string) => {
    try {
      await deleteUnit(unitId);
      toast({
        title: "Unit Deleted",
        description: `${unitCode} has been removed from ${course.name}.`,
      });

      // Don't update course.units since it should remain as string[] according to Course type
      // The courseUnits will automatically update when createdUnits changes
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast({
        title: "Error",
        description: "Failed to delete unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setNewUnit({
      code: unit.code,
      name: unit.name,
      description: unit.description,
      credits: unit.credits,
      year: unit.year,
      semester: unit.semester,
      prerequisites: unit.prerequisites || [],
      capacity: unit.capacity,
      schedule: unit.schedule || '',
      whatsappLink: unit.whatsappLink || '',
      hasDiscussionGroup: unit.hasDiscussionGroup || false
    });
    setIsEditUnitDialogOpen(true);
  };

  const handleUpdateUnit = async () => {
    if (!selectedUnit || !newUnit.code || !newUnit.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const unitData: Partial<Unit> = {
        code: newUnit.code,
        name: newUnit.name,
        description: newUnit.description,
        credits: newUnit.credits,
        year: newUnit.year,
        semester: newUnit.semester,
        prerequisites: newUnit.prerequisites,
        capacity: newUnit.capacity,
        schedule: newUnit.schedule,
        whatsappLink: newUnit.whatsappLink,
        hasDiscussionGroup: newUnit.hasDiscussionGroup
      };

      await updateUnit(selectedUnit.id, unitData);

      setNewUnit({
        code: '',
        name: '',
        description: '',
        credits: 3,
        year: 1,
        semester: 1,
        prerequisites: [],
        capacity: 50,
        schedule: '',
        whatsappLink: '',
        hasDiscussionGroup: false
      });
      
      setIsEditUnitDialogOpen(false);
      setSelectedUnit(null);

      toast({
        title: "Unit Updated",
        description: `${unitData.code} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating unit:', error);
      toast({
        title: "Error",
        description: "Failed to update unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async () => {
    // Safety check for courses with enrolled students
    if (course.studentsEnrolled > 0) {
      const confirmDeleteWithStudents = window.confirm(
        `WARNING: This course has ${course.studentsEnrolled} enrolled students!\n\n` +
        `Deleting "${course.name}" (${course.code}) will:\n` +
        `- Remove ${course.studentsEnrolled} students from this course\n` +
        `- Delete all ${courseUnits.length} units and their data\n` +
        `- Permanently erase all course records\n\n` +
        `Are you absolutely sure you want to proceed?\n` +
        `This action cannot be undone and will affect student records.`
      );
      
      if (!confirmDeleteWithStudents) return;
    } else {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the course "${course.name}" (${course.code})?\n\n` +
        `This will permanently delete:\n` +
        `- The course and all its data\n` +
        `- All ${courseUnits.length} units associated with this course\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmDelete) return;
    }

    try {
      // First delete all units associated with this course
      const deleteUnitPromises = courseUnits.map(unit => deleteUnit(unit.id));
      await Promise.all(deleteUnitPromises);

      // Then delete the course
      await deleteCourse(course.id);

      toast({
        title: "Course Deleted",
        description: `${course.name} and all its units have been permanently deleted.`,
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
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
              {courseUnits.length} Units
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteCourse}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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

        <div className="flex gap-2 pt-4 border-t">
          <Dialog open={isViewUnitsDialogOpen} onOpenChange={setIsViewUnitsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                View Units ({courseUnits.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{course.name} - Course Units</DialogTitle>
                <DialogDescription>
                  Manage units for {course.name} ({courseUnits.length} units)
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total Credits: {courseUnits.reduce((sum, unit) => sum + unit.credits, 0)}
                  </div>
                  <Dialog open={isCreateUnitDialogOpen} onOpenChange={setIsCreateUnitDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Unit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Unit for {course.name}</DialogTitle>
                        <DialogDescription>
                          Add a new unit to this course
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Unit Code *</Label>
                              <Input
                                value={newUnit.code}
                                onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="e.g., CS101"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit Name *</Label>
                              <Input
                                value={newUnit.name}
                                onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Introduction to Programming"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={newUnit.description}
                              onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Unit description"
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Credits</Label>
                              <Input
                                type="number"
                                value={newUnit.credits}
                                onChange={(e) => setNewUnit(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Year</Label>
                              <Select value={newUnit.year.toString()} onValueChange={(value) => setNewUnit(prev => ({ ...prev, year: parseInt(value) }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: course.duration }, (_, i) => i + 1).map(year => (
                                    <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Semester</Label>
                              <Select value={newUnit.semester.toString()} onValueChange={(value) => setNewUnit(prev => ({ ...prev, semester: parseInt(value) }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Semester 1</SelectItem>
                                  <SelectItem value="2">Semester 2</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input
                              type="number"
                              value={newUnit.capacity}
                              onChange={(e) => setNewUnit(prev => ({ ...prev, capacity: parseInt(e.target.value) || 50 }))}
                            />
                          </div>
                        </div>
                      </ScrollArea>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateUnitDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateUnit}>
                          Create Unit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Units List */}
                <div className="space-y-2">
                  {courseUnits.length > 0 ? (
                    courseUnits.map(unit => (
                      <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{unit.code}</h4>
                            <Badge variant="outline">
                              Y{unit.year} S{unit.semester}
                            </Badge>
                            <Badge variant="secondary">
                              {unit.credits} Credits
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{unit.name}</p>
                          {unit.lecturerName && (
                            <p className="text-xs text-gray-500">Lecturer: {unit.lecturerName}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUnit(unit)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUnit(unit.id, unit.code)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No units created yet</p>
                      <p className="text-sm">Create units for this course to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="default" size="sm" className="flex-1" onClick={() => setIsCreateUnitDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Unit
          </Button>
        </div>
      </CardContent>

      {/* Edit Unit Dialog */}
      <Dialog open={isEditUnitDialogOpen} onOpenChange={setIsEditUnitDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>
              Update the details for {selectedUnit?.code}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Code</Label>
                  <Input
                    value={newUnit.code}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Name</Label>
                  <Input
                    value={newUnit.name}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newUnit.description}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this unit covers..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Select value={newUnit.credits.toString()} onValueChange={(value) => setNewUnit(prev => ({ ...prev, credits: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(credit => (
                        <SelectItem key={credit} value={credit.toString()}>{credit} Credits</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={newUnit.year.toString()} onValueChange={(value) => setNewUnit(prev => ({ ...prev, year: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: course.duration }, (_, i) => i + 1).map(year => (
                        <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={newUnit.semester.toString()} onValueChange={(value) => setNewUnit(prev => ({ ...prev, semester: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={newUnit.capacity}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, capacity: parseInt(e.target.value) || 50 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Schedule (Optional)</Label>
                <Input
                  value={newUnit.schedule}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="e.g., Mon 9:00-11:00, Wed 14:00-16:00"
                />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Group Link (Optional)</Label>
                <Input
                  value={newUnit.whatsappLink}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, whatsappLink: e.target.value }))}
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasDiscussionGroup"
                  checked={newUnit.hasDiscussionGroup}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, hasDiscussionGroup: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="hasDiscussionGroup">Enable Discussion Group</Label>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditUnitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUnit}>
              Update Unit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
