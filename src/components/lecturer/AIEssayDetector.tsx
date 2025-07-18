import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, CheckCircle, Eye, FileText, RefreshCw } from "lucide-react";

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  submission_text: string;
  submitted_at: string;
  ai_detection_status: string;
  ai_confidence_score: number;
  ai_detection_details: any;
  human_review_status: string;
  final_status: string;
  grade: number;
}

export const AIEssayDetector = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAIDetection = async (submission: Submission) => {
    setAnalyzing(submission.id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-essay-detector', {
        body: {
          submissionId: submission.id,
          text: submission.submission_text
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "AI Detection Complete",
          description: `Analysis completed with ${data.result.confidence}% confidence`,
        });
        fetchSubmissions();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run AI detection",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const submitHumanReview = async (approved: boolean) => {
    if (!selectedSubmission) return;

    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          human_review_status: approved ? 'approved' : 'rejected',
          human_reviewer_id: user?.id,
          human_review_notes: reviewNotes,
          human_reviewed_at: new Date().toISOString(),
          final_status: approved ? 'ready_for_marking' : 'flagged_as_ai'
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: `Submission ${approved ? 'approved' : 'flagged'} for further action`,
      });

      setSelectedSubmission(null);
      setReviewNotes("");
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (submission: Submission) => {
    const { ai_detection_status, final_status } = submission;
    
    switch (ai_detection_status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Pending Analysis</Badge>;
      case 'human':
        return <Badge variant="outline" className="bg-green-50 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Human Written
        </Badge>;
      case 'flagged_for_review':
        return <Badge variant="outline" className="bg-orange-50 text-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Needs Review
        </Badge>;
      case 'ai_detected':
        return <Badge variant="outline" className="bg-red-50 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          AI Detected
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-red-600";
    if (confidence >= 60) return "text-orange-600";
    return "text-green-600";
  };

  if (loading) {
    return <div className="p-6">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            AI Essay Detection Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and review assignment submissions for AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>AI Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Final Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.student_name}
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(submission)}
                    </TableCell>
                    <TableCell>
                      {submission.ai_confidence_score ? (
                        <span className={getConfidenceColor(submission.ai_confidence_score)}>
                          {submission.ai_confidence_score}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {submission.final_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {submission.ai_detection_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runAIDetection(submission)}
                            disabled={analyzing === submission.id}
                          >
                            {analyzing === submission.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              "Analyze"
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No submissions to review yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission && `Submission by ${selectedSubmission.student_name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              {/* AI Detection Results */}
              {selectedSubmission.ai_detection_details && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Detection Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="font-semibold">Confidence: </span>
                        <span className={getConfidenceColor(selectedSubmission.ai_confidence_score)}>
                          {selectedSubmission.ai_confidence_score}%
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Status: </span>
                        {getStatusBadge(selectedSubmission)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Analysis Reasoning:</h4>
                      <p className="text-sm text-gray-600">
                        {selectedSubmission.ai_detection_details.reasoning}
                      </p>
                    </div>
                    
                    {selectedSubmission.ai_detection_details.flags?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Detection Flags:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedSubmission.ai_detection_details.flags.map((flag: string, index: number) => (
                            <li key={index}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Submission Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submission Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSubmission.submission_text}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Human Review */}
              {(selectedSubmission.ai_detection_status === 'flagged_for_review' || 
                selectedSubmission.ai_detection_status === 'ai_detected') && 
                selectedSubmission.human_review_status === 'not_reviewed' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Human Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add your review notes..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => submitHumanReview(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve (Mark as Human)
                      </Button>
                      <Button 
                        onClick={() => submitHumanReview(false)}
                        variant="destructive"
                      >
                        Flag as AI-Generated
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};