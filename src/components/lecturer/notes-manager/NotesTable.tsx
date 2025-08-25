
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Edit, Trash2, FileText, BookOpen } from "lucide-react";
import { CreatedContent } from "@/contexts/auth/types";
import { useToast } from "@/hooks/use-toast";

interface NotesTableProps {
  notes: (CreatedContent | any)[];
}

export const NotesTable = ({ notes }: NotesTableProps) => {
  const { toast } = useToast();
  
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

  const handleViewNote = (note: any) => {
    toast({
      title: "View Note",
      description: "Note viewing functionality will be implemented here.",
      duration: 3000,
    });
  };

  const handleDownloadNote = (note: any) => {
    if (note.fileUrl) {
      window.open(note.fileUrl, '_blank');
    } else {
      toast({
        title: "Download Note",
        description: "Note download functionality will be implemented here.",
        duration: 3000,
      });
    }
  };

  const handleEditNote = (note: any) => {
    if (note.isFromSemesterPlan) {
      toast({
        title: "Edit in Semester Planning",
        description: "This note was created through semester planning. Please edit it in the Semester Planning tab.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Edit Note",
        description: "Note editing functionality will be implemented here.",
        duration: 3000,
      });
    }
  };

  const handleDeleteNote = (note: any) => {
    if (note.isFromSemesterPlan) {
      toast({
        title: "Cannot Delete",
        description: "Notes from semester plans cannot be deleted here. Edit them in the Semester Planning tab.",
        variant: "destructive",
        duration: 3000,
      });
    } else {
      toast({
        title: "Delete Note",
        description: "Note deletion functionality will be implemented here.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
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
                <TableHead>Source</TableHead>
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
                  <TableCell>{note.topic || note.description || '-'}</TableCell>
                  <TableCell>{new Date(note.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{getFileSize(note.fileName || '')}</TableCell>
                  <TableCell>
                    <Badge className={getFileTypeColor(note.fileName || '')}>
                      {note.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {note.isFromSemesterPlan ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Week {note.weekNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewNote(note)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadNote(note)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteNote(note)}
                      >
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
  );
};
