
// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { QuizForm } from "./quiz-attendance/QuizForm";
import { QuizTable } from "./quiz-attendance/QuizTable";
import { AttendanceQuiz } from "./quiz-attendance/types";

export const QuizAttendance = () => {
  const { toast } = useToast();
  const { user, createdUnits } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [quizzes, setQuizzes] = useState<AttendanceQuiz[]>([]);
  const [activeQuizTimer, setActiveQuizTimer] = useState<{ [key: string]: number }>({});

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

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

  const handleCreateQuiz = (newQuiz: AttendanceQuiz) => {
    setQuizzes([...quizzes, newQuiz]);
    setShowCreateForm(false);
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
        <QuizForm 
          assignedUnits={assignedUnits}
          onCreateQuiz={handleCreateQuiz}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <QuizTable 
        quizzes={quizzes}
        activeQuizTimer={activeQuizTimer}
        onStartQuiz={handleStartQuiz}
        onStopQuiz={handleStopQuiz}
      />
    </div>
  );
};
