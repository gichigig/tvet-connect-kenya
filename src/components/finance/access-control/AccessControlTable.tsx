
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AccessControlTableProps {
  filteredStudents: any[];
  getStudentFinancialStatus: (studentId: string) => {
    status: string;
    balance: number;
    totalFees: number;
    totalPaid: number;
    percentagePaid: number;
    percentageOwing: number;
  };
  handleToggleAccess: (studentId: string, isBlocked: boolean) => void;
}

export const AccessControlTable = ({ 
  filteredStudents, 
  getStudentFinancialStatus, 
  handleToggleAccess 
}: AccessControlTableProps) => {
  const getStatusBadge = (status: string, percentageOwing: number) => {
    if (percentageOwing >= 100) {
      return <Badge className="bg-red-100 text-red-800">100% Unpaid</Badge>;
    } else if (percentageOwing >= 80) {
      return <Badge className="bg-red-100 text-red-800">80%+ Unpaid</Badge>;
    } else if (percentageOwing >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">40%+ Unpaid</Badge>;
    } else if (percentageOwing > 0) {
      return <Badge className="bg-blue-100 text-blue-800">Partial Payment</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Cleared</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Admission No.</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Amount Owed</TableHead>
          <TableHead>% Unpaid</TableHead>
          <TableHead>Access Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredStudents.map((student) => {
          const financial = getStudentFinancialStatus(student.id);
          return (
            <TableRow key={student.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{student.firstName} {student.lastName}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </div>
              </TableCell>
              <TableCell>{student.admissionNumber}</TableCell>
              <TableCell>{getStatusBadge(financial.status, financial.percentageOwing)}</TableCell>
              <TableCell>
                {financial.balance > 0 ? (
                  <span className="text-red-600 font-medium">
                    KSh {financial.balance.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-green-600">Cleared</span>
                )}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${
                  financial.percentageOwing >= 80 ? 'text-red-600' :
                  financial.percentageOwing >= 40 ? 'text-yellow-600' :
                  financial.percentageOwing > 0 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {financial.percentageOwing.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>
                {student.blocked ? (
                  <Badge variant="destructive">Blocked</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant={student.blocked ? "default" : "destructive"}
                  onClick={() => handleToggleAccess(student.id, student.blocked || false)}
                >
                  {student.blocked ? 'Restore Access' : 'Block Access'}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
