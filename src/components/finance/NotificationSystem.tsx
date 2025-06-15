
import { useAuth } from "@/contexts/AuthContext";
import { BulkActions } from "./notification-system/BulkActions";
import { CustomNotificationForm } from "./notification-system/CustomNotificationForm";
import { NotificationStats } from "./notification-system/NotificationStats";

export const NotificationSystem = () => {
  const { studentFees } = useAuth();

  const getStudentFinancialInfo = (studentId: string) => {
    const studentFeeRecords = studentFees.filter(fee => fee.studentId === studentId);
    const totalOwed = studentFeeRecords
      .filter(fee => fee.status !== 'paid')
      .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
    
    const totalFees = studentFeeRecords.reduce((total, fee) => total + fee.amount, 0);
    const totalPaid = studentFeeRecords.reduce((total, fee) => total + (fee.paidAmount || 0), 0);
    
    const percentagePaid = totalFees > 0 ? (totalPaid / totalFees) * 100 : 100;
    const percentageOwing = 100 - percentagePaid;
    
    return {
      totalOwed,
      totalFees,
      totalPaid,
      percentagePaid,
      percentageOwing
    };
  };

  return (
    <div className="space-y-6">
      <BulkActions getStudentFinancialInfo={getStudentFinancialInfo} />
      
      <NotificationStats getStudentFinancialInfo={getStudentFinancialInfo} />

      <CustomNotificationForm getStudentFinancialInfo={getStudentFinancialInfo} />
    </div>
  );
};
