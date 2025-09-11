
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AttendanceQuiz, QuizFormData } from "./types";
import { Unit } from "@/types/unitManagement";

interface QuizFormProps {
  assignedUnits: Unit[];
  onCreateQuiz: (quiz: AttendanceQuiz) => void;
  onCancel: () => void;
}

export const QuizForm = ({ assignedUnits, onCreateQuiz, onCancel }: QuizFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    unitCode: '',
    timeLimit: '5',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate questions
    const validQuestions = formData.questions.filter(q => 
      q.question.trim() && q.options.every(opt => opt.trim())
    );

    if (validQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one complete question with all options.",
        variant: "destructive",
      });
      return;
    }

    const selectedUnit = assignedUnits.find(unit => unit.code === formData.unitCode);
    if (!selectedUnit) {
      toast({
        title: "Error",
        description: "Please select a valid unit.",
        variant: "destructive",
      });
      return;
    }

    const newQuiz: AttendanceQuiz = {
      id: Date.now().toString(),
      title: formData.title,
      unitCode: formData.unitCode,
      unitName: selectedUnit.name,
      questions: validQuestions.map((q, index) => ({
        id: (index + 1).toString(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      timeLimit: parseInt(formData.timeLimit),
      isActive: false,
      responses: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    onCreateQuiz(newQuiz);

    toast({
      title: "Quiz Created",
      description: `Attendance quiz "${newQuiz.title}" has been created successfully.`,
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...formData.questions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value;
    } else if (field.startsWith('option_')) {
      const optionIndex = parseInt(field.split('_')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Attendance Quiz</CardTitle>
        <CardDescription>Create a timed quiz for attendance verification</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateQuiz} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCode">Unit</Label>
              <Select value={formData.unitCode} onValueChange={(value) => setFormData({ ...formData, unitCode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {assignedUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.code}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Select value={formData.timeLimit} onValueChange={(value) => setFormData({ ...formData, timeLimit: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {formData.questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question {questionIndex + 1}</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="space-y-1">
                        <Label className="text-sm">Option {String.fromCharCode(65 + optionIndex)}</Label>
                        <Input
                          value={option}
                          onChange={(e) => updateQuestion(questionIndex, `option_${optionIndex}`, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select 
                      value={question.correctAnswer.toString()} 
                      onValueChange={(value) => updateQuestion(questionIndex, 'correctAnswer', parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((_, optionIndex) => (
                          <SelectItem key={optionIndex} value={optionIndex.toString()}>
                            Option {String.fromCharCode(65 + optionIndex)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit">Create Quiz</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
