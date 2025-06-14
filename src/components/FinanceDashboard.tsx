
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileCheck, CreditCard, AlertTriangle, Package, Receipt } from "lucide-react";
import { SupplyVerification } from "@/components/finance/SupplyVerification";
import { FeeManagement } from "@/components/finance/FeeManagement";
import { StudentFeesOverview } from "@/components/finance/StudentFeesOverview";

export const FinanceDashboard = () => {
  const { user, supplyRequests, studentFees } = useAuth();
  const [activeTab, setActiveTab] = useState("supplies");

  const pendingSupplies = supplyRequests.filter(r => r.status === 'pending');
  const pendingFees = studentFees.filter(f => f.status === 'pending');
  const overdueFees = studentFees.filter(f => f.status === 'overdue');
  const totalRevenue = studentFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);

  const stats = {
    pendingSupplies: pendingSupplies.length,
    pendingFees: pendingFees.length,
    overdueFees: overdueFees.length,
    totalRevenue
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Supply verification and student fee management</p>
        </div>
        <DollarSign className="w-8 h-8 text-green-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingSupplies}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingFees}</div>
            <p className="text-xs text-muted-foreground">
              Student payments due
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Fees</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueFees}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KSh {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Collected this term
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supplies" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Supply Verification
          </TabsTrigger>
          <TabsTrigger value="fee-management" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Fee Management
          </TabsTrigger>
          <TabsTrigger value="student-fees" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Student Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supplies" className="space-y-4">
          <SupplyVerification />
        </TabsContent>

        <TabsContent value="fee-management" className="space-y-4">
          <FeeManagement />
        </TabsContent>

        <TabsContent value="student-fees" className="space-y-4">
          <StudentFeesOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};
