
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const NotificationSystem = () => {
  const { toast } = useToast();
  const { studentFees, getAllUsers } = useAuth();
  const [messageType, setMessageType] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const getStudentsWithOutstanding = () => {
    return students.filter(student => {
      const balance = studentFees
        .filter(fee => fee.studentId === student.id && fee.status !== 'paid')
        .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
      return balance > 0;
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
    payment_reminder: "Dear {studentName}, this is a friendly reminder that you have an outstanding fee balance of KSh {amount}. Please make payment by {dueDate} to avoid any inconvenience. Thank you.",
    overdue_notice: "Dear {studentName}, your payment of KSh {amount} is now overdue. Please settle this amount immediately to maintain your student status. Contact the finance office for assistance.",
    payment_confirmation: "Dear {studentName}, we confirm receipt of your payment of KSh {amount} for {feeType}. Your receipt number is {receiptNumber}. Thank you for your payment.",
    clearance_reminder: "Dear {studentName}, please ensure all outstanding fees are cleared before your clearance deadline. Current balance: KSh {amount}. Visit the finance office for more details."
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

    // Simulate sending notifications
    targetStudents.forEach(student => {
      const balance = studentFees
        .filter(fee => fee.studentId === student.id && fee.status !== 'paid')
        .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);

      const personalizedMessage = messageTemplate
        .replace('{studentName}', `${student.firstName} ${student.lastName}`)
        .replace('{amount}', balance.toLocaleString())
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
      const balance = studentFees
        .filter(fee => fee.studentId === student.id && fee.status !== 'paid')
        .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);

      const personalizedMessage = messageTemplate
        .replace('{studentName}', `${student.firstName} ${student.lastName}`)
        .replace('{amount}', balance.toLocaleString());

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
            <message-square className="w-5 h-5" />
            Notification System
          </CardTitle>
          <CardDescription>
            Send SMS and email reminders to students about payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleBulkReminder('all')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Remind All Outstanding
            </Button>
            <Button
              onClick={() => handleBulkReminder('overdue')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Remind Overdue
            </Button>
            <Button
              onClick={() => handleBulkReminder('defaulters')}
              className="bg-red-600 hover:bg-red-700"
            >
              Remind Defaulters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getStudentsWithOutstanding().length}
              </div>
              <div className="text-sm text-blue-800">Outstanding Balances</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getOverdueStudents().length}
              </div>
              <div className="text-sm text-orange-800">Overdue Payments</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {students.filter(s => s.financialStatus === 'defaulter').length}
              </div>
              <div className="text-sm text-red-800">Defaulters</div>
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
                  <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                  <SelectItem value="clearance_reminder">Clearance Reminder</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox checked={sendSMS} onCheckedChange={setSendSMS} />
                <Label>Send SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={sendEmail} onCheckedChange={setSendEmail} />
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
                Use {"{studentName}"}, {"{amount}"}, {"{dueDate}"} for personalization
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
            <message-square className="w-4 h-4 mr-2" />
            Send Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
