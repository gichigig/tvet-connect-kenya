
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, PenTool, Award, AlertCircle, CheckCircle } from "lucide-react";

interface ExamQuiz {
  id: string;
  title: string;
  unitCode: string;
  unitName: string;
  type: 'exam' | 'quiz' | 'cat' | 'assignment';
  status: 'upcoming' | 'active' | 'completed' | 'graded';
  dueDate: string;
  duration: string;
  totalMarks: number;
  obtainedMarks?: number;
  attempts: number;
  maxAttempts: number;
  startDate: string;
  description: string;
}

const examsQuizzes: ExamQuiz[] = [
  {
    id: "1",
    title: "Mid-Semester Exam",
    unitCode: "SE101",
    unitName: "Introduction to Software Engineering",
    type: 'exam',
    status: 'upcoming',
    dueDate: "2024-02-15",
    duration: "3 hours",
    totalMarks: 100,
    attempts: 0,
    maxAttempts: 1,
    startDate: "2024-02-15",
    description: "Comprehensive examination covering software engineering principles and methodologies"
  },
  {
    id: "2",
    title: "Database Design Quiz",
    unitCode: "DB201",
    unitName: "Database Management Systems",
    type: 'quiz',
    status: 'active',
    dueDate: "2024-01-25",
    duration: "45 minutes",
    totalMarks: 20,
    attempts: 0,
    maxAttempts: 2,
    startDate: "2024-01-20",
    description: "Quick assessment on database design and normalization concepts"
  },
  {
    id: "3",
    title: "Programming CAT 1",
    unitCode: "PROG101",
    unitName: "Programming Fundamentals",
    type: 'cat',
    status: 'graded',
    dueDate: "2024-01-18",
    duration: "1.5 hours",
    totalMarks: 50,
    obtainedMarks: 42,
    attempts: 1,
    maxAttempts: 1,
    startDate: "2024-01-18",
    description: "Continuous Assessment Test covering basic programming concepts"
  },
  {
    id: "4",
    title: "Web Development Assignment",
    unitCode: "WEB301",
    unitName: "Web Development",
    type: 'assignment',
    status: 'completed',
    dueDate: "2024-01-22",
    duration: "1 week",
    totalMarks: 30,
    attempts: 1,
    maxAttempts: 1,
    startDate: "2024-01-15",
    description: "Create a responsive portfolio website using HTML, CSS, and JavaScript"
  }
];

export const ExamsQuizzes = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'graded'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exam' | 'quiz' | 'cat' | 'assignment'>('all');

  const filteredItems = examsQuizzes.filter(item => {
    const matchesStatus = filter === 'all' || item.status === filter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'quiz':
        return 'bg-blue-100 text-blue-800';
      case 'cat':
        return 'bg-orange-100 text-orange-800';
      case 'assignment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'graded':
        return <Award className="w-4 h-4" />;
      default:
        return <PenTool className="w-4 h-4" />;
    }
  };

  const handleStartExam = (item: ExamQuiz) => {
    console.log(`Starting ${item.type}: ${item.title}`);
  };

  const handleViewResults = (item: ExamQuiz) => {
    console.log(`Viewing results for: ${item.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exams & Quizzes</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'upcoming', 'active', 'completed', 'graded'].map((status) => (
              <Button 
                key={status}
                variant={filter === status ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'exam', 'quiz', 'cat', 'assignment'].map((type) => (
              <Button 
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter(type as any)}
              >
                {type === 'cat' ? 'CAT' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.unitCode} - {item.unitName}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(item.type)}>
                    {item.type === 'cat' ? 'CAT' : item.type.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status.toUpperCase()}
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{item.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{item.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  <span>{item.totalMarks} marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{item.attempts}/{item.maxAttempts} attempts</span>
                </div>
              </div>

              {item.status === 'graded' && item.obtainedMarks !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span>{item.obtainedMarks}/{item.totalMarks} ({Math.round((item.obtainedMarks / item.totalMarks) * 100)}%)</span>
                  </div>
                  <Progress value={(item.obtainedMarks / item.totalMarks) * 100} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {item.status === 'active' && item.attempts < item.maxAttempts && (
                  <Button 
                    onClick={() => handleStartExam(item)}
                    className="flex-1"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    Start {item.type === 'cat' ? 'CAT' : item.type}
                  </Button>
                )}
                
                {item.status === 'upcoming' && (
                  <Button variant="outline" className="flex-1" disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    Scheduled
                  </Button>
                )}
                
                {(item.status === 'completed' || item.status === 'graded') && (
                  <Button 
                    onClick={() => handleViewResults(item)}
                    variant="outline" 
                    className="flex-1"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                )}
                
                {item.status === 'active' && item.attempts >= item.maxAttempts && (
                  <Button variant="outline" className="flex-1" disabled>
                    No attempts left
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No exams or quizzes found for the selected filters.
          </p>
        </div>
      )}
    </div>
  );
};
