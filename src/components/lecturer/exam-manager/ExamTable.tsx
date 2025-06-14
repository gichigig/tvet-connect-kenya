
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock } from "lucide-react";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamActions } from "./ExamActions";
import { CreatedContent } from "@/contexts/auth/types";

interface ExamTableProps {
  exams: CreatedContent[];
  type: 'cats' | 'exams';
}

export const ExamTable = ({ exams, type }: ExamTableProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="font-medium">{exam.title}</TableCell>
            <TableCell>{exam.unitName || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(exam.scheduledDate)}</span>
                <Clock className="w-4 h-4 text-gray-400 ml-2" />
                <span>{formatTime(exam.scheduledDate)}</span>
              </div>
            </TableCell>
            <TableCell>{exam.duration} min</TableCell>
            {type === 'exams' && <TableCell>{exam.venue}</TableCell>}
            <TableCell>{exam.questions?.length || 0}</TableCell>
            <TableCell>
              <ExamStatusBadge status={exam.status} />
            </TableCell>
            <TableCell>
              <ExamActions examId={exam.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
