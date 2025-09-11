
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { StudentFee } from "@/contexts/auth/types";

interface FeesSummaryCardsProps {
  studentFees: StudentFee[];
}

export const FeesSummaryCards = ({ studentFees }: FeesSummaryCardsProps) => {
  const totalPending = studentFees.filter(f => f.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = studentFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const totalOverdue = studentFees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">KSh {totalPending.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Fees</p>
              <p className="text-2xl font-bold text-green-600">KSh {totalPaid.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Fees</p>
              <p className="text-2xl font-bold text-red-600">KSh {totalOverdue.toLocaleString()}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
