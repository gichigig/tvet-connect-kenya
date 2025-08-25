import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { fileStorageService, StoredDocument } from '@/services/FileStorageService';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  unitId: string;
  unitCode: string;
  submittedAt: Date;
  status: 'submitted' | 'late' | 'graded';
  documents: StoredDocument[];
  comments?: string;
  wordCount?: number;
}

interface SubmissionViewerProps {
  assignmentId: string;
  assignmentTitle: string;
  dueDate: Date;
  unitId?: string;
  unitCode?: string;
}

export const SubmissionViewer: React.FC<SubmissionViewerProps> = ({
  assignmentId,
  assignmentTitle,
  dueDate,
  unitId,
  unitCode
}) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      // Get all submission documents for this assignment
      const submissionDocuments = await fileStorageService.getAssignmentSubmissions(assignmentId);
      
      console.log('Assignment submission documents:', submissionDocuments);

      // Group documents by student
      const assignmentSubmissions: { [studentId: string]: StudentSubmission } = {};

      submissionDocuments.forEach(doc => {
        // Parse entityId format: assignmentId_studentId
        if (doc.entityId && doc.entityId.startsWith(`${assignmentId}_`)) {
          const studentId = doc.entityId.replace(`${assignmentId}_`, '');
          
          if (!assignmentSubmissions[studentId]) {
            assignmentSubmissions[studentId] = {
              id: `${studentId}_${assignmentId}`,
              assignmentId,
              studentId,
              studentName: doc.uploadedBy || 'Unknown Student',
              unitId: unitId || '',
              unitCode: unitCode || '',
              submittedAt: new Date(doc.uploadedAt),
              status: new Date(doc.uploadedAt) > dueDate ? 'late' : 'submitted',
              documents: [doc],
              comments: doc.description
            };
          } else {
            // Add additional documents for the same student
            assignmentSubmissions[studentId].documents.push(doc);
            // Update submission time to latest document
            if (new Date(doc.uploadedAt) > assignmentSubmissions[studentId].submittedAt) {
              assignmentSubmissions[studentId].submittedAt = new Date(doc.uploadedAt);
              assignmentSubmissions[studentId].status = new Date(doc.uploadedAt) > dueDate ? 'late' : 'submitted';
            }
          }
        }
      });

      const submissionsList = Object.values(assignmentSubmissions);
      console.log('Processed submissions:', submissionsList);
      
      setSubmissions(submissionsList);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast({
        title: "Failed to Load Submissions",
        description: "Unable to load student submissions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSubmission = async (fileDocument: StoredDocument) => {
    try {
      // Get download URL from S3
      const downloadUrl = await fileStorageService.getDownloadUrl(fileDocument.id);
      
      if (!downloadUrl) {
        throw new Error('No download URL available');
      }
      
      // Create a temporary link and trigger download using browser DOM API
      const htmlDocument = globalThis.document;
      const linkElement = htmlDocument.createElement('a');
      linkElement.href = downloadUrl;
      linkElement.download = fileDocument.fileName || fileDocument.title || 'submission';
      htmlDocument.body.appendChild(linkElement);
      linkElement.click();
      htmlDocument.body.removeChild(linkElement);

      toast({
        title: "Download Started",
        description: `Downloading ${fileDocument.fileName || fileDocument.title}`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, submittedAt: Date) => {
    const isLate = submittedAt > dueDate;
    
    if (status === 'graded') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Graded</Badge>;
    }
    
    if (isLate) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Late</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-100 text-green-800"><Clock className="w-3 h-3 mr-1" />On Time</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>Loading submissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Student Submissions ({submissions.length})
        </CardTitle>
        <CardDescription>
          Submissions for: <strong>{assignmentTitle}</strong>
          <span className="ml-4 text-sm">Due: {formatDate(dueDate)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No submissions yet</p>
            <p className="text-sm">Student submissions will appear here once uploaded</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.studentName}</div>
                      <div className="text-sm text-gray-500">{submission.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(submission.submittedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.status, submission.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {submission.documents.length} file(s)
                      {submission.documents.map((doc, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          {doc.fileName || doc.title}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Submission Details</DialogTitle>
                            <DialogDescription>
                              {selectedSubmission?.studentName} - {assignmentTitle}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Student:</label>
                                  <p className="text-sm">{selectedSubmission.studentName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Submitted:</label>
                                  <p className="text-sm">{formatDate(selectedSubmission.submittedAt)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status:</label>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedSubmission.status, selectedSubmission.submittedAt)}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Files:</label>
                                  <p className="text-sm">{selectedSubmission.documents.length} file(s)</p>
                                </div>
                              </div>
                              
                              {selectedSubmission.comments && (
                                <div>
                                  <label className="text-sm font-medium">Comments:</label>
                                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedSubmission.comments}</p>
                                </div>
                              )}
                              
                              <div>
                                <label className="text-sm font-medium">Submitted Files:</label>
                                <div className="mt-2 space-y-2">
                                  {selectedSubmission.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">{doc.fileName || doc.title}</p>
                                        <p className="text-xs text-gray-500">
                                          Uploaded: {formatDate(new Date(doc.uploadedAt))}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleDownloadSubmission(doc)}
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {submission.documents.length === 1 && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadSubmission(submission.documents[0])}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button onClick={loadSubmissions} variant="outline">
            Refresh Submissions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
