import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, DollarSign, Users, TrendingUp, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/finance/FinanceContext";

interface Scholarship {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  amount: number;
  type: 'full' | 'partial' | 'merit' | 'need_based';
  sponsor: string;
  academicYear: string;
  semester: number;
  status: 'active' | 'suspended' | 'completed';
  dateAwarded: string;
}

export const GrantsManagement = () => {
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  const { addStudentFee, studentFees, setStudentFees } = useFinance();
  
  const users = getAllUsers();
  const students = users.filter(u => u.role === 'student' && u.approved);
  
  const [scholarships, setScholarships] = useState<Scholarship[]>([
    {
      id: 'SCH001',
      studentId: 'U003',
      studentName: 'John Kamau',
      admissionNumber: 'TVET/2024/001',
      amount: 25000,
      type: 'merit',
      sponsor: 'Academic Excellence Foundation',
      academicYear: '2024/2025',
      semester: 1,
      status: 'active',
      dateAwarded: '2024-01-15'
    }
  ]);

  const [editingScholarship, setEditingScholarship] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Scholarship>>({});

  const [newScholarship, setNewScholarship] = useState({
    studentId: '',
    amount: '',
    type: 'merit' as const,
    sponsor: '',
    academicYear: '2024/2025',
    semester: 1
  });

  const handleAddScholarship = () => {
    if (!newScholarship.studentId || !newScholarship.amount || !newScholarship.sponsor) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const student = students.find(s => s.id === newScholarship.studentId);
    if (!student) return;

    const scholarship: Scholarship = {
      id: Date.now().toString(),
      studentId: newScholarship.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber || `ADM${student.id.slice(-3)}`,
      amount: parseInt(newScholarship.amount),
      type: newScholarship.type,
      sponsor: newScholarship.sponsor,
      academicYear: newScholarship.academicYear,
      semester: newScholarship.semester,
      status: 'active',
      dateAwarded: new Date().toISOString().split('T')[0]
    };

    setScholarships(prev => [...prev, scholarship]);

    // Create a student fee record marked as paid by scholarship (using cheque as stand-in for scholarship)
    addStudentFee({
      studentId: scholarship.studentId,
      studentName: scholarship.studentName,
      feeType: 'tuition',
      amount: scholarship.amount,
      description: `Scholarship from ${scholarship.sponsor}`,
      dueDate: new Date().toISOString().split('T')[0],
      academicYear: scholarship.academicYear,
      semester: scholarship.semester,
      paidAmount: scholarship.amount,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cheque', // stand in for scholarship, since "scholarship" not supported by type
      receiptNumber: `SCH-${scholarship.id}`
    });

    setNewScholarship({
      studentId: '',
      amount: '',
      type: 'merit',
      sponsor: '',
      academicYear: '2024/2025',
      semester: 1
    });

    toast({
      title: "Scholarship Added",
      description: `Scholarship for ${student.firstName} ${student.lastName} has been created and marked as paid.`,
    });
  };

  const handleEditScholarship = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship.id);
    setEditForm(scholarship);
  };

  const handleSaveEdit = () => {
    if (!editingScholarship) return;

    setScholarships(prev => prev.map(scholarship => 
      scholarship.id === editingScholarship 
        ? { ...scholarship, ...editForm }
        : scholarship
    ));

    // Update matching fee record using setStudentFees directly (editing description and paidAmount etc)
    const updatedScholarship = scholarships.find(s => s.id === editingScholarship);
    if (updatedScholarship) {
      setStudentFees(prevFees =>
        prevFees.map(fee =>
          // For scholarship paid-in-full fees, mark as paid for edited student/admission information
          fee.studentId === updatedScholarship.studentId &&
          fee.paymentMethod === "cheque" && // We use "cheque" as a stand-in for 'scholarship'
          fee.receiptNumber === `SCH-${editingScholarship}`
            ? {
                ...fee,
                studentName: editForm.studentName || fee.studentName,
                amount: editForm.amount !== undefined ? Number(editForm.amount) : fee.amount,
                paidAmount: editForm.amount !== undefined ? Number(editForm.amount) : fee.paidAmount,
                description: `Scholarship from ${editForm.sponsor || updatedScholarship.sponsor}`
              }
            : fee
        )
      );
    }

    setEditingScholarship(null);
    setEditForm({});

    toast({
      title: "Scholarship Updated",
      description: "Scholarship details have been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditingScholarship(null);
    setEditForm({});
  };

  const totalScholarshipValue = scholarships.reduce((sum, s) => sum + s.amount, 0);
  const activeScholarships = scholarships.filter(s => s.status === 'active').length;
  const beneficiaries = new Set(scholarships.map(s => s.studentId)).size;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Scholarships & Grants Management
          </CardTitle>
          <CardDescription>
            Manage student scholarships and external funding with real-time fee integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalScholarshipValue.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Total Scholarship Value</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeScholarships}</div>
              <div className="text-sm text-green-800">Active Scholarships</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{beneficiaries}</div>
              <div className="text-sm text-purple-800">Students Benefiting</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{students.length}</div>
              <div className="text-sm text-orange-800">Total Students</div>
            </div>
          </div>

          <Tabs defaultValue="scholarships" className="space-y-4">
            <TabsList>
              <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
              <TabsTrigger value="add">Add New</TabsTrigger>
            </TabsList>

            <TabsContent value="scholarships" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell>
                        {editingScholarship === scholarship.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editForm.studentName || ''}
                              onChange={(e) => setEditForm(prev => ({...prev, studentName: e.target.value}))}
                              placeholder="Student name"
                            />
                            <Input
                              value={editForm.admissionNumber || ''}
                              onChange={(e) => setEditForm(prev => ({...prev, admissionNumber: e.target.value}))}
                              placeholder="Admission number"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">{scholarship.studentName}</div>
                            <div className="text-sm text-gray-500">{scholarship.admissionNumber}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingScholarship === scholarship.id ? (
                          <Input
                            type="number"
                            value={editForm.amount || ''}
                            onChange={(e) => setEditForm(prev => ({...prev, amount: parseInt(e.target.value)}))}
                          />
                        ) : (
                          <span className="font-medium">KSh {scholarship.amount.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={scholarship.type === 'merit' ? 'default' : 'secondary'}>
                          {scholarship.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingScholarship === scholarship.id ? (
                          <Input
                            value={editForm.sponsor || ''}
                            onChange={(e) => setEditForm(prev => ({...prev, sponsor: e.target.value}))}
                          />
                        ) : (
                          scholarship.sponsor
                        )}
                      </TableCell>
                      <TableCell>{scholarship.academicYear}</TableCell>
                      <TableCell>
                        <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
                          {scholarship.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingScholarship === scholarship.id ? (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleEditScholarship(scholarship)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <Select value={newScholarship.studentId} onValueChange={(value) => setNewScholarship(prev => ({...prev, studentId: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.admissionNumber || `ADM${student.id.slice(-3)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Scholarship amount"
                  type="number"
                  value={newScholarship.amount}
                  onChange={(e) => setNewScholarship(prev => ({...prev, amount: e.target.value}))}
                />
                <Input
                  placeholder="Sponsor name"
                  value={newScholarship.sponsor}
                  onChange={(e) => setNewScholarship(prev => ({...prev, sponsor: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <Select value={newScholarship.type} onValueChange={(value: any) => setNewScholarship(prev => ({...prev, type: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merit">Merit Based</SelectItem>
                    <SelectItem value="need_based">Need Based</SelectItem>
                    <SelectItem value="full">Full Scholarship</SelectItem>
                    <SelectItem value="partial">Partial Scholarship</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newScholarship.academicYear} onValueChange={(value) => setNewScholarship(prev => ({...prev, academicYear: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddScholarship}>Add Scholarship</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
