
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PayrollManagement = () => {
  const { toast } = useToast();
  const [payrollRecords, setPayrollRecords] = useState([
    { 
      id: '1', 
      employeeId: 'EMP001', 
      name: 'Dr. John Kamau', 
      position: 'Senior Lecturer', 
      basicSalary: 120000, 
      allowances: 25000, 
      nssf: 1200, 
      nhif: 1700, 
      paye: 28000, 
      netSalary: 114100,
      status: 'processed',
      month: 'December 2024'
    },
    { 
      id: '2', 
      employeeId: 'EMP002', 
      name: 'Mary Wanjiku', 
      position: 'Lecturer', 
      basicSalary: 85000, 
      allowances: 18000, 
      nssf: 1200, 
      nhif: 1700, 
      paye: 15500, 
      netSalary: 84600,
      status: 'pending',
      month: 'December 2024'
    }
  ]);

  const [selectedMonth, setSelectedMonth] = useState('December 2024');

  const processPayroll = (recordId: string) => {
    setPayrollRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status: 'processed' as const }
          : record
      )
    );
    
    toast({
      title: "Payroll Processed",
      description: "Employee salary has been processed successfully.",
    });
  };

  const generatePayslip = (record: any) => {
    const payslipData = `
PAYSLIP - ${record.month}
Employee: ${record.name} (${record.employeeId})
Position: ${record.position}

EARNINGS:
Basic Salary: KSh ${record.basicSalary.toLocaleString()}
Allowances: KSh ${record.allowances.toLocaleString()}
Gross Pay: KSh ${(record.basicSalary + record.allowances).toLocaleString()}

DEDUCTIONS:
NSSF: KSh ${record.nssf.toLocaleString()}
NHIF: KSh ${record.nhif.toLocaleString()}
PAYE: KSh ${record.paye.toLocaleString()}
Total Deductions: KSh ${(record.nssf + record.nhif + record.paye).toLocaleString()}

NET PAY: KSh ${record.netSalary.toLocaleString()}

Generated: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([payslipData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${record.employeeId}_${record.month.replace(' ', '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Payslip Generated",
      description: `Payslip for ${record.name} has been downloaded.`,
    });
  };

  const totalGross = payrollRecords.reduce((sum, record) => sum + record.basicSalary + record.allowances, 0);
  const totalNet = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const totalDeductions = totalGross - totalNet;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Salaries & Payroll Management
          </CardTitle>
          <CardDescription>
            Process staff salaries, manage deductions, and make lecturers smile on payday
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">KSh {totalGross.toLocaleString()}</div>
              <div className="text-sm text-green-800">Total Gross Pay</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalNet.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Total Net Pay</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">KSh {totalDeductions.toLocaleString()}</div>
              <div className="text-sm text-orange-800">Total Deductions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{payrollRecords.length}</div>
              <div className="text-sm text-purple-800">Employees</div>
            </div>
          </div>

          <Tabs defaultValue="payroll" className="space-y-4">
            <TabsList>
              <TabsTrigger value="payroll">Monthly Payroll</TabsTrigger>
              <TabsTrigger value="deductions">Statutory Deductions</TabsTrigger>
              <TabsTrigger value="benefits">Benefits & Allowances</TabsTrigger>
              <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="payroll" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="December 2024">December 2024</SelectItem>
                    <SelectItem value="November 2024">November 2024</SelectItem>
                    <SelectItem value="October 2024">October 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Process All Payroll</Button>
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
                  {payrollRecords.filter(record => record.month === selectedMonth).map((record) => {
                    const grossPay = record.basicSalary + record.allowances;
                    const totalDeductions = record.nssf + record.nhif + record.paye;
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
                        <TableCell>KSh {totalDeductions.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">KSh {record.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'processed' ? 'default' : 'secondary'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {record.status === 'pending' && (
                              <Button size="sm" onClick={() => processPayroll(record.id)}>
                                Process
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => generatePayslip(record)}>
                              Payslip
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="deductions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>NSSF Contributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Employee Rate:</span>
                        <span>6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employer Rate:</span>
                        <span>6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum:</span>
                        <span>KSh 2,160</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Monthly:</span>
                        <span>KSh {payrollRecords.reduce((sum, r) => sum + r.nssf, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>NHIF Contributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Based on Salary:</span>
                        <span>Graduated Scale</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum:</span>
                        <span>KSh 150</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum:</span>
                        <span>KSh 1,700</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Monthly:</span>
                        <span>KSh {payrollRecords.reduce((sum, r) => sum + r.nhif, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>PAYE Tax</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tax Bands:</span>
                        <span>Progressive</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relief:</span>
                        <span>KSh 2,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance Relief:</span>
                        <span>Up to KSh 5,000</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Monthly:</span>
                        <span>KSh {payrollRecords.reduce((sum, r) => sum + r.paye, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Standard Allowances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>House Allowance</span>
                        <span>KSh 15,000 - 25,000</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Transport Allowance</span>
                        <span>KSh 5,000 - 10,000</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Medical Allowance</span>
                        <span>KSh 3,000 - 5,000</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Research Allowance</span>
                        <span>KSh 2,000 - 8,000</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pension Schemes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>• Contributory Pension Scheme</li>
                      <li>• Employee: 5% of basic salary</li>
                      <li>• Employer: 10% of basic salary</li>
                      <li>• Retirement benefits package</li>
                      <li>• Gratuity payments</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div>Monthly Payroll Report</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                    <div>Statutory Remittances</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2" />
                    <div>Annual Tax Returns</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20">
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <div>Employee Benefits Summary</div>
                  </div>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
