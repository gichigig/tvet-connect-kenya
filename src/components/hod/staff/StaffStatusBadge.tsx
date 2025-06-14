
import { Badge } from "@/components/ui/badge";

interface StaffStatusBadgeProps {
  status: string;
}

export const StaffStatusBadge = ({ status }: StaffStatusBadgeProps) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case 'leave':
      return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>;
    case 'probation':
      return <Badge className="bg-orange-100 text-orange-800">Probation</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
