
import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'on_track':
      return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
    case 'overspent':
      return <Badge className="bg-red-100 text-red-800">Overspent</Badge>;
    case 'underutilized':
      return <Badge className="bg-yellow-100 text-yellow-800">Underutilized</Badge>;
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
    case 'approved':
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount);
};
