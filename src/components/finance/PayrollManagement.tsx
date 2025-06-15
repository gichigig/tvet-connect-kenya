
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, DollarSign, Send, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/finance/FinanceContext";

interface PayrollRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  position: string;
  department: string;
  basicSalary: number;
  allowances: number;
  nssf: number;
  nhif: number;
  paye: number;
  netSalary: number;
  status: 'pending' | 'processed';
  month: string;
  bankAccount: string;
  taxPin: string;
}

export const PayrollManagement = () => {
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  const { createPayrollForAllEmployees, sendPayrollEmails } = useFinance();
  
  const users = getAllUsers();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'Payslip for {month} - {employeeName}',
    body: `Dear {employeeName},

Please find below your payslip for {month}:

EARNINGS:
Basic Salary: KSh {basicSalary}
Allowances: KSh {allowances}
Gross Pay: KSh {grossPay}

DEDUCTIONS:
NSSF: KSh 1,200
NHIF: KSh 1,700
PAYE: KSh {totalDeductions}
Total Deductions: KSh {totalDeductions}

NET PAY: KSh {netSalary}

Bank Account: {bankAccount}

Best regards,
Finance Department`
  });

  const handleGeneratePayroll = () => {
    const newPayrollRecords = createPayrollForAllEmployees(users);
    setPayrollRecords(newPayrollRecords);
    
    toast({
      title: "Payroll Generated",
      description: `Generated payroll for ${newPayrollRecords.length} employees.`,
    });
  };

  const handleProcessPayroll = (employeeId: string) => {
    setPayrollRecords(prev => prev.map(record => 
      record.id === employeeId ? { ...record, status: 'processed' as const } : record
    ));
    
    toast({
      title: "Payroll Processed",
      description: "Employee payroll has been processed.",
    });
  };

  const handleBulkProcess = () => {
    setPayrollRecords(prev => prev.map(record => ({ ...record, status: 'processed' as const })));
    
    toast({
      title: "Bulk Processing Complete",
      description: "All payroll records have been processed.",
    });
  };

  const handleSendEmails = async () => {
    if (payrollRecords.length === 0) {
      toast({
        title: "No Payroll Data",
        description: "Please generate payroll first.",
        variant: "destructive",
      });
      return;
    }

    await sendPayrollEmails(payrollRecords, emailTemplate);
    
    toast({
      title: "Emails Sent",
      description: `Payslips sent to ${payrollRecords.length} employees.`,
    });
  };

  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const totalGross = payrollRecords.reduce((sum, record) => sum + record.basicSalary + record.allowances, 0);
  const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.nssf + record.nhif + record.paye, 0);
  const processedCount = payrollRecords.filter(r => r.status === 'processed').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Payroll Management
          </CardTitle>
          <CardDescription>
            Generate and manage employee payroll with automated email distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalPayroll.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Total Net Payroll</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{payrollRecords.length}</div>
              <div className="text-sm text-green-800">Employees</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{processedCount}</div>
              <div className="text-sm text-purple-800">Processed</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">KSh {totalDeductions.toLocaleString()}</div>
              <div className="text-sm text-orange-800">Total Deductions</div>
            </div>
          </div>

          <Tabs defaultValue="payroll" className="space-y-4">
            <TabsList>
              <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
              <TabsTrigger value="email">Email Template</TabsTrigger>
              <TabsTrigger value="summary">Summary Report</TabsTrigger>
            </TabsList>

            <TabsContent value="payroll" className="space-y-4">
              <div className="flex space-x-4 mb-4">
                <Button onClick={handleGeneratePayroll}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Payroll
                </Button>
                <Button onClick={handleBulkProcess} disabled={payrollRecords.length === 0}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Process All
                </Button>
                <Button onClick={handleSendEmails} disabled={payrollRecords.length === 0}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Payslips
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => {
                    const grossPay = record.basicSalary + record.allowances;
                    const totalRecordDeductions = record.nssf + record.nhif + record.paye;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.name}</div>
                            <div className="text-sm text-gray-500">{record.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{record.position}</TableCell>
                        <TableCell>KSh {record.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>KSh {record.allowances.toLocaleString()}</TableCell>
                        <TableCell>KSh {grossPay.toLocaleString()}</TableCell>
                        <TableCell>KSh {totalRecordDeductions.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">KSh {record.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'processed' ? 'default' : 'secondary'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.status === 'pending' && (
                            <Button size="sm" onClick={() => handleProcessPayroll(record.id)}>
                              Process
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Subject</label>
                  <Input
                    value={emailTemplate.subject}
                    onChange={(e) => setEmailTemplate(prev => ({...prev, subject: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Body</label>
                  <Textarea
                    value={emailTemplate.body}
                    onChange={(e) => setEmailTemplate(prev => ({...prev, body: e.target.value}))}
                    rows={15}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Available placeholders:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{"{employeeName}"} - Employee's full name</li>
                    <li>{"{month}"} - Current month and year</li>
                    <li>{"{basicSalary}"} - Basic salary amount</li>
                    <li>{"{allowances}"} - Allowances amount</li>
                    <li>{"{grossPay}"} - Gross pay amount</li>
                    <li>{"{totalDeductions}"} - Total deductions</li>
                    <li>{"{netSalary}"} - Net salary amount</li>
                    <li>{"{bankAccount}"} - Bank account number</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Employees:</span>
                        <span className="font-medium">{payrollRecords.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Basic Salaries:</span>
                        <span className="font-medium">KSh {payrollRecords.reduce((sum, r) => sum + r.basicSalary, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Allowances:</span>
                        <span className="font-medium">KSh {payrollRecords.reduce((sum, r) => sum + r.allowances, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Gross Pay:</span>
                        <span>KSh {totalGross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Deductions:</span>
                        <span className="font-medium text-red-600">KSh {totalDeductions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total Net Payroll:</span>
                        <span className="text-green-600">KSh {totalPayroll.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processing Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Pending Processing:</span>
                        <span className="font-medium text-orange-600">{payrollRecords.filter(r => r.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processed:</span>
                        <span className="font-medium text-green-600">{processedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Rate:</span>
                        <span className="font-medium">{payrollRecords.length > 0 ? Math.round((processedCount / payrollRecords.length) * 100) : 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
