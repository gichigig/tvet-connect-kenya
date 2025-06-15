
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ban, search } from "lucide-react";
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
    const studentBalance = studentFees
      .filter(fee => fee.studentId === studentId && fee.status !== 'paid')
      .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);

    if (studentBalance === 0) return { status: 'cleared', balance: 0 };
    if (studentBalance > 50000) return { status: 'defaulter', balance: studentBalance };
    return { status: 'partial', balance: studentBalance };
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

  const handleBulkBlock = () => {
    const defaulters = filteredStudents.filter(student => {
      const financial = getStudentFinancialStatus(student.id);
      return financial.status === 'defaulter' && !student.blocked;
    });

    defaulters.forEach(student => {
      blockUser(student.id);
      updateStudentFinancialStatus(student.id, 'defaulter', getStudentFinancialStatus(student.id).balance);
    });

    toast({
      title: "Bulk Action Completed",
      description: `${defaulters.length} students have been blocked for unpaid fees.`,
      variant: "destructive",
    });
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cleared':
        return <Badge className="bg-green-100 text-green-800">Cleared</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial Payment</Badge>;
      case 'defaulter':
        return <Badge className="bg-red-100 text-red-800">Defaulter</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ban className="w-5 h-5" />
            Student Access Control
          </CardTitle>
          <CardDescription>
            Manage student access based on payment status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                <span className="text-sm">Auto-block defaulters</span>
              </div>
            </div>
            <Button onClick={handleBulkBlock} variant="destructive">
              <ban className="w-4 h-4 mr-2" />
              Block All Defaulters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredStudents.filter(s => getStudentFinancialStatus(s.id).status === 'cleared').length}
              </div>
              <div className="text-sm text-green-800">Cleared Students</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredStudents.filter(s => getStudentFinancialStatus(s.id).status === 'partial').length}
              </div>
              <div className="text-sm text-yellow-800">Partial Payments</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredStudents.filter(s => getStudentFinancialStatus(s.id).status === 'defaulter').length}
              </div>
              <div className="text-sm text-red-800">Defaulters</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">
                {filteredStudents.filter(s => s.blocked).length}
              </div>
              <div className="text-sm text-gray-800">Blocked Access</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Access Status</CardTitle>
          <CardDescription>
            Monitor and control individual student access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Financial Status</TableHead>
                <TableHead>Outstanding Balance</TableHead>
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
                    <TableCell>{getStatusBadge(financial.status)}</TableCell>
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
