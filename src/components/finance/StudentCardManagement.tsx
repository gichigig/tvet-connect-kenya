
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Search, CheckCircle, XCircle, History, User } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";

export const StudentCardManagement = () => {
  const { 
    user, 
    getAllUsers, 
    studentFees, 
    studentCards, 
    activateStudentCard, 
    deactivateStudentCard,
    getActivityLogs 
  } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const students = getAllUsers().filter(u => u.role === 'student' && u.approved);

  const getStudentFinancialStatus = (studentId: string) => {
    const studentFeeRecords = studentFees.filter(fee => fee.studentId === studentId);
    const totalOwed = studentFeeRecords
      .filter(fee => fee.status !== 'paid')
      .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
    
    return {
      isCleared: totalOwed === 0,
      balance: totalOwed
    };
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActivateCard = (studentId: string) => {
    if (!user) return;
    
    activateStudentCard(studentId, user.id);
    const student = students.find(s => s.id === studentId);
    
    toast({
      title: "Student Card Activated",
      description: `Card activated for ${student?.firstName} ${student?.lastName}`,
    });
  };

  const handleDeactivateCard = (studentId: string) => {
    if (!user) return;
    
    deactivateStudentCard(studentId, user.id);
    const student = students.find(s => s.id === studentId);
    
    toast({
      title: "Student Card Deactivated",
      description: `Card deactivated for ${student?.firstName} ${student?.lastName}`,
      variant: "destructive",
    });
  };

  const getStudentCard = (studentId: string) => {
    return studentCards.find(card => card.studentId === studentId);
  };

  const financeActivityLogs = getActivityLogs();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Student Card Management
          </CardTitle>
          <CardDescription>
            Activate and manage student cards based on payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="management" className="space-y-4">
            <TabsList>
              <TabsTrigger value="management">Card Management</TabsTrigger>
              <TabsTrigger value="history">Activity History</TabsTrigger>
            </TabsList>

            <TabsContent value="management" className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission Number</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Financial Status</TableHead>
                    <TableHead>Card Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const financial = getStudentFinancialStatus(student.id);
                    const card = getStudentCard(student.id);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.admissionNumber || '-'}</TableCell>
                        <TableCell>{student.course || '-'}</TableCell>
                        <TableCell>
                          {financial.isCleared ? (
                            <Badge className="bg-green-100 text-green-800">Cleared</Badge>
                          ) : (
                            <div>
                              <Badge className="bg-red-100 text-red-800">Owing</Badge>
                              <div className="text-xs text-red-600">
                                KSh {financial.balance.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {card?.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!card?.isActive ? (
                              <Button
                                size="sm"
                                onClick={() => handleActivateCard(student.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Activate Card
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeactivateCard(student.id)}
                              >
                                Deactivate Card
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Finance Department Activity Log
                  </CardTitle>
                  <CardDescription>
                    Track all student card management activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {financeActivityLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No activity logs found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financeActivityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {log.userName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell>{log.targetStudentName || '-'}</TableCell>
                            <TableCell className="max-w-md">
                              <div className="text-sm">{log.details}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
