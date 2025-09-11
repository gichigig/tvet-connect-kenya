import { useState, useRef, useEffect } from "react";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Download, Send, Plus, Trash2, Upload, FileText, Mail, Users, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// TODO: Replace with the correct import if available, or implement createNotification if missing.
import { CreateNotificationData, createNotification } from "@/utils/notificationUtils";
// If you have a default export or a differently named export, adjust accordingly:
// import createNotification from "@/utils/notificationUtils";
// or
// import notificationUtils from "@/utils/notificationUtils";
// and use notificationUtils.createNotification(...)
import { uploadStudentDocument } from "@/integrations/aws/fileUpload";

interface UploadedTimetable {
  id: string;
  name: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  course: string;
  year: number;
  semester: number;
  uploadedDate: string;
  uploadedBy: string;
  isActive: boolean;
  distributionStatus: {
    emailSent: boolean;
    notificationSent: boolean;
    studentsNotified: number;
    lecturersNotified: number;
  };
}

const TimetableManagement = () => {
  const { units } = useUnits();
  const { getAllUsers, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedTimetables, setUploadedTimetables] = useState<UploadedTimetable[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedUploadedTimetable, setSelectedUploadedTimetable] = useState<UploadedTimetable | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    course: '',
    year: 1,
    semester: 1,
    file: null as File | null
  });
  const [distributionSettings, setDistributionSettings] = useState({
    sendEmail: true,
    sendNotification: true,
    targetStudents: true,
    targetLecturers: true,
    specificCourse: '',
    specificYear: 0,
    specificSemester: 0
  });

  // If you need only active units, filter them here if there's an 'active' property
  const activeUnits = units ? units.filter((unit: any) => unit.active) : [];
  const [users, setUsers] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  // Fetch users asynchronously
  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      const lecturerList = allUsers.filter((u: any) => u.role === 'lecturer');
      const studentList = allUsers.filter((u: any) => u.role === 'student' && u.approved);
      setLecturers(lecturerList);
      setStudents(studentList);
      setCourses([...new Set(studentList.map((s: any) => s.course).filter(Boolean))]);
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type (PDF, DOC, DOCX, XLS, XLSX)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Word document, Excel file, or image.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUploadTimetable = async () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to S3
      const uploadResult = await uploadStudentDocument(uploadForm.file, `timetable_${Date.now()}`, 'timetable');
      const fileUrl = uploadResult.url; // Assuming UploadResult has a 'url' property; adjust if needed
      
      const uploadedTimetable: UploadedTimetable = {
        id: Date.now().toString(),
        name: uploadForm.name,
        description: uploadForm.description,
        fileName: uploadForm.file.name,
        fileUrl,
        fileSize: uploadForm.file.size,
        course: uploadForm.course,
        year: uploadForm.year,
        semester: uploadForm.semester,
        uploadedDate: new Date().toISOString(),
        uploadedBy: user?.firstName + ' ' + user?.lastName || 'HOD',
        isActive: true,
        distributionStatus: {
          emailSent: false,
          notificationSent: false,
          studentsNotified: 0,
          lecturersNotified: 0
        }
      };

      setUploadedTimetables(prev => [...prev, uploadedTimetable]);
      setUploadForm({ name: '', description: '', course: '', year: 1, semester: 1, file: null });
      setIsUploadDialogOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Timetable Uploaded",
        description: `${uploadedTimetable.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading timetable:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDistributeTimetable = async () => {
    if (!selectedUploadedTimetable) return;

    setIsDistributing(true);
    try {
      let targetStudents: any[] = [];
      let targetLecturers: any[] = [];

      // Filter target audience based on settings
      if (distributionSettings.targetStudents) {
        targetStudents = students.filter(student => {
          if (distributionSettings.specificCourse && student.course !== distributionSettings.specificCourse) return false;
          if (distributionSettings.specificYear && student.year !== distributionSettings.specificYear) return false;
          if (distributionSettings.specificSemester && parseInt(student.semester) !== distributionSettings.specificSemester) return false;
          return true;
        });
      }

      if (distributionSettings.targetLecturers) {
        targetLecturers = lecturers.filter(lecturer => {
          if (distributionSettings.specificCourse) {
            const lecturerUnits = activeUnits.filter(unit => unit.lecturerId === lecturer.id);
            return lecturerUnits.some(unit => unit.course === distributionSettings.specificCourse);
          }
          return true;
        });
      }

      // Send notifications
      if (distributionSettings.sendNotification) {
        // Collect all target user IDs
        const targetUserIds = [...targetStudents.map(s => s.id), ...targetLecturers.map(l => l.id)];
        
        // Send single notification to all targets
        if (targetUserIds.length > 0) {
          await createNotification({
            title: "New Timetable Available",
            message: `A new timetable "${selectedUploadedTimetable.name}" has been uploaded for ${selectedUploadedTimetable.course}.`,
            type: 'info',
            recipient_type: 'all',
            recipient_ids: targetUserIds,
            sender_id: user?.id || '',
            sender_name: user?.firstName + ' ' + user?.lastName || 'System',
            priority: 'normal',
            metadata: { 
              timetableId: selectedUploadedTimetable.id,
              fileName: selectedUploadedTimetable.fileName,
              downloadUrl: selectedUploadedTimetable.fileUrl
            }
          });
        }
      }

      // Update distribution status
      const updatedTimetable = {
        ...selectedUploadedTimetable,
        isDistributed: true,
        distributedAt: new Date().toISOString(),
        distributedTo: {
          students: targetStudents.length,
          lecturers: targetLecturers.length
        }
      };

      setUploadedTimetables(prev => 
        prev.map(t => t.id === selectedUploadedTimetable.id ? updatedTimetable : t)
      );

      setIsDistributeDialogOpen(false);
      setSelectedUploadedTimetable(null);

      toast({
        title: "Timetable Distributed",
        description: `Timetable sent to ${targetStudents.length} students and ${targetLecturers.length} lecturers.`,
      });
    } catch (error) {
      console.error('Error distributing timetable:', error);
      toast({
        title: "Distribution Failed",
        description: "Failed to distribute timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDistributing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timetable Management</h2>
          <p className="text-gray-600">Upload and distribute course timetables to students and lecturers</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Timetable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Timetable Document</DialogTitle>
              <DialogDescription>
                Upload a timetable document (PDF, Word, Excel, or Image)
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Timetable Name</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science Y1 S1 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the timetable"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select 
                    value={uploadForm.course} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, course: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={String(course)} value={String(course)}>{String(course)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select 
                    value={uploadForm.year.toString()} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, year: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select 
                    value={uploadForm.semester.toString()} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, semester: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Timetable File</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                {uploadForm.file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getFileIcon(uploadForm.file.name)}
                    <span>{uploadForm.file.name}</span>
                    <span>({formatFileSize(uploadForm.file.size)})</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadTimetable} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Uploaded Timetables</TabsTrigger>
          <TabsTrigger value="distribute">Distribution Center</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Timetables</CardTitle>
              <CardDescription>
                Manage uploaded timetable documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedTimetables.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timetable</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Distribution Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedTimetables.map(timetable => (
                      <TableRow key={timetable.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{timetable.name}</p>
                            {timetable.description && (
                              <p className="text-sm text-gray-500">{timetable.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{timetable.course}</p>
                            <p className="text-gray-500">Year {timetable.year}, Semester {timetable.semester}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(timetable.fileName)}
                            <div className="text-sm">
                              <p>{timetable.fileName}</p>
                              <p className="text-gray-500">{formatFileSize(timetable.fileSize)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(timetable.uploadedDate).toLocaleDateString()}</p>
                            <p className="text-gray-500">by {timetable.uploadedBy}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {timetable.distributionStatus.notificationSent && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Distributed
                              </Badge>
                            )}
                            {timetable.distributionStatus.studentsNotified > 0 && (
                              <p className="text-xs text-gray-600">
                                {timetable.distributionStatus.studentsNotified} students, {timetable.distributionStatus.lecturersNotified} lecturers
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(timetable.fileUrl, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUploadedTimetable(timetable);
                                setDistributionSettings(prev => ({
                                  ...prev,
                                  specificCourse: timetable.course,
                                  specificYear: timetable.year,
                                  specificSemester: timetable.semester
                                }));
                                setIsDistributeDialogOpen(true);
                              }}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Distribute
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No timetables uploaded yet.</p>
                  <p className="text-sm">Upload your first timetable document to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribute" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Center</CardTitle>
              <CardDescription>
                Distribute timetables to students and lecturers via notifications and email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Lecturers</p>
                        <p className="text-2xl font-bold text-green-600">{lecturers.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Uploaded Timetables</p>
                        <p className="text-2xl font-bold text-purple-600">{uploadedTimetables.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {uploadedTimetables.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No timetables available for distribution.</p>
                  <p className="text-sm">Upload timetables first to distribute them.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Distribution Dialog */}
      <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Distribute Timetable</DialogTitle>
            <DialogDescription>
              Configure how to distribute the timetable to students and lecturers
            </DialogDescription>
          </DialogHeader>
          {selectedUploadedTimetable && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Timetable to Distribute</Label>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">{selectedUploadedTimetable.name}</p>
                  <p className="text-sm text-gray-500">{selectedUploadedTimetable.course} - Year {selectedUploadedTimetable.year}, Semester {selectedUploadedTimetable.semester}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Distribution Methods</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-notification"
                        checked={distributionSettings.sendNotification}
                        onCheckedChange={(checked) => 
                          setDistributionSettings(prev => ({ ...prev, sendNotification: checked as boolean }))
                        }
                      />
                      <Label htmlFor="send-notification">Send In-App Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-email"
                        checked={distributionSettings.sendEmail}
                        onCheckedChange={(checked) => 
                          setDistributionSettings(prev => ({ ...prev, sendEmail: checked as boolean }))
                        }
                      />
                      <Label htmlFor="send-email">Send Email Notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="target-students"
                        checked={distributionSettings.targetStudents}
                        onCheckedChange={(checked) => 
                          setDistributionSettings(prev => ({ ...prev, targetStudents: checked as boolean }))
                        }
                      />
                      <Label htmlFor="target-students">Students</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="target-lecturers"
                        checked={distributionSettings.targetLecturers}
                        onCheckedChange={(checked) => 
                          setDistributionSettings(prev => ({ ...prev, targetLecturers: checked as boolean }))
                        }
                      />
                      <Label htmlFor="target-lecturers">Lecturers</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filter Options</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Course</Label>
                      <Select 
                        value={distributionSettings.specificCourse} 
                        onValueChange={(value) => setDistributionSettings(prev => ({ ...prev, specificCourse: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Courses</SelectItem>
                          {courses.map(course => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Year</Label>
                      <Select 
                        value={distributionSettings.specificYear.toString()} 
                        onValueChange={(value) => setDistributionSettings(prev => ({ ...prev, specificYear: parseInt(value) || 0 }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">All Years</SelectItem>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                          <SelectItem value="3">Year 3</SelectItem>
                          <SelectItem value="4">Year 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Semester</Label>
                      <Select 
                        value={distributionSettings.specificSemester.toString()} 
                        onValueChange={(value) => setDistributionSettings(prev => ({ ...prev, specificSemester: parseInt(value) || 0 }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">All Semesters</SelectItem>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDistributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDistributeTimetable} disabled={isDistributing}>
              {isDistributing ? "Distributing..." : "Distribute"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { TimetableManagement };
