
import { Card, CardContent } from "@/components/ui/card";

interface AccessControlStatsProps {
  filteredStudents: any[];
  getStudentFinancialStatus: (studentId: string) => {
    status: string;
    balance: number;
    totalFees: number;
    totalPaid: number;
    percentagePaid: number;
    percentageOwing: number;
  };
}

export const AccessControlStats = ({ filteredStudents, getStudentFinancialStatus }: AccessControlStatsProps) => {
  const getStudentsByPercentageThreshold = (threshold: number) => {
    return filteredStudents.filter(student => {
      const financial = getStudentFinancialStatus(student.id);
      return financial.percentageOwing >= threshold;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">
          {filteredStudents.filter(s => getStudentFinancialStatus(s.id).percentageOwing === 0).length}
        </div>
        <div className="text-sm text-green-800">Fully Paid</div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">
          {filteredStudents.filter(s => {
            const p = getStudentFinancialStatus(s.id).percentageOwing;
            return p > 0 && p < 40;
          }).length}
        </div>
        <div className="text-sm text-blue-800">Partial (0-40%)</div>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {getStudentsByPercentageThreshold(40).filter(s => getStudentFinancialStatus(s.id).percentageOwing < 80).length}
        </div>
        <div className="text-sm text-yellow-800">40-80% Unpaid</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-orange-600">
          {getStudentsByPercentageThreshold(80).filter(s => getStudentFinancialStatus(s.id).percentageOwing < 100).length}
        </div>
        <div className="text-sm text-orange-800">80-100% Unpaid</div>
      </div>
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-red-600">
          {getStudentsByPercentageThreshold(100).length}
        </div>
        <div className="text-sm text-red-800">100% Unpaid</div>
      </div>
    </div>
  );
};
