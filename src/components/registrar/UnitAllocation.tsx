
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, BookOpen, Users, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Unit {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  year: number;
  semester: number;
  capacity: number;
  enrolled: number;
}

export const UnitAllocation = () => {
  const { toast } = useToast();
  const { getAllUsers, getPendingUnitRegistrations } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"students" | "units">("students");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedStudentForUnits, setSelectedStudentForUnits] = useState<any>(null);
  const [showUnitsDialog, setShowUnitsDialog] = useState(false);

  // Get approved students from context
  const approvedStudents = getAllUsers().filter(u => u.role === 'student' && u.approved);
  
  // Get approved unit registrations
  const approvedUnitRegistrations = getPendingUnitRegistrations ? 
    getPendingUnitRegistrations().filter(reg => reg.status === 'approved') : [];

  // Get unique values for filters
  const departments = [...new Set(approvedStudents.map(s => s.department).filter(Boolean))];
  const courses = [...new Set(approvedStudents.map(s => s.course).filter(Boolean))];
  const years = [...new Set(approvedStudents.map(s => s.year?.toString()).filter(Boolean))];
  const semesters = [...new Set(approvedStudents.map(s => s.semester?.toString()).filter(Boolean))];

  // Mock units data - this should come from the registrar's created units
  const [units] = useState<Unit[]>([
    {
      id: "1",
      code: "CS101",
      name: "Introduction to Computer Science",
      credits: 3,
      department: "Computer Science",
      year: 1,
      semester: 1,
      capacity: 50,
      enrolled: 35
    },
    {
      id: "2",
      code: "MATH101",
      name: "Calculus I",
      credits: 4,
      department: "Mathematics",
      year: 1,
      semester: 1,
      capacity: 60,
      enrolled: 45
    },
    {
      id: "3",
      code: "ENG101",
      name: "English Composition",
      credits: 3,
      department: "English",
      year: 1,
      semester: 1,
      capacity: 40,
      enrolled: 32
    }
  ]);

  const handleAllocateUnits = () => {
    if (selectedStudents.length === 0 || selectedUnits.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select both students and units to allocate.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Units Allocated",
      description: `Successfully allocated ${selectedUnits.length} units to ${selectedStudents.length} students.`,
    });

    setSelectedStudents([]);
    setSelectedUnits([]);
  };

  const handleUnitSelection = (unitId: string, checked: boolean) => {
    if (checked) {
      setSelectedUnits(prev => [...prev, unitId]);
    } else {
      setSelectedUnits(prev => prev.filter(id => id !== unitId));
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudentForUnits(student);
    setShowUnitsDialog(true);
  };

  const getStudentRegisteredUnits = (studentId: string) => {
    return approvedUnitRegistrations.filter(reg => reg.studentId === studentId);
  };

  // Filter students based on search and filters
  const filteredStudents = approvedStudents.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || student.department === selectedDepartment;
    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;
    const matchesYear = selectedYear === "all" || student.year?.toString() === selectedYear;
    const matchesSemester = selectedSemester === "all" || student.semester?.toString() === selectedSemester;
    
    return matchesSearch && matchesDepartment && matchesCourse && matchesYear && matchesSemester;
  });

  const filteredUnits = units.filter(unit =>
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group students by department, course, year, and semester
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const department = student.department || 'Unassigned';
    const course = student.course || 'Unassigned';
    const year = student.year?.toString() || 'Unknown';
    const semester = student.semester?.toString() || 'Unknown';

    if (!acc[department]) acc[department] = {};
    if (!acc[department][course]) acc[department][course] = {};
    if (!acc[department][course][year]) acc[department][course][year] = {};
    if (!acc[department][course][year][semester]) acc[department][course][year][semester] = [];
    
    acc[department][course][year][semester].push(student);
    return acc;
  }, {} as any);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unit Allocation</h2>
          <p className="text-gray-600">Assign units to approved students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "students" ? "default" : "outline"}
            onClick={() => setViewMode("students")}
          >
            <Users className="w-4 h-4 mr-2" />
            Students ({approvedStudents.length})
          </Button>
          <Button
            variant={viewMode === "units" ? "default" : "outline"}
            onClick={() => setViewMode("units")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Units
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Students</p>
                <p className="text-2xl font-bold text-blue-600">{selectedStudents.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Units</p>
                <p className="text-2xl font-bold text-green-600">{selectedUnits.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <Button 
                onClick={handleAllocateUnits}
                disabled={selectedStudents.length === 0 || selectedUnits.length === 0}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Allocate Units
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "students" ? "Select Students" : "Select Units"}
          </CardTitle>
          <CardDescription>
            {viewMode === "students" 
              ? "Choose students to allocate units to. Click on a student to view their registered units."
              : "Choose units to allocate to students"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={viewMode === "students" ? "Search students..." : "Search units..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {viewMode === "students" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>Year {year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>Semester {semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {viewMode === "students" ? (
            <>
              {/* Grouped View */}
              <div className="space-y-6">
                {Object.entries(groupedStudents).map(([department, courseData]) => (
                  <Card key={department}>
                    <CardHeader>
                      <CardTitle className="text-lg">{department}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(courseData).map(([course, yearData]) => (
                        <div key={course} className="mb-6">
                          <h4 className="font-semibold text-md mb-3">{course}</h4>
                          {Object.entries(yearData).map(([year, semesterData]) => (
                            <div key={year} className="mb-4">
                              <h5 className="font-medium text-sm mb-2 text-gray-600">Year {year}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(semesterData).map(([semester, students]) => (
                                  <Card key={semester} className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Semester {semester}</CardTitle>
                                      <CardDescription>{students.length} students</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        {students.map((student: any) => (
                                          <div key={student.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                            <Checkbox
                                              checked={selectedStudents.includes(student.id)}
                                              onCheckedChange={(checked) => 
                                                handleStudentSelection(student.id, checked as boolean)
                                              }
                                            />
                                            <div 
                                              className="flex-1 cursor-pointer"
                                              onClick={() => handleStudentClick(student)}
                                            >
                                              <div className="font-medium text-sm">{student.firstName} {student.lastName}</div>
                                              <div className="text-xs text-gray-500">
                                                {student.admissionNumber} • {student.email}
                                              </div>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleStudentClick(student)}
                                              className="ml-2"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {Object.keys(groupedStudents).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No approved students found matching your criteria
                </div>
              )}
            </>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Unit Code</TableHead>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUnits.includes(unit.id)}
                        onCheckedChange={(checked) => 
                          handleUnitSelection(unit.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{unit.code}</TableCell>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.credits}</TableCell>
                    <TableCell>{unit.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{unit.enrolled}/{unit.capacity}</span>
                        <Badge variant={unit.enrolled >= unit.capacity ? "destructive" : "default"}>
                          {unit.enrolled >= unit.capacity ? "Full" : "Available"}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {viewMode === "units" && filteredUnits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No units found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units Dialog */}
      <Dialog open={showUnitsDialog} onOpenChange={setShowUnitsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudentForUnits && `${selectedStudentForUnits.firstName} ${selectedStudentForUnits.lastName}'s Registered Units`}
            </DialogTitle>
            <DialogDescription>
              {selectedStudentForUnits && `${selectedStudentForUnits.admissionNumber} • ${selectedStudentForUnits.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedStudentForUnits && (
              <div className="space-y-4">
                {getStudentRegisteredUnits(selectedStudentForUnits.id).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit Code</TableHead>
                        <TableHead>Unit Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentRegisteredUnits(selectedStudentForUnits.id).map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">{registration.unitCode}</TableCell>
                          <TableCell>{registration.unitName}</TableCell>
                          <TableCell>{registration.course}</TableCell>
                          <TableCell>{registration.year}</TableCell>
                          <TableCell>{registration.semester}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No units registered yet</p>
                    <p className="text-sm">This student hasn't registered for any units.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
