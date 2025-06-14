
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Unit } from "@/types/unitManagement";

interface NotesFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const NotesForm = ({ onClose, onSubmit }: NotesFormProps) => {
  const { toast } = useToast();
  const { user, createdUnits, addCreatedContent } = useAuth();
  
  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  const [formData, setFormData] = useState({
    title: '',
    unitCode: '',
    topic: '',
    description: '',
    files: null as File[] | null
  });

  const handleUploadNotes = (e: React.FormEvent) => {
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

    formData.files.forEach((file, index) => {
      const newNote = {
        id: `${Date.now()}-${index}`,
        type: 'notes' as const,
        title: formData.title || file.name,
        description: formData.description,
        unitId: selectedUnit.id,
        unitCode: formData.unitCode,
        unitName: selectedUnit.name,
        lecturerId: user?.id || '',
        isVisible: true,
        createdAt: new Date().toISOString(),
        fileName: file.name,
        topic: formData.topic
      };

      addCreatedContent(newNote);
    });

    setFormData({
      title: '',
      unitCode: '',
      topic: '',
      description: '',
      files: null
    });

    toast({
      title: "Notes Uploaded",
      description: `${formData.files.length} file(s) uploaded successfully.`,
    });

    onSubmit();
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
              <Select value={formData.unitCode} onValueChange={(value) => setFormData({ ...formData, unitCode: value })}>
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
