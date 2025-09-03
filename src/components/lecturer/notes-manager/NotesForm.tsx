
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
import { Unit } from "@/types/unitManagement";

interface NotesFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const NotesForm = ({ onClose, onSubmit }: NotesFormProps) => {
  const { toast } = useToast();
  const { user, createdUnits } = useAuth();
  const { getSemesterPlan, addMaterialToSemesterPlan, hasSemesterPlan } = useSemesterPlan();
  
  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  const [formData, setFormData] = useState({
    title: '',
    unitCode: '',
    topic: '',
    description: '',
    files: null as File[] | null,
    weekNumber: undefined as number | undefined
  });

  const [semesterWeeks, setSemesterWeeks] = useState<number[]>([]);

  // Load semester plan when unit is selected
  const handleUnitChange = async (unitCode: string) => {
    setFormData({ ...formData, unitCode, weekNumber: undefined });
    setSemesterWeeks([]);
    
    const selectedUnit = assignedUnits.find(unit => unit.code === unitCode);
    if (selectedUnit) {
      try {
        // Always fetch the latest semester plan (will use cache if available)
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
        console.error('Error loading semester plan:', error);
        setSemesterWeeks([]);
        toast({
          title: "No Semester Plan",
          description: "Please create a semester plan for this unit first.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.files || formData.files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

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
        description: "Please select a week for these notes.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create material for semester plan
      const semesterMaterial = {
        id: `material-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        title: formData.title || formData.files[0].name,
        description: formData.description,
        type: 'notes' as const,
        dayOfWeek: 'monday', // Default, can be made configurable
        releaseTime: '08:00', // Default, can be made configurable
        isUploaded: true,
        isVisible: true,
        documents: formData.files.map(file => ({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          title: file.name,
          description: formData.description,
          fileName: file.name,
          fileUrl: `https://storage.example.com/${selectedUnit.id}/${file.name}`, // Placeholder URL
          fileSize: file.size,
          uploadDate: new Date(),
          isVisible: true,
          uploadedBy: user?.id || ''
        }))
      };

      // Add to semester plan
      await addMaterialToSemesterPlan(selectedUnit.id, formData.weekNumber, semesterMaterial);

      setFormData({
        title: '',
        unitCode: '',
        topic: '',
        description: '',
        files: null,
        weekNumber: undefined
      });
      setSemesterWeeks([]);

      toast({
        title: "Notes Uploaded",
        description: `${formData.files.length} file(s) uploaded and added to Week ${formData.weekNumber}.`,
      });

      onClose();
      onSubmit();
    } catch (error) {
      console.error('Failed to upload notes:', error);
      toast({
        title: "Error",
        description: "Failed to upload notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Course Notes</CardTitle>
        <CardDescription>Upload notes, presentations, or study materials</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUploadNotes} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Leave empty to use filename"
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
                  <SelectValue placeholder="Select week for these notes" />
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
                ⚠️ No semester plan found for this unit. Please create a semester plan first to organize notes by week.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="topic">Topic/Chapter</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Enter topic or chapter name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description or additional notes"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Files</Label>
            <Input
              id="files"
              type="file"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              required
            />
            {formData.files && (
              <div className="text-sm text-gray-600">
                <p>{formData.files.length} file(s) selected:</p>
                <ul className="list-disc list-inside ml-2">
                  {Array.from(formData.files).map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit">Upload Notes</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
