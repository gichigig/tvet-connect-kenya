
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Play, Stop, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface AttendanceQuiz {
  id: string;
  title: string;
  course: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  responses: number;
  createdDate: string;
}

export const QuizAttendance = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quizzes, setQuizzes] = useState<AttendanceQuiz[]>([
    {
      id: '1',
      title: 'Daily Attendance Quiz - CS101',
      course: 'Computer Science 101',
      questions: [
        {
          id: '1',
          question: 'What is the time complexity of binary search?',
          options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
          correctAnswer: 1
        }
      ],
      timeLimit: 5,
      isActive: false,
      responses: 23,
      createdDate: '2024-06-14'
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    timeLimit: '5',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const [activeQuizTimer, setActiveQuizTimer] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuizTimer(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(quizId => {
          if (updated[quizId] > 0) {
            updated[quizId] -= 1;
          } else {
            // Auto-stop quiz when time is up
            const quiz = quizzes.find(q => q.id === quizId);
            if (quiz && quiz.isActive) {
              handleStopQuiz(quizId);
            }
            delete updated[quizId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizzes]);

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

    const newQuiz: AttendanceQuiz = {
      id: Date.now().toString(),
      title: formData.title,
      course: formData.course,
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

    setQuizzes([...quizzes, newQuiz]);
    setFormData({
      title: '',
      course: '',
      timeLimit: '5',
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    });
    setShowCreateForm(false);

    toast({
      title: "Quiz Created",
      description: `Attendance quiz "${newQuiz.title}" has been created successfully.`,
    });
  };

  const handleStartQuiz = (quizId: string) => {
    const timeLimit = quizzes.find(q => q.id === quizId)?.timeLimit || 5;
    setActiveQuizTimer(prev => ({ ...prev, [quizId]: timeLimit * 60 }));
    
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? { ...quiz, isActive: true, startTime: new Date() }
        : quiz
    ));

    toast({
      title: "Quiz Started",
      description: `Attendance quiz is now active for ${timeLimit} minutes.`,
    });
  };

  const handleStopQuiz = (quizId: string) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? { ...quiz, isActive: false, endTime: new Date() }
        : quiz
    ));

    setActiveQuizTimer(prev => {
      const updated = { ...prev };
      delete updated[quizId];
      return updated;
    });

    toast({
      title: "Quiz Stopped",
      description: "Attendance quiz has been stopped.",
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz-Based Attendance</h2>
          <p className="text-gray-600">Create timed quizzes for attendance tracking</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {showCreateForm && (
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
                  <Label htmlFor="course">Course</Label>
                  <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science 101">Computer Science 101</SelectItem>
                      <SelectItem value="Mathematics 201">Mathematics 201</SelectItem>
                      <SelectItem value="Physics 301">Physics 301</SelectItem>
                      <SelectItem value="Chemistry 101">Chemistry 101</SelectItem>
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
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Quizzes</CardTitle>
          <CardDescription>Manage your attendance verification quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Time Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.course}</TableCell>
                  <TableCell>{quiz.questions.length}</TableCell>
                  <TableCell>{quiz.timeLimit} min</TableCell>
                  <TableCell>
                    {quiz.isActive ? (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        {activeQuizTimer[quiz.id] && (
                          <span className="text-sm font-mono text-red-600">
                            {formatTime(activeQuizTimer[quiz.id])}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{quiz.responses}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {quiz.isActive ? (
                        <Button size="sm" variant="destructive" onClick={() => handleStopQuiz(quiz.id)}>
                          <Stop className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleStartQuiz(quiz.id)}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
