
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Clock, CheckCircle, AlertTriangle, Download, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const StudentFees = () => {
  const { user, studentFees } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const myFees = studentFees.filter(fee => fee.studentId === user.id);
  
  const totalOwed = myFees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = myFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + (fee.paidAmount || fee.amount), 0);
  const overdueAmount = myFees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);
  const pendingCount = myFees.filter(f => f.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      tuition: 'bg-blue-100 text-blue-800',
      exam: 'bg-purple-100 text-purple-800',
      library: 'bg-green-100 text-green-800',
      lab: 'bg-orange-100 text-orange-800',
      activity: 'bg-pink-100 text-pink-800',
      medical: 'bg-cyan-100 text-cyan-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const handleDownloadReceipt = (fee: any) => {
    if (fee.status !== 'paid') {
      toast({
        title: "Receipt Not Available",
        description: "Receipt is only available for paid fees.",
        variant: "destructive",
      });
      return;
    }

    // Simulate receipt download
    toast({
      title: "Receipt Downloaded",
      description: `Receipt for ${fee.description} has been downloaded.`,
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
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">KSh {totalOwed.toLocaleString()}</div>
              <div className="text-sm text-red-800">Amount Owed</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">KSh {totalPaid.toLocaleString()}</div>
              <div className="text-sm text-green-800">Total Paid</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">KSh {overdueAmount.toLocaleString()}</div>
              <div className="text-sm text-orange-800">Overdue</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
              <div className="text-sm text-blue-800">Pending Payments</div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Fees</TabsTrigger>
              <TabsTrigger value="pending">Pending ({myFees.filter(f => f.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({myFees.filter(f => f.status === 'paid').length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({myFees.filter(f => f.status === 'overdue').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.description}</div>
                          <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                      <TableCell>
                        <div className="font-medium">KSh {fee.amount.toLocaleString()}</div>
                        {fee.paidAmount && fee.paidAmount !== fee.amount && (
                          <div className="text-sm text-green-600">Paid: KSh {fee.paidAmount.toLocaleString()}</div>
                        )}
                      </TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {fee.status === 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReceipt(fee)}
                            >
                              <Receipt className="w-4 h-4 mr-1" />
                              Receipt
                            </Button>
                          )}
                          {fee.status === 'pending' && (
                            <Button size="sm" disabled>
                              Pay Online
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myFees.filter(f => f.status === 'pending').map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.description}</div>
                          <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                      <TableCell className="font-medium">KSh {fee.amount.toLocaleString()}</TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>
                        <Button size="sm" disabled>
                          Pay Online
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="paid">
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
                  {myFees.filter(f => f.status === 'paid').map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.description}</div>
                          <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                      <TableCell>
                        <div className="font-medium">KSh {fee.amount.toLocaleString()}</div>
                        {fee.paidAmount && fee.paidAmount !== fee.amount && (
                          <div className="text-sm text-green-600">Paid: KSh {fee.paidAmount.toLocaleString()}</div>
                        )}
                      </TableCell>
                      <TableCell>{fee.paidDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fee.paymentMethod || 'N/A'}</Badge>
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
            </TabsContent>

            <TabsContent value="overdue">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myFees.filter(f => f.status === 'overdue').map((fee) => {
                    const daysOverdue = Math.floor((new Date().getTime() - new Date(fee.dueDate).getTime()) / (1000 * 3600 * 24));
                    return (
                      <TableRow key={fee.id} className="bg-red-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{fee.description}</div>
                            <div className="text-sm text-gray-500">{fee.academicYear} - Sem {fee.semester}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(fee.feeType)}</TableCell>
                        <TableCell className="font-medium text-red-600">KSh {fee.amount.toLocaleString()}</TableCell>
                        <TableCell>{fee.dueDate}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{daysOverdue} days</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="destructive" disabled>
                            Pay Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
