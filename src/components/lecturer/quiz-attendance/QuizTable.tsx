
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Eye } from "lucide-react";
import { AttendanceQuiz } from "./types";

interface QuizTableProps {
  quizzes: AttendanceQuiz[];
  activeQuizTimer: { [key: string]: number };
  onStartQuiz: (quizId: string) => void;
  onStopQuiz: (quizId: string) => void;
}

export const QuizTable = ({ quizzes, activeQuizTimer, onStartQuiz, onStopQuiz }: QuizTableProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Quizzes</CardTitle>
        <CardDescription>Manage your attendance verification quizzes</CardDescription>
      </CardHeader>
      <CardContent>
        {quizzes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Unit</TableHead>
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
                  <TableCell>{quiz.unitCode} - {quiz.unitName}</TableCell>
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
                        <Button size="sm" variant="destructive" onClick={() => onStopQuiz(quiz.id)}>
                          <Square className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => onStartQuiz(quiz.id)}>
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No attendance quizzes created yet.</p>
            <p className="text-sm">Create your first quiz using the button above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
