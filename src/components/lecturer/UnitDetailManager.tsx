import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadCourseMaterialSecurely } from '@/integrations/aws/secureUploadLambda';
import { 
  ArrowLeft, 
  FileText, 
  Video, 
  BookOpen, 
  Users, 
  Calendar, 
  Upload, 
  Download,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  GraduationCap,
  ClipboardList,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Unit } from '@/types/unitManagement';

interface UnitDetailManagerProps {
  unit: Unit;
  onBack: () => void;
}

interface ContentItem {
  id: string;
  type: 'notes' | 'assignment' | 'exam' | 'cat' | 'material';
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  dueDate?: string;
  maxMarks?: number;
  instructions?: string;
  createdAt: string;
  isVisible: boolean;
}

interface OnlineClass {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  meetingLink: string;
  isRecurring: boolean;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export const UnitDetailManager: React.FC<UnitDetailManagerProps> = ({ unit, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateContentDialogOpen, setIsCreateContentDialogOpen] = useState(false);
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock data - would come from context/API
  const [unitContent, setUnitContent] = useState<ContentItem[]>([
    {
      id: '1',
      type: 'notes',
      title: 'Introduction to Programming Concepts',
      description: 'Basic programming concepts and paradigms',
      fileUrl: 'https://example.com/notes1.pdf',
      fileName: 'intro_programming.pdf',
      createdAt: '2025-01-20',
      isVisible: true
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Assignment 1: Hello World Program',
      description: 'Create your first program in Python',
      fileUrl: 'https://example.com/assignment1.pdf',
      fileName: 'assignment1.pdf',
      dueDate: '2025-02-01',
      maxMarks: 100,
      instructions: 'Submit via LMS by midnight',
      createdAt: '2025-01-18',
      isVisible: true
    }
  ]);

  const [onlineClasses, setOnlineClasses] = useState<OnlineClass[]>([
    {
      id: '1',
      title: 'Introduction to Variables and Data Types',
      description: 'Live session on programming fundamentals',
      scheduledDate: '2025-01-25T10:00:00',
      duration: 90,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      isRecurring: false,
      status: 'scheduled'
    }
  ]);

  const [contentForm, setContentForm] = useState({
    type: 'notes' as ContentItem['type'],
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
    instructions: '',
    isVisible: true
  });

  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 90,
    meetingLink: '',
    isRecurring: false
  });

  const enrolledStudents = [
    { id: '1', name: 'John Doe', email: 'john@example.com', admissionNumber: 'CS/001/2024' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', admissionNumber: 'CS/002/2024' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', admissionNumber: 'CS/003/2024' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF, Word document, PowerPoint, text file, or image",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) ready for secure upload`
      });
    }
  };

  const handleCreateContent = async () => {
    if (!contentForm.title || !contentForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      let fileUrl = '';
      let fileName = '';
      
      if (selectedFile) {
        toast({
          title: "Uploading File",
          description: "Uploading file securely to S3..."
        });
        
        // Use secure upload with Firebase Auth + S3 Signed URLs
        fileUrl = await uploadCourseMaterialSecurely(selectedFile, unit.id);
        fileName = selectedFile.name;
        
        toast({
          title: "File Uploaded Successfully",
          description: `${selectedFile.name} uploaded securely to S3`
        });
      }

      const newContent: ContentItem = {
        id: Date.now().toString(),
        type: contentForm.type,
        title: contentForm.title,
        description: contentForm.description,
        fileUrl,
        fileName,
        dueDate: contentForm.dueDate,
        maxMarks: contentForm.maxMarks,
        instructions: contentForm.instructions,
        createdAt: new Date().toISOString().split('T')[0],
        isVisible: contentForm.isVisible
      };

      setUnitContent(prev => [...prev, newContent]);

      toast({
        title: "Content Created",
        description: `${contentForm.type} "${contentForm.title}" has been created`
      });

      // Reset form
      setContentForm({
        type: 'notes',
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100,
        instructions: '',
        isVisible: true
      });
      setSelectedFile(null);
      setIsCreateContentDialogOpen(false);
      setEditingContent(null);
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive"
      });
    }
  };

  const handleCreateOnlineClass = async () => {
    if (!classForm.title || !classForm.scheduledDate || !classForm.meetingLink) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const newClass: OnlineClass = {
        id: Date.now().toString(),
        title: classForm.title,
        description: classForm.description,
        scheduledDate: classForm.scheduledDate,
        duration: classForm.duration,
        meetingLink: classForm.meetingLink,
        isRecurring: classForm.isRecurring,
        status: 'scheduled'
      };

      setOnlineClasses(prev => [...prev, newClass]);

      toast({
        title: "Online Class Scheduled",
        description: `"${classForm.title}" has been scheduled`
      });

      // Reset form
      setClassForm({
        title: '',
        description: '',
        scheduledDate: '',
        duration: 90,
        meetingLink: '',
        isRecurring: false
      });
      setIsCreateClassDialogOpen(false);
    } catch (error) {
      console.error('Error creating online class:', error);
      toast({
        title: "Error",
        description: "Failed to schedule online class",
        variant: "destructive"
      });
    }
  };

  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content);
    setContentForm({
      type: content.type,
      title: content.title,
      description: content.description,
      dueDate: content.dueDate || '',
      maxMarks: content.maxMarks || 100,
      instructions: content.instructions || '',
      isVisible: content.isVisible
    });
    setIsCreateContentDialogOpen(true);
  };

  const handleDeleteContent = (contentId: string) => {
    setUnitContent(prev => prev.filter(content => content.id !== contentId));
    toast({
      title: "Content Deleted",
      description: "Content has been removed"
    });
  };

  const getContentIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'notes': return <FileText className="w-4 h-4" />;
      case 'assignment': return <ClipboardList className="w-4 h-4" />;
      case 'exam': case 'cat': return <GraduationCap className="w-4 h-4" />;
      case 'material': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeBadge = (type: ContentItem['type']) => {
    const colors = {
      notes: 'bg-blue-100 text-blue-800',
      assignment: 'bg-orange-100 text-orange-800',
      exam: 'bg-red-100 text-red-800',
      cat: 'bg-purple-100 text-purple-800',
      material: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[type]}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{unit.code} - {unit.name}</h1>
          <p className="text-muted-foreground">
            {unit.course} • Year {unit.year} Semester {unit.semester} • {unit.credits} Credits
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{enrolledStudents.length}</div>
                <div className="text-sm text-muted-foreground">Enrolled Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{unitContent.filter(c => c.type === 'notes' || c.type === 'material').length}</div>
                <div className="text-sm text-muted-foreground">Notes & Materials</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{unitContent.filter(c => c.type === 'assignment').length}</div>
                <div className="text-sm text-muted-foreground">Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{onlineClasses.length}</div>
                <div className="text-sm text-muted-foreground">Online Classes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="exams">Exams & CATs</TabsTrigger>
          <TabsTrigger value="classes">Online Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Unit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Capacity</Label>
                    <p className="text-sm">{unit.enrolled}/{unit.capacity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Schedule</Label>
                    <p className="text-sm">{unit.schedule || 'Not set'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">WhatsApp Group</Label>
                  {unit.whatsappLink ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(unit.whatsappLink, '_blank')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open WhatsApp Group
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No WhatsApp group set</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Discussion Group</Label>
                  <Badge variant={unit.hasDiscussionGroup ? "default" : "secondary"}>
                    {unit.hasDiscussionGroup ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => setIsCreateContentDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Materials
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('students')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Students ({enrolledStudents.length})
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsCreateClassDialogOpen(true)}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Create Online Class
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Materials & Notes</h3>
            <Button onClick={() => {
              setContentForm(prev => ({ ...prev, type: 'notes' }));
              setIsCreateContentDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unitContent.filter(c => c.type === 'notes' || c.type === 'material').map(content => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getContentIcon(content.type)}
                        {content.title}
                      </CardTitle>
                      <CardDescription>{content.description}</CardDescription>
                    </div>
                    {getContentTypeBadge(content.type)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {content.fileName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {content.fileName}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created: {content.createdAt}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditContent(content)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      {content.fileUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(content.fileUrl, '_blank')}>
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteContent(content.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assignments</h3>
            <Button onClick={() => {
              setContentForm(prev => ({ ...prev, type: 'assignment' }));
              setIsCreateContentDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unitContent.filter(c => c.type === 'assignment').map(assignment => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        {assignment.title}
                      </CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    {getContentTypeBadge(assignment.type)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assignment.dueDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3" />
                        Due: {assignment.dueDate}
                      </div>
                    )}
                    {assignment.maxMarks && (
                      <div className="text-sm">
                        Max Marks: {assignment.maxMarks}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditContent(assignment)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      {assignment.fileUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(assignment.fileUrl, '_blank')}>
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteContent(assignment.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Exams & CATs</h3>
            <div className="flex gap-2">
              <Button onClick={() => {
                setContentForm(prev => ({ ...prev, type: 'cat' }));
                setIsCreateContentDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create CAT
              </Button>
              <Button onClick={() => {
                setContentForm(prev => ({ ...prev, type: 'exam' }));
                setIsCreateContentDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Exam
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unitContent.filter(c => c.type === 'exam' || c.type === 'cat').map(exam => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {exam.title}
                      </CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </div>
                    {getContentTypeBadge(exam.type)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exam.dueDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3" />
                        Date: {exam.dueDate}
                      </div>
                    )}
                    {exam.maxMarks && (
                      <div className="text-sm">
                        Max Marks: {exam.maxMarks}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditContent(exam)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      {exam.fileUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(exam.fileUrl, '_blank')}>
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteContent(exam.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Online Classes</h3>
            <Button onClick={() => setIsCreateClassDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Class
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineClasses.map(onlineClass => (
              <Card key={onlineClass.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        {onlineClass.title}
                      </CardTitle>
                      <CardDescription>{onlineClass.description}</CardDescription>
                    </div>
                    <Badge variant={onlineClass.status === 'live' ? 'destructive' : 'default'}>
                      {onlineClass.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(onlineClass.scheduledDate).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      Duration: {onlineClass.duration} minutes
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(onlineClass.meetingLink, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Join
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Enrolled Students ({enrolledStudents.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledStudents.map(student => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.admissionNumber}</div>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Content Dialog */}
      <Dialog open={isCreateContentDialogOpen} onOpenChange={setIsCreateContentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Create Content'}
            </DialogTitle>
            <DialogDescription>
              {editingContent ? 'Update the content details' : 'Add new content to your unit (Files will be automatically stored in S3)'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select 
                value={contentForm.type} 
                onValueChange={(value: ContentItem['type']) => setContentForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="material">Study Material</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="cat">CAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={contentForm.title}
                onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={contentForm.description}
                onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the content"
                rows={3}
              />
            </div>

            {(contentForm.type === 'assignment' || contentForm.type === 'exam' || contentForm.type === 'cat') && (
              <>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={contentForm.dueDate}
                    onChange={(e) => setContentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Maximum Marks</Label>
                  <Input
                    type="number"
                    value={contentForm.maxMarks}
                    onChange={(e) => setContentForm(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 100 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea
                    value={contentForm.instructions}
                    onChange={(e) => setContentForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Special instructions for students"
                    rows={2}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-3">
              <Label>Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">
                      PDF, Word, PowerPoint, Text files, or Images (Max 50MB)
                    </div>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for secure upload via Firebase Auth + S3
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Files are securely uploaded using Firebase Authentication and AWS S3 signed URLs
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={contentForm.isVisible}
                onChange={(e) => setContentForm(prev => ({ ...prev, isVisible: e.target.checked }))}
              />
              <Label htmlFor="isVisible">Make visible to students</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => {
                setIsCreateContentDialogOpen(false);
                setEditingContent(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateContent}>
                {editingContent ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Online Class Dialog */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Schedule Online Class</DialogTitle>
            <DialogDescription>
              Set up a new online class session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label>Class Title</Label>
              <Input
                value={classForm.title}
                onChange={(e) => setClassForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter class title"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={classForm.description}
                onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what will be covered"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Scheduled Date & Time</Label>
              <Input
                type="datetime-local"
                value={classForm.scheduledDate}
                onChange={(e) => setClassForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={classForm.duration}
                onChange={(e) => setClassForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                value={classForm.meetingLink}
                onChange={(e) => setClassForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={classForm.isRecurring}
                onChange={(e) => setClassForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
              />
              <Label htmlFor="isRecurring">Recurring class</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => setIsCreateClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOnlineClass}>
                Schedule Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
