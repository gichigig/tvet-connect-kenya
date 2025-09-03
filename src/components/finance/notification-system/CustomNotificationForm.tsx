
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { messageTemplates, MessageTemplateKey } from "./MessageTemplates";

interface CustomNotificationFormProps {
  getStudentFinancialInfo: (studentId: string) => {
    totalOwed: number;
    totalFees: number;
    totalPaid: number;
    percentagePaid: number;
    percentageOwing: number;
  };
}

export const CustomNotificationForm = ({ getStudentFinancialInfo }: CustomNotificationFormProps) => {
  const { toast } = useToast();
  const { studentFees, getAllUsers } = useAuth();
  const [messageType, setMessageType] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [percentageThreshold, setPercentageThreshold] = useState("");

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

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
    let messageTemplate = messageTemplates[messageType as MessageTemplateKey] || customMessage;

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

    setMessageType("");
    setCustomMessage("");
    setSelectedStudents([]);
    setPercentageThreshold("");
  };

  return (
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
              {messageTemplates[messageType as MessageTemplateKey]}
            </div>
          </div>
        )}

        <Button onClick={handleSendNotifications} className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Notifications
        </Button>
      </CardContent>
    </Card>
  );
};
