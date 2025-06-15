
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const NotificationSystem = () => {
  const { toast } = useToast();
  const { studentFees, getAllUsers, blockUser } = useAuth();
  const [messageType, setMessageType] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [percentageThreshold, setPercentageThreshold] = useState("");

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const getStudentFinancialInfo = (studentId: string) => {
    const studentFeeRecords = studentFees.filter(fee => fee.studentId === studentId);
    const totalOwed = studentFeeRecords
      .filter(fee => fee.status !== 'paid')
      .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
    
    const totalFees = studentFeeRecords.reduce((total, fee) => total + fee.amount, 0);
    const totalPaid = studentFeeRecords.reduce((total, fee) => total + (fee.paidAmount || 0), 0);
    
    const percentagePaid = totalFees > 0 ? (totalPaid / totalFees) * 100 : 100;
    const percentageOwing = 100 - percentagePaid;
    
    return {
      totalOwed,
      totalFees,
      totalPaid,
      percentagePaid,
      percentageOwing
    };
  };

  const getStudentsByPercentageThreshold = (threshold: number) => {
    return students.filter(student => {
      const financial = getStudentFinancialInfo(student.id);
      return financial.percentageOwing >= threshold;
    });
  };

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

  const messageTemplates = {
    payment_reminder: "Dear {studentName}, this is a friendly reminder that you have an outstanding fee balance of KSh {amount} ({percentage}% of total fees). Please make payment by {dueDate} to avoid any inconvenience. Thank you.",
    overdue_notice: "Dear {studentName}, your payment of KSh {amount} is now overdue ({percentage}% of total fees unpaid). Please settle this amount immediately to maintain your student status. Contact the finance office for assistance.",
    payment_confirmation: "Dear {studentName}, we confirm receipt of your payment of KSh {amount} for {feeType}. Your receipt number is {receiptNumber}. Thank you for your payment.",
    clearance_reminder: "Dear {studentName}, please ensure all outstanding fees are cleared before your clearance deadline. Current balance: KSh {amount} ({percentage}% unpaid). Visit the finance office for more details.",
    percentage_warning: "Dear {studentName}, you currently owe {percentage}% of your total fees (KSh {amount}). Immediate payment is required to avoid service interruption. Please visit the finance office."
  };

  const handleSendNotifications = () => {
    if (!messageType) {
      toast({
        title: "Select Message Type",
        description: "Please select a message type to send.",
        variant: "destructive",
      });
      return;
    }

    let targetStudents: any[] = [];
    let messageTemplate = messageTemplates[messageType as keyof typeof messageTemplates] || customMessage;

    switch (messageType) {
      case 'payment_reminder':
        targetStudents = getStudentsWithOutstanding();
        break;
      case 'overdue_notice':
        targetStudents = getOverdueStudents();
        break;
      case 'percentage_warning':
        if (!percentageThreshold) {
          toast({
            title: "Select Percentage",
            description: "Please select a percentage threshold.",
            variant: "destructive",
          });
          return;
        }
        targetStudents = getStudentsByPercentageThreshold(parseInt(percentageThreshold));
        break;
      case 'custom':
        targetStudents = students.filter(s => selectedStudents.includes(s.id));
        messageTemplate = customMessage;
        break;
      default:
        targetStudents = getStudentsWithOutstanding();
    }

    if (targetStudents.length === 0) {
      toast({
        title: "No Recipients",
        description: "No students match the criteria for this message type.",
        variant: "destructive",
      });
      return;
    }

    // Send notifications to selected students
    targetStudents.forEach(student => {
      const financial = getStudentFinancialInfo(student.id);
      
      const personalizedMessage = messageTemplate
        .replace('{studentName}', `${student.firstName} ${student.lastName}`)
        .replace('{amount}', financial.totalOwed.toLocaleString())
        .replace('{percentage}', financial.percentageOwing.toFixed(1))
        .replace('{dueDate}', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString());

      if (sendSMS) {
        console.log(`SMS to ${student.phone}: ${personalizedMessage}`);
      }
      
      if (sendEmail) {
        console.log(`Email to ${student.email}: ${personalizedMessage}`);
      }
    });

    toast({
      title: "Notifications Sent",
      description: `Sent ${sendSMS && sendEmail ? 'SMS and email' : sendSMS ? 'SMS' : 'email'} notifications to ${targetStudents.length} students.`,
    });

    // Reset form
    setMessageType("");
    setCustomMessage("");
    setSelectedStudents([]);
    setPercentageThreshold("");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Notification & Access Control System
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getStudentsWithOutstanding().length}
              </div>
              <div className="text-sm text-blue-800">Outstanding Balances</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getStudentsByPercentageThreshold(40).length}
              </div>
              <div className="text-sm text-yellow-800">40%+ Unpaid</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getStudentsByPercentageThreshold(80).length}
              </div>
              <div className="text-sm text-orange-800">80%+ Unpaid</div>
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
          <CardTitle>Custom Notification</CardTitle>
          <CardDescription>
            Send personalized messages to selected students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="message-type">Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                  <SelectItem value="overdue_notice">Overdue Notice</SelectItem>
                  <SelectItem value="percentage_warning">Percentage Warning</SelectItem>
                  <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                  <SelectItem value="clearance_reminder">Clearance Reminder</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {messageType === 'percentage_warning' && (
              <div>
                <Label htmlFor="percentage-threshold">Percentage Threshold</Label>
                <Select value={percentageThreshold} onValueChange={setPercentageThreshold}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select percentage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40">40% or more unpaid</SelectItem>
                    <SelectItem value="60">60% or more unpaid</SelectItem>
                    <SelectItem value="80">80% or more unpaid</SelectItem>
                    <SelectItem value="100">100% unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={sendSMS} 
                  onCheckedChange={(checked) => setSendSMS(checked === true)} 
                />
                <Label>Send SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={sendEmail} 
                  onCheckedChange={(checked) => setSendEmail(checked === true)} 
                />
                <Label>Send Email</Label>
              </div>
            </div>
          </div>

          {messageType === 'custom' && (
            <div>
              <Label htmlFor="custom-message">Custom Message</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {"{studentName}"}, {"{amount}"}, {"{percentage}"}, {"{dueDate}"} for personalization
              </p>
            </div>
          )}

          {messageType && messageType !== 'custom' && (
            <div>
              <Label>Message Preview</Label>
              <div className="bg-gray-50 p-3 rounded border text-sm">
                {messageTemplates[messageType as keyof typeof messageTemplates]}
              </div>
            </div>
          )}

          <Button onClick={handleSendNotifications} className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
