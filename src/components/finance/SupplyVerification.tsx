
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, XCircle, Eye, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";

export const SupplyVerification = () => {
  const { toast } = useToast();
  const { supplyRequests, updateSupplyRequestStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  const handleVerifyRequest = (requestId: string, requestedBy: string) => {
    updateSupplyRequestStatus(requestId, 'verified', verificationNotes);
    
    toast({
      title: "Supply Request Verified",
      description: `Supply request from ${requestedBy} has been verified.`,
    });
    
    setIsDialogOpen(false);
    setVerificationNotes("");
    setSelectedRequest(null);
  };

  const handleRejectRequest = (requestId: string, requestedBy: string) => {
    updateSupplyRequestStatus(requestId, 'rejected', verificationNotes);
    
    toast({
      title: "Supply Request Rejected",
      description: `Supply request from ${requestedBy} has been rejected.`,
      variant: "destructive",
    });
    
    setIsDialogOpen(false);
    setVerificationNotes("");
    setSelectedRequest(null);
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setVerificationNotes(request.verificationNotes || "");
    setIsDialogOpen(true);
  };

  const filteredRequests = supplyRequests.filter(request => {
    const matchesSearch = request.requestedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supply Verification</h2>
          <p className="text-gray-600">Review and verify supply requests from departments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supply Requests</CardTitle>
          <CardDescription>
            Verify supply requests from different departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by requestor or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Details</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.requestedByName}</div>
                      <div className="text-sm text-gray-500">Date: {request.requestDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{request.department}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {request.items.length} items
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">KSh {request.totalAmount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No supply requests found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Supply Request</DialogTitle>
            <DialogDescription>
              Review the supply request details and provide verification
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Requested By</h4>
                  <p>{selectedRequest.requestedByName}</p>
                  <p className="text-sm text-gray-500">Department: {selectedRequest.department}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Request Details</h4>
                  <p>Date: {selectedRequest.requestDate}</p>
                  <p>Priority: {selectedRequest.priority}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-600">Requested Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRequest.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>KSh {item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell>KSh {item.totalPrice.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-2 text-right">
                  <strong>Total Amount: KSh {selectedRequest.totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600">Verification Notes</h4>
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add your verification notes and decision reasoning..."
                />
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectRequest(selectedRequest.id, selectedRequest.requestedByName)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerifyRequest(selectedRequest.id, selectedRequest.requestedByName)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.verificationNotes && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Previous Verification Notes</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.verificationNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
