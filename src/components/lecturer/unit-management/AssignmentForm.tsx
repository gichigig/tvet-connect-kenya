import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Trash2, FileText, PenTool } from "lucide-react";
import { useSemesterPlan } from "@/contexts/SemesterPlanContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface AssignmentFormProps {
  onAddAssignment: (assignment: any) => void;
  unitCode?: string;
  unitId?: string;
}

export const AssignmentForm = ({ onAddAssignment, unitCode, unitId }: AssignmentFormProps) => {
  const { user } = useAuth();
  const { semesterPlans, addAssignmentToSemesterPlan, hasSemesterPlan } = useSemesterPlan();
  
  const [assignmentType, setAssignmentType] = useState<"essay" | "multiple_choice" | "file_upload" | "question_file">("file_upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [acceptedFormats, setAcceptedFormats] = useState<string[]>(["pdf"]);
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
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

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuestionFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // Always set studentType correctly for AssignmentWorkplace
    const getStudentAssignmentType = (assignmentType: string): 'essay' | 'document' => {
      return assignmentType === 'essay' ? 'essay' : 'document';
    };

    const assignment = {
      type: "assignment", // For CreatedContent type classification
      assignmentType, // Original assignment type for lecturer reference
      title,
      description,
      dueDate,
      // Add the student-facing type field that AssignmentWorkplace expects
      studentType: getStudentAssignmentType(assignmentType), // This will be 'essay' | 'document'
      acceptedFormats: assignmentType === "file_upload" ? acceptedFormats : [],
      questions: assignmentType === "multiple_choice" ? questions : [],
      questionFile: assignmentType === "question_file" ? questionFile : null,
      questionFileName: questionFile?.name || "",
      createdAt: new Date().toISOString(),
      weekNumber // Add week number to assignment data
    };
    
    onAddAssignment(assignment);
    
    // Add to semester plan if week is selected and we have the necessary data
    if (weekNumber && unitCode && unitId) {
      const mappedType = getStudentAssignmentType(assignmentType);
      addAssignmentToSemesterPlan(unitId, weekNumber, {
        id: Date.now().toString(),
        title,
        description,
        dueDate: new Date(dueDate),
        type: mappedType,
        studentType: mappedType,
        maxMarks: mappedType === "essay" ? 100 : 100,
        instructions: description,
        assignDate: new Date(),
        fileUrl: '',
        fileName: '',
        isUploaded: false,
        requiresAICheck: false
      });
    }
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    setQuestionFile(null);
    setWeekNumber(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Add New Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Assignment Type</Label>
            <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essay">Essay Writing</SelectItem>
                <SelectItem value="file_upload">File Upload</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="question_file">Question File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
          />
        </div>

        <div>
          <Label>Instructions</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Assignment instructions and requirements"
            rows={3}
          />
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
                <SelectValue placeholder="Select week for this assignment" />
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
              ⚠️ No semester plan found for this unit. Please create a semester plan first to organize assignments by week.
            </p>
          </div>
        )}

        {assignmentType === "essay" && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              <Label className="text-blue-800 font-medium">Essay Assignment Settings</Label>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wordLimit">Word Limit (Optional)</Label>
                <Input
                  id="wordLimit"
                  type="number"
                  placeholder="e.g. 1500"
                  min="100"
                  max="10000"
                />
                <p className="text-xs text-gray-600">Leave empty for no word limit</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresAICheck"
                  defaultChecked
                />
                <Label htmlFor="requiresAICheck" className="text-sm">
                  Enable AI originality check (Recommended)
                </Label>
              </div>
            </div>
            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
              <strong>Note:</strong> Students will write their essays directly in the platform using the essay workspace. 
              AI checking will help detect plagiarism and AI-generated content.
            </div>
          </div>
        )}

        {assignmentType === "file_upload" && (
          <div>
            <Label>Accepted File Formats</Label>
            <div className="flex gap-2 mt-2">
              {["pdf", "doc", "docx", "txt", "zip"].map((format) => (
                <Button
                  key={format}
                  variant={acceptedFormats.includes(format) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (acceptedFormats.includes(format)) {
                      setAcceptedFormats(acceptedFormats.filter(f => f !== format));
                    } else {
                      setAcceptedFormats([...acceptedFormats, format]);
                    }
                  }}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}

        {assignmentType === "question_file" && (
          <div className="space-y-4">
            <div>
              <Label>Upload Question File</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  onChange={handleQuestionFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload a file containing assignment questions (PDF, DOC, DOCX, TXT)
                </p>
              </div>
              {questionFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">{questionFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestionFile(null)}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label>Accepted Submission Formats</Label>
              <div className="flex gap-2 mt-2">
                {["pdf", "doc", "docx", "txt", "zip"].map((format) => (
                  <Button
                    key={format}
                    variant={acceptedFormats.includes(format) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (acceptedFormats.includes(format)) {
                        setAcceptedFormats(acceptedFormats.filter(f => f !== format));
                      } else {
                        setAcceptedFormats([...acceptedFormats, format]);
                      }
                    }}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {assignmentType === "multiple_choice" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questions</Label>
              <Button onClick={handleAddQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <Label>Question {qIndex + 1}</Label>
                    {questions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveQuestion(qIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(qIndex, "question", e.target.value)}
                    placeholder="Enter question"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => handleUpdateQuestion(qIndex, "correctAnswer", oIndex)}
                        />
                        <Input
                          value={option}
                          onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full">
          Create Assignment
        </Button>
      </CardContent>
    </Card>
  );
};
