import { useState, useEffect } from "react";
import { useUsers } from "@/contexts/users/UsersContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle, XCircle, Eye, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentResult } from "@/contexts/auth/types";

export const ResultsApproval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
  const [hodComments, setHodComments] = useState("");

  // Mock data - In real app, this would come from Firebase/API
  const [studentResults, setStudentResults] = useState<StudentResult[]>([
    {
      id: "1",
      studentId: "STU001",
      studentName: "John Doe",
      admissionNumber: "2024/001",
      unitCode: "CS101",
      unitName: "Introduction to Programming",
      semester: 1,
      year: 1,
      lecturerId: "LEC001",
      lecturerName: "Dr. Smith",
      cat1Score: 15,
      cat1MaxScore: 20,
      cat2Score: null,
      cat2MaxScore: 20,
      assignmentScore: 18,
      assignmentMaxScore: 20,
      examScore: 65,
      examMaxScore: 80,
      totalScore: 98,
      totalMaxScore: 140,
      percentage: 70,
      grade: "B",
      submittedBy: "Dr. Smith",
      submittedDate: "2024-12-20",
      hodApproval: "pending",
      status: "pass"
    },
    {
      id: "2",
      studentId: "STU002",
      studentName: "Jane Smith",
      admissionNumber: "2024/002",
      unitCode: "CS101",
      unitName: "Introduction to Programming",
      semester: 1,
      year: 1,
      lecturerId: "LEC001",
      lecturerName: "Dr. Smith",
      cat1Score: 18,
      cat1MaxScore: 20,
      cat2Score: 16,
      cat2MaxScore: 20,
      assignmentScore: null,
      assignmentMaxScore: 20,
      examScore: 72,
      examMaxScore: 80,
      totalScore: 106,
      totalMaxScore: 140,
      percentage: 75.7,
      grade: "B+",
      submittedBy: "Dr. Smith",
      submittedDate: "2024-12-20",
      hodApproval: "pending",
      status: "pass"
    },
    {
      id: "3",
      studentId: "STU003",
      studentName: "Michael Johnson",
      admissionNumber: "2024/003",
      unitCode: "MATH101",
      unitName: "Calculus I",
      semester: 1,
      year: 1,
      lecturerId: "LEC002",
      lecturerName: "Prof. Davis",
      cat1Score: 12,
      cat1MaxScore: 20,
      cat2Score: 14,
      cat2MaxScore: 20,
      assignmentScore: 16,
      assignmentMaxScore: 20,
      examScore: 45,
      examMaxScore: 80,
      totalScore: 87,
      totalMaxScore: 140,
      percentage: 62.1,
      grade: "C+",
      submittedBy: "Prof. Davis",
      submittedDate: "2024-12-19",
      hodApproval: "approved",
      hodApprovedBy: user?.firstName + " " + user?.lastName,
      hodApprovedDate: "2024-12-21",
      status: "pass"
    },
    {
      id: "4",
      studentId: "STU004",
      studentName: "Sarah Wilson",
      admissionNumber: "2024/004",
      unitCode: "MATH101",
      unitName: "Calculus I",
      semester: 1,
      year: 1,
      lecturerId: "LEC002",
      lecturerName: "Prof. Davis",
      cat1Score: null,
      cat1MaxScore: 20,
      cat2Score: null,
      cat2MaxScore: 20,
      assignmentScore: 12,
      assignmentMaxScore: 20,
      examScore: 35,
      examMaxScore: 80,
      totalScore: 47,
      totalMaxScore: 140,
      percentage: 33.6,
      grade: "F",
      submittedBy: "Prof. Davis",
      submittedDate: "2024-12-19",
      hodApproval: "pending",
      status: "fail"
    }
  ]);

  // Filter results
  const filteredResults = studentResults.filter(result => {
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = filterUnit === "all" || result.unitCode === filterUnit;
    const matchesStatus = filterStatus === "all" || result.hodApproval === filterStatus;
    
    return matchesSearch && matchesUnit && matchesStatus;
  });

  // Get unique units
  const units = studentResults.reduce((unique: { code: string; name: string }[], result) => {
    const existing = unique.find(u => u.code === result.unitCode);
    if (!existing) {
      unique.push({ code: result.unitCode, name: result.unitName });
    }
    return unique;
  }, []);

  const handleApproval = (resultId: string, action: 'approve' | 'reject') => {
    setStudentResults(prev => prev.map(result => 
      result.id === resultId 
        ? { 
            ...result, 
            hodApproval: action === 'approve' ? 'approved' : 'rejected',
            hodApprovedBy: user?.firstName + " " + user?.lastName,
            hodApprovedDate: new Date().toISOString().split('T')[0],
            hodComments: hodComments
          }
        : result
    ));

    toast({
      title: action === 'approve' ? "Results Approved" : "Results Rejected",
      description: `Results have been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
    });

    setHodComments("");
  };

  const handleEditSave = () => {
    if (!editingResult) return;

    const totalScore = (editingResult.cat1Score || 0) + 
                      (editingResult.cat2Score || 0) + 
                      (editingResult.assignmentScore || 0) + 
                      (editingResult.examScore || 0);
    
    const percentage = (totalScore / editingResult.totalMaxScore) * 100;
    const grade = calculateGrade(percentage);

    setStudentResults(prev => prev.map(result => 
      result.id === editingResult.id 
        ? { 
            ...editingResult, 
            totalScore,
            percentage,
            grade,
            status: percentage >= 50 ? 'pass' : 'fail'
          }
        : result
    ));

    setEditingResult(null);
    toast({
      title: "Results Updated",
      description: "Student results have been updated successfully.",
    });
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return "A";
    if (percentage >= 75) return "A-";
    if (percentage >= 70) return "B+";
    if (percentage >= 65) return "B";
    if (percentage >= 60) return "B-";
    if (percentage >= 55) return "C+";
    if (percentage >= 50) return "C";
    if (percentage >= 45) return "C-";
    if (percentage >= 40) return "D+";
    if (percentage >= 35) return "D";
    return "F";
  };

  const renderScore = (score: number | null, maxScore: number) => {
    if (score === null) {
      return <span className="text-red-500 font-medium">DND</span>;
    }
    return `${score}/${maxScore}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results Approval</h2>
          <p className="text-gray-600">Review and approve student assessment results</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">
                  {studentResults.filter(r => r.hodApproval === 'pending').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {studentResults.filter(r => r.hodApproval === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {studentResults.filter(r => r.hodApproval === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((studentResults.filter(r => r.status === 'pass').length / studentResults.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, admission no., or unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={filterUnit} onValueChange={setFilterUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="All units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All units</SelectItem>
                  {units.map(unit => (
                    <SelectItem key={unit.code} value={unit.code}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>
            Review individual student assessment results and approve/reject them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>CAT 1</TableHead>
                <TableHead>CAT 2</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.studentName}</div>
                      <div className="text-sm text-gray-500">{result.admissionNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.unitCode}</div>
                      <div className="text-sm text-gray-500">{result.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingResult?.id === result.id ? (
                      <Input
                        type="number"
                        value={editingResult.cat1Score || ''}
                        onChange={(e) => setEditingResult({
                          ...editingResult,
                          cat1Score: e.target.value ? Number(e.target.value) : null
                        })}
                        className="w-20"
                        max={result.cat1MaxScore}
                      />
                    ) : (
                      renderScore(result.cat1Score, result.cat1MaxScore)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingResult?.id === result.id ? (
                      <Input
                        type="number"
                        value={editingResult.cat2Score || ''}
                        onChange={(e) => setEditingResult({
                          ...editingResult,
                          cat2Score: e.target.value ? Number(e.target.value) : null
                        })}
                        className="w-20"
                        max={result.cat2MaxScore}
                      />
                    ) : (
                      renderScore(result.cat2Score, result.cat2MaxScore)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingResult?.id === result.id ? (
                      <Input
                        type="number"
                        value={editingResult.assignmentScore || ''}
                        onChange={(e) => setEditingResult({
                          ...editingResult,
                          assignmentScore: e.target.value ? Number(e.target.value) : null
                        })}
                        className="w-20"
                        max={result.assignmentMaxScore}
                      />
                    ) : (
                      renderScore(result.assignmentScore, result.assignmentMaxScore)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingResult?.id === result.id ? (
                      <Input
                        type="number"
                        value={editingResult.examScore || ''}
                        onChange={(e) => setEditingResult({
                          ...editingResult,
                          examScore: e.target.value ? Number(e.target.value) : null
                        })}
                        className="w-20"
                        max={result.examMaxScore}
                      />
                    ) : (
                      renderScore(result.examScore, result.examMaxScore)
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.totalScore}/{result.totalMaxScore}</div>
                      <div className="text-sm text-gray-500">{result.percentage.toFixed(1)}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={result.grade === 'F' ? 'destructive' : 'default'}>
                      {result.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        result.hodApproval === 'approved' ? 'default' :
                        result.hodApproval === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {result.hodApproval}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingResult?.id === result.id ? (
                        <>
                          <Button size="sm" onClick={handleEditSave}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingResult(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingResult(result)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Dialog open={isDialogOpen && selectedResult?.id === result.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedResult(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve/Reject Results</DialogTitle>
                            <DialogDescription>
                              Review and take action on {result.studentName}'s results for {result.unitCode}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Student</Label>
                                <p className="font-medium">{result.studentName}</p>
                                <p className="text-sm text-gray-500">{result.admissionNumber}</p>
                              </div>
                              <div>
                                <Label>Unit</Label>
                                <p className="font-medium">{result.unitCode}</p>
                                <p className="text-sm text-gray-500">{result.unitName}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label>CAT 1</Label>
                                <p className="font-medium">{renderScore(result.cat1Score, result.cat1MaxScore)}</p>
                              </div>
                              <div>
                                <Label>CAT 2</Label>
                                <p className="font-medium">{renderScore(result.cat2Score, result.cat2MaxScore)}</p>
                              </div>
                              <div>
                                <Label>Assignment</Label>
                                <p className="font-medium">{renderScore(result.assignmentScore, result.assignmentMaxScore)}</p>
                              </div>
                              <div>
                                <Label>Exam</Label>
                                <p className="font-medium">{renderScore(result.examScore, result.examMaxScore)}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Total Score</Label>
                              <p className="text-lg font-bold">
                                {result.totalScore}/{result.totalMaxScore} ({result.percentage.toFixed(1)}%) - Grade {result.grade}
                              </p>
                            </div>
                            
                            <div>
                              <Label>Submitted by</Label>
                              <p>{result.lecturerName} on {result.submittedDate}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="comments">HOD Comments</Label>
                              <Textarea
                                id="comments"
                                value={hodComments}
                                onChange={(e) => setHodComments(e.target.value)}
                                placeholder="Add comments about the results..."
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  handleApproval(result.id, 'approve');
                                  setIsDialogOpen(false);
                                  setSelectedResult(null);
                                }}
                                className="flex-1"
                                disabled={result.hodApproval !== 'pending'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  handleApproval(result.id, 'reject');
                                  setIsDialogOpen(false);
                                  setSelectedResult(null);
                                }}
                                className="flex-1"
                                disabled={result.hodApproval !== 'pending'}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No results found matching the current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};