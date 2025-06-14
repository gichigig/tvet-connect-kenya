
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Download, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const NotesManager = () => {
  const { toast } = useToast();
  const { user, createdUnits, createdContent, addCreatedContent } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);
  
  // Get notes created by current lecturer
  const notes = createdContent.filter(content => 
    content.type === 'notes' && content.lecturerId === user?.id
  );

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
        unitCode: formData.unitCode,
        unitName: selectedUnit.name,
        lecturerId: user?.id || '',
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
    setShowUploadForm(false);

    toast({
      title: "Notes Uploaded",
      description: `${formData.files.length} file(s) uploaded successfully.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) });
    }
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'doc':
      case 'docx': return 'bg-blue-100 text-blue-800';
      case 'ppt':
      case 'pptx': return 'bg-orange-100 text-orange-800';
      case 'txt': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileSize = (fileName: string) => {
    // Since we don't have actual file size, return a placeholder
    return "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes Management</h2>
          <p className="text-gray-600">Upload and manage course notes and materials</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Notes
        </Button>
      </div>

      {showUploadForm && (
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
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Notes</CardTitle>
          <CardDescription>Manage your uploaded course materials</CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        {note.title}
                      </div>
                    </TableCell>
                    <TableCell>{note.unitCode}</TableCell>
                    <TableCell>{note.topic || '-'}</TableCell>
                    <TableCell>{new Date(note.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{getFileSize(note.fileName || '')}</TableCell>
                    <TableCell>
                      <Badge className={getFileTypeColor(note.fileName || '')}>
                        {note.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No course materials uploaded yet.</p>
              <p className="text-sm">Upload your first notes using the button above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
