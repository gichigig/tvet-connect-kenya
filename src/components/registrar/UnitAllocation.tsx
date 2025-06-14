
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, BookOpen, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  course: string;
  year: number;
  semester: number;
  email: string;
}

export const UnitAllocation = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"students" | "units">("students");

  // Mock data
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

  const [students] = useState<Student[]>([
    {
      id: "1",
      firstName: "Alice",
      lastName: "Johnson",
      studentId: "STU2024003",
      course: "Computer Science",
      year: 1,
      semester: 1,
      email: "alice.johnson@student.edu"
    },
    {
      id: "2",
      firstName: "Bob",
      lastName: "Wilson",
      studentId: "STU2024004",
      course: "Engineering",
      year: 1,
      semester: 1,
      email: "bob.wilson@student.edu"
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

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnits = units.filter(unit =>
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unit Allocation</h2>
          <p className="text-gray-600">Assign units to students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "students" ? "default" : "outline"}
            onClick={() => setViewMode("students")}
          >
            <Users className="w-4 h-4 mr-2" />
            Students
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
              ? "Choose students to allocate units to"
              : "Choose units to allocate to students"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={viewMode === "students" ? "Search students..." : "Search units..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {viewMode === "students" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Course & Year</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => 
                          handleStudentSelection(student.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.course}</div>
                        <div className="text-sm text-gray-500">Year {student.year}, Semester {student.semester}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

          {(viewMode === "students" ? filteredStudents : filteredUnits).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No {viewMode} found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
