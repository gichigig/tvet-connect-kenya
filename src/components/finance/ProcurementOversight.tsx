
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, FileCheck, AlertTriangle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProcurementOversight = () => {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState([
    { 
      id: 'PO001', 
      department: 'Engineering', 
      item: 'Laboratory Equipment', 
      supplier: 'TechPro Supplies Ltd', 
      amount: 450000, 
      status: 'pending_finance_approval',
      requestDate: '2024-12-10',
      priority: 'high'
    },
    { 
      id: 'PO002', 
      department: 'ICT', 
      item: 'Computer Accessories', 
      supplier: 'Digital Solutions', 
      amount: 125000, 
      status: 'finance_approved',
      requestDate: '2024-12-08',
      priority: 'medium'
    }
  ]);

  const [quotations, setQuotations] = useState([
    { id: 'Q001', poId: 'PO001', supplier: 'TechPro Supplies Ltd', amount: 450000, validity: '30 days', status: 'submitted' },
    { id: 'Q002', poId: 'PO001', supplier: 'EduEquip Kenya', amount: 420000, validity: '45 days', status: 'submitted' },
    { id: 'Q003', poId: 'PO002', supplier: 'Digital Solutions', amount: 125000, validity: '21 days', status: 'approved' }
  ]);

  const approvePurchaseOrder = (poId: string) => {
    setPurchaseOrders(prev => 
      prev.map(po => 
        po.id === poId 
          ? { ...po, status: 'finance_approved' as const }
          : po
      )
    );
    
    toast({
      title: "Purchase Order Approved",
      description: `PO ${poId} has been approved by finance department.`,
    });
  };

  const rejectPurchaseOrder = (poId: string) => {
    setPurchaseOrders(prev => 
      prev.map(po => 
        po.id === poId 
          ? { ...po, status: 'finance_rejected' as const }
          : po
      )
    );
    
    toast({
      title: "Purchase Order Rejected",
      description: `PO ${poId} has been rejected. Reason logged.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending_finance_approval': { variant: 'secondary' as const, label: 'Pending Finance' },
      'finance_approved': { variant: 'default' as const, label: 'Approved' },
      'finance_rejected': { variant: 'destructive' as const, label: 'Rejected' },
      'completed': { variant: 'default' as const, label: 'Completed' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPendingValue = purchaseOrders
    .filter(po => po.status === 'pending_finance_approval')
    .reduce((sum, po) => sum + po.amount, 0);

  const totalApprovedValue = purchaseOrders
    .filter(po => po.status === 'finance_approved')
    .reduce((sum, po) => sum + po.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Procurement Oversight
          </CardTitle>
          <CardDescription>
            Control spending, verify purchases, and ensure compliance - No budget? No lab chairs. Just chalk and vibes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {purchaseOrders.filter(po => po.status === 'pending_finance_approval').length}
              </div>
              <div className="text-sm text-yellow-800">Pending Approvals</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">KSh {totalPendingValue.toLocaleString()}</div>
              <div className="text-sm text-orange-800">Pending Value</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {purchaseOrders.filter(po => po.status === 'finance_approved').length}
              </div>
              <div className="text-sm text-green-800">Approved Orders</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalApprovedValue.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Approved Value</div>
            </div>
          </div>

          <Tabs defaultValue="purchase-orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
              <TabsTrigger value="quotations">Quotation Analysis</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
              <TabsTrigger value="payments">Payment Authorization</TabsTrigger>
            </TabsList>

            <TabsContent value="purchase-orders" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.id}</TableCell>
                      <TableCell>{po.department}</TableCell>
                      <TableCell>{po.item}</TableCell>
                      <TableCell>{po.supplier}</TableCell>
                      <TableCell>KSh {po.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={po.priority === 'high' ? 'destructive' : 'secondary'}>
                          {po.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        {po.status === 'pending_finance_approval' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approvePurchaseOrder(po.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectPurchaseOrder(po.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="quotations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quotation Comparison</CardTitle>
                  <CardDescription>Compare supplier quotations for best value</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quotation ID</TableHead>
                        <TableHead>PO Reference</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Quoted Amount</TableHead>
                        <TableHead>Validity Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell>{quote.id}</TableCell>
                          <TableCell>{quote.poId}</TableCell>
                          <TableCell>{quote.supplier}</TableCell>
                          <TableCell>KSh {quote.amount.toLocaleString()}</TableCell>
                          <TableCell>{quote.validity}</TableCell>
                          <TableCell>
                            <Badge variant={quote.status === 'approved' ? 'default' : 'secondary'}>
                              {quote.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {quote.status === 'submitted' && (
                              <Button size="sm" variant="outline">Review</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      Public Finance Laws Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Budget allocation verified</span>
                        <Badge variant="default">✓ Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Procurement threshold followed</span>
                        <Badge variant="default">✓ Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Competitive quotations obtained</span>
                        <Badge variant="secondary">⚠ Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Approval hierarchy followed</span>
                        <Badge variant="default">✓ Compliant</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Supplier verification</span>
                        <Badge variant="default">Low Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Budget impact</span>
                        <Badge variant="secondary">Medium Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Delivery timeline</span>
                        <Badge variant="default">Low Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Quality assurance</span>
                        <Badge variant="default">Low Risk</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Authorization Queue</CardTitle>
                  <CardDescription>Authorize payments for approved purchase orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseOrders
                      .filter(po => po.status === 'finance_approved')
                      .map(po => (
                        <div key={po.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{po.id} - {po.item}</h4>
                              <p className="text-sm text-gray-600">Supplier: {po.supplier}</p>
                              <p className="text-sm text-gray-600">Department: {po.department}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">KSh {po.amount.toLocaleString()}</div>
                              <Button size="sm" className="mt-2">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Authorize Payment
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {purchaseOrders.filter(po => po.status === 'finance_approved').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No payments pending authorization
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
