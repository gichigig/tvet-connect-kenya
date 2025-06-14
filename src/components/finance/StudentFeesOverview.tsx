
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const StudentFeesOverview = () => {
  const { toast } = useToast();
  const { studentFees, updateFeeStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const handleMarkAsPaid = (feeId: string, studentName: string) => {
    updateFeeStatus(feeId, 'paid', new Date().toISOString().split('T')[0]);
    
    toast({
      title: "Payment Recorded",
      description: `Payment for ${studentName} has been recorded.`,
    });
  };

  const handleMarkAsOverdue = (feeId: string, studentName: string) => {
    updateFeeStatus(feeId, 'overdue');
    
    toast({
      title: "Fee Marked Overdue",
      description: `Fee for ${studentName} has been marked as overdue.`,
      variant: "destructive",
    });
  };

  const filteredFees = studentFees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.unitCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || fee.status === filterStatus;
    const matchesType = filterType === "all" || fee.feeType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'supplementary_exam':
        return <Badge className="bg-blue-100 text-blue-800">Supplementary Exam</Badge>;
      case 'special_exam':
        return <Badge className="bg-purple-100 text-purple-800">Special Exam</Badge>;
      case 'unit_retake':
        return <Badge className="bg-orange-100 text-orange-800">Unit Retake</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const totalPending = studentFees.filter(f => f.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = studentFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const totalOverdue = studentFees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Fees Overview</h2>
          <p className="text-gray-600">Monitor and manage all student fee payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">KSh {totalPending.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Fees</p>
                <p className="text-2xl font-bold text-green-600">KSh {totalPaid.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Fees</p>
                <p className="text-2xl font-bold text-red-600">KSh {totalOverdue.toLocaleString()}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Student Fees</CardTitle>
          <CardDescription>
            Track all fee payments across the institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or unit code..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="supplementary_exam">Supplementary</SelectItem>
                <SelectItem value="special_exam">Special</SelectItem>
                <SelectItem value="unit_retake">Retake</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fees Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{fee.studentName}</div>
                      <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{fee.unitCode}</div>
                      <div className="text-sm text-gray-500">{fee.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">KSh {fee.amount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>{fee.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {fee.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(fee.id, fee.studentName)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMarkAsOverdue(fee.id, fee.studentName)}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Mark Overdue
                          </Button>
                        </>
                      )}
                      {fee.status === 'overdue' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(fee.id, fee.studentName)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                      {fee.status === 'paid' && fee.paidDate && (
                        <div className="text-sm text-gray-500">
                          Paid: {fee.paidDate}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No student fees found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
