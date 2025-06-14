
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

interface Note {
  id: string;
  title: string;
  course: string;
  topic: string;
  uploadDate: string;
  fileSize: string;
  downloads: number;
  type: 'pdf' | 'doc' | 'ppt' | 'txt';
}

export const NotesManager = () => {
  const { toast } = useToast();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Introduction to Algorithms',
      course: 'Computer Science 101',
      topic: 'Sorting Algorithms',
      uploadDate: '2024-06-10',
      fileSize: '2.5 MB',
      downloads: 45,
      type: 'pdf'
    },
    {
      id: '2',
      title: 'Calculus Fundamentals',
      course: 'Mathematics 201',
      topic: 'Derivatives and Integrals',
      uploadDate: '2024-06-12',
      fileSize: '1.8 MB',
      downloads: 32,
      type: 'pdf'
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    course: '',
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

    formData.files.forEach((file, index) => {
      const newNote: Note = {
        id: `${Date.now()}-${index}`,
        title: formData.title || file.name,
        course: formData.course,
        topic: formData.topic,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        downloads: 0,
        type: file.name.split('.').pop() as Note['type'] || 'pdf'
      };

      setNotes(prev => [...prev, newNote]);
    });

    setFormData({
      title: '',
      course: '',
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

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'doc': return 'bg-blue-100 text-blue-800';
      case 'ppt': return 'bg-orange-100 text-orange-800';
      case 'txt': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  <Label htmlFor="course">Course</Label>
                  <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science 101">Computer Science 101</SelectItem>
                      <SelectItem value="Mathematics 201">Mathematics 201</SelectItem>
                      <SelectItem value="Physics 301">Physics 301</SelectItem>
                      <SelectItem value="Chemistry 101">Chemistry 101</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Downloads</TableHead>
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
                  <TableCell>{note.course}</TableCell>
                  <TableCell>{note.topic}</TableCell>
                  <TableCell>{new Date(note.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>{note.fileSize}</TableCell>
                  <TableCell>
                    <Badge className={getFileTypeColor(note.type)}>
                      {note.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{note.downloads}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};
