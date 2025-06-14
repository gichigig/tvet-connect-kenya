
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  course: string;
  year: number;
  semester: number;
  applicationDate: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export const StudentApproval = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  // Mock data for pending students
  const [students, setStudents] = useState<PendingStudent[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@student.edu",
      studentId: "STU2024001",
      course: "Computer Science",
      year: 1,
      semester: 1,
      applicationDate: "2024-01-15",
      documents: ["transcript", "id_copy", "certificate"],
      status: "pending"
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@student.edu",
      studentId: "STU2024002",
      course: "Engineering",
      year: 2,
      semester: 1,
      applicationDate: "2024-01-16",
      documents: ["transcript", "id_copy"],
      status: "pending"
    }
  ]);

  const courses = ["Computer Science", "Engineering", "Business", "Medicine", "Law"];

  const handleApproveStudent = (studentId: string, studentName: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'approved' as const } : student
    ));
    toast({
      title: "Student Approved",
      description: `${studentName} has been approved for registration.`,
    });
  };

  const handleRejectStudent = (studentId: string, studentName: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'rejected' as const } : student
    ));
    toast({
      title: "Student Rejected",
      description: `${studentName}'s application has been rejected.`,
      variant: "destructive",
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "all" || student.course === filterCourse;
    const matchesYear = filterYear === "all" || student.year.toString() === filterYear;
    
    return matchesSearch && matchesCourse && matchesYear && student.status === 'pending';
  });

  const getDocumentStatus = (documents: string[]) => {
    const required = ["transcript", "id_copy", "certificate"];
    const hasAll = required.every(doc => documents.includes(doc));
    return hasAll ? "complete" : "incomplete";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Registration Approval</CardTitle>
          <CardDescription>
            Review and approve student registration applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Details</TableHead>
                <TableHead>Course & Year</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Documents</TableHead>
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
                      <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.course}</div>
                      <div className="text-sm text-gray-500">
                        Year {student.year}, Semester {student.semester}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.applicationDate}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getDocumentStatus(student.documents) === "complete" ? "default" : "secondary"}
                    >
                      {getDocumentStatus(student.documents)}
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
