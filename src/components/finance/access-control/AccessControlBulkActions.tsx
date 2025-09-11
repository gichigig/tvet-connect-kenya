
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

interface AccessControlBulkActionsProps {
  filteredStudents: any[];
  getStudentFinancialStatus: (studentId: string) => {
    status: string;
    balance: number;
    totalFees: number;
    totalPaid: number;
    percentagePaid: number;
    percentageOwing: number;
  };
  handleBulkBlockByPercentage: (threshold: number) => void;
}

export const AccessControlBulkActions = ({ 
  filteredStudents, 
  getStudentFinancialStatus, 
  handleBulkBlockByPercentage 
}: AccessControlBulkActionsProps) => {
  const getStudentsByPercentageThreshold = (threshold: number) => {
    return filteredStudents.filter(student => {
      const financial = getStudentFinancialStatus(student.id);
      return financial.percentageOwing >= threshold;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Button
        onClick={() => handleBulkBlockByPercentage(40)}
        variant="outline"
        className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
      >
        <Ban className="w-4 h-4 mr-2" />
        Block 40%+ Unpaid ({getStudentsByPercentageThreshold(40).length})
      </Button>
      <Button
        onClick={() => handleBulkBlockByPercentage(80)}
        variant="outline" 
        className="border-orange-500 text-orange-700 hover:bg-orange-50"
      >
        <Ban className="w-4 h-4 mr-2" />
        Block 80%+ Unpaid ({getStudentsByPercentageThreshold(80).length})
      </Button>
      <Button
        onClick={() => handleBulkBlockByPercentage(100)}
        variant="destructive"
      >
        <Ban className="w-4 h-4 mr-2" />
        Block 100% Unpaid ({getStudentsByPercentageThreshold(100).length})
      </Button>
      <div className="flex items-center justify-center bg-gray-50 rounded p-2">
        <span className="text-sm text-gray-600">
          {filteredStudents.filter(s => s.blocked).length} Currently Blocked
        </span>
      </div>
    </div>
  );
};
