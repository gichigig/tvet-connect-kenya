
import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const StudentApproval = () => {
  const { toast } = useToast();
  const { getPendingUsers, approveStudent, rejectUser } = useAuth();
  const { courses } = useCoursesContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const pendingStudents = getPendingUsers().filter(u => u.role === 'student');

  // Use courses from the dynamic course system
  const courseNames = courses.map(course => course.name);
  const levels = Array.from(new Set(pendingStudents.map(s => s.level).filter(Boolean)));

  const handleApproveStudent = (studentId: string, studentName: string) => {
    approveStudent(studentId);
    toast({
      title: "Student Approved",
      description: `${studentName} has been approved for registration and assigned an admission number.`,
    });
  };

  const handleRejectStudent = (studentId: string, studentName: string) => {
    rejectUser(studentId);
    toast({
      title: "Student Rejected",
      description: `${studentName}'s application has been rejected.`,
      variant: "destructive",
    });
  };

  const filteredStudents = pendingStudents.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "all" || student.courseName === filterCourse;
    const matchesLevel = filterLevel === "all" || student.level === filterLevel;
    
    return matchesSearch && matchesCourse && matchesLevel;
  });

  const formatIntake = (intake?: string) => {
    if (!intake) return 'N/A';
    return intake.charAt(0).toUpperCase() + intake.slice(1);
  };

  const formatLevel = (level?: string) => {
    if (!level) return 'N/A';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Registration Approval</CardTitle>
          <CardDescription>
            Review and approve student registration applications. Approved students will receive admission numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courseNames.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level || ''}>{formatLevel(level)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Details</TableHead>
                <TableHead>Course & Level</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.course || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {formatLevel(student.level)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatIntake(student.intake)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveStudent(student.id, `${student.firstName} ${student.lastName}`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectStudent(student.id, `${student.firstName} ${student.lastName}`)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending student applications found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
