// Staff Actions Component
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  FileText,
  Calendar,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

interface StaffActionsProps {
  staff: StaffMember;
  onView?: (staff: StaffMember) => void;
  onEdit?: (staff: StaffMember) => void;
  onDelete?: (staff: StaffMember) => void;
  onActivate?: (staff: StaffMember) => void;
  onDeactivate?: (staff: StaffMember) => void;
  onSendEmail?: (staff: StaffMember) => void;
  onViewSchedule?: (staff: StaffMember) => void;
  onViewPerformance?: (staff: StaffMember) => void;
  onGenerateReport?: (staff: StaffMember) => void;
}

export const StaffActions = ({ 
  staff, 
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onSendEmail,
  onViewSchedule,
  onViewPerformance,
  onGenerateReport
}: StaffActionsProps) => {
  const { toast } = useToast();

  const handleAction = (action: () => void, actionName: string) => {
    try {
      action();
      toast({
        title: "Action Completed",
        description: `${actionName} for ${staff.firstName} ${staff.lastName}`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${actionName.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onView && (
          <DropdownMenuItem onClick={() => handleAction(() => onView(staff), "View details")}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        
        {onEdit && (
          <DropdownMenuItem onClick={() => handleAction(() => onEdit(staff), "Edit staff")}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {onViewSchedule && (
          <DropdownMenuItem onClick={() => handleAction(() => onViewSchedule(staff), "View schedule")}>
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </DropdownMenuItem>
        )}
        
        {onViewPerformance && (
          <DropdownMenuItem onClick={() => handleAction(() => onViewPerformance(staff), "View performance")}>
            <Award className="mr-2 h-4 w-4" />
            Performance
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {onSendEmail && (
          <DropdownMenuItem onClick={() => handleAction(() => onSendEmail(staff), "Send email")}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
        )}
        
        {onGenerateReport && (
          <DropdownMenuItem onClick={() => handleAction(() => onGenerateReport(staff), "Generate report")}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {staff.status === 'active' && onDeactivate && (
          <DropdownMenuItem 
            onClick={() => handleAction(() => onDeactivate(staff), "Deactivate staff")}
            className="text-orange-600"
          >
            <UserX className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        )}
        
        {staff.status !== 'active' && onActivate && (
          <DropdownMenuItem 
            onClick={() => handleAction(() => onActivate(staff), "Activate staff")}
            className="text-green-600"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}
        
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}?`)) {
                handleAction(() => onDelete(staff), "Delete staff");
              }
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
