
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface Question {
  id: string;
  question: string;
  marks: number;
}

interface ExamFormProps {
  onAddExam: (exam: any) => void;
  unitCode?: string;
  unitId?: string;
}

export const ExamForm = ({ onAddExam, unitCode, unitId }: ExamFormProps) => {
  const { user } = useAuth();
  const { semesterPlans, addExamToSemesterPlan, hasSemesterPlan } = useSemesterPlan();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(120); // minutes
  const [venue, setVenue] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentMarks, setCurrentMarks] = useState(10);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [semesterWeeks, setSemesterWeeks] = useState<number[]>([]);

  // Load available weeks when component mounts or unitId changes
  useEffect(() => {
    if (unitId) {
      // First check if plan exists in memory
      if (hasSemesterPlan(unitId)) {
        const plan = semesterPlans[unitId];
        const weeks = plan.weekPlans.map(w => w.weekNumber).sort((a, b) => a - b);
        setSemesterWeeks(weeks);
      } else {
        setSemesterWeeks([]);
      }
    }
  }, [unitId, semesterPlans, hasSemesterPlan]);

  const addQuestion = () => {
    if (!currentQuestion.trim()) return;
    
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion,
      marks: currentMarks
    };
    
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setCurrentMarks(10);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + q.marks, 0);
  };

  const handleSubmit = () => {
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const exam = {
      type: "exam",
      title,
      description,
      scheduledDate,
      duration,
      venue,
      totalMarks: calculateTotalMarks(),
      questions,
      isLive: true,
      requiresHODApproval: true,
      status: "pending_approval",
      isVisible: true,
      isAccessible: false,
      createdAt: new Date().toISOString(),
      weekNumber // Add week number to exam data
    };
    
    onAddExam(exam);
    
    // Add to semester plan if week is selected and we have the necessary data
    if (weekNumber && unitCode && unitId) {
      addExamToSemesterPlan(unitId, weekNumber, {
        id: Date.now().toString(),
        title,
        description,
        examDate: new Date(scheduledDate),
        examTime: scheduledDate,
        duration,
        venue,
        maxMarks: calculateTotalMarks(),
        instructions: description,
        type: 'exam',
        questions: [],
        isLocked: false,
        approvalStatus: 'draft'
      });
    }
    
    // Reset form
    setTitle("");
    setDescription("");
    setScheduledDate("");
    setDuration(120);
    setVenue("");
    setTotalMarks(100);
    setQuestions([]);
    setWeekNumber(null);
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
            <Label>Venue</Label>
            <Input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Exam hall or room number"
            />
          </div>
        </div>

        {/* Week Selection - Only show when unit has semester plan */}
        {semesterWeeks.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="weekNumber">Semester Week</Label>
            <Select 
              value={weekNumber?.toString()} 
              onValueChange={(value) => setWeekNumber(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select week for this exam" />
              </SelectTrigger>
              <SelectContent>
                {semesterWeeks.map((weekNum) => (
                  <SelectItem key={weekNum} value={weekNum.toString()}>
                    Week {weekNum}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {semesterWeeks.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ No semester plan found for this unit. Please create a semester plan first to organize exams by week.
            </p>
          </div>
        )}

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
            <Label>Scheduled Date & Time</Label>
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
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

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Exam Questions</Label>
            <Badge variant="outline">
              Total Marks: {calculateTotalMarks()}
            </Badge>
          </div>
          
          {/* Add Question Form */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <Label>Question</Label>
              <Textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Enter exam question"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={currentMarks}
                  onChange={(e) => setCurrentMarks(Number(e.target.value))}
                  min="1"
                  max="100"
                  className="w-20"
                />
              </div>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <Label>Added Questions:</Label>
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded p-3 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">Question {index + 1}: ({question.marks} marks)</div>
                    <div className="text-sm text-gray-600 mt-1">{question.question}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">HOD Approval Required</p>
              <p>This exam will be submitted for HOD approval before it becomes active. Students will see it but cannot access it until the scheduled date and time.</p>
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={questions.length === 0}>
          Submit for HOD Approval
        </Button>
      </CardContent>
    </Card>
  );
};
