// Staff Status Badge Component
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

interface StaffStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  className?: string;
}

export const StaffStatusBadge = ({ status, className }: StaffStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          variant: 'secondary' as const,
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
      case 'pending':
        return {
          label: 'Pending',
          variant: 'outline' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
        };
      case 'suspended':
        return {
          label: 'Suspended',
          variant: 'destructive' as const,
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1 ${config.className} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
