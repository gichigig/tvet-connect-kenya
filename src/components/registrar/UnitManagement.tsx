import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Unit, CreateUnitData } from "@/types/unitManagement";

export const UnitManagement = () => {
  const { toast } = useToast();
  const { getAllUsers, createdUnits, addCreatedUnit, updateCreatedUnit, deleteCreatedUnit } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Get lecturers for assignment
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(user => user.role === 'lecturer' && user.approved);

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

  const courses = [
    'Software Engineering',
    'Computer Science',
    'Information Technology',
    'Computer Engineering'
  ];

  const departments = [
    'Computer Science',
    'Mathematics',
    'Engineering',
    'Business Studies',
    'Languages'
  ];

  const handleCreateUnit = () => {
    if (!newUnit.code || !newUnit.name || !newUnit.department || !newUnit.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const unit: Unit = {
      ...newUnit,
      id: Date.now().toString(),
      enrolled: 0,
      createdBy: 'registrar',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    addCreatedUnit(unit);
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
      hasDiscussionGroup: false
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Unit Created",
      description: `${unit.code} - ${unit.name} has been created successfully.`,
    });
  };

  const handleAssignLecturer = (unitId: string, lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    if (!lecturer) return;

    updateCreatedUnit(unitId, {
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
    deleteCreatedUnit(unitId);
    toast({
      title: "Unit Deleted",
      description: "Unit has been removed successfully.",
    });
  };

  const filteredUnits = createdUnits.filter(unit =>
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
                    <Label htmlFor="course">Course *</Label>
                    <Select value={newUnit.course} onValueChange={(value) => setNewUnit(prev => ({ ...prev, course: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
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
                <p className="text-2xl font-bold text-blue-600">{createdUnits.length}</p>
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
                  {createdUnits.filter(u => u.lecturerId).length}
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
                  {createdUnits.filter(u => !u.lecturerId).length}
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
                          {lecturers.map(lecturer => (
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
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteUnit(unit.id)}
                      >
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
              {createdUnits.length === 0 ? "No units created yet" : "No units found matching your search"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
