
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Receipt, Send, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const InvoiceManagement = () => {
  const { toast } = useToast();
  const { getAllUsers, generateInvoice, studentFees, updateFeeStatus, addPaymentRecord, user } = useAuth();
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: "",
    academicYear: "2024/2025",
    semester: 1
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "cash" as const,
    referenceNumber: "",
    notes: ""
  });

  const students = getAllUsers().filter(user => user.role === 'student' && user.approved);

  const handleGenerateInvoice = () => {
    if (!invoiceForm.studentId) {
      toast({
        title: "Select Student",
        description: "Please select a student to generate invoice for.",
        variant: "destructive",
      });
      return;
    }

    generateInvoice(invoiceForm.studentId, invoiceForm.academicYear, invoiceForm.semester);
    
    const student = students.find(s => s.id === invoiceForm.studentId);
    toast({
      title: "Invoice Generated",
      description: `Invoice generated for ${student?.firstName} ${student?.lastName}.`,
    });

    setInvoiceForm({
      studentId: "",
      academicYear: "2024/2025",
      semester: 1
    });
    setIsGenerateDialogOpen(false);
  };

  const handleRecordPayment = () => {
    if (!selectedFee || paymentForm.amount <= 0) {
      toast({
        title: "Invalid Payment",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    const receiptNumber = `RCP-${Date.now()}`;
    const isFullPayment = paymentForm.amount >= selectedFee.amount;
    
    updateFeeStatus(
      selectedFee.id, 
      isFullPayment ? 'paid' : 'partial',
      new Date().toISOString().split('T')[0],
      paymentForm.amount,
      paymentForm.paymentMethod,
      receiptNumber
    );

    addPaymentRecord({
      studentId: selectedFee.studentId,
      studentName: selectedFee.studentName,
      feeId: selectedFee.id,
      amount: paymentForm.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
      receiptNumber,
      processedBy: user?.id || "",
      notes: paymentForm.notes
    });

    toast({
      title: "Payment Recorded",
      description: `Payment of KSh ${paymentForm.amount.toLocaleString()} recorded successfully.`,
    });

    setPaymentForm({
      amount: 0,
      paymentMethod: "cash",
      referenceNumber: "",
      notes: ""
    });
    setSelectedFee(null);
    setIsPaymentDialogOpen(false);
  };

  const handlePaymentClick = (fee: any) => {
    setSelectedFee(fee);
    setPaymentForm(prev => ({ ...prev, amount: fee.amount - (fee.paidAmount || 0) }));
    setIsPaymentDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'partial':
        return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice & Payment Management</h2>
          <p className="text-gray-600">Generate invoices and record student payments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Student Invoice</DialogTitle>
                <DialogDescription>
                  Create fees based on the fee structure for selected student
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={invoiceForm.studentId} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - {student.course} Year {student.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Select value={invoiceForm.academicYear} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, academicYear: value }))}>
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
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={invoiceForm.semester.toString()} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, semester: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateInvoice}>
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Invoices & Payments</CardTitle>
          <CardDescription>
            Track all student fees and record payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentFees.map((fee) => {
                const balance = fee.amount - (fee.paidAmount || 0);
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-mono">{fee.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fee.studentName}</div>
                        <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{fee.feeType.replace('_', ' ')}</TableCell>
                    <TableCell>KSh {fee.amount.toLocaleString()}</TableCell>
                    <TableCell>KSh {(fee.paidAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>KSh {balance.toLocaleString()}</TableCell>
                    <TableCell>{fee.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(fee.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {fee.status !== 'paid' && (
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(fee)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Record Payment
                          </Button>
                        )}
                        {fee.receiptNumber && (
                          <Button size="sm" variant="outline">
                            <Receipt className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {studentFees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No invoices found. Generate invoices for students to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Recording Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for {selectedFee?.studentName} - {selectedFee?.feeType?.replace('_', ' ')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Amount:</span> KSh {selectedFee?.amount?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Already Paid:</span> KSh {(selectedFee?.paidAmount || 0).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Outstanding:</span> KSh {((selectedFee?.amount || 0) - (selectedFee?.paidAmount || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Payment Amount (KSh)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                placeholder="Transaction/Reference number"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Payment notes..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment}>
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
