
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Edit, Eye, User, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  examType: "cat1" | "cat2" | "exam";
  score: number;
  grade: string;
  status: "pass" | "fail" | "deferred";
  examDate: string;
  canEdit: boolean;
}

export const StudentResults = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editScore, setEditScore] = useState("");

  const [studentResults, setStudentResults] = useState<StudentResult[]>([
    {
      id: "1",
      studentId: "STU2024001",
      studentName: "John Doe",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      examType: "cat1",
      score: 78,
      grade: "B",
      status: "pass",
      examDate: "2024-06-15",
      canEdit: true
    },
    {
      id: "2",
      studentId: "STU2024001",
      studentName: "John Doe",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      examType: "exam",
      score: 45,
      grade: "F",
      status: "fail",
      examDate: "2024-06-20",
      canEdit: true
    },
    {
      id: "3",
      studentId: "STU2024002",
      studentName: "Jane Smith",
      unitCode: "MATH201",
      unitName: "Calculus II",
      examType: "cat1",
      score: 85,
      grade: "A",
      status: "pass",
      examDate: "2024-06-12",
      canEdit: true
    },
    {
      id: "4",
      studentId: "STU2024003",
      studentName: "Alice Johnson",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      examType: "exam",
      score: 0,
      grade: "DEF",
      status: "deferred",
      examDate: "2024-06-20",
      canEdit: true
    }
  ]);

  const handleEditResult = (result: StudentResult) => {
    setSelectedResult(result);
    setEditScore(result.score.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdateScore = () => {
    if (!selectedResult) return;
    
    const newScore = parseInt(editScore);
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      toast({
        title: "Invalid Score",
        description: "Please enter a valid score between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    const newGrade = getGrade(newScore);
    const newStatus = newScore >= 50 ? "pass" : "fail";

    setStudentResults(prev => prev.map(result => 
      result.id === selectedResult.id 
        ? { 
            ...result, 
            score: newScore, 
            grade: newGrade,
            status: newStatus as "pass" | "fail" | "deferred"
          }
        : result
    ));
    
    toast({
      title: "Score Updated",
      description: `${selectedResult.studentName}'s score has been updated to ${newScore}.`,
    });
    
    setIsEditDialogOpen(false);
    setSelectedResult(null);
    setEditScore("");
  };

  const getGrade = (score: number): string => {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      case 'deferred':
        return <Badge className="bg-yellow-100 text-yellow-800">Deferred</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGradeBadge = (grade: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
      'DEF': 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>;
  };

  const filteredResults = studentResults.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = filterUnit === "all" || result.unitCode === filterUnit;
    const matchesStatus = filterStatus === "all" || result.status === filterStatus;
    
    return matchesSearch && matchesUnit && matchesStatus;
  });

  const uniqueUnits = [...new Set(studentResults.map(r => r.unitCode))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Results Management</CardTitle>
          <CardDescription>
            View and manually update student exam and CAT results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {uniqueUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{result.studentName}</div>
                        <div className="text-sm text-gray-500">{result.studentId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.unitCode}</div>
                      <div className="text-sm text-gray-500">{result.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{result.examType.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{result.score}%</span>
                  </TableCell>
                  <TableCell>{getGradeBadge(result.grade)}</TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell>{result.examDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {result.canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditResult(result)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Score Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Score</DialogTitle>
            <DialogDescription>
              Update the score for this assessment
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-600">Student</h4>
                <p>{selectedResult.studentName} ({selectedResult.studentId})</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-600">Assessment</h4>
                <p>{selectedResult.unitCode} - {selectedResult.examType.toUpperCase()}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600">Current Score</h4>
                <p>{selectedResult.score}% (Grade: {selectedResult.grade})</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600">New Score</h4>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editScore}
                  onChange={(e) => setEditScore(e.target.value)}
                  placeholder="Enter new score (0-100)"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateScore}>
                  Update Score
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
