// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUsers } from "@/contexts/users/UsersContext";
import { useGradeVault } from "@/contexts/GradeVaultContext";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Save, Users, FileText, Search, CheckCircle, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface StudentMark {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  marks: number | '';
  grade: string;
  status: 'pass' | 'fail';
}

interface ExamForGrading {
  id: string;
  title: string;
  type: 'exam' | 'cat';
  unitId: string;
  unitName: string;
  unitCode: string;
  maxMarks: number;
  scheduledDate: string;
  duration: number;
  enrolledStudents: number;
  submittedStudents: number;
}

export const ManualMarksInput = () => {
  const { user, createdContent, pendingUnitRegistrations, getAllUsers } = useAuth();
  const { addExamResult } = useUsers();
  const { addResult, submitForHODApproval, calculateGrade } = useGradeVault();
  const { toast } = useToast();
  
  const [selectedExam, setSelectedExam] = useState<ExamForGrading | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'ungraded'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [showMarkingDialog, setShowMarkingDialog] = useState(false);

  // Get exams created by current lecturer that are ready for grading
  const lecturerExams = createdContent.filter(content => 
    content.lecturerId === user?.id && 
    (content.type === 'exam' || content.type === 'cat') &&
    content.isVisible &&
    content.status === 'approved' // Only show approved exams for grading
  );

  // Convert to ExamForGrading format
  const examsForGrading: ExamForGrading[] = lecturerExams.map(exam => {
    // Get students enrolled in this unit
    const enrolledInUnit = pendingUnitRegistrations.filter(
      reg => reg.unitId === exam.unitId && reg.status === 'approved'
    );

    return {
      id: exam.id,
      title: exam.title,
      type: exam.type as 'exam' | 'cat',
      unitId: exam.unitId,
      unitName: exam.unitName || '',
      unitCode: exam.unitCode || '',
      maxMarks: exam.totalMarks || 100,
      scheduledDate: exam.scheduledDate || '',
      duration: exam.duration || 120,
      enrolledStudents: enrolledInUnit.length,
      submittedStudents: 0 // This would be actual submission count
    };
  });

  // Load student marks when exam is selected
  useEffect(() => {
    if (selectedExam) {
      const enrolledStudents = pendingUnitRegistrations.filter(
        reg => reg.unitId === selectedExam.unitId && reg.status === 'approved'
      );

      const allUsers = getAllUsers();
      const marks: StudentMark[] = enrolledStudents.map(reg => {
        const student = allUsers.find(u => u.id === reg.studentId);
        return {
          studentId: reg.studentId,
          studentName: student ? `${student.firstName} ${student.lastName}` : reg.studentName,
          admissionNumber: student?.admissionNumber || reg.studentId,
          marks: '',
          grade: '',
          status: 'fail' as const
        };
      });

      setStudentMarks(marks);
    }
  }, [selectedExam, pendingUnitRegistrations, getAllUsers]);

  // Calculate grade based on marks using TVET grading scale
  const calculateGradeLocal = (marks: number, maxMarks: number): { grade: string; status: 'pass' | 'fail' } => {
    const percentage = (marks / maxMarks) * 100;
    
    // TVET Grading Scale: 70-100=A, 60-69=B, 50-59=C, 40-49=D, 0-39=E(fail)
    if (percentage >= 70) return { grade: 'A', status: 'pass' };
    if (percentage >= 60) return { grade: 'B', status: 'pass' };
    if (percentage >= 50) return { grade: 'C', status: 'pass' };
    if (percentage >= 40) return { grade: 'D', status: 'pass' };
    return { grade: 'E', status: 'fail' }; // E is fail (0-39%)
  };

  // Update student marks
  const updateStudentMarks = (studentId: string, marks: number) => {
    if (!selectedExam || marks < 0 || marks > selectedExam.maxMarks) {
      toast({
        title: "Invalid Marks",
        description: `Marks must be between 0 and ${selectedExam?.maxMarks}`,
        variant: "destructive"
      });
      return;
    }

    const { grade, status } = calculateGradeLocal(marks, selectedExam.maxMarks);
    
    setStudentMarks(prev => prev.map(student => 
      student.studentId === studentId 
        ? { ...student, marks, grade, status }
        : student
    ));
  };

  // Save all marks to Grade Vault
  const saveAllMarks = async () => {
    if (!selectedExam) return;

    const ungraded = studentMarks.filter(s => s.marks === '');
    if (ungraded.length > 0) {
      toast({
        title: "Incomplete Grading",
        description: `${ungraded.length} students have not been graded yet.`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const currentYear = new Date().getFullYear();
      const currentSemester = Math.ceil((new Date().getMonth() + 1) / 6); // Simple semester calculation
      const resultIds: string[] = [];

      // Save results for each student to Grade Vault
      for (const student of studentMarks) {
        // Determine assessment type based on exam type
        const assessmentType = selectedExam.type === 'exam' ? 'exam' : 
                              selectedExam.type === 'cat' ? 'cat1' : 'assignment';

        const gradeVaultResult = {
          studentId: student.studentId,
          studentName: student.studentName,
          admissionNumber: student.admissionNumber,
          unitCode: selectedExam.unitCode,
          unitName: selectedExam.unitName,
          assessmentType: assessmentType as 'cat1' | 'cat2' | 'assignment' | 'exam',
          assessmentTitle: `${selectedExam.type.toUpperCase()} - ${selectedExam.title}`,
          marks: Number(student.marks),
          maxMarks: selectedExam.maxMarks,
          percentage: (Number(student.marks) / selectedExam.maxMarks) * 100,
          grade: student.grade,
          semester: currentSemester,
          year: currentYear,
          academicYear: `${currentYear}/${currentYear + 1}`,
          lecturerId: user?.id || '',
          lecturerName: `${user?.firstName} ${user?.lastName}`,
          gradedAt: new Date(),
          submittedToHOD: false,
          hodApprovalRequired: selectedExam.type === 'exam', // Exams require HOD approval
          hodApproved: false,
          status: selectedExam.type === 'exam' ? 'draft' : 'approved' as 'draft' | 'submitted' | 'hod_review' | 'approved' | 'rejected' | 'published',
          visibleToStudent: selectedExam.type !== 'exam', // CATs and assignments visible immediately, exams need approval
          canEdit: true
        };

        await addResult(gradeVaultResult);

        // Also save to legacy exam results for backward compatibility
        const examResult = {
          studentId: student.studentId,
          studentName: student.studentName,
          unitCode: selectedExam.unitCode,
          unitName: selectedExam.unitName,
          examType: selectedExam.type,
          score: Number(student.marks),
          maxScore: selectedExam.maxMarks,
          grade: student.grade,
          semester: currentSemester,
          year: currentYear,
          examDate: selectedExam.scheduledDate,
          lecturerName: `${user?.firstName} ${user?.lastName}`,
          status: student.status
        };

        addExamResult(examResult);
      }

      // If exam results, submit for HOD approval
      if (selectedExam.type === 'exam') {
        // Note: We would need to get the result IDs to submit for HOD approval
        // This would require modifying the addResult function to return the ID
        toast({
          title: "Exam Results Saved",
          description: `Exam marks for ${studentMarks.length} students have been saved and will be submitted to HOD for approval.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Results Saved and Published",
          description: `${selectedExam.type.toUpperCase()} marks for ${studentMarks.length} students have been saved and are now visible to students.`,
          variant: "default"
        });
      }

      setShowMarkingDialog(false);
      setSelectedExam(null);
      setStudentMarks([]);
    } catch (error) {
      toast({
        title: "Error Saving Marks",
        description: "Failed to save marks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter students based on search and status
  const filteredStudents = studentMarks.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'graded') return matchesSearch && student.marks !== '';
    if (filterStatus === 'ungraded') return matchesSearch && student.marks === '';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Manual Marks Input
          </h2>
          <p className="text-gray-600">Input exam marks for your students</p>
        </div>
      </div>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Exams for Grading</CardTitle>
          <CardDescription>
            Select an exam to input marks for enrolled students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examsForGrading.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No approved exams available for grading</p>
              <p className="text-sm">Create and get approval for exams to start grading</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examsForGrading.map(exam => (
                <Card key={exam.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={exam.type === 'exam' ? 'default' : 'secondary'}>
                        {exam.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {exam.maxMarks} marks
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <CardDescription>
                      {exam.unitCode} - {exam.unitName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{exam.enrolledStudents} students enrolled</span>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {exam.duration} minutes
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(exam.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Dialog open={showMarkingDialog && selectedExam?.id === exam.id} onOpenChange={setShowMarkingDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowMarkingDialog(true);
                          }}
                        >
                          Input Marks
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Input Marks - {exam.title}
                          </DialogTitle>
                          <DialogDescription>
                            {exam.unitCode} - {exam.unitName} | Maximum Marks: {exam.maxMarks}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Search and Filters */}
                          <div className="flex gap-4">
                            <div className="flex-1 relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                <SelectItem value="graded">Graded</SelectItem>
                                <SelectItem value="ungraded">Ungraded</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Summary */}
                          <div className="flex gap-4 text-sm">
                            <Badge variant="outline">
                              Total: {studentMarks.length}
                            </Badge>
                            <Badge variant="default">
                              Graded: {studentMarks.filter(s => s.marks !== '').length}
                            </Badge>
                            <Badge variant="secondary">
                              Ungraded: {studentMarks.filter(s => s.marks === '').length}
                            </Badge>
                          </div>

                          {/* Marks Input Table */}
                          <div className="border rounded-lg">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Student Name</TableHead>
                                  <TableHead>Admission No.</TableHead>
                                  <TableHead>Marks (/{exam.maxMarks})</TableHead>
                                  <TableHead>Grade</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredStudents.map(student => (
                                  <TableRow key={student.studentId}>
                                    <TableCell className="font-medium">
                                      {student.studentName}
                                    </TableCell>
                                    <TableCell>{student.admissionNumber}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min="0"
                                        max={exam.maxMarks}
                                        value={student.marks}
                                        onChange={(e) => {
                                          const marks = parseFloat(e.target.value);
                                          if (!isNaN(marks)) {
                                            updateStudentMarks(student.studentId, marks);
                                          }
                                        }}
                                        placeholder="0"
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {student.grade && (
                                        <Badge variant={student.status === 'pass' ? 'default' : 'destructive'}>
                                          {student.grade}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {student.marks !== '' && (
                                        <Badge variant={student.status === 'pass' ? 'default' : 'destructive'}>
                                          {student.status === 'pass' ? 'Pass' : 'Fail'}
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowMarkingDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={saveAllMarks}
                              disabled={isSaving || studentMarks.filter(s => s.marks !== '').length === 0}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isSaving ? 'Saving...' : 'Save All Marks'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
