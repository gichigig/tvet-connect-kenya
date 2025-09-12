// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, BookOpen, User, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Unit, CreateUnitData } from "@/types/unitManagement";


export const UnitManagement = () => {
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  const { units, addUnit, updateUnit, deleteUnit } = useUnits();
  const { courses } = useCoursesContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get course names from the dynamic course system
  const availableCourses = courses.map(course => course.name);
  const departments = Array.from(new Set(courses.map(course => course.department)));

  // State for new unit creation
  const [newUnit, setNewUnit] = useState<CreateUnitData>({
    code: '',
    name: '',
    description: '',
    credits: 3,
    department: '',
    course: '',
    year: 1,
    semester: 1,
    prerequisites: [],
    capacity: 50,
    schedule: '',
    whatsappLink: '',
    hasDiscussionGroup: false
  });

  // State for selected level and filtered courses
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  let filteredCourses: string[] = [];
  if (selectedLevel === 'certificate') {
    filteredCourses = courses.filter(c => c.level === 'certificate').map(c => c.name);
  } else if (selectedLevel === 'diploma') {
    filteredCourses = courses.filter(c => ['diploma', 'higher_diploma'].includes(c.level)).map(c => c.name);
  } else if (selectedLevel === 'degree') {
    filteredCourses = courses.filter(c => c.level === 'degree').map(c => c.name);
  } else {
    filteredCourses = availableCourses;
  }

  // Get lecturers for assignment
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [getAllUsers]);

  // Only show lecturers who are approved
  const lecturers = allUsers.filter(user => user.role === 'lecturer' && user.approved);


  const handleCreateUnit = async () => {
    if (!newUnit.code || !newUnit.name || !newUnit.department || !newUnit.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare unit data with all required fields, using default values where necessary
      const unitData: Omit<Unit, 'id'> = {
        code: newUnit.code.trim(),
        name: newUnit.name.trim(),
        description: newUnit.description?.trim() || '',
        credits: newUnit.credits || 3,
        department: newUnit.department.trim(),
        course: newUnit.course.trim(),
        year: newUnit.year || 1,
        semester: newUnit.semester || 1,
        prerequisites: newUnit.prerequisites || [],
        capacity: newUnit.capacity || 50,
        schedule: newUnit.schedule?.trim() || '',
        whatsappLink: newUnit.whatsappLink?.trim() || '',
        lecturerId: newUnit.lecturerId || '',
        lecturerName: newUnit.lecturerName || '',
        lecturerEmail: newUnit.lecturerEmail || '',
        enrolled: 0,
        hasDiscussionGroup: newUnit.hasDiscussionGroup || false,
        createdBy: 'registrar',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      // Clean the data by removing empty strings
      const cleanUnit = Object.fromEntries(
        Object.entries(unitData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      ) as Omit<Unit, 'id'>;

      // Only include lecturer fields if they are present
      if (newUnit.lecturerId) {
        await addUnit(cleanUnit); // Firestore-backed, triggers real-time update
      } else {
        // Remove lecturer fields if no lecturer is assigned
        const { lecturerId, lecturerName, lecturerEmail, ...unitWithoutLecturer } = cleanUnit;
        await addUnit(unitWithoutLecturer);
      }

      // Reset form with all fields including lecturer-related ones
      setNewUnit({
        code: '',
        name: '',
        description: '',
        credits: 3,
        department: '',
        course: '',
        year: 1,
        semester: 1,
        prerequisites: [],
        capacity: 50,
        schedule: '',
        whatsappLink: '',
        hasDiscussionGroup: false,
        lecturerId: '',
        lecturerName: '',
        lecturerEmail: ''
      });
      setIsCreateDialogOpen(false);

      // Notify students about the new unit (simplified notification for now)
      try {
        // For now, we'll create a notification about 1 new unit for the course and year
        // In a real implementation, you would fetch student IDs for the specific course/year
        // and pass them to the notification function
        console.log(`New unit created: ${cleanUnit.code} for ${cleanUnit.course} Year ${cleanUnit.year}`);
        // TODO: Implement student fetching and notification
        // await notifyStudentsOfNewUnits(studentIds, 1, cleanUnit.course, cleanUnit.year);
      } catch (notificationError) {
        console.error('Failed to notify students:', notificationError);
        // Don't show error to user as unit was created successfully
      }

      toast({
        title: "Unit Created",
        description: `${cleanUnit.code} - ${cleanUnit.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error Creating Unit",
        description: "There was a problem creating the unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignLecturer = (unitId: string, lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    if (!lecturer) return;

    console.log('Assigning lecturer:', {
      unitId,
      lecturerId: lecturer.id,
      lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
      lecturerEmail: lecturer.email
    });

    updateUnit(unitId, {
      lecturerId: lecturer.id,
      lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
      lecturerEmail: lecturer.email
    });

    toast({
      title: "Lecturer Assigned",
      description: `${lecturer.firstName} ${lecturer.lastName} has been assigned to this unit.`,
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    deleteUnit(unitId);
    toast({
      title: "Unit Deleted",
      description: "Unit has been removed successfully.",
    });
  };

  const filteredUnits = units.filter(unit =>
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unit Management</h2>
          <p className="text-gray-600">Create and manage academic units</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Unit</DialogTitle>
              <DialogDescription>
                Add a new academic unit to the system
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Unit Code *</Label>
                    <Input
                      id="code"
                      value={newUnit.code}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Unit Name *</Label>
                    <Input
                      id="name"
                      value={newUnit.name}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={newUnit.department} onValueChange={(value) => setNewUnit(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level of Education *</Label>
                    <Select value={selectedLevel} onValueChange={value => {
                      setSelectedLevel(value);
                      setNewUnit(prev => ({ ...prev, course: "" })); // Reset course when level changes
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="degree">Degree</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course *</Label>
                    <Select value={newUnit.course} onValueChange={(value) => setNewUnit(prev => ({ ...prev, course: value }))} disabled={!selectedLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedLevel ? "Select course" : "Select level first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={newUnit.year.toString()} onValueChange={(value) => setNewUnit(prev => ({ ...prev, year: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={newUnit.credits}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                      min="1"
                      max="6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newUnit.capacity}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      min="1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newUnit.description}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the unit..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Input
                    id="schedule"
                    value={newUnit.schedule}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="e.g., Mon, Wed, Fri 8:00-10:00 AM"
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUnit}>
                Create Unit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-blue-600">{units.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Units</p>
                <p className="text-2xl font-bold text-green-600">
                  {units.filter(u => u.lecturerId).length}
                </p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned Units</p>
                <p className="text-2xl font-bold text-orange-600">
                  {units.filter(u => !u.lecturerId).length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>Manage academic units and lecturer assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Details</TableHead>
                <TableHead>Course & Year</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Assigned Lecturer</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{unit.code}</div>
                      <div className="text-sm text-gray-500">{unit.name}</div>
                      <div className="text-xs text-gray-400">{unit.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{unit.course}</div>
                      <div className="text-sm text-gray-500">Year {unit.year}, Semester {unit.semester}</div>
                    </div>
                  </TableCell>
                  <TableCell>{unit.credits}</TableCell>
                  <TableCell>
                    {unit.lecturerId ? (
                      <div>
                        <div className="font-medium">{unit.lecturerName}</div>
                        <div className="text-sm text-gray-500">{unit.lecturerEmail}</div>
                      </div>
                    ) : (
                    <Select onValueChange={(value) => handleAssignLecturer(unit.id, value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Assign lecturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {lecturers
                          .map(lecturer => (
                            <SelectItem key={lecturer.id} value={lecturer.id}>
                              {lecturer.firstName} {lecturer.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{unit.enrolled}/{unit.capacity}</span>
                      <Badge variant={unit.enrolled >= unit.capacity ? "destructive" : "default"}>
                        {unit.enrolled >= unit.capacity ? "Full" : "Available"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUnit(unit.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUnits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {units.length === 0 ? "No units created yet" : "No units found matching your search"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};