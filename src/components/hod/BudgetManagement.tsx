
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Package, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  allocated: number;
  spent: number;
  status: "on_track" | "overspent" | "underutilized";
  priority: "high" | "medium" | "low";
}

interface ProcurementRequest {
  id: string;
  item: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  urgency: "urgent" | "normal" | "low";
}

export const BudgetManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"budget" | "procurement">("budget");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: "1",
      category: "Equipment",
      description: "Laboratory equipment and tools",
      allocated: 500000,
      spent: 320000,
      status: "on_track",
      priority: "high"
    },
    {
      id: "2",
      category: "Materials",
      description: "Raw materials for practical sessions",
      allocated: 200000,
      spent: 180000,
      status: "on_track",
      priority: "medium"
    },
    {
      id: "3",
      category: "Maintenance",
      description: "Equipment maintenance and repairs",
      allocated: 150000,
      spent: 165000,
      status: "overspent",
      priority: "high"
    },
    {
      id: "4",
      category: "Training",
      description: "Staff development and training",
      allocated: 100000,
      spent: 45000,
      status: "underutilized",
      priority: "medium"
    }
  ]);

  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([
    {
      id: "1",
      item: "Welding Machine",
      description: "Industrial welding machine for practical training",
      amount: 85000,
      status: "pending",
      requestDate: "2024-06-10",
      urgency: "urgent"
    },
    {
      id: "2",
      item: "Computer Software",
      description: "CAD software licenses for design classes",
      amount: 120000,
      status: "approved",
      requestDate: "2024-06-08",
      urgency: "normal"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
      case 'overspent':
        return <Badge className="bg-red-100 text-red-800">Overspent</Badge>;
      case 'underutilized':
        return <Badge className="bg-yellow-100 text-yellow-800">Underutilized</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const utilizationRate = (totalSpent / totalAllocated) * 100;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</div>
            <Progress value={utilizationRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "budget" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("budget")}
        >
          Budget Overview
        </Button>
        <Button
          variant={activeTab === "procurement" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("procurement")}
        >
          Procurement Requests
        </Button>
      </div>

      {activeTab === "budget" && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation & Utilization</CardTitle>
            <CardDescription>
              Monitor departmental budget usage by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.map((item) => {
                  const remaining = item.allocated - item.spent;
                  const utilization = (item.spent / item.allocated) * 100;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.category}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.allocated)}</TableCell>
                      <TableCell>{formatCurrency(item.spent)}</TableCell>
                      <TableCell className={remaining < 0 ? "text-red-600" : ""}>
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(utilization, 100)} className="w-16" />
                          <span className="text-sm">{utilization.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "procurement" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Procurement Requests
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Request
              </Button>
            </CardTitle>
            <CardDescription>
              Manage equipment and material procurement requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procurementRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.item}</div>
                        <div className="text-sm text-gray-500">{request.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(request.amount)}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <Badge variant={request.urgency === "urgent" ? "destructive" : "outline"}>
                        {request.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Approve</Button>
                          <Button size="sm" variant="outline">Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
