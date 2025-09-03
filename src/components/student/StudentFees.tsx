import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Clock, CheckCircle, AlertTriangle, Download, Receipt, FileText } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import type { StudentFee as FirebaseStudentFee, FeeStructure, Payment } from "@/integrations/firebase/fees";
import ExamCard from './ExamCard';

interface FeeBreakdownItem {
  name: string;
  amount: number;
}

interface FeeTypeConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// Extend the Firebase StudentFee interface with UI-specific properties
interface StudentFee {
  id?: string;
  studentId: string;
  studentName: string;
  course: string;
  year: number;
  semester: number;
  academicYear: string;
  feeStructureId: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue';
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  labFee: number;
  cautionMoney: number;
  activityFee: number;
  medicalFee?: number;
  feeType?: string;
  description?: string;
  examCardActivated?: boolean;
}

export const StudentFees = () => {
  const { user, studentFees } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  // Cast student fees to our extended type
  const myFees: StudentFee[] = studentFees
    .filter(fee => fee.studentId === user.id)
    .map(fee => ({
      id: fee.id,
      studentId: fee.studentId,
      studentName: fee.studentName || "",
      course: (fee as any).course || "",
      year: (fee as any).year || 1,
      semester: fee.semester || 1,
      academicYear: fee.academicYear || "",
      feeStructureId: (fee as any).feeStructureId || "",
      totalAmount: fee.amount || 0,
      amountPaid: fee.paidAmount || 0,
      balance: (fee.amount || 0) - (fee.paidAmount || 0),
      dueDate: fee.dueDate || "",
      status: fee.status === "partial" ? "partially_paid" : (fee.status || "pending"),
      payments: (fee as any).payments || [],
      createdAt: fee.createdDate || "",
      updatedAt: (fee as any).updatedAt || fee.createdDate || "",
      tuitionFee: (fee as any).tuitionFee || 0,
      examFee: (fee as any).examFee || 0,
      libraryFee: (fee as any).libraryFee || 0,
      labFee: (fee as any).labFee || 0,
      cautionMoney: (fee as any).cautionMoney || 0,
      activityFee: (fee as any).activityFee || 0,
      medicalFee: (fee as any).medicalFee || 0,
      description: fee.description || "",
      feeType: fee.feeType || "",
      examCardActivated: (fee as any).examCardActivated || false,
    }));
  const currentAcademicYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
  
  // Calculate totals
  const totalOwed = myFees
    .filter(f => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, fee) => sum + (fee.balance || fee.totalAmount), 0);

  const totalPaid = myFees
    .filter(f => f.status === 'paid' || f.status === 'partially_paid')
    .reduce((sum, fee) => sum + fee.amountPaid, 0);

  const overdueAmount = myFees
    .filter(f => f.status === 'overdue')
    .reduce((sum, fee) => sum + (fee.balance || fee.totalAmount), 0);

  const pendingCount = myFees.filter(f => f.status === 'pending').length;
  const overdueCount = myFees.filter(f => f.status === 'overdue').length;

  const currentFee = myFees.find(f =>
    f.academicYear === currentAcademicYear && 
    f.course === user.course
  ) as StudentFee | undefined;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-blue-100 text-blue-800">Partially Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const FEE_TYPES: FeeTypeConfig = {
    tuition: { label: 'Tuition', color: 'bg-blue-100 text-blue-800' },
    exam: { label: 'Exam', color: 'bg-purple-100 text-purple-800' },
    library: { label: 'Library', color: 'bg-green-100 text-green-800' },
    lab: { label: 'Lab', color: 'bg-orange-100 text-orange-800' },
    activity: { label: 'Activity', color: 'bg-pink-100 text-pink-800' },
    medical: { label: 'Medical', color: 'bg-cyan-100 text-cyan-800' },
    caution: { label: 'Caution', color: 'bg-yellow-100 text-yellow-800' },
  };

  const getFeeBreakdown = (fee: StudentFee): FeeBreakdownItem[] => {
    return [
      { name: 'Tuition Fee', amount: fee.tuitionFee },
      { name: 'Exam Fee', amount: fee.examFee },
      { name: 'Library Fee', amount: fee.libraryFee },
      { name: 'Lab Fee', amount: fee.labFee },
      { name: 'Caution Money', amount: fee.cautionMoney },
      { name: 'Activity Fee', amount: fee.activityFee },
      { name: 'Medical Fee', amount: fee.medicalFee },
    ].filter(item => item.amount > 0);
  };
  
  const getTypeBadge = (type: string) => {
    const feeType = FEE_TYPES[type.toLowerCase()] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={feeType.color}>{feeType.label}</Badge>;
  };

  const handleDownloadReceipt = (fee: StudentFee, payment?: Payment) => {
    if (fee.status !== 'paid' && fee.status !== 'partially_paid') {
      toast({
        title: "Receipt Not Available",
        description: "Receipt is only available for paid or partially paid fees.",
        variant: "destructive",
      });
      return;
    }

    // Simulate receipt download
    toast({
      title: "Receipt Downloaded",
      description: payment 
        ? `Receipt for payment of ${formatAmount(payment.amount)} on ${new Date(payment.date).toLocaleDateString()} has been downloaded.`
        : `Receipt for ${fee.description} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            My Fees
          </CardTitle>
          <CardDescription>
            Track your fee payments and download receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(currentFee?.totalAmount || 0)}</div>
                <p className="text-xs text-muted-foreground">For {currentAcademicYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totalPaid)}</div>
                <p className="text-xs text-muted-foreground">Total payments made</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totalOwed)}</div>
                <p className="text-xs text-muted-foreground">{pendingCount} pending payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(overdueAmount)}</div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Fees</TabsTrigger>
              <TabsTrigger value="pending">Pending ({myFees.filter(f => f.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({myFees.filter(f => f.status === 'paid').length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({myFees.filter(f => f.status === 'overdue').length})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(currentFee?.totalAmount || 0)}</div>
                        <p className="text-xs text-muted-foreground">For {currentAcademicYear}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(totalPaid)}</div>
                        <p className="text-xs text-muted-foreground">Total payments made</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(totalOwed)}</div>
                        <p className="text-xs text-muted-foreground">{pendingCount} pending payments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatAmount(overdueAmount)}</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myFees.filter(f => f.status === 'paid' || f.status === 'partially_paid').map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fee.description}</div>
                              <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                          <TableCell>
                            <div className="font-medium">KSh {fee.totalAmount.toLocaleString()}</div>
                            {fee.amountPaid && fee.amountPaid !== fee.totalAmount && (
                              <div className="text-sm text-green-600">Paid: KSh {fee.amountPaid.toLocaleString()}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {fee.payments && fee.payments.length > 0 && 
                              fee.payments[fee.payments.length - 1].date
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(fee.payments && fee.payments.length > 0 && 
                                fee.payments[fee.payments.length - 1].paymentMethod) || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReceipt(fee)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="exam-card">
              <ExamCard
                studentName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student'}
                registrationNumber={user.email || ''}
                course={currentFee?.course || 'Unknown Course'}
                year={currentFee?.year || 1}
                semester={currentFee?.semester || 1}
                academicYear={currentFee?.academicYear || currentAcademicYear}
                hasOutstandingFees={currentFee ? currentFee.balance > 0 : false}
                units={[
                  { code: 'CS101', name: 'Introduction to Programming' },
                  { code: 'MA101', name: 'Calculus I' },
                  { code: 'PHY101', name: 'Physics for Engineers' },
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
