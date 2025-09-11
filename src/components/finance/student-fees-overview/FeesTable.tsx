
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { StudentFee } from "@/contexts/auth/types";
import { getStatusBadge, getTypeBadge } from "./feeUtils.tsx";

interface FeesTableProps {
  fees: StudentFee[];
  onMarkAsPaid: (feeId: string, studentName: string) => void;
  onMarkAsOverdue: (feeId: string, studentName: string) => void;
}

export const FeesTable = ({ fees, onMarkAsPaid, onMarkAsOverdue }: FeesTableProps) => {
  if (fees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No student fees found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Fee Type</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.id}>
            <TableCell>
              <div>
                <div className="font-medium">{fee.studentName}</div>
                <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{fee.unitCode}</div>
                <div className="text-sm text-gray-500">{fee.unitName}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">KSh {fee.amount.toLocaleString()}</div>
            </TableCell>
            <TableCell>{fee.dueDate}</TableCell>
            <TableCell>{getStatusBadge(fee.status)}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {fee.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onMarkAsPaid(fee.id, fee.studentName)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onMarkAsOverdue(fee.id, fee.studentName)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Mark Overdue
                    </Button>
                  </>
                )}
                {fee.status === 'overdue' && (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsPaid(fee.id, fee.studentName)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Paid
                  </Button>
                )}
                {fee.status === 'paid' && fee.paidDate && (
                  <div className="text-sm text-gray-500">
                    Paid: {fee.paidDate}
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
