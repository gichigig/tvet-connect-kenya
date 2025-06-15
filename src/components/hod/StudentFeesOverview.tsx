
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const StudentFeesOverview = () => {
  const { getAllUsers, studentFees } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const users = getAllUsers();
  const students = users.filter(u => u.role === 'student' && u.approved);

  // Filter fees for students only
  const studentFeesData = studentFees.filter(fee => {
    const student = students.find(s => s.id === fee.studentId);
    return student !== undefined;
  });

  const filteredFees = studentFeesData.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || fee.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalFeesIssued = studentFeesData.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaidFees = studentFeesData.filter(f => f.status === 'paid').reduce((sum, fee) => sum + (fee.paidAmount || fee.amount), 0);
  const totalOverdue = studentFeesData.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);
  const studentsWithFees = new Set(studentFeesData.map(f => f.studentId)).size;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      tuition: 'bg-blue-100 text-blue-800',
      exam: 'bg-purple-100 text-purple-800',
      library: 'bg-green-100 text-green-800',
      lab: 'bg-orange-100 text-orange-800',
      activity: 'bg-pink-100 text-pink-800',
      medical: 'bg-cyan-100 text-cyan-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Student Fees Overview
          </CardTitle>
          <CardDescription>
            Monitor fee payments and financial status of students in your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalFeesIssued.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Total Fees Issued</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">KSh {totalPaidFees.toLocaleString()}</div>
              <div className="text-sm text-green-800">Fees Collected</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">KSh {totalOverdue.toLocaleString()}</div>
              <div className="text-sm text-red-800">Overdue Fees</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{studentsWithFees}</div>
              <div className="text-sm text-purple-800">Students with Fees</div>
            </div>
          </div>

          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Search by student name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Academic Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <div className="font-medium">{fee.studentName}</div>
                  </TableCell>
                  <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                  <TableCell>{fee.description}</TableCell>
                  <TableCell>
                    <div className="font-medium">KSh {fee.amount.toLocaleString()}</div>
                    {fee.paidAmount && fee.paidAmount !== fee.amount && (
                      <div className="text-sm text-green-600">Paid: KSh {fee.paidAmount.toLocaleString()}</div>
                    )}
                  </TableCell>
                  <TableCell>{fee.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{fee.academicYear}</div>
                      <div className="text-gray-500">Sem {fee.semester}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No student fees found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
