import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseContent } from '@/contexts/CourseContentContext';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  Lock,
  Unlock,
  Save,
  School,
  BookOpen
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { uploadCourseMaterialViaAPI } from '@/integrations/aws/apiUpload';

interface SemesterProgramme {
  id: string;
  title: string;
  description: string;
  academicYearName: string;
  semesterNumber: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'active' | 'completed';
  weeklyPlans: ProgrammeWeek[];
}

interface ProgrammeWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  activities: WeekActivity[];
}

interface WeekActivity {
  id: string;
  type: 'material' | 'assignment' | 'exam' | 'cat' | 'event';
  title: string;
  description: string;
  scheduledDate: Date;
  scheduledTime?: string;
  applicableLevels: string[];
  unitCodes?: string[];
  instructions?: string;
  maxMarks?: number;
  isPublished: boolean;
  
  // Lecturer upload fields
  fileUrl?: string;
  fileName?: string;
  isUploaded: boolean;
  uploadedAt?: Date;
  uploadedBy?: string;
  accessibleFrom?: Date; // When students can access this material
}

interface LecturerUnit {
  id: string;
  code: string;
  name: string;
  level: string;
}

interface LecturerSemesterViewProps {
  lecturerUnits: LecturerUnit[];
}

export const LecturerSemesterView: React.FC<LecturerSemesterViewProps> = ({ lecturerUnits }) => {
  const { user } = useAuth();
  const { addContent } = useCourseContent();
  const { toast } = useToast();
  
  const [programmes, setProgrammes] = useState<SemesterProgramme[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState<SemesterProgramme | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<WeekActivity | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    unitId: '',
    unitCode: '',
    accessDate: new Date(),
    accessTime: '08:00',
    additionalNotes: ''
  });

  // Load programmes from backend context
  useEffect(() => {
    // Programmes would be loaded from backend context instead
    // const publishedProgrammes = backendProgrammes.filter((p: SemesterProgramme) => 
    //   p.status === 'published' || p.status === 'active'
    // );
    // setProgrammes(publishedProgrammes);
    
    if (publishedProgrammes.length > 0) {
      setSelectedProgramme(publishedProgrammes[0]);
    }
  }, []);

  // Get activities that the lecturer can upload materials for
  const getMyActivities = () => {
    if (!selectedProgramme) return [];
    
    const allActivities: (WeekActivity & { weekNumber: number })[] = [];
    selectedProgramme.weeklyPlans.forEach(week => {
      week.activities.forEach(activity => {
        if (activity.type === 'material') {
          // Check if this activity applies to any of the lecturer's units
          const hasMyUnit = activity.unitCodes?.some(code => 
            lecturerUnits.some(unit => unit.code === code)
          ) || activity.unitCodes?.length === 0; // If no specific units, assume it applies to all
          
          if (hasMyUnit) {
            allActivities.push({ ...activity, weekNumber: week.weekNumber });
          }
        }
      });
    });
    
    return allActivities;
  };

  const filteredActivities = getMyActivities().filter(activity => {
    if (filterUnit !== 'all') {
      const hasUnit = activity.unitCodes?.includes(filterUnit) || activity.unitCodes?.length === 0;
      if (!hasUnit) return false;
    }
    
    if (filterWeek !== 'all') {
      if (activity.weekNumber !== parseInt(filterWeek)) return false;
    }
    
    return true;
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit for course materials)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) ready for upload`
      });
    }
  };

  // Upload material for activity
  const uploadMaterial = async () => {
    if (!selectedActivity || !selectedFile || !uploadForm.unitId) {
      toast({
        title: "Missing Information",
        description: "Please select a file and unit before uploading",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload to S3 via API
      const fileUrl = await uploadCourseMaterialViaAPI(
        selectedFile, 
        uploadForm.unitId, 
        uploadForm.unitCode
      );

      // Calculate access date/time
      const accessDateTime = new Date(uploadForm.accessDate);
      const [hours, minutes] = uploadForm.accessTime.split(':').map(Number);
      accessDateTime.setHours(hours, minutes, 0, 0);

      // Update the activity with upload information
      const updatedActivity: WeekActivity = {
        ...selectedActivity,
        fileUrl,
        fileName: selectedFile.name,
        isUploaded: true,
        uploadedAt: new Date(),
        uploadedBy: user?.id,
        accessibleFrom: accessDateTime
      };

      // Update programmes in state and localStorage
      const updatedProgramme = {
        ...selectedProgramme!,
        weeklyPlans: selectedProgramme!.weeklyPlans.map(week => ({
          ...week,
          activities: week.activities.map(activity => 
            activity.id === selectedActivity.id ? updatedActivity : activity
          )
        }))
      };

      setProgrammes(prev => prev.map(p => 
        p.id === selectedProgramme!.id ? updatedProgramme : p
      ));
      setSelectedProgramme(updatedProgramme);

      // Programme updated in state, backend sync would happen here

      // Also add to course content context for student access
      addContent({
        id: `material-${Date.now()}`,
        title: selectedActivity.title,
        description: selectedActivity.description,
        type: 'material',
        url: fileUrl,
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        unitCode: uploadForm.unitCode,
        unitId: uploadForm.unitId,
      });

      toast({
        title: "Material Uploaded Successfully",
        description: `${selectedFile.name} has been uploaded and will be accessible to students from ${format(accessDateTime, 'PPP p')}`,
      });

      // Reset form
      setSelectedFile(null);
      setSelectedActivity(null);
      setUploadForm({
        unitId: '',
        unitCode: '',
        accessDate: new Date(),
        accessTime: '08:00',
        additionalNotes: ''
      });
      setUploadDialogOpen(false);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload the material. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Check if material is accessible to students
  const isMaterialAccessible = (activity: WeekActivity) => {
    if (!activity.accessibleFrom) return false;
    return isAfter(new Date(), activity.accessibleFrom);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            My Semester Programme Materials
          </h2>
          <p className="text-gray-600">
            Upload and manage materials for your units according to the semester programme
          </p>
        </div>
      </div>

      {/* Programme Selector */}
      {programmes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Semester Programme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programmes.map((programme) => (
                <Card 
                  key={programme.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProgramme?.id === programme.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedProgramme(programme)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{programme.title}</CardTitle>
                    <CardDescription>{programme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Academic Year:</span>
                        <span className="font-medium">{programme.academicYearName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semester:</span>
                        <span className="font-medium">{programme.semesterNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">
                          {format(programme.startDate, 'MMM d')} - {format(programme.endDate, 'MMM d')}
                        </span>
                      </div>
                      <Badge 
                        variant={programme.status === 'active' ? 'default' : 'secondary'}
                        className="w-full justify-center"
                      >
                        {programme.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {selectedProgramme && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Label>Filters:</Label>
          
          <div className="flex items-center gap-2">
            <Label>Unit:</Label>
            <Select value={filterUnit} onValueChange={setFilterUnit}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {lecturerUnits.map(unit => (
                  <SelectItem key={unit.id} value={unit.code}>
                    {unit.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Week:</Label>
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {selectedProgramme.weeklyPlans.map(week => (
                  <SelectItem key={week.weekNumber} value={week.weekNumber.toString()}>
                    Week {week.weekNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Materials Grid */}
      {selectedProgramme && (
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Materials Found</h3>
                <p className="text-gray-500">
                  No materials are scheduled for your selected filters in this semester programme.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{activity.title}</h3>
                          <Badge variant="outline">
                            Week {activity.weekNumber}
                          </Badge>
                          {activity.isUploaded ? (
                            <Badge variant="secondary" className="text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <Upload className="w-3 h-3 mr-1" />
                              Pending Upload
                            </Badge>
                          )}
                          
                          {activity.isUploaded && activity.accessibleFrom && (
                            <Badge 
                              variant="secondary" 
                              className={isMaterialAccessible(activity) ? 'text-green-600' : 'text-red-600'}
                            >
                              {isMaterialAccessible(activity) ? (
                                <>
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Accessible
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Locked
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{activity.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Scheduled: {format(activity.scheduledDate, 'MMM d, yyyy')}
                          </span>
                          {activity.scheduledTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.scheduledTime}
                            </span>
                          )}
                        </div>
                        
                        {activity.isUploaded && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{activity.fileName}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                              <span>Uploaded: {format(activity.uploadedAt!, 'MMM d, yyyy p')}</span>
                              {activity.accessibleFrom && (
                                <span>
                                  Accessible from: {format(activity.accessibleFrom, 'MMM d, yyyy p')}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {activity.unitCodes && activity.unitCodes.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-gray-500">Units:</span>
                            {activity.unitCodes.map(code => (
                              <Badge key={code} variant="secondary" className="text-xs">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {activity.instructions && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <span className="font-medium">Instructions: </span>
                            {activity.instructions}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {activity.isUploaded ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedActivity(activity);
                                setUploadForm(prev => ({
                                  ...prev,
                                  unitId: lecturerUnits[0]?.id || '',
                                  unitCode: lecturerUnits[0]?.code || ''
                                }));
                                setUploadDialogOpen(true);
                              }}
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Re-upload
                            </Button>
                          </div>
                        ) : (
                          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedActivity(activity);
                                  setUploadForm(prev => ({
                                    ...prev,
                                    unitId: lecturerUnits[0]?.id || '',
                                    unitCode: lecturerUnits[0]?.code || '',
                                    accessDate: activity.scheduledDate,
                                    accessTime: activity.scheduledTime || '08:00'
                                  }));
                                }}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Material
                              </Button>
                            </DialogTrigger>
                            
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Upload Material: {selectedActivity?.title}</DialogTitle>
                                <DialogDescription>
                                  Upload course material that will be accessible to students according to the schedule
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Select File</Label>
                                  <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                                    onChange={handleFileSelect}
                                  />
                                  {selectedFile && (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium">{selectedFile.name}</span>
                                      <span className="text-xs text-gray-500">
                                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Unit</Label>
                                  <Select 
                                    value={uploadForm.unitId} 
                                    onValueChange={(value) => {
                                      const unit = lecturerUnits.find(u => u.id === value);
                                      setUploadForm(prev => ({ 
                                        ...prev, 
                                        unitId: value,
                                        unitCode: unit?.code || ''
                                      }));
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {lecturerUnits.map(unit => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                          {unit.code} - {unit.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Access Date</Label>
                                    <Input
                                      type="date"
                                      value={format(uploadForm.accessDate, 'yyyy-MM-dd')}
                                      onChange={(e) => setUploadForm(prev => ({ 
                                        ...prev, 
                                        accessDate: new Date(e.target.value) 
                                      }))}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Access Time</Label>
                                    <Input
                                      type="time"
                                      value={uploadForm.accessTime}
                                      onChange={(e) => setUploadForm(prev => ({ 
                                        ...prev, 
                                        accessTime: e.target.value 
                                      }))}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Additional Notes (Optional)</Label>
                                  <Textarea
                                    value={uploadForm.additionalNotes}
                                    onChange={(e) => setUploadForm(prev => ({ 
                                      ...prev, 
                                      additionalNotes: e.target.value 
                                    }))}
                                    placeholder="Any additional notes for students"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center gap-2 text-blue-700">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-medium">Access Schedule</span>
                                  </div>
                                  <p className="text-sm text-blue-600 mt-1">
                                    This material will be accessible to students from{' '}
                                    <span className="font-medium">
                                      {format(new Date(uploadForm.accessDate), 'PPP')} at {uploadForm.accessTime}
                                    </span>
                                  </p>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={uploadMaterial}
                                    disabled={isUploading || !selectedFile || !uploadForm.unitId}
                                  >
                                    {isUploading ? (
                                      <>
                                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Upload Material
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
