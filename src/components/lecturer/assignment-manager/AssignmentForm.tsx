
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";
import { fileStorageService } from "@/services/FileStorageService";
import { Loader2, Upload } from "lucide-react";

interface AssignmentFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const AssignmentForm = ({ onClose, onSubmit }: AssignmentFormProps) => {
  const { toast } = useToast();
  const { user, createdUnits } = useAuth();
  const { getSemesterPlan, addAssignmentToSemesterPlan, hasSemesterPlan } = useSemesterPlan();

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  const [formData, setFormData] = useState({
    title: '',
    unitCode: '',
    description: '',
    dueDate: '',
    assignmentType: 'practical',
    assignmentMode: 'document' as 'essay' | 'document', // New field for assignment mode
    acceptedFormats: [] as string[],
    attachments: null as File[] | null,
    weekNumber: undefined as number | undefined // Add week selection
  });

  const [semesterWeeks, setSemesterWeeks] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load semester plan when unit is selected
  const handleUnitChange = async (unitCode: string) => {
    setFormData({ ...formData, unitCode, weekNumber: undefined });
    
    const selectedUnit = assignedUnits.find(unit => unit.code === unitCode);
    if (selectedUnit) {
      try {
        // Check if semester plan exists in memory first
        if (hasSemesterPlan(selectedUnit.id)) {
          const plan = await getSemesterPlan(selectedUnit.id);
          setSemesterWeeks(plan.weekPlans.map(week => week.weekNumber));
          return;
        }
        
        // If not in memory, try to fetch from API
        const plan = await getSemesterPlan(selectedUnit.id);
        if (plan.weekPlans.length > 0) {
          setSemesterWeeks(plan.weekPlans.map(week => week.weekNumber));
        } else {
          setSemesterWeeks([]);
          toast({
            title: "No Semester Plan",
            description: "Please create a semester plan for this unit first.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setSemesterWeeks([]);
        toast({
          title: "No Semester Plan",
          description: "Please create a semester plan for this unit first.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedUnit = assignedUnits.find(unit => unit.code === formData.unitCode);
    if (!selectedUnit) {
      toast({
        title: "Error",
        description: "Please select a valid unit.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.weekNumber) {
      toast({
        title: "Error",
        description: "Please select a week for this assignment.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate assignment ID early for file uploads
      const assignmentId = `assignment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Upload attachment files to S3 if any
      const uploadedDocuments = [];
      if (formData.attachments && formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          try {
            const uploadedDoc = await fileStorageService.uploadDocument(
              file,
              {
                title: `${formData.title} - ${file.name}`,
                description: `Assignment question file for ${formData.title}`,
                isVisible: true,
                uploadedBy: user?.email || 'lecturer',
                category: 'assignment',
                entityId: assignmentId,
                entityType: 'semester-plan-assignment'
              }
            );
            uploadedDocuments.push({
              id: uploadedDoc.id,
              name: uploadedDoc.fileName,
              url: uploadedDoc.downloadUrl,
              size: uploadedDoc.fileSize,
              type: uploadedDoc.fileType,
              uploadedAt: uploadedDoc.uploadedAt
            });
          } catch (uploadError) {
            console.error('Failed to upload attachment:', file.name, uploadError);
            toast({
              title: "Upload Warning",
              description: `Failed to upload ${file.name}. Assignment will be created without this file.`,
              variant: "destructive",
            });
          }
        }
      }

      // Create assignment data for semester plan
      const semesterAssignment = {
        id: assignmentId,
        title: formData.title,
        description: formData.description,
        type: formData.assignmentMode as 'essay' | 'document', // Use the selected assignment mode
        studentType: (formData.assignmentMode === 'essay' ? 'essay' : 'document') as 'essay' | 'document',
        assignDate: new Date(),
        dueDate: new Date(formData.dueDate),
        maxMarks: 100, // Default value, can be made configurable
        instructions: formData.description,
        isUploaded: uploadedDocuments.length > 0,
        requiresAICheck: formData.assignmentMode === 'essay', // Enable AI check for essays
        documents: uploadedDocuments
      };

      // Add to semester plan
      await addAssignmentToSemesterPlan(selectedUnit.id, formData.weekNumber, semesterAssignment);

      setFormData({
        title: '',
        unitCode: '',
        description: '',
        dueDate: '',
        assignmentType: 'practical',
        assignmentMode: 'document',
        acceptedFormats: [],
        attachments: null,
        weekNumber: undefined
      });
      setSemesterWeeks([]);
      onClose();
      onSubmit();

      toast({
        title: "Assignment Created Successfully",
        description: `${formData.title} has been created and added to Week ${formData.weekNumber}${uploadedDocuments.length > 0 ? ` with ${uploadedDocuments.length} file(s) uploaded to S3.` : '.'}`,
      });
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, attachments: Array.from(e.target.files) });
    }
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, acceptedFormats: [...formData.acceptedFormats, format] });
    } else {
      setFormData({ 
        ...formData, 
        acceptedFormats: formData.acceptedFormats.filter(f => f !== format) 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
        <CardDescription>Fill in the details to create a new assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assignment title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCode">Unit</Label>
              <Select value={formData.unitCode} onValueChange={handleUnitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {assignedUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.code}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Week Selection - Only show when unit is selected and has semester plan */}
          {formData.unitCode && semesterWeeks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="weekNumber">Semester Week</Label>
              <Select 
                value={formData.weekNumber?.toString()} 
                onValueChange={(value) => setFormData({ ...formData, weekNumber: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select week for this assignment" />
                </SelectTrigger>
                <SelectContent>
                  {semesterWeeks.map((weekNum) => (
                    <SelectItem key={weekNum} value={weekNum.toString()}>
                      Week {weekNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.unitCode && semesterWeeks.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ No semester plan found for this unit. Please create a semester plan first to organize assignments by week.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter assignment description and requirements"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select value={formData.assignmentType} onValueChange={(value) => setFormData({ ...formData, assignmentType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment Mode Selection */}
          <div className="space-y-2">
            <Label>Assignment Mode</Label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="assignmentMode"
                  value="essay"
                  checked={formData.assignmentMode === 'essay'}
                  onChange={(e) => setFormData({ ...formData, assignmentMode: e.target.value as 'essay' | 'document' })}
                />
                <div>
                  <div className="font-medium">Essay Assignment</div>
                  <div className="text-sm text-gray-500">Students write essays using the built-in workspace</div>
                </div>
              </label>
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="assignmentMode"
                  value="document"
                  checked={formData.assignmentMode === 'document'}
                  onChange={(e) => setFormData({ ...formData, assignmentMode: e.target.value as 'essay' | 'document' })}
                />
                <div>
                  <div className="font-medium">Document Upload</div>
                  <div className="text-sm text-gray-500">Students upload files (PDF, DOC, etc.)</div>
                </div>
              </label>
            </div>
          </div>

          {/* Document Upload Options - Only show for document assignments */}
          {formData.assignmentMode === 'document' && (
            <>
              <div className="space-y-2">
                <Label>Accepted Submission Formats</Label>
                <div className="flex gap-4">
                  {['pdf', 'doc', 'docx', 'txt'].map((format) => (
                    <label key={format} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.acceptedFormats.includes(format)}
                        onChange={(e) => handleFormatChange(format, e.target.checked)}
                      />
                      <span className="text-sm">{format.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Question File (Optional)</Label>
                <Input
                  id="attachments"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                />
                {formData.attachments && (
                  <p className="text-sm text-gray-600">
                    {formData.attachments.length} file(s) selected
                  </p>
                )}
              </div>
            </>
          )}

          {/* Essay Assignment Information */}
          {formData.assignmentMode === 'essay' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600">✨</span>
                <span className="font-medium text-blue-900">Essay Assignment Features</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Students will have access to a built-in essay writing workspace</li>
                <li>• Automatic word count and character tracking</li>
                <li>• Auto-save functionality for student drafts</li>
                <li>• AI plagiarism detection during grading</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading Files...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
