import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, Trash2, FileText } from "lucide-react";

interface AssignmentFormProps {
  onAddAssignment: (assignment: any) => void;
}

export const AssignmentForm = ({ onAddAssignment }: AssignmentFormProps) => {
  const [assignmentType, setAssignmentType] = useState<"multiple_choice" | "file_upload" | "question_file">("file_upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [acceptedFormats, setAcceptedFormats] = useState<string[]>(["pdf"]);
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  const [questionFile, setQuestionFile] = useState<File | null>(null);

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
    const assignment = {
      type: "assignment",
      assignmentType,
      title,
      description,
      dueDate,
      acceptedFormats: assignmentType === "file_upload" ? acceptedFormats : [],
      questions: assignmentType === "multiple_choice" ? questions : [],
      questionFile: assignmentType === "question_file" ? questionFile : null,
      questionFileName: questionFile?.name || "",
      createdAt: new Date().toISOString()
    };
    
    onAddAssignment(assignment);
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    setQuestionFile(null);
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
