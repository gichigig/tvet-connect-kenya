import { useState } from "react";
import { useUsers } from "@/contexts/users/UsersContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Mail, MessageSquare, Users, User, Upload, Download, FileText, Phone, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResultsNotification = () => {
  const { examResults } = useUsers();
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [sendToGuardians, setSendToGuardians] = useState(true);
  const [sendMethod, setSendMethod] = useState<'email' | 'sms' | 'both'>('both');
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("send");
  const [editingContact, setEditingContact] = useState<any>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const users = getAllUsers();
  const students = users.filter(u => u.role === 'student' && u.approved);

  // Group results by student to analyze pass/fail status
  const studentResults = students.map(student => {
    const studentExamResults = examResults.filter(result => result.studentId === student.id);
    const totalUnits = studentExamResults.length;
    const failedUnits = studentExamResults.filter(result => result.status === 'fail').length;
    const passedUnits = studentExamResults.filter(result => result.status === 'pass').length;
    const overallStatus = failedUnits === 0 && passedUnits > 0 ? 'pass' : 'fail';
    
    return {
      ...student,
      examResults: studentExamResults,
      totalUnits,
      passedUnits,
      failedUnits,
      overallStatus,
      hasResults: totalUnits > 0
    };
  }).filter(student => student.hasResults);

  const filteredStudentResults = studentResults.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults(prev => [...prev, studentId]);
    } else {
      setSelectedResults(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(filteredStudentResults.map(student => student.id));
    } else {
      setSelectedResults([]);
    }
  };

  const generateResultMessage = (student: any) => {
    const { overallStatus, failedUnits, totalUnits } = student;
    
    if (overallStatus === 'pass') {
      return `Congratulations! You have passed all your units this semester.`;
    } else {
      return `Results notification: You have failed ${failedUnits} out of ${totalUnits} units. Please contact your academic advisor for guidance on retakes.`;
    }
  };

  const handleSendNotifications = async () => {
    if (selectedResults.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select at least one student to send notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedStudents = filteredStudentResults.filter(student => 
        selectedResults.includes(student.id)
      );

      // Send notifications (this would integrate with your SMS/Email service)
      for (const student of selectedStudents) {
        const message = generateResultMessage(student);
        
        // Here you would implement actual SMS/Email sending
        // For now, we'll simulate the process
        await simulateNotificationSending(student, message, sendMethod, sendToGuardians);
      }

      // Upload results to S3 (simulated)
      await uploadResultsToS3(selectedStudents);
      
      toast({
        title: "Notifications Sent Successfully",
        description: `Results sent to ${selectedResults.length} student${selectedResults.length > 1 ? 's' : ''}${sendToGuardians ? ' and their guardians' : ''} via ${sendMethod}.`,
      });
      
      setSelectedResults([]);
    } catch (error) {
      toast({
        title: "Failed to Send Notifications",
        description: "There was an error sending the notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNotificationSending = async (student: any, message: string, method: string, includeGuardians: boolean) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Sending ${method} to ${student.firstName} ${student.lastName}:`, message);
    if (includeGuardians && (student as any).guardianPhone) {
      console.log(`Also sending to guardian: ${(student as any).guardianPhone}`);
    }
  };

  const uploadResultsToS3 = async (students: any[]) => {
    // Simulate S3 upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Results uploaded to S3 bucket');
  };

  const handleEditContact = (student: any) => {
    setEditingContact({ ...student });
    setIsContactDialogOpen(true);
  };

  const handleSaveContact = () => {
    // Here you would update the student's contact information
    toast({
      title: "Contact Updated",
      description: "Student contact information has been updated successfully.",
    });
    setIsContactDialogOpen(false);
    setEditingContact(null);
  };

  const getStatusBadge = (status: string) => {
    return status === 'pass' 
      ? <Badge className="bg-green-100 text-green-800">Pass</Badge>
      : <Badge className="bg-red-100 text-red-800">Fail</Badge>;
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    
    return <Badge className={gradeColors[grade] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results Notification Center</h2>
          <p className="text-gray-600">Send student results via email, SMS, or make them available in student dashboard</p>
        </div>
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-blue-600" />
          <Mail className="w-5 h-5 text-green-600" />
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium">Multi-Channel</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Results</TabsTrigger>
          <TabsTrigger value="contacts">Manage Contacts</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{studentResults.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {studentResults.filter(s => s.overallStatus === 'pass').length}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Pass</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {studentResults.filter(s => s.overallStatus === 'fail').length}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Fail</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Selected</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedResults.length}</p>
                  </div>
                  <User className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and where to send the results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="send-method">Send Method</Label>
                  <Select value={sendMethod} onValueChange={(value: 'email' | 'sms' | 'both') => setSendMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="both">Email & SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="send-to-guardians"
                    checked={sendToGuardians}
                    onCheckedChange={setSendToGuardians}
                  />
                  <Label htmlFor="send-to-guardians">Include Guardians</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendNotifications}
                    disabled={selectedResults.length === 0 || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? "Sending..." : `Send to ${selectedResults.length} Students`}
                  </Button>
                  
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to S3
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by student name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Results Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Student Results Summary</CardTitle>
                  <CardDescription>
                    Select students to send notifications about their results
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedResults.length === filteredStudentResults.length && filteredStudentResults.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Results Summary</TableHead>
                    <TableHead>Overall Status</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudentResults.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedResults.includes(student.id)}
                          onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-500">{student.admissionNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Total: {student.totalUnits} units</p>
                          <p className="text-green-600">Passed: {student.passedUnits}</p>
                          {student.failedUnits > 0 && (
                            <p className="text-red-600">Failed: {student.failedUnits}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={student.overallStatus === 'pass' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"}>
                          {student.overallStatus.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{student.email || 'No email'}</p>
                          <p>{student.phone || 'No phone'}</p>
                          {(student as any).guardianPhone && (
                            <p className="text-gray-500">Guardian: {(student as any).guardianPhone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs max-w-xs truncate" title={generateResultMessage(student)}>
                          {generateResultMessage(student)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContact(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredStudentResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No student results found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>Manage student and guardian contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Contact management interface will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View history of sent notifications and S3 uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Notification history will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Edit Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update student and guardian contact details
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Email</Label>
                  <Input
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Student Phone</Label>
                  <Input
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254712345678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  <Input
                    value={(editingContact as any).guardianName || ''}
                    onChange={(e) => setEditingContact(prev => ({ ...prev, guardianName: e.target.value }))}
                    placeholder="Guardian full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guardian Phone</Label>
                  <Input
                    value={(editingContact as any).guardianPhone || ''}
                    onChange={(e) => setEditingContact(prev => ({ ...prev, guardianPhone: e.target.value }))}
                    placeholder="+254712345678"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Guardian Email</Label>
                <Input
                  value={(editingContact as any).guardianEmail || ''}
                  onChange={(e) => setEditingContact(prev => ({ ...prev, guardianEmail: e.target.value }))}
                  placeholder="guardian@example.com"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ResultsNotification };
