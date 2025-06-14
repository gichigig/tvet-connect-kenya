
import { Button } from "@/components/ui/button";
import { Edit, Award, Calendar } from "lucide-react";
import { StaffMember } from "./types";

interface StaffActionsProps {
  staff: StaffMember;
  onScheduleAppraisal: (staff: StaffMember) => void;
}

export const StaffActions = ({ staff, onScheduleAppraisal }: StaffActionsProps) => {
  return (
    <div className="flex space-x-2">
      <Button size="sm" variant="outline">
        <Edit className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => onScheduleAppraisal(staff)}>
        <Award className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline">
        <Calendar className="w-4 h-4" />
      </Button>
    </div>
  );
};
