import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Send, File, Users, GraduationCap, X, Paperclip } from "lucide-react";
import { createNotification } from "@/utils/notificationUtils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded file data
}

interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer';
  course?: string;
  year?: number;
}

export const FileSharing = () => {
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  
  const [recipientType, setRecipientType] = useState<'individual' | 'course' | 'all-students' | 'all-lecturers'>('individual');
  const [selectedRecipients, setSelectedRecipients] = useState<EmailRecipient[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const users = getAllUsers();
  const students = users.filter(u => u.role === 'student' && u.approved);
  const lecturers = users.filter(u => u.role === 'lecturer');
  
  // Get unique courses and years
  const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
  const years = [...new Set(students.map(s => s.year).filter(Boolean))].sort();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    Array.from(files).forEach(file => {
      // Check file size (limit to 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target?.result as string
        };

        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    setIsUploading(false);
    event.target.value = ''; // Reset input
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const addRecipient = (user: any) => {
    const recipient: EmailRecipient = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      course: user.course,
      year: user.year
    };

    if (!selectedRecipients.find(r => r.id === recipient.id)) {
      setSelectedRecipients(prev => [...prev, recipient]);
    }
  };

  const removeRecipient = (recipientId: string) => {
    setSelectedRecipients(prev => prev.filter(r => r.id !== recipientId));
  };

  const getRecipientsForCourse = () => {
    if (!selectedCourse) return [];
    
    let courseStudents = students.filter(s => s.course === selectedCourse);
    if (selectedYear) {
      courseStudents = courseStudents.filter(s => s.year?.toString() === selectedYear);
    }
    
    return courseStudents.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      role: 'student' as const,
      course: s.course,
      year: s.year
    }));
  };

  const getFinalRecipientList = (): EmailRecipient[] => {
    switch (recipientType) {
      case 'individual':
        return selectedRecipients;
      case 'course':
        return getRecipientsForCourse();
      case 'all-students':
        return students.map(s => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email,
          role: 'student' as const,
          course: s.course,
          year: s.year
        }));
      case 'all-lecturers':
        return lecturers.map(l => ({
          id: l.id,
          name: `${l.firstName} ${l.lastName}`,
          email: l.email,
          role: 'lecturer' as const
        }));
      default:
        return [];
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter an email subject.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    const recipients = getFinalRecipientList();
    if (recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Create notifications for each recipient
      const notificationPromises = recipients.map(recipient => 
        createNotification({
          userId: recipient.id,
          title: `Email: ${subject}`,
          message: `You have received an email from HOD${attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : ''}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
          type: 'info',
          actionUrl: '/email',
          data: {
            emailId: Date.now().toString(),
            subject,
            message,
            attachments: attachments.map(a => ({
              name: a.name,
              size: a.size,
              type: a.type
            })),
            fromHOD: true,
            sentAt: new Date().toISOString()
          }
        })
      );

      await Promise.all(notificationPromises);

      // In a real implementation, you would also send actual emails here
      // using a service like SendGrid, AWS SES, or similar

      toast({
        title: "Email Sent Successfully",
        description: `Message sent to ${recipients.length} recipient(s) with ${attachments.length} attachment(s).`,
      });

      // Reset form
      setSubject('');
      setMessage('');
      setAttachments([]);
      setSelectedRecipients([]);
      setRecipientType('individual');
      setSelectedCourse('');
      setSelectedYear('');

    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error Sending Email",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const finalRecipients = getFinalRecipientList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">File Sharing & Email</h2>
          <p className="text-gray-600">Send files and messages to students and lecturers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composition */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>Create and send emails with file attachments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipient Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Recipients</SelectItem>
                    <SelectItem value="course">Course Students</SelectItem>
                    <SelectItem value="all-students">All Students</SelectItem>
                    <SelectItem value="all-lecturers">All Lecturers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === 'individual' && (
                <div className="space-y-2">
                  <Label>Add Recipients</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Students</Label>
                      <Select onValueChange={(userId) => {
                        const user = students.find(s => s.id === userId);
                        if (user) addRecipient(user);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} ({student.course})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Lecturers</Label>
                      <Select onValueChange={(userId) => {
                        const user = lecturers.find(l => l.id === userId);
                        if (user) addRecipient(user);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add lecturer" />
                        </SelectTrigger>
                        <SelectContent>
                          {lecturers.map(lecturer => (
                            <SelectItem key={lecturer.id} value={lecturer.id}>
                              {lecturer.firstName} {lecturer.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {recipientType === 'course' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year (Optional)</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All years</SelectItem>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Selected Recipients Display */}
              {recipientType === 'individual' && selectedRecipients.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Recipients ({selectedRecipients.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipients.map(recipient => (
                      <Badge key={recipient.id} variant="secondary" className="flex items-center gap-1">
                        {recipient.role === 'student' ? <GraduationCap className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {recipient.name}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeRecipient(recipient.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Email Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                  rows={6}
                />
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Attachments ({attachments.length})</Label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button variant="outline" disabled={isUploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Add Files'}
                  </Button>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button 
              onClick={handleSendEmail} 
              disabled={isSending || finalRecipients.length === 0}
              className="w-full"
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email to {finalRecipients.length} recipient(s)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recipients Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Recipients Preview</CardTitle>
            <CardDescription>
              {finalRecipients.length} recipient(s) selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {finalRecipients.length > 0 ? (
                finalRecipients.map(recipient => (
                  <div key={recipient.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                    {recipient.role === 'student' ? 
                      <GraduationCap className="w-4 h-4 text-blue-500" /> : 
                      <Users className="w-4 h-4 text-green-500" />
                    }
                    <div className="flex-1">
                      <p className="font-medium">{recipient.name}</p>
                      <p className="text-xs text-gray-500">{recipient.email}</p>
                      {recipient.course && (
                        <p className="text-xs text-gray-500">
                          {recipient.course} {recipient.year && `Year ${recipient.year}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recipients selected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
