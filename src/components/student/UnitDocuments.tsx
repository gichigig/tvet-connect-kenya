import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Filter,
  Eye,
  BookOpen,
  PenTool,
  FileQuestion,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: string;
  uploaded_by: string;
  is_visible: boolean;
  due_date: string | null;
  semester: string;
  academic_year: string;
  created_at: string;
  unit_id: string;
}

interface UnitDocumentsProps {
  unitId: string;
  unitCode: string;
  unitName: string;
}

export const UnitDocuments: React.FC<UnitDocumentsProps> = ({
  unitId,
  unitCode,
  unitName
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const documentTypeIcons = {
    'notes': <BookOpen className="h-4 w-4" />,
    'assignment': <PenTool className="h-4 w-4" />,
    'lecture_material': <FileText className="h-4 w-4" />,
    'exam': <FileQuestion className="h-4 w-4" />,
    'syllabus': <BookOpen className="h-4 w-4" />,
    'announcement': <Bell className="h-4 w-4" />
  };

  const documentTypeLabels = {
    'notes': 'Lecture Notes',
    'assignment': 'Assignment',
    'lecture_material': 'Lecture Material',
    'exam': 'Exam',
    'syllabus': 'Syllabus',
    'announcement': 'Announcement'
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('unit_id', unitId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [unitId]);

  const handleDownload = async (document: Document) => {
    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_url.split('/documents/').pop() || '', 3600);

      if (error) throw error;

      // Create download link
      const link = window.document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDateString: string | null): boolean => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date();
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.document_type === filter;
  });

  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const type = doc.document_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents - {unitCode} ({unitName})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="notes">Lecture Notes</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="lecture_material">Materials</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="syllabus">Syllabus</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents available for this unit</p>
              <p className="text-sm">Check back later for updates from your lecturer</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDocuments).map(([type, docs]) => (
                <div key={type}>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    {documentTypeIcons[type as keyof typeof documentTypeIcons]}
                    {documentTypeLabels[type as keyof typeof documentTypeLabels]}
                    <Badge variant="secondary">{docs.length}</Badge>
                  </h3>
                  <div className="grid gap-4">
                    {docs.map((document) => (
                      <Card key={document.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {documentTypeIcons[document.document_type as keyof typeof documentTypeIcons]}
                                <h4 className="font-medium">{document.title}</h4>
                                {document.due_date && (
                                  <Badge 
                                    variant={isOverdue(document.due_date) ? "destructive" : "outline"}
                                    className="text-xs"
                                  >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Due: {formatDate(document.due_date)}
                                  </Badge>
                                )}
                              </div>
                              
                              {document.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {document.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {document.file_name}
                                </span>
                                <span>{formatFileSize(document.file_size)}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(document.created_at)}
                                </span>
                                {document.semester && (
                                  <span>Semester {document.semester}</span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleDownload(document)}
                              size="sm"
                              className="ml-4"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};