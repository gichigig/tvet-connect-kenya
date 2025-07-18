import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  unitCode: string;
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  onSubmissionComplete: () => void;
}

export const AssignmentSubmission = ({ assignment, onSubmissionComplete }: AssignmentSubmissionProps) => {
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your assignment text",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Submit the assignment
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignment.id,
          student_id: user?.id,
          student_name: `${user?.firstName} ${user?.lastName}`,
          submission_text: submissionText,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger AI detection
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-essay-detector', {
        body: {
          submissionId: data.id,
          text: submissionText
        }
      });

      if (aiError) {
        console.error('AI detection failed:', aiError);
        toast({
          title: "Submission Complete",
          description: "Assignment submitted successfully. AI detection will run shortly.",
        });
      } else {
        toast({
          title: "Submission Complete",
          description: "Assignment submitted and analyzed for AI content.",
        });
      }

      setSubmission(data);
      onSubmissionComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'human':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'flagged_for_review':
      case 'ai_detected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Analyzing...</Badge>;
      case 'human':
        return <Badge variant="outline" className="bg-green-50 text-green-800">Approved</Badge>;
      case 'flagged_for_review':
        return <Badge variant="outline" className="bg-orange-50 text-orange-800">Under Review</Badge>;
      case 'ai_detected':
        return <Badge variant="outline" className="bg-red-50 text-red-800">Flagged</Badge>;
      default:
        return <Badge variant="outline">Submitted</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Assignment: {assignment.title}
        </CardTitle>
        <CardDescription>
          Due: {new Date(assignment.dueDate).toLocaleDateString()} | Unit: {assignment.unitCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assignment Description */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Assignment Instructions:</h4>
          <p className="text-sm text-gray-700">{assignment.description}</p>
        </div>

        {/* AI Detection Notice */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">AI Detection Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                All submissions are automatically analyzed for AI-generated content. 
                Submissions flagged as AI-generated will be reviewed by your lecturer.
              </p>
            </div>
          </div>
        </div>

        {!submission ? (
          <>
            {/* Submission Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Assignment</label>
                <Textarea
                  placeholder="Enter your assignment text here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={12}
                  className="min-h-[300px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {submissionText.length}
                </p>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !submissionText.trim()}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Submitting & Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Submission Status */
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Assignment Submitted Successfully</h4>
              </div>
              <p className="text-sm text-green-700">
                Submitted on {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>

            {/* AI Detection Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.ai_detection_status)}
                  <span className="font-medium">AI Detection Status</span>
                </div>
                {getStatusBadge(submission.ai_detection_status)}
              </div>
              
              {submission.ai_confidence_score && (
                <p className="text-sm text-gray-600">
                  Confidence Score: {submission.ai_confidence_score}%
                </p>
              )}
              
              {submission.final_status === 'ready_for_marking' && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Your submission has been approved and is ready for marking.
                </p>
              )}
              
              {submission.final_status === 'requires_review' && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠ Your submission requires manual review by your lecturer.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};