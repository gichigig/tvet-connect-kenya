import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

export const getStatusBadge = (status: string): ReactNode => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'paid':
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    case 'overdue':
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const getTypeBadge = (type: string): ReactNode => {
  switch (type) {
    case 'supplementary_exam':
      return <Badge className="bg-blue-100 text-blue-800">Supplementary Exam</Badge>;
    case 'special_exam':
      return <Badge className="bg-purple-100 text-purple-800">Special Exam</Badge>;
    case 'unit_retake':
      return <Badge className="bg-orange-100 text-orange-800">Unit Retake</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};
