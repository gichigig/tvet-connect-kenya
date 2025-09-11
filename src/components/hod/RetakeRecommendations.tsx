
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Send, AlertTriangle, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentAtRisk {
  id: string;
  studentId: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  currentGrade: string;
  reason: "failed_exam" | "low_cats" | "deferred" | "multiple_failures";
  recommendedAction: "retake" | "supplementary" | "deferred_exam";
  academicYear: string;
  semester: number;
  lastExamDate: string;
  notificationSent: boolean;
}

export const RetakeRecommendations = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [studentsAtRisk, setStudentsAtRisk] = useState<StudentAtRisk[]>([
    {
      id: "1",
      studentId: "STU2024001",
      studentName: "John Doe",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      currentGrade: "F",
      reason: "failed_exam",
      recommendedAction: "retake",
      academicYear: "2023/2024",
      semester: 2,
      lastExamDate: "2024-06-20",
      notificationSent: false
    },
    {
      id: "2",
      studentId: "STU2024003",
      studentName: "Alice Johnson",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      currentGrade: "DEF",
      reason: "deferred",
      recommendedAction: "deferred_exam",
      academicYear: "2023/2024",
      semester: 2,
      lastExamDate: "2024-06-20",
      notificationSent: false
    },
    {
      id: "3",
      studentId: "STU2024004",
      studentName: "Bob Wilson",
      unitCode: "MATH201",
      unitName: "Calculus II",
      currentGrade: "D",
      reason: "low_cats",
      recommendedAction: "supplementary",
      academicYear: "2023/2024",
      semester: 2,
      lastExamDate: "2024-06-18",
      notificationSent: false
    }
  ]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredStudents.map(s => s.id);
    setSelectedStudents(prev => 
      prev.length === filteredIds.length ? [] : filteredIds
    );
  };

  const handleSendToRegistrar = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select at least one student to send to registrar.",
        variant: "destructive",
      });
      return;
    }

    setStudentsAtRisk(prev => prev.map(student => 
      selectedStudents.includes(student.id)
        ? { ...student, notificationSent: true }
        : student
    ));

    toast({
      title: "Notification Sent",
      description: `Details for ${selectedStudents.length} student(s) have been sent to the registrar.`,
    });

    setSelectedStudents([]);
    setIsDialogOpen(false);
    setNotificationMessage("");
  };

  const getReasonBadge = (reason: string) => {
    const colors = {
      'failed_exam': 'bg-red-100 text-red-800',
      'low_cats': 'bg-orange-100 text-orange-800',
      'deferred': 'bg-yellow-100 text-yellow-800',
      'multiple_failures': 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      'failed_exam': 'Failed Exam',
      'low_cats': 'Low CATs',
      'deferred': 'Deferred',
      'multiple_failures': 'Multiple Failures'
    };

    return (
      <Badge className={colors[reason as keyof typeof colors]}>
        {labels[reason as keyof typeof labels]}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const colors = {
      'retake': 'bg-blue-100 text-blue-800',
      'supplementary': 'bg-green-100 text-green-800',
      'deferred_exam': 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      'retake': 'Full Retake',
      'supplementary': 'Supplementary',
      'deferred_exam': 'Deferred Exam'
    };

    return (
      <Badge className={colors[action as keyof typeof colors]}>
        {labels[action as keyof typeof labels]}
      </Badge>
    );
  };

  const getGradeBadge = (grade: string) => {
    const colors = {
      'F': 'bg-red-100 text-red-800',
      'D': 'bg-orange-100 text-orange-800',
      'DEF': 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>;
  };

  const filteredStudents = studentsAtRisk.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === "all" || student.recommendedAction === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const pendingCount = studentsAtRisk.filter(s => !s.notificationSent).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Students Requiring Intervention</h2>
          <p className="text-gray-600">Identify and process students needing retakes or special exams</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-orange-50">
            {pendingCount} Pending
          </Badge>
          <Button
            onClick={() => setIsDialogOpen(true)}
            disabled={selectedStudents.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Registrar ({selectedStudents.length})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
          <CardDescription>
            Students who need retakes, supplementary exams, or deferred exam scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, ID, or unit code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="retake">Full Retake</SelectItem>
                <SelectItem value="supplementary">Supplementary</SelectItem>
                <SelectItem value="deferred_exam">Deferred Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Student Details</TableHead>
                <TableHead>Unit Information</TableHead>
                <TableHead>Current Grade</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Recommended Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Exam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.unitCode}</div>
                      <div className="text-sm text-gray-500">{student.unitName}</div>
                      <div className="text-sm text-gray-500">
                        {student.academicYear} - Sem {student.semester}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getGradeBadge(student.currentGrade)}</TableCell>
                  <TableCell>{getReasonBadge(student.reason)}</TableCell>
                  <TableCell>{getActionBadge(student.recommendedAction)}</TableCell>
                  <TableCell>
                    {student.notificationSent ? (
                      <Badge className="bg-green-100 text-green-800">Sent to Registrar</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{student.lastExamDate}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send to Registrar Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Details to Registrar</DialogTitle>
            <DialogDescription>
              Send student details to the registrar for retake/supplementary exam processing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-2">Selected Students ({selectedStudents.length})</h4>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {studentsAtRisk
                  .filter(s => selectedStudents.includes(s.id))
                  .map(student => (
                    <div key={student.id} className="text-sm py-1">
                      {student.studentName} ({student.studentId}) - {student.unitCode}
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-600">Additional Notes (Optional)</h4>
              <Textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Add any additional instructions or notes for the registrar..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendToRegistrar}>
                <Send className="w-4 h-4 mr-1" />
                Send to Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
