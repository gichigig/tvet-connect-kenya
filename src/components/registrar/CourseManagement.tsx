import { useState, useEffect } from "react";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Plus, Eye, Edit, Trash2, BookOpen, Users, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Unit } from "@/types/unitManagement";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  duration: number; // in years
  totalCredits: number;
  units: Unit[];
  studentsEnrolled: number;
  isActive: boolean;
}

export const CourseManagement = () => {
  const { getAllActiveUnits, addCreatedUnit, updateCreatedUnit, deleteCreatedUnit } = useUnits();
  const { getAllUsers } = useAuth();
  const { toast } = useToast();

  // Add debug logging
  console.log('CourseManagement component rendering');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false);
  const [isViewCourseDialogOpen, setIsViewCourseDialogOpen] = useState(false);
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    duration: 2,
    totalCredits: 120
  });

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

  const units = getAllActiveUnits();
  const users = getAllUsers();
  const students = users.filter(u => u.role === 'student' && u.approved);

  // Initialize with sample courses based on existing units
  useEffect(() => {
    const coursesFromUnits = units.reduce((acc, unit) => {
      const existingCourse = acc.find(c => c.name === unit.course);
      if (existingCourse) {
        existingCourse.units.push(unit);
        existingCourse.totalCredits += unit.credits;
      } else {
        const courseStudents = students.filter(s => s.course === unit.course);
        acc.push({
          id: unit.course.replace(/\s+/g, '_').toLowerCase(),
          name: unit.course,
          code: unit.course.split(' ').map(word => word.substring(0, 2).toUpperCase()).join(''),
          description: `${unit.course} program offering comprehensive education in the field.`,
          department: unit.department,
          duration: Math.max(...units.filter(u => u.course === unit.course).map(u => u.year)),
          totalCredits: unit.credits,
          units: [unit],
          studentsEnrolled: courseStudents.length,
          isActive: true
        });
      }
      return acc;
    }, [] as Course[]);

    setCourses(coursesFromUnits);
  }, [units, students]);

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || filterDepartment === 'all' || course.department === filterDepartment;
    const matchesStatus = !filterStatus || filterStatus === 'all' || 
                         (filterStatus === 'active' && course.isActive) ||
                         (filterStatus === 'inactive' && !course.isActive);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments
  const departments = [...new Set(courses.map(c => c.department))];

  const handleCreateCourse = () => {
    if (!newCourse.name || !newCourse.code || !newCourse.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const course: Course = {
      id: Date.now().toString(),
      ...newCourse,
      units: [],
      studentsEnrolled: 0,
      isActive: true
    };

    setCourses(prev => [...prev, course]);
    setNewCourse({
      name: '',
      code: '',
      description: '',
      department: '',
      duration: 2,
      totalCredits: 120
    });
    setIsCreateCourseDialogOpen(false);

    toast({
      title: "Course Created",
      description: `${course.name} has been created successfully.`,
    });
  };

  const handleAddUnitToCourse = async () => {
    if (!selectedCourse || !newUnit.code || !newUnit.name) {
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
        department: selectedCourse.department,
        course: selectedCourse.name,
        lecturerId: '',
        lecturerName: '',
        lecturerEmail: '',
        enrolled: 0,
        createdBy: 'registrar',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      await addCreatedUnit(unitData);

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
      setIsAddUnitDialogOpen(false);

      toast({
        title: "Unit Added",
        description: `${unitData.code} has been added to ${selectedCourse.name}.`,
      });
    } catch (error) {
      console.error('Error adding unit:', error);
      toast({
        title: "Error",
        description: "Failed to add unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnit = async (unitId: string, unitCode: string) => {
    try {
      await deleteCreatedUnit(unitId);
      toast({
        title: "Unit Deleted",
        description: `${unitCode} has been removed from the course.`,
      });
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast({
        title: "Error",
        description: "Failed to delete unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">Manage courses and their associated units</p>
        </div>
        <Dialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., CS"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Course description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newCourse.department}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Years)</Label>
                  <Select value={newCourse.duration.toString()} onValueChange={(value) => setNewCourse(prev => ({ ...prev, duration: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year} Year{year > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Total Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={newCourse.totalCredits}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, totalCredits: parseInt(e.target.value) || 120 }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>
                Create Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{courses.filter(c => c.isActive).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{units.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{students.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Courses</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {course.name}
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </div>
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{course.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Department:</span>
                  <p>{course.department}</p>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <p>{course.duration} Year{course.duration > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <span className="font-medium">Units:</span>
                  <p>{course.units.length} units</p>
                </div>
                <div>
                  <span className="font-medium">Students:</span>
                  <p>{course.studentsEnrolled} enrolled</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog open={isViewCourseDialogOpen && selectedCourse?.id === course.id} onOpenChange={(open) => {
                  setIsViewCourseDialogOpen(open);
                  if (!open) setSelectedCourse(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Units
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{course.name} - Units</DialogTitle>
                      <DialogDescription>
                        Manage units for {course.name} ({course.units.length} units)
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Total Credits: {course.units.reduce((sum, unit) => sum + unit.credits, 0)}
                        </div>
                        <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-1" />
                              Add Unit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Unit to {course.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
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
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsAddUnitDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddUnitToCourse}>
                                Add Unit
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Units List */}
                      <div className="space-y-2">
                        {course.units.length > 0 ? (
                          course.units.map(unit => (
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
                                  onClick={() => handleDeleteUnit(unit.id, unit.code)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No units added yet</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No courses found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};
