
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { file-bar-chart, file } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const FinancialReports = () => {
  const { toast } = useToast();
  const { studentFees, paymentRecords, getAllUsers, clearanceForms } = useAuth();
  const [reportType, setReportType] = useState("");
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [semester, setSemester] = useState("1");

  const generateCollectionReport = () => {
    const filteredFees = studentFees.filter(fee => 
      fee.academicYear === academicYear && fee.semester === parseInt(semester)
    );

    const totalExpected = filteredFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalCollected = filteredFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected * 100).toFixed(2) : 0;

    const reportData = `
UNIVERSITY FEE COLLECTION REPORT
Academic Year: ${academicYear} - Semester ${semester}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Expected: KSh ${totalExpected.toLocaleString()}
Total Collected: KSh ${totalCollected.toLocaleString()}
Outstanding: KSh ${(totalExpected - totalCollected).toLocaleString()}
Collection Rate: ${collectionRate}%

BREAKDOWN BY FEE TYPE
${['tuition', 'exam', 'library', 'lab', 'activity'].map(type => {
  const typeFees = filteredFees.filter(f => f.feeType === type);
  const typeExpected = typeFees.reduce((sum, fee) => sum + fee.amount, 0);
  const typeCollected = typeFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  return `${type.toUpperCase()}: Expected KSh ${typeExpected.toLocaleString()}, Collected KSh ${typeCollected.toLocaleString()}`;
}).join('\n')}

DETAILED BREAKDOWN
${filteredFees.map(fee => 
  `${fee.studentName} - ${fee.feeType} - Expected: KSh ${fee.amount.toLocaleString()} - Paid: KSh ${(fee.paidAmount || 0).toLocaleString()} - Status: ${fee.status}`
).join('\n')}
    `;

    downloadReport(reportData, `collection_report_${academicYear}_sem${semester}.txt`);
  };

  const generateDefaultersReport = () => {
    const students = getAllUsers().filter(user => user.role === 'student' && user.approved);
    const defaulters = students.filter(student => {
      const studentBalance = studentFees
        .filter(fee => fee.studentId === student.id && fee.status !== 'paid')
        .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
      return studentBalance > 0;
    });

    const reportData = `
UNIVERSITY DEFAULTERS REPORT
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Students: ${students.length}
Students with Outstanding Fees: ${defaulters.length}
Percentage: ${((defaulters.length / students.length) * 100).toFixed(2)}%

DEFAULTERS LIST
${defaulters.map(student => {
  const balance = studentFees
    .filter(fee => fee.studentId === student.id && fee.status !== 'paid')
    .reduce((total, fee) => total + (fee.amount - (fee.paidAmount || 0)), 0);
  return `${student.firstName} ${student.lastName} - ${student.admissionNumber} - Outstanding: KSh ${balance.toLocaleString()}`;
}).join('\n')}
    `;

    downloadReport(reportData, `defaulters_report_${new Date().toISOString().split('T')[0]}.txt`);
  };

  const generateClearanceReport = () => {
    const reportData = `
UNIVERSITY CLEARANCE REPORT
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Clearance Forms: ${clearanceForms.length}
Pending Clearances: ${clearanceForms.filter(c => c.status === 'pending').length}
Cleared Students: ${clearanceForms.filter(c => c.status === 'cleared').length}
Blocked Students: ${clearanceForms.filter(c => c.status === 'blocked').length}

DETAILED BREAKDOWN
${clearanceForms.map(clearance => 
  `${clearance.studentName} - Status: ${clearance.status} - Outstanding: KSh ${clearance.outstandingBalance.toLocaleString()}`
).join('\n')}
    `;

    downloadReport(reportData, `clearance_report_${new Date().toISOString().split('T')[0]}.txt`);
  };

  const generatePaymentReport = () => {
    const filteredPayments = paymentRecords.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const isCurrentYear = paymentDate.getFullYear() === new Date().getFullYear();
      return isCurrentYear;
    });

    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const paymentMethods = ['cash', 'bank_transfer', 'mobile_money', 'cheque'];

    const reportData = `
UNIVERSITY PAYMENT REPORT
Year: ${new Date().getFullYear()}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Payments: ${filteredPayments.length}
Total Amount: KSh ${totalAmount.toLocaleString()}

BREAKDOWN BY PAYMENT METHOD
${paymentMethods.map(method => {
  const methodPayments = filteredPayments.filter(p => p.paymentMethod === method);
  const methodAmount = methodPayments.reduce((sum, p) => sum + p.amount, 0);
  return `${method.toUpperCase()}: ${methodPayments.length} payments - KSh ${methodAmount.toLocaleString()}`;
}).join('\n')}

MONTHLY BREAKDOWN
${Array.from({length: 12}, (_, i) => {
  const month = i + 1;
  const monthPayments = filteredPayments.filter(p => new Date(p.paymentDate).getMonth() + 1 === month);
  const monthAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  return `Month ${month}: ${monthPayments.length} payments - KSh ${monthAmount.toLocaleString()}`;
}).join('\n')}
    `;

    downloadReport(reportData, `payment_report_${new Date().getFullYear()}.txt`);
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: `${filename} has been downloaded successfully.`,
    });
  };

  const handleGenerateReport = () => {
    switch (reportType) {
      case 'collection':
        generateCollectionReport();
        break;
      case 'defaulters':
        generateDefaultersReport();
        break;
      case 'clearance':
        generateClearanceReport();
        break;
      case 'payments':
        generatePaymentReport();
        break;
      default:
        toast({
          title: "Select Report Type",
          description: "Please select a report type to generate.",
          variant: "destructive",
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <file-bar-chart className="w-5 h-5" />
          Financial Reports
        </CardTitle>
        <CardDescription>
          Generate comprehensive financial reports for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collection">Fee Collection Report</SelectItem>
                <SelectItem value="defaulters">Defaulters Report</SelectItem>
                <SelectItem value="clearance">Clearance Report</SelectItem>
                <SelectItem value="payments">Payment Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Academic Year</label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2023/2024">2023/2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Semester</label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleGenerateReport} className="w-full">
              <file className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {studentFees.filter(f => f.status === 'paid').length}
            </div>
            <div className="text-sm text-blue-800">Completed Payments</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {studentFees.filter(f => f.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-800">Pending Payments</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {studentFees.filter(f => f.status === 'overdue').length}
            </div>
            <div className="text-sm text-red-800">Overdue Payments</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {((studentFees.filter(f => f.status === 'paid').length / studentFees.length) * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-green-800">Collection Rate</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Available Reports</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-medium">Fee Collection Report</h5>
              <p className="text-sm text-gray-600">Detailed analysis of fee collection by semester and course</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-medium">Defaulters Report</h5>
              <p className="text-sm text-gray-600">List of students with outstanding fee balances</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-medium">Clearance Report</h5>
              <p className="text-sm text-gray-600">Student clearance status and financial standings</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-medium">Payment Analysis</h5>
              <p className="text-sm text-gray-600">Payment trends and method breakdowns</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
