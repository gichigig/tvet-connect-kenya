
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

interface NotesFormProps {
  onAddNotes: (notes: any) => void;
}

export const NotesForm = ({ onAddNotes }: NotesFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);

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
      createdAt: new Date().toISOString()
    };
    
    onAddNotes(notes);
    
    // Reset form
    setTitle("");
    setDescription("");
    setTopic("");
    setFiles([]);
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
