
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingResult {
  id: string;
  examTitle: string;
  unitCode: string;
  unitName: string;
  examType: "cat" | "exam";
  lecturer: string;
  submissionDate: string;
  studentsCount: number;
  averageScore: number;
  passRate: number;
  status: "pending" | "approved" | "rejected";
}

export const ResultsApproval = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedResult, setSelectedResult] = useState<PendingResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [pendingResults, setPendingResults] = useState<PendingResult[]>([
    {
      id: "1",
      examTitle: "Data Structures CAT 1",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      examType: "cat",
      lecturer: "Dr. John Smith",
      submissionDate: "2024-06-20",
      studentsCount: 25,
      averageScore: 78.5,
      passRate: 84,
      status: "pending"
    },
    {
      id: "2",
      examTitle: "Calculus Final Exam",
      unitCode: "MATH201",
      unitName: "Calculus II",
      examType: "exam",
      lecturer: "Prof. Jane Doe",
      submissionDate: "2024-06-18",
      studentsCount: 30,
      averageScore: 65.2,
      passRate: 70,
      status: "pending"
    },
    {
      id: "3",
      examTitle: "Database Systems CAT 2",
      unitCode: "CS301",
      unitName: "Database Management Systems",
      examType: "cat",
      lecturer: "Dr. Michael Brown",
      submissionDate: "2024-06-15",
      studentsCount: 28,
      averageScore: 45.8,
      passRate: 42,
      status: "pending"
    }
  ]);

  const handleApprove = (resultId: string, examTitle: string) => {
    setPendingResults(prev => prev.map(result => 
      result.id === resultId 
        ? { ...result, status: 'approved' as const }
        : result
    ));
    
    toast({
      title: "Results Approved",
      description: `${examTitle} results have been approved and are now visible to students.`,
    });
    
    setIsDialogOpen(false);
    setSelectedResult(null);
  };

  const handleReject = (resultId: string, examTitle: string) => {
    setPendingResults(prev => prev.map(result => 
      result.id === resultId 
        ? { ...result, status: 'rejected' as const }
        : result
    ));
    
    toast({
      title: "Results Rejected",
      description: `${examTitle} results have been rejected and sent back to lecturer.`,
      variant: "destructive",
    });
    
    setIsDialogOpen(false);
    setSelectedResult(null);
  };

  const handleViewResults = (result: PendingResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
  };

  const filteredResults = pendingResults.filter(result => {
    const matchesSearch = result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || result.examType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getExamTypeBadge = (type: string) => {
    return type === 'cat' 
      ? <Badge variant="outline">CAT</Badge>
      : <Badge variant="secondary">EXAM</Badge>;
  };

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 80) return "text-green-600";
    if (passRate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam & CAT Results Approval</CardTitle>
          <CardDescription>
            Review and approve exam results submitted by lecturers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by exam title, unit code, or lecturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cat">CATs Only</SelectItem>
                <SelectItem value="exam">Exams Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Details</TableHead>
                <TableHead>Unit Information</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.examTitle}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {getExamTypeBadge(result.examType)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.unitCode}</div>
                      <div className="text-sm text-gray-500">{result.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>{result.lecturer}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Students: {result.studentsCount}</div>
                      <div>Average: {result.averageScore.toFixed(1)}%</div>
                      <div className={getPassRateColor(result.passRate)}>
                        Pass Rate: {result.passRate}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{result.submissionDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewResults(result)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending results found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Exam Results</DialogTitle>
            <DialogDescription>
              Review the detailed results and decide whether to approve or reject
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Exam Information</h4>
                  <p className="font-medium">{selectedResult.examTitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getExamTypeBadge(selectedResult.examType)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Unit & Lecturer</h4>
                  <p>{selectedResult.unitCode} - {selectedResult.unitName}</p>
                  <p className="text-sm text-gray-500">{selectedResult.lecturer}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-sm text-gray-600">Students</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedResult.studentsCount}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-medium text-sm text-gray-600">Average Score</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedResult.averageScore.toFixed(1)}%</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <h4 className="font-medium text-sm text-gray-600">Pass Rate</h4>
                  <p className={`text-2xl font-bold ${getPassRateColor(selectedResult.passRate)}`}>
                    {selectedResult.passRate}%
                  </p>
                </div>
              </div>

              {selectedResult.passRate < 60 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <p className="text-red-800 text-sm">
                    <strong>Low Pass Rate Alert:</strong> This exam has a pass rate below 60%. 
                    Consider reviewing the exam difficulty or recommending retakes for failing students.
                  </p>
                </div>
              )}

              {selectedResult.status === 'pending' && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedResult.id, selectedResult.examTitle)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedResult.id, selectedResult.examTitle)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve & Publish
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
