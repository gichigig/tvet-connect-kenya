
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, FileCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const ClearanceManagement = () => {
  const { toast } = useToast();
  const { 
    getAllUsers, 
    studentFees, 
    clearanceForms, 
    addClearanceForm, 
    updateClearanceStatus, 
    updateStudentFinancialStatus,
    user 
  } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClearance, setSelectedClearance] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const [clearanceForm, setClearanceForm] = useState({
    studentId: "",
    academicYear: "2024/2025",
    semester: 1
  });

  const handleRequestClearance = () => {
    if (!clearanceForm.studentId) {
      toast({
        title: "Select Student",
        description: "Please select a student to process clearance for.",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.id === clearanceForm.studentId);
    if (!student) return;

    // Calculate fees for this student
    const studentAllFees = studentFees.filter(fee => 
      fee.studentId === clearanceForm.studentId &&
      fee.academicYear === clearanceForm.academicYear &&
      fee.semester === clearanceForm.semester
    );

    const totalFees = studentAllFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = studentAllFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const outstandingBalance = totalFees - totalPaid;

    addClearanceForm({
      studentId: clearanceForm.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      academicYear: clearanceForm.academicYear,
      semester: clearanceForm.semester,
      requestDate: new Date().toISOString().split('T')[0],
      status: outstandingBalance > 0 ? 'blocked' : 'cleared',
      totalFeesOwed: totalFees,
      totalFeesPaid: totalPaid,
      outstandingBalance
    });

    // Update student financial status
    updateStudentFinancialStatus(
      clearanceForm.studentId,
      outstandingBalance > 0 ? 'defaulter' : 'cleared',
      outstandingBalance
    );

    toast({
      title: "Clearance Processed",
      description: `Clearance ${outstandingBalance > 0 ? 'blocked' : 'approved'} for ${student.firstName} ${student.lastName}.`,
      variant: outstandingBalance > 0 ? "destructive" : "default"
    });

    setClearanceForm({
      studentId: "",
      academicYear: "2024/2025",
      semester: 1
    });
    setIsDialogOpen(false);
  };

  const handleUpdateClearance = (clearanceId: string, status: 'cleared' | 'blocked') => {
    updateClearanceStatus(clearanceId, status, user?.id, remarks);
    
    const clearance = clearanceForms.find(c => c.id === clearanceId);
    if (clearance) {
      updateStudentFinancialStatus(
        clearance.studentId,
        status === 'cleared' ? 'cleared' : 'defaulter',
        clearance.outstandingBalance
      );
    }

    toast({
      title: "Clearance Updated",
      description: `Student clearance ${status === 'cleared' ? 'approved' : 'blocked'}.`,
    });

    setSelectedClearance(null);
    setRemarks("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cleared':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Cleared</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFinancialStatusBadge = (status?: string, balance?: number) => {
    if (!status) return null;
    
    switch (status) {
      case 'cleared':
        return <Badge className="bg-green-100 text-green-800">Cleared</Badge>;
      case 'defaulter':
        return <Badge className="bg-red-100 text-red-800">Defaulter</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial Payment</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Clearance Management</h2>
          <p className="text-gray-600">Process student clearances and manage financial defaulters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileCheck className="w-4 h-4 mr-2" />
              Process Clearance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Student Clearance</DialogTitle>
              <DialogDescription>
                Check student fees and generate clearance status
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student">Student</Label>
                <Select value={clearanceForm.studentId} onValueChange={(value) => setClearanceForm(prev => ({ ...prev, studentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.admissionNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Select value={clearanceForm.academicYear} onValueChange={(value) => setClearanceForm(prev => ({ ...prev, academicYear: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={clearanceForm.semester.toString()} onValueChange={(value) => setClearanceForm(prev => ({ ...prev, semester: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestClearance}>
                  Process Clearance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student Financial Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Status Overview</CardTitle>
          <CardDescription>
            Overview of student financial standings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Financial Status</TableHead>
                <TableHead>Total Owed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const studentTotalOwed = studentFees
                  .filter(fee => fee.studentId === student.id && fee.status !== 'paid')
                  .reduce((sum, fee) => sum + (fee.amount - (fee.paidAmount || 0)), 0);
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>Year {student.year}</TableCell>
                    <TableCell>{getFinancialStatusBadge(student.financialStatus, studentTotalOwed)}</TableCell>
                    <TableCell>
                      {studentTotalOwed > 0 ? (
                        <span className="text-red-600 font-medium">KSh {studentTotalOwed.toLocaleString()}</span>
                      ) : (
                        <span className="text-green-600 font-medium">KSh 0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {studentTotalOwed > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Block Access
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Clearance Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Clearance Requests</CardTitle>
          <CardDescription>
            Process and manage student clearance requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Academic Period</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Total Fees</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearanceForms.map((clearance) => (
                <TableRow key={clearance.id}>
                  <TableCell>
                    <div className="font-medium">{clearance.studentName}</div>
                  </TableCell>
                  <TableCell>{clearance.academicYear} - Sem {clearance.semester}</TableCell>
                  <TableCell>{clearance.requestDate}</TableCell>
                  <TableCell>KSh {clearance.totalFeesOwed.toLocaleString()}</TableCell>
                  <TableCell>KSh {clearance.totalFeesPaid.toLocaleString()}</TableCell>
                  <TableCell>
                    {clearance.outstandingBalance > 0 ? (
                      <span className="text-red-600 font-medium">KSh {clearance.outstandingBalance.toLocaleString()}</span>
                    ) : (
                      <span className="text-green-600 font-medium">KSh 0</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(clearance.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {clearance.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateClearance(clearance.id, 'cleared')}
                            disabled={clearance.outstandingBalance > 0}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateClearance(clearance.id, 'blocked')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Block
                          </Button>
                        </>
                      )}
                      {clearance.clearanceDate && (
                        <div className="text-sm text-gray-500">
                          {clearance.status === 'cleared' ? 'Cleared' : 'Blocked'}: {clearance.clearanceDate}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {clearanceForms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No clearance requests found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
