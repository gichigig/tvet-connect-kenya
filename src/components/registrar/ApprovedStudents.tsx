import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useStudents } from "@/contexts/students/StudentsContext";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BookOpen, 
  Search, 
  Edit, 
  Eye, 
  Copy, 
  Download,
  Filter,
  Grid,
  List,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  Trash2
} from "lucide-react";

interface EditStudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  county: string;
  subcounty: string;
  ward: string;
  postalAddress: string;
  postalCode: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  guardianAddress: string;
  courseId: string;
  academicYear: string;
  semester: string;
  previousEducation: string;
  previousGrade: string;
}

export const ApprovedStudents = () => {
  const { updateUser } = useAuth();
  const { students: approvedStudents, updateStudent, deleteStudent } = useStudents();
  const { courses } = useCoursesContext();
  const { toast } = useToast();
  
  // Utility function to format semester display
  const formatSemester = (semester: any) => {
    if (!semester) return 'N/A';
    if (typeof semester === 'string') {
      return semester.replace('_', ' ').toUpperCase();
    }
    return `SEMESTER ${semester}`;
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<EditStudentData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Debug logging
  console.log('Approved students from StudentsContext:', approvedStudents);

  // Get unique values for filters from all students
  const availableCourses = [...new Set(approvedStudents.map(s => s.courseName || s.course).filter(Boolean))];
  const availableYears = [...new Set(approvedStudents.map(s => s.academicYear).filter(Boolean))];
  const availableSemesters = ['semester_1', 'semester_2', 'semester_3'];

  const filteredStudents = approvedStudents.filter(student => {
    const matchesSearch = student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.nationalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === "all" || 
                         student.courseName === selectedCourse || 
                         student.course === selectedCourse;
    const matchesYear = selectedYear === "all" || student.academicYear === selectedYear;
    const matchesSemester = selectedSemester === "all" || student.semester === selectedSemester;
    
    return matchesSearch && matchesCourse && matchesYear && matchesSemester;
  });

  const handleEditStudent = (student: any) => {
    setEditingStudent({
      id: student.id,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      nationalId: student.nationalId || '',
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || '',
      nationality: student.nationality || '',
      county: student.county || '',
      subcounty: student.subcounty || '',
      ward: student.ward || '',
      postalAddress: student.postalAddress || '',
      postalCode: student.postalCode || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      guardianRelationship: student.guardianRelationship || '',
      guardianAddress: student.guardianAddress || '',
      courseId: student.courseId || student.course || '',
      academicYear: student.academicYear || '',
      semester: student.semester || '',
      previousEducation: student.previousEducation || '',
      previousGrade: student.previousGrade || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    try {
      const selectedCourseData = courses.find(c => c.id === editingStudent.courseId);
      
      await updateStudent(editingStudent.id, {
        ...editingStudent,
        courseName: selectedCourseData?.name || editingStudent.courseId,
        course: editingStudent.courseId
      });

      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteStudent(studentId);
      toast({
        title: "Student Deleted",
        description: `${studentName} has been removed from the system`
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  const handleActivateAccount = async (studentId: string, studentEmail: string, studentName: string) => {
    try {
      // Call API to activate student account
      const response = await fetch(`http://localhost:3001/api/students/activate/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: studentEmail,
          approved: true,
          accountActive: true
        })
      });

      if (response.ok) {
        // Update student in context
        await updateStudent(studentId, {
          approved: true,
          accountActive: true
        });

        toast({
          title: "Account Activated",
          description: `${studentName}'s account has been activated and can now login`
        });
      } else {
        throw new Error('Failed to activate account');
      }
    } catch (error) {
      console.error('Error activating account:', error);
      toast({
        title: "Error",
        description: "Failed to activate student account",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    });
  };

  const exportStudentData = () => {
    const csvData = filteredStudents.map(student => ({
      'Admission Number': student.admissionNumber,
      'First Name': student.firstName,
      'Last Name': student.lastName,
      'Email': student.email,
      'Phone': student.phone,
      'Course': student.courseName,
      'Academic Year': student.academicYear,
      'Semester': student.semester,
      'National ID': student.nationalId,
      'Date of Birth': student.dateOfBirth,
      'Gender': student.gender,
      'Guardian Name': student.guardianName,
      'Guardian Phone': student.guardianPhone
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'approved_students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approved Students</h2>
          <p className="text-muted-foreground">
            Manage and view all registered students ({filteredStudents.length} students)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportStudentData}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {availableCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {availableSemesters.map(semester => (
                    <SelectItem key={semester} value={semester}>
                      {semester.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCourse("all");
                  setSelectedYear("all");
                  setSelectedSemester("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Data Display */}
      {viewMode === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No students found
                </h3>
                <p className="text-sm text-muted-foreground">
                  No students match your current search criteria.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Details</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Academic Info</TableHead>
                      <TableHead>Credentials</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-muted-foreground">{student.nationalId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{student.email}</div>
                            <div className="text-sm text-muted-foreground">{student.phone || student.guardianPhone || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {student.courseName || courses.find((course) => course.id === student.course)?.name || student.course || 'N/A'}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {formatSemester(student.semester)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{student.academicYear}</div>
                            <div className="text-xs text-muted-foreground">
                              Year {student.academicYear}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-mono text-sm">{student.admissionNumber}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(student.admissionNumber, 'Admission Number')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Student Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for {student.firstName} {student.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Personal Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Name:</strong> {student.firstName} {student.lastName}</div>
                                        <div><strong>Email:</strong> {student.email}</div>
                                        <div><strong>Phone:</strong> {student.phone || student.guardianPhone || 'N/A'}</div>
                                        <div><strong>National ID:</strong> {student.nationalId}</div>
                                        <div><strong>Date of Birth:</strong> {student.dateOfBirth || 'N/A'}</div>
                                        <div><strong>Gender:</strong> {student.gender || 'N/A'}</div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Address</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>County:</strong> {student.county || 'N/A'}</div>
                                        <div><strong>Sub-County:</strong> {student.subcounty || 'N/A'}</div>
                                        <div><strong>Ward:</strong> {student.ward || 'N/A'}</div>
                                        <div><strong>Postal Address:</strong> {student.postalAddress || 'N/A'}</div>
                                        <div><strong>Postal Code:</strong> {student.postalCode || 'N/A'}</div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Guardian Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Name:</strong> {student.guardianName || 'N/A'}</div>
                                        <div><strong>Phone:</strong> {student.guardianPhone || 'N/A'}</div>
                                        <div><strong>Email:</strong> {student.guardianEmail || 'N/A'}</div>
                                        <div><strong>Relationship:</strong> {student.guardianRelationship || 'N/A'}</div>
                                        <div><strong>Address:</strong> {student.guardianAddress || 'N/A'}</div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Academic Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Course:</strong> {student.courseName || courses.find((course) => course.id === student.course)?.name || student.course || 'N/A'}</div>
                                        <div><strong>Academic Year:</strong> {student.academicYear}</div>
                                        <div><strong>Semester:</strong> {formatSemester(student.semester)}</div>
                                        <div><strong>Status:</strong> 
                                          <Badge variant={student.approved ? "default" : "secondary"} className="ml-2">
                                            {student.approved ? "Approved" : "Pending Approval"}
                                          </Badge>
                                        </div>
                                        <div><strong>Account Status:</strong> 
                                          <Badge variant={student.accountActive ? "default" : "destructive"} className="ml-2">
                                            {student.accountActive ? "Active" : "Inactive"}
                                          </Badge>
                                        </div>
                                        <div><strong>Previous Education:</strong> {student.previousEducation || 'N/A'}</div>
                                        <div><strong>Previous Grade:</strong> {student.previousGrade || 'N/A'}</div>
                                        <div><strong>Admission Number:</strong> 
                                          <span className="ml-2 font-mono">{student.admissionNumber}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="ml-2"
                                            onClick={() => copyToClipboard(student.admissionNumber, 'Admission Number')}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {!student.accountActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActivateAccount(student.id, student.email, `${student.firstName} ${student.lastName}`)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                  <Badge variant="outline">{formatSemester(student.semester)}</Badge>
                </div>
                <CardDescription>
                  {student.courseName || 
                   courses.find((course) => course.id === student.course)?.name || 
                   student.course || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.phone || student.guardianPhone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{student.admissionNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(student.admissionNumber, 'Admission Number')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{student.academicYear}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Student Details</DialogTitle>
                          <DialogDescription>
                            Complete information for {student.firstName} {student.lastName}
                          </DialogDescription>
                        </DialogHeader>
                        {/* Same detailed view as in table */}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    {!student.accountActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateAccount(student.id, student.email, `${student.firstName} ${student.lastName}`)}
                        className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                      >
                        <User className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update student details and academic information
            </DialogDescription>
          </DialogHeader>
          
          {editingStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        value={editingStudent.firstName}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, firstName: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        value={editingStudent.lastName}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, lastName: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingStudent.email}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, email: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        value={editingStudent.phone}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, phone: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-nationalId">National ID</Label>
                      <Input
                        id="edit-nationalId"
                        value={editingStudent.nationalId}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, nationalId: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                      <Input
                        id="edit-dateOfBirth"
                        type="date"
                        value={editingStudent.dateOfBirth}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, dateOfBirth: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender">Gender</Label>
                      <Select 
                        value={editingStudent.gender} 
                        onValueChange={(value) => setEditingStudent(prev => prev ? {...prev, gender: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-nationality">Nationality</Label>
                      <Input
                        id="edit-nationality"
                        value={editingStudent.nationality}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, nationality: e.target.value} : null)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Guardian Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-guardianName">Guardian Name</Label>
                      <Input
                        id="edit-guardianName"
                        value={editingStudent.guardianName}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, guardianName: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-guardianPhone">Guardian Phone</Label>
                      <Input
                        id="edit-guardianPhone"
                        value={editingStudent.guardianPhone}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, guardianPhone: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-guardianEmail">Guardian Email</Label>
                      <Input
                        id="edit-guardianEmail"
                        type="email"
                        value={editingStudent.guardianEmail}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, guardianEmail: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-guardianRelationship">Guardian Relationship</Label>
                      <Select 
                        value={editingStudent.guardianRelationship} 
                        onValueChange={(value) => setEditingStudent(prev => prev ? {...prev, guardianRelationship: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Relative">Relative</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-guardianAddress">Guardian Address</Label>
                      <Textarea
                        id="edit-guardianAddress"
                        value={editingStudent.guardianAddress}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, guardianAddress: e.target.value} : null)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Academic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-courseId">Course</Label>
                      <Select 
                        value={editingStudent.courseId} 
                        onValueChange={(value) => setEditingStudent(prev => prev ? {...prev, courseId: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-academicYear">Academic Year</Label>
                      <Select 
                        value={editingStudent.academicYear} 
                        onValueChange={(value) => setEditingStudent(prev => prev ? {...prev, academicYear: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-semester">Semester</Label>
                      <Select 
                        value={editingStudent.semester} 
                        onValueChange={(value) => setEditingStudent(prev => prev ? {...prev, semester: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semester_1">Semester 1</SelectItem>
                          <SelectItem value="semester_2">Semester 2</SelectItem>
                          <SelectItem value="semester_3">Semester 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-previousEducation">Previous Education</Label>
                      <Input
                        id="edit-previousEducation"
                        value={editingStudent.previousEducation}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, previousEducation: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-previousGrade">Previous Grade</Label>
                      <Input
                        id="edit-previousGrade"
                        value={editingStudent.previousGrade}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, previousGrade: e.target.value} : null)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Address Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-county">County</Label>
                      <Input
                        id="edit-county"
                        value={editingStudent.county}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, county: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-subcounty">Sub-County</Label>
                      <Input
                        id="edit-subcounty"
                        value={editingStudent.subcounty}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, subcounty: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-ward">Ward</Label>
                      <Input
                        id="edit-ward"
                        value={editingStudent.ward}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, ward: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-postalCode">Postal Code</Label>
                      <Input
                        id="edit-postalCode"
                        value={editingStudent.postalCode}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, postalCode: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-postalAddress">Postal Address</Label>
                      <Textarea
                        id="edit-postalAddress"
                        value={editingStudent.postalAddress}
                        onChange={(e) => setEditingStudent(prev => prev ? {...prev, postalAddress: e.target.value} : null)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent}>
              Update Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovedStudents;
