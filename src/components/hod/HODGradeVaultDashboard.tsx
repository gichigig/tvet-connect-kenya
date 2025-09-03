import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  GraduationCap, 
  FileText, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Calendar,
  Edit,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useGradeVault, GradeVaultResult } from '@/contexts/GradeVaultContext';
import { useToast } from '@/hooks/use-toast';

export const HODGradeVaultDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    results,
    getPendingHODApproval,
    approveResults,
    rejectResults,
    grantEditingPermission,
    revokeEditingPermission,
    updateResult,
    getGradeVaultStats,
    loading
  } = useGradeVault();
  const { toast } = useToast();

  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [viewingResult, setViewingResult] = useState<GradeVaultResult | null>(null);
  const [editingResult, setEditingResult] = useState<GradeVaultResult | null>(null);
  const [hodComments, setHODComments] = useState('');
  const [editMarks, setEditMarks] = useState<number>(0);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterAssessment, setFilterAssessment] = useState<string>('all');

  // Get statistics
  const stats = getGradeVaultStats();
  const pendingResults = getPendingHODApproval();

  // Filter results based on current filters
  const getFilteredResults = () => {
    return results.filter(result => {
      const matchesSearch = 
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.lecturerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
      const matchesAssessment = filterAssessment === 'all' || result.assessmentType === filterAssessment;
      
      return matchesSearch && matchesStatus && matchesAssessment;
    });
  };

  const filteredResults = getFilteredResults();

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(filteredResults.map(r => r.id));
    } else {
      setSelectedResults([]);
    }
  };

  const handleSelectResult = (resultId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults(prev => [...prev, resultId]);
    } else {
      setSelectedResults(prev => prev.filter(id => id !== resultId));
    }
  };

  // Handle approve results
  const handleApproveResults = async (resultIds: string[], comments?: string) => {
    try {
      await approveResults(resultIds, comments);
      toast({
        title: "Results Approved",
        description: `${resultIds.length} result(s) have been approved and are now visible to students.`,
        variant: "default"
      });
      setSelectedResults([]);
      setHODComments('');
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve results. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle reject results
  const handleRejectResults = async (resultIds: string[], comments: string) => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide comments when rejecting results.",
        variant: "destructive"
      });
      return;
    }

    try {
      await rejectResults(resultIds, comments);
      toast({
        title: "Results Rejected",
        description: `${resultIds.length} result(s) have been rejected and sent back to lecturer.`,
        variant: "default"
      });
      setSelectedResults([]);
      setHODComments('');
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject results. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle edit result
  const handleEditResult = async () => {
    if (!editingResult) return;

    try {
      const percentage = (editMarks / editingResult.maxMarks) * 100;
      const grade = calculateGrade(percentage);
      
      await updateResult(editingResult.id, {
        marks: editMarks,
        percentage,
        grade,
        status: 'approved', // Auto-approve HOD edits
        visibleToStudent: true
      });

      toast({
        title: "Result Updated",
        description: `${editingResult.studentName}'s marks have been updated successfully.`,
        variant: "default"
      });
      
      setEditingResult(null);
      setEditMarks(0);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update result. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'E';
  };

  // Grant editing permission to lecturer
  const handleGrantEditPermission = async (resultIds: string[]) => {
    try {
      const lecturerIds = resultIds.map(id => {
        const result = results.find(r => r.id === id);
        return result?.lecturerId || '';
      }).filter(Boolean);

      for (const lecturerId of new Set(lecturerIds)) {
        await grantEditingPermission(resultIds.filter(id => {
          const result = results.find(r => r.id === id);
          return result?.lecturerId === lecturerId;
        }), lecturerId);
      }

      toast({
        title: "Editing Permission Granted",
        description: `Lecturers can now edit the selected results.`,
        variant: "default"
      });
      setSelectedResults([]);
    } catch (error) {
      toast({
        title: "Permission Grant Failed",
        description: "Failed to grant editing permission. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedResults.length === 0) {
      toast({
        title: "No Results Selected",
        description: "Please select results to perform bulk actions.",
        variant: "destructive"
      });
      return;
    }

    switch (bulkAction) {
      case 'approve':
        await handleApproveResults(selectedResults, hodComments);
        break;
      case 'reject':
        await handleRejectResults(selectedResults, hodComments);
        break;
      case 'grant_edit':
        await handleGrantEditPermission(selectedResults);
        break;
      default:
        toast({
          title: "Invalid Action",
          description: "Please select a valid bulk action.",
          variant: "destructive"
        });
    }
    setBulkAction('');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hod_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'published':
        return <Badge className="bg-blue-100 text-blue-800">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get grade badge
  const getGradeBadge = (grade: string) => {
    const gradeColors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800'
    };
    
    const color = gradeColors[grade as keyof typeof gradeColors] || 'bg-gray-100 text-gray-800';
    return <Badge className={color}>{grade}</Badge>;
  };

  if (!user || user.role !== 'hod') {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            Only HOD users can access the Grade Vault approval dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            HOD Grade Vault Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve academic results submitted by lecturers
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalResults}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingHODApproval}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Results</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedResults}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-3xl font-bold text-purple-600">{stats.passRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students, units, lecturers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="hod_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssessment} onValueChange={setFilterAssessment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assessments</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
                <SelectItem value="cat1">CAT 1</SelectItem>
                <SelectItem value="cat2">CAT 2</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterAssessment('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions ({selectedResults.length} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve Results</SelectItem>
                    <SelectItem value="reject">Reject Results</SelectItem>
                    <SelectItem value="grant_edit">Grant Edit Permission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(bulkAction === 'approve' || bulkAction === 'reject') && (
                <div className="flex-2">
                  <Textarea
                    placeholder="Comments (required for rejection)..."
                    value={hodComments}
                    onChange={(e) => setHODComments(e.target.value)}
                    rows={2}
                  />
                </div>
              )}
              
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Execute Action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Academic Results ({filteredResults.length})
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No results found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={(e) => handleSelectResult(result.id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
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
                        <Badge variant="outline" className="uppercase">
                          {result.assessmentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold">
                            {result.marks}/{result.maxMarks}
                          </span>
                          <div className="text-sm text-gray-500">
                            {result.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getGradeBadge(result.grade)}</TableCell>
                      <TableCell>{getStatusBadge(result.status)}</TableCell>
                      <TableCell className="text-sm">{result.lecturerName}</TableCell>
                      <TableCell className="text-sm">
                        {result.gradedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setViewingResult(result)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Result Details</DialogTitle>
                                <DialogDescription>
                                  Detailed view of {result.studentName}'s result
                                </DialogDescription>
                              </DialogHeader>
                              
                              {viewingResult && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">Student Information</h4>
                                      <p>Name: {viewingResult.studentName}</p>
                                      <p>Admission: {viewingResult.admissionNumber}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Assessment Details</h4>
                                      <p>Unit: {viewingResult.unitCode} - {viewingResult.unitName}</p>
                                      <p>Type: {viewingResult.assessmentType.toUpperCase()}</p>
                                      <p>Title: {viewingResult.assessmentTitle}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <h4 className="font-semibold">Marks</h4>
                                      <p className="text-2xl font-bold">
                                        {viewingResult.marks}/{viewingResult.maxMarks}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Percentage</h4>
                                      <p className="text-2xl font-bold">
                                        {viewingResult.percentage.toFixed(1)}%
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Grade</h4>
                                      <div className="text-2xl font-bold">
                                        {getGradeBadge(viewingResult.grade)}
                                      </div>
                                    </div>
                                  </div>

                                  {viewingResult.hodComments && (
                                    <div>
                                      <h4 className="font-semibold">HOD Comments</h4>
                                      <p className="bg-gray-50 p-3 rounded">{viewingResult.hodComments}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {result.status === 'hod_review' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApproveResults([result.id])}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSelectedResults([result.id]);
                                  setBulkAction('reject');
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingResult(result);
                                  setEditMarks(result.marks);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Result</DialogTitle>
                                <DialogDescription>
                                  Edit marks for {result.studentName}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {editingResult && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Marks (out of {editingResult.maxMarks})
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={editingResult.maxMarks}
                                      value={editMarks}
                                      onChange={(e) => setEditMarks(Number(e.target.value))}
                                    />
                                  </div>
                                  
                                  <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-sm">
                                      <strong>Percentage:</strong> {((editMarks / editingResult.maxMarks) * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-sm">
                                      <strong>Grade:</strong> {calculateGrade((editMarks / editingResult.maxMarks) * 100)}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingResult(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditResult}>
                                  Update Result
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HODGradeVaultDashboard;
