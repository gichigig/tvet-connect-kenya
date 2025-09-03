
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface NotificationStatsProps {
  getStudentFinancialInfo: (studentId: string) => {
    totalOwed: number;
    totalFees: number;
    totalPaid: number;
    percentagePaid: number;
    percentageOwing: number;
  };
}

export const NotificationStats = ({ getStudentFinancialInfo }: NotificationStatsProps) => {
  const { getAllUsers } = useAuth();

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const getStudentsWithOutstanding = () => {
    return students.filter(student => {
      const financial = getStudentFinancialInfo(student.id);
      return financial.totalOwed > 0;
    });
  };

  const getStudentsByPercentageThreshold = (threshold: number) => {
    return students.filter(student => {
      const financial = getStudentFinancialInfo(student.id);
      return financial.percentageOwing >= threshold;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">
          {getStudentsWithOutstanding().length}
        </div>
        <div className="text-sm text-blue-800">Outstanding Balances</div>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {getStudentsByPercentageThreshold(40).length}
        </div>
        <div className="text-sm text-yellow-800">40%+ Unpaid</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-orange-600">
          {getStudentsByPercentageThreshold(80).length}
        </div>
        <div className="text-sm text-orange-800">80%+ Unpaid</div>
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
