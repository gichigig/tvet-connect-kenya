
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Ban, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
// import { AccessControlStats } from "./access-control/AccessControlStats";
// import { AccessControlBulkActions } from "./access-control/AccessControlBulkActions";
// import { AccessControlTable } from "./access-control/AccessControlTable";

export const AccessControl = () => {
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [studentFees] = useState<any[]>([]); // Mock fees data

  // Load users on component mount
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
        setAllUsers([]);
      }
    };
    loadUsers();
  }, [getAllUsers]);

  // Mock functions for missing auth context methods
  const blockUser = async (userId: string) => {
    try {
      console.log('Blocking user:', userId);
      toast({
        title: "User blocked",
        description: "Student access has been blocked due to payment issues.",
      });
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      console.log('Unblocking user:', userId);
      toast({
        title: "User unblocked",
        description: "Student access has been restored.",
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const updateStudentFinancialStatus = async (userId: string, status: string, balance: number) => {
    try {
      console.log('Updating financial status:', userId, status, balance);
      toast({
        title: "Financial status updated",
        description: `Student financial status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating financial status:', error);
    }
  };

  const students = allUsers.filter(user => user.role === 'student' && user.approved);

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

          {/* Placeholder for AccessControlBulkActions */}
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Bulk Actions</h3>
            <p className="text-sm text-muted-foreground">Bulk action controls would appear here</p>
          </div>

          {/* Placeholder for AccessControlStats */}
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Access Statistics</h3>
            <p className="text-sm text-muted-foreground">Statistics would appear here</p>
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
          {/* Placeholder for AccessControlTable */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Student Access Table</h3>
            <p className="text-sm text-muted-foreground">Student access control table would appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
