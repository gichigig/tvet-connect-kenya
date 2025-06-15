
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileCheck, CreditCard, AlertTriangle, Package, Receipt, Settings, File, UserCheck, Upload, Ban, MessageSquare, FileBarChart } from "lucide-react";
import { SupplyVerification } from "@/components/finance/SupplyVerification";
import { FeeManagement } from "@/components/finance/FeeManagement";
import { StudentFeesOverview } from "@/components/finance/StudentFeesOverview";
import { FeeStructureManagement } from "@/components/finance/FeeStructureManagement";
import { InvoiceManagement } from "@/components/finance/InvoiceManagement";
import { ClearanceManagement } from "@/components/finance/ClearanceManagement";
import { FeeStructureUpload } from "@/components/finance/FeeStructureUpload";
import { ReceiptGeneration } from "@/components/finance/ReceiptGeneration";
import { AccessControl } from "@/components/finance/AccessControl";
import { NotificationSystem } from "@/components/finance/NotificationSystem";
import { FinancialReports } from "@/components/finance/FinancialReports";

export const FinanceDashboard = () => {
  const { user, supplyRequests, studentFees, getAllUsers, clearanceForms } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const pendingSupplies = supplyRequests.filter(r => r.status === 'pending');
  const pendingFees = studentFees.filter(f => f.status === 'pending');
  const overdueFees = studentFees.filter(f => f.status === 'overdue');
  const totalRevenue = studentFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + (fee.paidAmount || fee.amount), 0);
  
  const students = getAllUsers().filter(u => u.role === 'student' && u.approved);
  const defaulters = students.filter(s => s.financialStatus === 'defaulter');
  const pendingClearances = clearanceForms.filter(c => c.status === 'pending');

  const stats = {
    pendingSupplies: pendingSupplies.length,
    pendingFees: pendingFees.length,
    overdueFees: overdueFees.length,
    totalRevenue,
    defaulters: defaulters.length,
    pendingClearances: pendingClearances.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial management system</p>
        </div>
        <DollarSign className="w-8 h-8 text-green-600" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <CardTitle className="text-sm font-medium">Defaulters</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.defaulters}</div>
            <p className="text-xs text-muted-foreground">
              Students blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Clearances</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingClearances}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
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
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            <span className="hidden sm:inline">Fees</span>
          </TabsTrigger>
          <TabsTrigger value="structures" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">Structures</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            <span className="hidden sm:inline">Receipts</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-1">
            <Ban className="w-3 h-3" />
            <span className="hidden sm:inline">Access</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <FileBarChart className="w-3 h-3" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-1">
            <File className="w-3 h-3" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="clearances" className="flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Clearances</span>
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center gap-1">
            <FileCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Supplies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StudentFeesOverview />
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <FeeStructureManagement />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeeStructureUpload />
            <FeeManagement />
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <ReceiptGeneration />
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <AccessControl />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSystem />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManagement />
        </TabsContent>

        <TabsContent value="clearances" className="space-y-4">
          <ClearanceManagement />
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <SupplyVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};
