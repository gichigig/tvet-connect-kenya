
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, Eye, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RetakeRequest {
  id: string;
  studentId: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  previousGrade: string;
  requestDate: string;
  reason: string;
  academicYear: string;
  semester: number;
  status: "pending" | "approved" | "rejected";
  reviewNotes?: string;
}

export const RetakeManager = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RetakeRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const [retakeRequests, setRetakeRequests] = useState<RetakeRequest[]>([
    {
      id: "1",
      studentId: "STU2024001",
      studentName: "John Doe",
      unitCode: "CS101",
      unitName: "Introduction to Computer Science",
      previousGrade: "F",
      requestDate: "2024-01-15",
      reason: "Failed due to illness during exam period. Have medical certificate as proof.",
      academicYear: "2023/2024",
      semester: 1,
      status: "pending"
    },
    {
      id: "2",
      studentId: "STU2024002",
      unitName: "Jane Smith",
      unitCode: "MATH101",
      unitName: "Calculus I",
      previousGrade: "D",
      requestDate: "2024-01-18",
      reason: "Need to retake to improve GPA for scholarship requirements.",
      academicYear: "2023/2024",
      semester: 1,
      status: "pending"
    },
    {
      id: "3",
      studentId: "STU2024003",
      studentName: "Alice Johnson",
      unitCode: "ENG101",
      unitName: "English Composition",
      previousGrade: "F",
      requestDate: "2024-01-12",
      reason: "Family emergency during exam period affected performance.",
      academicYear: "2023/2024",
      semester: 1,
      status: "approved",
      reviewNotes: "Valid reason with supporting documentation. Approved for next semester retake."
    }
  ]);

  const handleApproveRequest = (requestId: string, studentName: string) => {
    setRetakeRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'approved' as const, reviewNotes }
        : request
    ));
    
    toast({
      title: "Request Approved",
      description: `Retake request for ${studentName} has been approved.`,
    });
    
    setIsDialogOpen(false);
    setReviewNotes("");
    setSelectedRequest(null);
  };

  const handleRejectRequest = (requestId: string, studentName: string) => {
    setRetakeRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'rejected' as const, reviewNotes }
        : request
    ));
    
    toast({
      title: "Request Rejected",
      description: `Retake request for ${studentName} has been rejected.`,
      variant: "destructive",
    });
    
    setIsDialogOpen(false);
    setReviewNotes("");
    setSelectedRequest(null);
  };

  const handleViewRequest = (request: RetakeRequest) => {
    setSelectedRequest(request);
    setReviewNotes(request.reviewNotes || "");
    setIsDialogOpen(true);
  };

  const filteredRequests = retakeRequests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGradeBadge = (grade: string) => {
    const color = grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
    return <Badge className={color}>{grade}</Badge>;
  };

  const pendingCount = retakeRequests.filter(r => r.status === 'pending').length;
  const approvedCount = retakeRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = retakeRequests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Retake Management</h2>
          <p className="text-gray-600">Review and approve student retake requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
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
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retake Requests</CardTitle>
          <CardDescription>
            Review student requests for unit retakes
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Details</TableHead>
                <TableHead>Unit Information</TableHead>
                <TableHead>Previous Grade</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.studentName}</div>
                      <div className="text-sm text-gray-500">ID: {request.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.unitCode}</div>
                      <div className="text-sm text-gray-500">{request.unitName}</div>
                      <div className="text-sm text-gray-500">
                        {request.academicYear} - Semester {request.semester}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getGradeBadge(request.previousGrade)}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request)}
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

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No retake requests found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Retake Request</DialogTitle>
            <DialogDescription>
              Review the student's retake request and provide your decision
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Student</h4>
                  <p>{selectedRequest.studentName}</p>
                  <p className="text-sm text-gray-500">ID: {selectedRequest.studentId}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Unit</h4>
                  <p>{selectedRequest.unitCode} - {selectedRequest.unitName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.academicYear} - Semester {selectedRequest.semester}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-600">Previous Grade</h4>
                {getGradeBadge(selectedRequest.previousGrade)}
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600">Student's Reason</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.reason}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600">Review Notes</h4>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes and decision reasoning..."
                />
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectRequest(selectedRequest.id, selectedRequest.studentName)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveRequest(selectedRequest.id, selectedRequest.studentName)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Previous Review Notes</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.reviewNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
