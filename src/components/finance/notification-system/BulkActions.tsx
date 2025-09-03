
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { messageTemplates } from "./MessageTemplates";

interface BulkActionsProps {
  getStudentFinancialInfo: (studentId: string) => {
    totalOwed: number;
    totalFees: number;
    totalPaid: number;
    percentagePaid: number;
    percentageOwing: number;
  };
}

export const BulkActions = ({ getStudentFinancialInfo }: BulkActionsProps) => {
  const { toast } = useToast();
  const { getAllUsers, blockUser, studentFees } = useAuth();

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const getStudentsWithOutstanding = () => {
    return students.filter(student => {
      const financial = getStudentFinancialInfo(student.id);
      return financial.totalOwed > 0;
    });
  };

  const getOverdueStudents = () => {
    return students.filter(student => {
      return studentFees.some(fee => 
        fee.studentId === student.id && 
        fee.status === 'overdue'
      );
    });
  };

  const getStudentsByPercentageThreshold = (threshold: number) => {
    return students.filter(student => {
      const financial = getStudentFinancialInfo(student.id);
      return financial.percentageOwing >= threshold;
    });
  };

  const handleBulkBlockByPercentage = (threshold: number) => {
    const targetStudents = getStudentsByPercentageThreshold(threshold);
    let blockedCount = 0;

    targetStudents.forEach(student => {
      if (!student.blocked) {
        blockUser(student.id);
        blockedCount++;
      }
    });

    toast({
      title: "Bulk Block Completed",
      description: `${blockedCount} students with ${threshold}%+ unpaid fees have been blocked.`,
      variant: "destructive",
    });
  };

  const handleBulkReminder = (type: 'all' | 'overdue' | 'defaulters') => {
    let targetStudents: any[] = [];
    let messageTemplate = "";

    switch (type) {
      case 'all':
        targetStudents = getStudentsWithOutstanding();
        messageTemplate = messageTemplates.payment_reminder;
        break;
      case 'overdue':
        targetStudents = getOverdueStudents();
        messageTemplate = messageTemplates.overdue_notice;
        break;
      case 'defaulters':
        targetStudents = students.filter(s => s.financialStatus === 'defaulter');
        messageTemplate = messageTemplates.clearance_reminder;
        break;
    }

    targetStudents.forEach(student => {
      const financial = getStudentFinancialInfo(student.id);

      const personalizedMessage = messageTemplate
        .replace('{studentName}', `${student.firstName} ${student.lastName}`)
        .replace('{amount}', financial.totalOwed.toLocaleString())
        .replace('{percentage}', financial.percentageOwing.toFixed(1));

      console.log(`Bulk notification to ${student.firstName}: ${personalizedMessage}`);
    });

    toast({
      title: "Bulk Notifications Sent",
      description: `Sent reminders to ${targetStudents.length} students.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Bulk Actions
        </CardTitle>
        <CardDescription>
          Send messages and block access based on payment percentages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleBulkReminder('all')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Message All Outstanding
          </Button>
          <Button
            onClick={() => handleBulkReminder('overdue')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Message Overdue
          </Button>
          <Button
            onClick={() => handleBulkReminder('defaulters')}
            className="bg-red-600 hover:bg-red-700"
          >
            Message Defaulters
          </Button>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Percentage-Based Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleBulkBlockByPercentage(40)}
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Block 40%+ Unpaid
            </Button>
            <Button
              onClick={() => handleBulkBlockByPercentage(80)}
              variant="outline"
              className="border-orange-500 text-orange-700 hover:bg-orange-50"
            >
              Block 80%+ Unpaid
            </Button>
            <Button
              onClick={() => handleBulkBlockByPercentage(100)}
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-50"
            >
              Block 100% Unpaid
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
