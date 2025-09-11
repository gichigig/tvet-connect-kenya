
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamActions } from "./ExamActions";
import { CreatedContent } from "@/contexts/auth/types";
import { useToast } from "@/hooks/use-toast";

interface ExamTableProps {
  exams: (CreatedContent | any)[];
  type: 'cats' | 'exams';
}

export const ExamTable = ({ exams, type }: ExamTableProps) => {
  const { toast } = useToast();
  
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString?: string | Date) => {
    if (!timeString) return 'N/A';
    if (typeof timeString === 'string' && timeString.includes(':')) {
      // Handle time string format like "14:30"
      return timeString;
    }
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewExam = (examId: string) => {
    toast({
      title: "View Exam",
      description: "Exam viewing functionality will be implemented here.",
      duration: 3000,
    });
  };

  const handleEditExam = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (exam?.isFromSemesterPlan) {
      toast({
        title: "Edit in Semester Planning",
        description: `This ${type === 'cats' ? 'CAT' : 'exam'} was created through semester planning. Please edit it in the Semester Planning tab.`,
        duration: 3000,
      });
    } else {
      toast({
        title: `Edit ${type === 'cats' ? 'CAT' : 'Exam'}`,
        description: `${type === 'cats' ? 'CAT' : 'Exam'} editing functionality will be implemented here.`,
        duration: 3000,
      });
    }
  };

  const handleDeleteExam = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (exam?.isFromSemesterPlan) {
      toast({
        title: "Cannot Delete",
        description: `${type === 'cats' ? 'CATs' : 'Exams'} from semester plans cannot be deleted here. Edit them in the Semester Planning tab.`,
        variant: "destructive",
        duration: 3000,
      });
    } else {
      toast({
        title: `Delete ${type === 'cats' ? 'CAT' : 'Exam'}`,
        description: `${type === 'cats' ? 'CAT' : 'Exam'} deletion functionality will be implemented here.`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Duration</TableHead>
          {type === 'exams' && <TableHead>Venue</TableHead>}
          <TableHead>Questions</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="font-medium">{exam.title}</TableCell>
            <TableCell>{exam.unitName || exam.unitCode || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(exam.examDate || exam.scheduledDate)}</span>
                <Clock className="w-4 h-4 text-gray-400 ml-2" />
                <span>{formatTime(exam.examTime || exam.scheduledDate)}</span>
              </div>
            </TableCell>
            <TableCell>{exam.duration || 0} min</TableCell>
            {type === 'exams' && <TableCell>{exam.venue || 'N/A'}</TableCell>}
            <TableCell>{exam.questions?.length || 0}</TableCell>
            <TableCell>
              {exam.isFromSemesterPlan ? (
                <Badge className="bg-blue-100 text-blue-800">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Week {exam.weekNumber}
                </Badge>
              ) : (
                <Badge variant="outline">Manual</Badge>
              )}
            </TableCell>
            <TableCell>
              <ExamStatusBadge status={exam.status || exam.approvalStatus || 'draft'} />
            </TableCell>
            <TableCell>
              <ExamActions 
                examId={exam.id}
                onView={handleViewExam}
                onEdit={handleEditExam}
                onDelete={handleDeleteExam}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
