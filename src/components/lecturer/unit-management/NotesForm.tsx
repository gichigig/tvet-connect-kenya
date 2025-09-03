
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface NotesFormProps {
  onAddNotes: (notes: any) => void;
  unitCode?: string;
  unitId?: string;
}

export const NotesForm = ({ onAddNotes, unitCode, unitId }: NotesFormProps) => {
  const { user } = useAuth();
  const { semesterPlans, addMaterialToSemesterPlan, hasSemesterPlan } = useSemesterPlan();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [semesterWeeks, setSemesterWeeks] = useState<number[]>([]);

  // Load available weeks when component mounts or unitId changes
  useEffect(() => {
    if (unitId) {
      // First check if plan exists in memory
      if (hasSemesterPlan(unitId)) {
        const plan = semesterPlans[unitId];
        const weeks = plan.weekPlans.map(w => w.weekNumber).sort((a, b) => a - b);
        setSemesterWeeks(weeks);
      } else {
        setSemesterWeeks([]);
      }
    }
  }, [unitId, semesterPlans, hasSemesterPlan]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    const notes = {
      type: "notes",
      title,
      description,
      topic,
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      createdAt: new Date().toISOString(),
      weekNumber // Add week number to notes data
    };
    
    onAddNotes(notes);
    
    // Add to semester plan if week is selected and we have the necessary data
    if (weekNumber && unitCode && unitId) {
      addMaterialToSemesterPlan(unitId, weekNumber, {
        id: Date.now().toString(),
        title,
        description,
        type: 'notes',
        dayOfWeek: 'Monday',
        releaseTime: '08:00',
        isUploaded: files.length > 0,
        isVisible: true
      });
    }
    
    // Reset form
    setTitle("");
    setDescription("");
    setTopic("");
    setFiles([]);
    setWeekNumber(null);
    // Reset file input
    const fileInput = document.getElementById('notes-files') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Add Course Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Notes Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter 1: Introduction"
            />
          </div>
          <div>
            <Label>Topic/Chapter</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic or chapter name"
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the notes content"
            rows={3}
          />
        </div>

        {/* Week Selection - Only show when unit has semester plan */}
        {semesterWeeks.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="weekNumber">Semester Week</Label>
            <Select 
              value={weekNumber?.toString()} 
              onValueChange={(value) => setWeekNumber(parseInt(value))}
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

        {semesterWeeks.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ No semester plan found for this unit. Please create a semester plan first to organize notes by week.
            </p>
          </div>
        )}

        <div>
          <Label>Upload Files</Label>
          <Input
            id="notes-files"
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          />
          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <p>{files.length} file(s) selected:</p>
              <ul className="list-disc list-inside ml-2">
                {files.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={files.length === 0}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Notes
        </Button>
      </CardContent>
    </Card>
  );
};
