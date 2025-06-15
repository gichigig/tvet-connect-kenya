
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Ban, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const AccessControl = () => {
  const { toast } = useToast();
  const { getAllUsers, blockUser, unblockUser, studentFees, updateStudentFinancialStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const getStudentFinancialStatus = (studentId: string) => {
    const studentFeeRecords = studentFees.filter(fee => fee.studentId === studentId);
    const totalOwed = studentFeeRecords
      .filter(fee => fee.status !== 'paid')
      .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
    
    const totalFees = studentFeeRecords.reduce((total, fee) => total + fee.amount, 0);
    const totalPaid = studentFeeRecords.reduce((total, fee) => total + (fee.paidAmount || 0), 0);
    
    const percentagePaid = totalFees > 0 ? (totalPaid / totalFees) * 100 : 100;
    const percentageOwing = 100 - percentagePaid;

    let status = 'cleared';
    if (percentageOwing >= 100) status = 'defaulter';
    else if (percentageOwing >= 40) status = 'partial';
    
    return { 
      status, 
      balance: totalOwed,
      totalFees,
      totalPaid,
      percentagePaid,
      percentageOwing
    };
  };

  const handleToggleAccess = (studentId: string, isBlocked: boolean) => {
    if (isBlocked) {
      unblockUser(studentId);
      toast({
        title: "Access Restored",
        description: "Student access has been restored.",
      });
    } else {
      blockUser(studentId);
      toast({
        title: "Access Blocked",
        description: "Student access has been blocked due to unpaid fees.",
        variant: "destructive",
      });
    }
  };

  const handleBulkBlockByPercentage = (threshold: number) => {
    const targetStudents = filteredStudents.filter(student => {
      const financial = getStudentFinancialStatus(student.id);
      return financial.percentageOwing >= threshold && !student.blocked;
    });

    targetStudents.forEach(student => {
      blockUser(student.id);
      const financial = getStudentFinancialStatus(student.id);
      updateStudentFinancialStatus(student.id, 'defaulter', financial.balance);
    });

    toast({
      title: "Bulk Block Completed",
      description: `${targetStudents.length} students with ${threshold}%+ unpaid fees have been blocked.`,
      variant: "destructive",
    });
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, percentageOwing: number) => {
    if (percentageOwing >= 100) {
      return <Badge className="bg-red-100 text-red-800">100% Unpaid</Badge>;
    } else if (percentageOwing >= 80) {
      return <Badge className="bg-red-100 text-red-800">80%+ Unpaid</Badge>;
    } else if (percentageOwing >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">40%+ Unpaid</Badge>;
    } else if (percentageOwing > 0) {
      return <Badge className="bg-blue-100 text-blue-800">Partial Payment</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Cleared</Badge>;
    }
  };

  const getStudentsByPercentageThreshold = (threshold: number) => {
    return filteredStudents.filter(student => {
      const financial = getStudentFinancialStatus(student.id);
      return financial.percentageOwing >= threshold;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Student Access Control
          </CardTitle>
          <CardDescription>
            Manage student access based on payment percentages (40%, 80%, 100%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoBlockEnabled}
                  onCheckedChange={setAutoBlockEnabled}
                />
                <span className="text-sm">Auto-block by percentage</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleBulkBlockByPercentage(40)}
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block 40%+ Unpaid ({getStudentsByPercentageThreshold(40).length})
            </Button>
            <Button
              onClick={() => handleBulkBlockByPercentage(80)}
              variant="outline" 
              className="border-orange-500 text-orange-700 hover:bg-orange-50"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block 80%+ Unpaid ({getStudentsByPercentageThreshold(80).length})
            </Button>
            <Button
              onClick={() => handleBulkBlockByPercentage(100)}
              variant="destructive"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block 100% Unpaid ({getStudentsByPercentageThreshold(100).length})
            </Button>
            <div className="flex items-center justify-center bg-gray-50 rounded p-2">
              <span className="text-sm text-gray-600">
                {filteredStudents.filter(s => s.blocked).length} Currently Blocked
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredStudents.filter(s => getStudentFinancialStatus(s.id).percentageOwing === 0).length}
              </div>
              <div className="text-sm text-green-800">Fully Paid</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredStudents.filter(s => {
                  const p = getStudentFinancialStatus(s.id).percentageOwing;
                  return p > 0 && p < 40;
                }).length}
              </div>
              <div className="text-sm text-blue-800">Partial (0-40%)</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getStudentsByPercentageThreshold(40).filter(s => getStudentFinancialStatus(s.id).percentageOwing < 80).length}
              </div>
              <div className="text-sm text-yellow-800">40-80% Unpaid</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getStudentsByPercentageThreshold(80).filter(s => getStudentFinancialStatus(s.id).percentageOwing < 100).length}
              </div>
              <div className="text-sm text-orange-800">80-100% Unpaid</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {getStudentsByPercentageThreshold(100).length}
              </div>
              <div className="text-sm text-red-800">100% Unpaid</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Access Status</CardTitle>
          <CardDescription>
            Monitor and control individual student access based on payment percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Amount Owed</TableHead>
                <TableHead>% Unpaid</TableHead>
                <TableHead>Access Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const financial = getStudentFinancialStatus(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>{getStatusBadge(financial.status, financial.percentageOwing)}</TableCell>
                    <TableCell>
                      {financial.balance > 0 ? (
                        <span className="text-red-600 font-medium">
                          KSh {financial.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-green-600">Cleared</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        financial.percentageOwing >= 80 ? 'text-red-600' :
                        financial.percentageOwing >= 40 ? 'text-yellow-600' :
                        financial.percentageOwing > 0 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {financial.percentageOwing.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={student.blocked ? "default" : "destructive"}
                        onClick={() => handleToggleAccess(student.id, student.blocked || false)}
                      >
                        {student.blocked ? 'Restore Access' : 'Block Access'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
