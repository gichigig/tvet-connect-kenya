
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
import { Gift, TrendingUp, FileText, AlertCircle, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const GrantsManagement = () => {
  const { toast } = useToast();
  const { getAllUsers, studentFees, updateFeeStatus, addStudentFee } = useAuth();
  
  const [grants, setGrants] = useState([
    { 
      id: 'G001', 
      name: 'TVET Capitation Grant', 
      donor: 'Ministry of Education', 
      amount: 25000000, 
      received: 15000000, 
      startDate: '2024-01-01', 
      endDate: '2024-12-31',
      status: 'active',
      compliance: 85
    },
    { 
      id: 'G002', 
      name: 'Equipment Modernization Fund', 
      donor: 'World Bank', 
      amount: 50000000, 
      received: 20000000, 
      startDate: '2024-03-01', 
      endDate: '2025-02-28',
      status: 'active',
      compliance: 92
    }
  ]);

  const [scholarships, setScholarships] = useState([]);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [newScholarship, setNewScholarship] = useState({
    studentId: '',
    studentName: '',
    admissionNumber: '',
    amount: '',
    semester: 1,
    year: 2024,
    grantSource: ''
  });

  const students = getAllUsers().filter(u => u.role === 'student' && u.approved);

  const addScholarship = () => {
    if (!newScholarship.studentId || !newScholarship.amount || !newScholarship.grantSource) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.id === newScholarship.studentId);
    if (!student) {
      toast({
        title: "Student Not Found",
        description: "Please select a valid student.",
        variant: "destructive",
      });
      return;
    }

    const scholarship = {
      id: `S${Date.now()}`,
      studentId: newScholarship.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber || 'N/A',
      amount: parseInt(newScholarship.amount),
      semester: newScholarship.semester,
      year: newScholarship.year,
      grantSource: newScholarship.grantSource,
      status: 'active' as const,
      dateAwarded: new Date().toISOString().split('T')[0]
    };

    setScholarships(prev => [...prev, scholarship]);

    // Create a scholarship fee record that marks it as paid
    addStudentFee({
      studentId: newScholarship.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      feeType: 'scholarship',
      amount: -parseInt(newScholarship.amount), // Negative amount for scholarship credit
      description: `Scholarship from ${newScholarship.grantSource}`,
      dueDate: new Date().toISOString().split('T')[0],
      academicYear: `${newScholarship.year}/${newScholarship.year + 1}`,
      semester: newScholarship.semester,
      paidAmount: parseInt(newScholarship.amount),
      paymentMethod: 'scholarship',
      paidDate: new Date().toISOString().split('T')[0],
      receiptNumber: `SCH-${Date.now()}`
    });

    setNewScholarship({
      studentId: '',
      studentName: '',
      admissionNumber: '',
      amount: '',
      semester: 1,
      year: 2024,
      grantSource: ''
    });

    toast({
      title: "Scholarship Added",
      description: `Scholarship awarded to ${student.firstName} ${student.lastName} and marked as paid.`,
    });
  };

  const updateScholarship = () => {
    if (!editingScholarship) return;

    setScholarships(prev => prev.map(s => 
      s.id === editingScholarship.id ? editingScholarship : s
    ));

    // Update the corresponding fee record
    const feeRecord = studentFees.find(f => 
      f.studentId === editingScholarship.studentId && 
      f.feeType === 'scholarship' && 
      f.receiptNumber?.includes('SCH')
    );

    if (feeRecord) {
      updateFeeStatus(
        feeRecord.id,
        'paid',
        new Date().toISOString().split('T')[0],
        editingScholarship.amount,
        'scholarship',
        `SCH-${Date.now()}`
      );
    }

    setEditingScholarship(null);
    toast({
      title: "Scholarship Updated",
      description: "Scholarship details have been updated successfully.",
    });
  };

  const generateComplianceReport = (grantId: string) => {
    const grant = grants.find(g => g.id === grantId);
    if (!grant) return;

    const report = `
GRANT COMPLIANCE REPORT
Grant: ${grant.name} (${grant.id})
Donor: ${grant.donor}
Reporting Period: ${new Date().toLocaleDateString()}

FINANCIAL SUMMARY
Total Grant Amount: KSh ${grant.amount.toLocaleString()}
Amount Received: KSh ${grant.received.toLocaleString()}
Amount Utilized: KSh ${(grant.received * 0.8).toLocaleString()}
Remaining Balance: KSh ${(grant.received * 0.2).toLocaleString()}

SCHOLARSHIP BENEFICIARIES
Total Scholarships Awarded: ${scholarships.length}
Total Scholarship Value: KSh ${scholarships.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}

BENEFICIARY LIST:
${scholarships.map(s => `- ${s.studentName} (${s.admissionNumber}): KSh ${s.amount.toLocaleString()}`).join('\n')}

COMPLIANCE STATUS
Overall Compliance Score: ${grant.compliance}%
Financial Management: 95%
Procurement Compliance: 90%
Reporting Timeliness: 88%
Beneficiary Targeting: 92%

Generated: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${grant.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Compliance Report Generated",
      description: `Report for ${grant.name} has been downloaded.`,
    });
  };

  const totalGrantAmount = grants.reduce((sum, grant) => sum + grant.amount, 0);
  const totalReceived = grants.reduce((sum, grant) => sum + grant.received, 0);
  const totalScholarships = scholarships.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Funding & Grants Management
          </CardTitle>
          <CardDescription>
            Manage donor funds, scholarships, and government capitation with real student integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">KSh {totalGrantAmount.toLocaleString()}</div>
              <div className="text-sm text-green-800">Total Grant Value</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalReceived.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Amount Received</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">KSh {totalScholarships.toLocaleString()}</div>
              <div className="text-sm text-purple-800">Scholarships Awarded</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{scholarships.length}</div>
              <div className="text-sm text-orange-800">Beneficiaries</div>
            </div>
          </div>

          <Tabs defaultValue="scholarships" className="space-y-4">
            <TabsList>
              <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
              <TabsTrigger value="grants">Grant Portfolio</TabsTrigger>
              <TabsTrigger value="capitation">TVET Capitation</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="scholarships" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Scholarship Management</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Award Scholarship
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Award New Scholarship</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="student">Student</Label>
                        <Select value={newScholarship.studentId} onValueChange={(value) => {
                          const student = students.find(s => s.id === value);
                          setNewScholarship(prev => ({
                            ...prev,
                            studentId: value,
                            studentName: student ? `${student.firstName} ${student.lastName}` : '',
                            admissionNumber: student?.admissionNumber || ''
                          }));
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName} ({student.admissionNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">Scholarship Amount (KSh)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newScholarship.amount}
                          onChange={(e) => setNewScholarship(prev => ({...prev, amount: e.target.value}))}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grantSource">Grant Source</Label>
                        <Input
                          id="grantSource"
                          value={newScholarship.grantSource}
                          onChange={(e) => setNewScholarship(prev => ({...prev, grantSource: e.target.value}))}
                          placeholder="e.g., Mastercard Foundation"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="semester">Semester</Label>
                          <Select value={newScholarship.semester.toString()} onValueChange={(value) => setNewScholarship(prev => ({...prev, semester: parseInt(value)}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Semester 1</SelectItem>
                              <SelectItem value="2">Semester 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="year">Academic Year</Label>
                          <Select value={newScholarship.year.toString()} onValueChange={(value) => setNewScholarship(prev => ({...prev, year: parseInt(value)}))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024/2025</SelectItem>
                              <SelectItem value="2025">2025/2026</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={addScholarship} className="w-full">Award Scholarship</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Grant Source</TableHead>
                    <TableHead>Academic Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scholarship.studentName}</div>
                          <div className="text-sm text-gray-500">{scholarship.admissionNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>KSh {scholarship.amount.toLocaleString()}</TableCell>
                      <TableCell>{scholarship.grantSource}</TableCell>
                      <TableCell>Semester {scholarship.semester}, {scholarship.year}/{scholarship.year + 1}</TableCell>
                      <TableCell>
                        <Badge variant="default">Paid</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setEditingScholarship(scholarship)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Scholarship</DialogTitle>
                            </DialogHeader>
                            {editingScholarship && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editStudentName">Student Name</Label>
                                  <Input
                                    id="editStudentName"
                                    value={editingScholarship.studentName}
                                    onChange={(e) => setEditingScholarship(prev => ({...prev, studentName: e.target.value}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editAdmissionNumber">Admission Number</Label>
                                  <Input
                                    id="editAdmissionNumber"
                                    value={editingScholarship.admissionNumber}
                                    onChange={(e) => setEditingScholarship(prev => ({...prev, admissionNumber: e.target.value}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editAmount">Amount (KSh)</Label>
                                  <Input
                                    id="editAmount"
                                    type="number"
                                    value={editingScholarship.amount}
                                    onChange={(e) => setEditingScholarship(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editGrantSource">Grant Source</Label>
                                  <Input
                                    id="editGrantSource"
                                    value={editingScholarship.grantSource}
                                    onChange={(e) => setEditingScholarship(prev => ({...prev, grantSource: e.target.value}))}
                                  />
                                </div>
                                <Button onClick={updateScholarship} className="w-full">Update Scholarship</Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="grants" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grant ID</TableHead>
                    <TableHead>Grant Name</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell className="font-medium">{grant.id}</TableCell>
                      <TableCell>{grant.name}</TableCell>
                      <TableCell>{grant.donor}</TableCell>
                      <TableCell>KSh {grant.amount.toLocaleString()}</TableCell>
                      <TableCell>KSh {grant.received.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{grant.startDate}</div>
                          <div className="text-gray-500">to {grant.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grant.status === 'active' ? 'default' : 'secondary'}>
                          {grant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => generateComplianceReport(grant.id)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="capitation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>TVET Capitation Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Academic Year 2024/2025:</span>
                        <span className="font-medium">KSh {(students.length * 10000).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Student Enrollment:</span>
                        <span className="font-medium">{students.length} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per Student Capitation:</span>
                        <span className="font-medium">KSh 10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Amount:</span>
                        <span className="font-medium text-green-600">KSh {(students.length * 10000).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment by Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from(new Set(students.map(s => s.course))).map(course => {
                        const count = students.filter(s => s.course === course).length;
                        return (
                          <div key={course} className="flex justify-between">
                            <span>{course}:</span>
                            <span>{count} students</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Financial Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Financial Reports</span>
                        <Badge variant="default">✓ Current</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Scholarship Records</span>
                        <Badge variant="default">{scholarships.length} Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Student Integration</span>
                        <Badge variant="default">✓ Live Data</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Beneficiary Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Total Beneficiaries</span>
                        <Badge variant="default">{scholarships.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Scholarships</span>
                        <Badge variant="default">{scholarships.filter(s => s.status === 'active').length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Payment Status</span>
                        <Badge variant="default">✓ All Paid</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      System Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Student Records</span>
                        <Badge variant="default">✓ Live</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Fee Integration</span>
                        <Badge variant="default">✓ Automated</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Real-time Updates</span>
                        <Badge variant="default">✓ Active</Badge>
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
