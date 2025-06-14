
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, AlertTriangle } from "lucide-react";

interface ExamFormProps {
  onAddExam: (exam: any) => void;
}

export const ExamForm = ({ onAddExam }: ExamFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(120); // minutes
  const [venue, setVenue] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);

  const handleSubmit = () => {
    const exam = {
      type: "exam",
      title,
      description,
      scheduledDate,
      duration,
      venue,
      totalMarks,
      isLive: true,
      requiresHODApproval: true,
      status: "pending_approval",
      createdAt: new Date().toISOString()
    };
    
    onAddExam(exam);
    
    // Reset form
    setTitle("");
    setDescription("");
    setScheduledDate("");
    setDuration(120);
    setVenue("");
    setTotalMarks(100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Add New Exam (Live & Timed)
          </div>
          <Badge variant="outline" className="text-orange-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Requires HOD Approval
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Exam Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Final Exam - Unit Name"
            />
          </div>
          <div>
            <Label>Total Marks</Label>
            <Input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="30"
              max="240"
            />
          </div>
          <div>
            <Label>Venue</Label>
            <Input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Exam hall or room number"
            />
          </div>
        </div>

        <div>
          <Label>Scheduled Date & Time</Label>
          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>

        <div>
          <Label>Exam Instructions</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exam instructions, materials allowed, etc."
            rows={4}
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">HOD Approval Required</p>
              <p>This exam will be submitted for HOD approval before it becomes active. You will be notified once approved.</p>
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit for HOD Approval
        </Button>
      </CardContent>
    </Card>
  );
};
