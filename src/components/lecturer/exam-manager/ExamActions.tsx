
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ExamActionsProps {
  examId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ExamActions = ({ examId, onView, onEdit, onDelete }: ExamActionsProps) => {
  return (
    <div className="flex space-x-2">
      <Button size="sm" variant="outline" onClick={() => onView?.(examId)}>
        <Eye className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => onEdit?.(examId)}>
        <Edit className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => onDelete?.(examId)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
