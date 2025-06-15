
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, DollarSign, FileText, Calendar, Mail, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const PayrollManagement = () => {
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  
  const employees = getAllUsers().filter(u => ['lecturer', 'hod', 'registrar', 'admin'].includes(u.role) && u.approved);
  
  const [payrollRecords, setPayrollRecords] = useState(() => {
    return employees.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId || `EMP${emp.id.slice(-3)}`,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      position: emp.role === 'lecturer' ? 'Lecturer' : 
               emp.role === 'hod' ? 'Head of Department' :
               emp.role === 'registrar' ? 'Registrar' :
               emp.role === 'admin' ? 'Administrator' : 'Staff',
      department: emp.department || 'General',
      basicSalary: emp.role === 'lecturer' ? 85000 : 
                  emp.role === 'hod' ? 120000 :
                  emp.role === 'registrar' ? 100000 :
                  emp.role === 'admin' ? 75000 : 60000,
      allowances: emp.role === 'lecturer' ? 18000 : 
                 emp.role === 'hod' ? 25000 :
                 emp.role === 'registrar' ? 20000 :
                 emp.role === 'admin' ? 15000 : 10000,
      nssf: 1200,
      nhif: 1700,
      paye: emp.role === 'lecturer' ? 15500 : 
            emp.role === 'hod' ? 28000 :
            emp.role === 'registrar' ? 22000 :
            emp.role === 'admin' ? 12000 : 8000,
      netSalary: 0,
      status: 'pending' as const,
      month: 'December 2024',
      bankAccount: '',
      taxPin: ''
    }));
  });

  const [selectedMonth, setSelectedMonth] = useState('December 2024');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'Payslip for {month} - {employeeName}',
    body: `Dear {employeeName},

Please find attached your payslip for {month}.

Salary Details:
- Basic Salary: KSh {basicSalary}
- Allowances: KSh {allowances}
- Gross Pay: KSh {grossPay}
- Total Deductions: KSh {totalDeductions}
- Net Pay: KSh {netSalary}

Payment will be processed to your bank account ending in {bankAccount}.

Best regards,
Human Resource Department
Finance Office`
  });

  // Calculate net salary for each record
  useState(() => {
    setPayrollRecords(prev => prev.map(record => ({
      ...record,
      netSalary: record.basicSalary + record.allowances - record.nssf - record.nhif - record.paye
    })));
  }, []);

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

  const processAllPayroll = () => {
    const pendingRecords = payrollRecords.filter(r => r.status === 'pending');
    
    setPayrollRecords(prev => 
      prev.map(record => 
        record.status === 'pending' 
          ? { ...record, status: 'processed' as const }
          : record
      )
    );

    toast({
      title: "Bulk Payroll Processed",
      description: `${pendingRecords.length} employee salaries have been processed.`,
    });
  };

  const sendPayslipEmail = (record: any) => {
    const grossPay = record.basicSalary + record.allowances;
    const totalDeductions = record.nssf + record.nhif + record.paye;
    
    const emailContent = emailTemplate.body
      .replace(/{employeeName}/g, record.name)
      .replace(/{month}/g, record.month)
      .replace(/{basicSalary}/g, record.basicSalary.toLocaleString())
      .replace(/{allowances}/g, record.allowances.toLocaleString())
      .replace(/{grossPay}/g, grossPay.toLocaleString())
      .replace(/{totalDeductions}/g, totalDeductions.toLocaleString())
      .replace(/{netSalary}/g, record.netSalary.toLocaleString())
      .replace(/{bankAccount}/g, record.bankAccount || 'XXXX');

    // Simulate email sending
    console.log(`Sending email to ${record.email}:`);
    console.log(`Subject: ${emailTemplate.subject.replace(/{month}/g, record.month).replace(/{employeeName}/g, record.name)}`);
    console.log(`Body: ${emailContent}`);

    toast({
      title: "Payslip Sent",
      description: `Payslip has been sent to ${record.name} at ${record.email}`,
    });
  };

  const sendAllPayslips = () => {
    const processedRecords = payrollRecords.filter(r => r.status === 'processed');
    
    processedRecords.forEach(record => {
      setTimeout(() => sendPayslipEmail(record), Math.random() * 1000);
    });

    toast({
      title: "Bulk Email Sent",
      description: `Payslips sent to ${processedRecords.length} employees`,
    });
  };

  const generatePayslip = (record: any) => {
    const grossPay = record.basicSalary + record.allowances;
    const totalDeductions = record.nssf + record.nhif + record.paye;
    
    const payslipData = `
PAYSLIP - ${record.month}
Employee: ${record.name} (${record.employeeId})
Position: ${record.position}
Department: ${record.department}
Email: ${record.email}

EARNINGS:
Basic Salary: KSh ${record.basicSalary.toLocaleString()}
Allowances: KSh ${record.allowances.toLocaleString()}
Gross Pay: KSh ${grossPay.toLocaleString()}

DEDUCTIONS:
NSSF: KSh ${record.nssf.toLocaleString()}
NHIF: KSh ${record.nhif.toLocaleString()}
PAYE: KSh ${record.paye.toLocaleString()}
Total Deductions: KSh ${totalDeductions.toLocaleString()}

NET PAY: KSh ${record.netSalary.toLocaleString()}

Bank Account: ${record.bankAccount || 'Not provided'}
Tax PIN: ${record.taxPin || 'Not provided'}

Generated: ${new Date().toLocaleDateString()}
Status: ${record.status.toUpperCase()}
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

  const updateEmployeeDetails = () => {
    if (!editingEmployee) return;

    setPayrollRecords(prev => prev.map(record => 
      record.id === editingEmployee.id ? {
        ...editingEmployee,
        netSalary: editingEmployee.basicSalary + editingEmployee.allowances - editingEmployee.nssf - editingEmployee.nhif - editingEmployee.paye
      } : record
    ));

    setEditingEmployee(null);
    toast({
      title: "Employee Updated",
      description: "Employee payroll details have been updated.",
    });
  };

  const generateSummaryReport = () => {
    const totalGross = payrollRecords.reduce((sum, record) => sum + record.basicSalary + record.allowances, 0);
    const totalNet = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
    const totalDeductions = totalGross - totalNet;

    const report = `
PAYROLL SUMMARY REPORT - ${selectedMonth}
Generated: ${new Date().toLocaleDateString()}

OVERVIEW:
Total Employees: ${payrollRecords.length}
Processed: ${payrollRecords.filter(r => r.status === 'processed').length}
Pending: ${payrollRecords.filter(r => r.status === 'pending').length}

FINANCIAL SUMMARY:
Total Gross Pay: KSh ${totalGross.toLocaleString()}
Total Deductions: KSh ${totalDeductions.toLocaleString()}
Total Net Pay: KSh ${totalNet.toLocaleString()}

DEPARTMENT BREAKDOWN:
${Array.from(new Set(payrollRecords.map(r => r.department))).map(dept => {
  const deptRecords = payrollRecords.filter(r => r.department === dept);
  const deptTotal = deptRecords.reduce((sum, r) => sum + r.netSalary, 0);
  return `${dept}: ${deptRecords.length} employees - KSh ${deptTotal.toLocaleString()}`;
}).join('\n')}

EMPLOYEE DETAILS:
${payrollRecords.map(record => {
  const grossPay = record.basicSalary + record.allowances;
  return `${record.name} (${record.employeeId}) - ${record.position}
  Gross: KSh ${grossPay.toLocaleString()} | Net: KSh ${record.netSalary.toLocaleString()} | Status: ${record.status}`;
}).join('\n')}

STATUTORY REMITTANCES:
Total NSSF: KSh ${payrollRecords.reduce((sum, r) => sum + r.nssf, 0).toLocaleString()}
Total NHIF: KSh ${payrollRecords.reduce((sum, r) => sum + r.nhif, 0).toLocaleString()}
Total PAYE: KSh ${payrollRecords.reduce((sum, r) => sum + r.paye, 0).toLocaleString()}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_summary_${selectedMonth.replace(' ', '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Summary Report Generated",
      description: "Payroll summary report has been downloaded.",
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
            Real-time payroll processing with email integration for all staff members
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
              <div className="text-sm text-purple-800">Active Employees</div>
            </div>
          </div>

          <Tabs defaultValue="payroll" className="space-y-4">
            <TabsList>
              <TabsTrigger value="payroll">Monthly Payroll</TabsTrigger>
              <TabsTrigger value="email">Email Management</TabsTrigger>
              <TabsTrigger value="deductions">Statutory Deductions</TabsTrigger>
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
                <Button onClick={processAllPayroll}>Process All Payroll</Button>
                <Button variant="outline" onClick={sendAllPayslips}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email All Payslips
                </Button>
                <Button variant="outline" onClick={generateSummaryReport}>
                  <FileText className="w-4 h-4 mr-2" />
                  Summary Report
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.filter(record => record.month === selectedMonth).map((record) => {
                    const grossPay = record.basicSalary + record.allowances;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.name}</div>
                            <div className="text-sm text-gray-500">{record.employeeId}</div>
                            <div className="text-sm text-gray-500">{record.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{record.position}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>KSh {record.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>KSh {grossPay.toLocaleString()}</TableCell>
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
                              Download
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => sendPayslipEmail(record)}>
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setEditingEmployee(record)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Employee Payroll</DialogTitle>
                                </DialogHeader>
                                {editingEmployee && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Basic Salary (KSh)</Label>
                                        <Input
                                          type="number"
                                          value={editingEmployee.basicSalary}
                                          onChange={(e) => setEditingEmployee(prev => ({...prev, basicSalary: parseInt(e.target.value) || 0}))}
                                        />
                                      </div>
                                      <div>
                                        <Label>Allowances (KSh)</Label>
                                        <Input
                                          type="number"
                                          value={editingEmployee.allowances}
                                          onChange={(e) => setEditingEmployee(prev => ({...prev, allowances: parseInt(e.target.value) || 0}))}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Bank Account</Label>
                                        <Input
                                          value={editingEmployee.bankAccount}
                                          onChange={(e) => setEditingEmployee(prev => ({...prev, bankAccount: e.target.value}))}
                                          placeholder="Bank account number"
                                        />
                                      </div>
                                      <div>
                                        <Label>Tax PIN</Label>
                                        <Input
                                          value={editingEmployee.taxPin}
                                          onChange={(e) => setEditingEmployee(prev => ({...prev, taxPin: e.target.value}))}
                                          placeholder="KRA PIN"
                                        />
                                      </div>
                                    </div>
                                    <Button onClick={updateEmployeeDetails} className="w-full">Update Employee</Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Template Configuration</CardTitle>
                  <CardDescription>
                    Customize the email template for payslip distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emailSubject">Subject Line</Label>
                    <Input
                      id="emailSubject"
                      value={emailTemplate.subject}
                      onChange={(e) => setEmailTemplate(prev => ({...prev, subject: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailBody">Email Body</Label>
                    <Textarea
                      id="emailBody"
                      rows={10}
                      value={emailTemplate.body}
                      onChange={(e) => setEmailTemplate(prev => ({...prev, body: e.target.value}))}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Available variables: {'{employeeName}'}, {'{month}'}, {'{basicSalary}'}, {'{allowances}'}, {'{grossPay}'}, {'{totalDeductions}'}, {'{netSalary}'}, {'{bankAccount}'}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={sendAllPayslips}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send All Payslips
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Template Saved",
                        description: "Email template has been saved successfully.",
                      });
                    }}>
                      Save Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20" onClick={generateSummaryReport}>
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
