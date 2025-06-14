
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Edit, Trash2, FileText } from "lucide-react";
import { CreatedContent } from "@/contexts/auth/types";

interface NotesTableProps {
  notes: CreatedContent[];
}

export const NotesTable = ({ notes }: NotesTableProps) => {
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
  );
};
