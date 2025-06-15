
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { receipt, file, message-square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentId: string;
  amount: number;
  feeType: string;
  paymentDate: string;
  paymentMethod: string;
}

export const ReceiptGeneration = () => {
  const { toast } = useToast();
  const { paymentRecords, studentFees, getAllUsers } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateReceiptPDF = (receiptData: ReceiptData) => {
    // Mock PDF generation
    const receiptContent = `
UNIVERSITY RECEIPT
Receipt No: ${receiptData.receiptNumber}
Date: ${receiptData.paymentDate}

Student Information:
Name: ${receiptData.studentName}
ID: ${receiptData.studentId}

Payment Details:
Fee Type: ${receiptData.feeType}
Amount Paid: KSh ${receiptData.amount.toLocaleString()}
Payment Method: ${receiptData.paymentMethod}

This is an official receipt for payment received.
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${receiptData.receiptNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Receipt Generated",
      description: "Receipt downloaded successfully.",
    });
  };

  const sendReceiptBySMS = (receiptData: ReceiptData) => {
    // Mock SMS sending
    console.log(`Sending SMS receipt to student ${receiptData.studentName}`);
    
    toast({
      title: "SMS Sent",
      description: `Receipt sent via SMS to ${receiptData.studentName}.`,
    });
  };

  const sendReceiptByEmail = (receiptData: ReceiptData) => {
    // Mock email sending
    console.log(`Sending email receipt to student ${receiptData.studentName}`);
    
    toast({
      title: "Email Sent",
      description: `Receipt sent via email to ${receiptData.studentName}.`,
    });
  };

  const recentPayments = paymentRecords.slice(0, 10).map(payment => {
    const fee = studentFees.find(f => f.id === payment.feeId);
    return {
      receiptNumber: payment.receiptNumber,
      studentName: payment.studentName,
      studentId: payment.studentId,
      amount: payment.amount,
      feeType: fee?.feeType || 'Unknown',
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <receipt className="w-5 h-5" />
          Receipt Generation
        </CardTitle>
        <CardDescription>
          Generate and send receipts for student payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {paymentRecords.length}
              </div>
              <div className="text-sm text-blue-800">Total Receipts</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {paymentRecords.filter(p => p.paymentDate === new Date().toISOString().split('T')[0]).length}
              </div>
              <div className="text-sm text-green-800">Today's Receipts</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                KSh {paymentRecords.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-purple-800">Total Collected</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Recent Payments</h4>
            <div className="border rounded-lg">
              {recentPayments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No recent payments found
                </div>
              ) : (
                <div className="divide-y">
                  {recentPayments.map((payment) => (
                    <div key={payment.receiptNumber} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-gray-500">
                          {payment.feeType} - KSh {payment.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReceipt(payment);
                            setIsDialogOpen(true);
                          }}
                        >
                          <receipt className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Receipt Options</DialogTitle>
              <DialogDescription>
                Choose how to generate or send the receipt for {selectedReceipt?.studentName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedReceipt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Receipt:</strong> {selectedReceipt.receiptNumber}</div>
                    <div><strong>Amount:</strong> KSh {selectedReceipt.amount.toLocaleString()}</div>
                    <div><strong>Student:</strong> {selectedReceipt.studentName}</div>
                    <div><strong>Date:</strong> {selectedReceipt.paymentDate}</div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  onClick={() => {
                    if (selectedReceipt) generateReceiptPDF(selectedReceipt);
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <file className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedReceipt) sendReceiptBySMS(selectedReceipt);
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <message-square className="w-4 h-4" />
                  Send SMS
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedReceipt) sendReceiptByEmail(selectedReceipt);
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <message-square className="w-4 h-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
