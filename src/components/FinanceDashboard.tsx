
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileCheck, CreditCard, AlertTriangle, Package, Receipt, Settings, File, UserCheck, Users, FileBarChart, PiggyBank, ShoppingCart, Gift, Ban, MessageSquare } from "lucide-react";
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
import { BudgetingPlanning } from "@/components/finance/BudgetingPlanning";
import { PayrollManagement } from "@/components/finance/PayrollManagement";
import { ProcurementOversight } from "@/components/finance/ProcurementOversight";
import { FinancialReporting } from "@/components/finance/FinancialReporting";
import { GrantsManagement } from "@/components/finance/GrantsManagement";
import { StudentCardManagement } from "@/components/finance/StudentCardManagement";

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

      {/* Main Content Tabs - Reorganized for better organization */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          {/* Core Finance Operations */}
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 text-xs">
            <Receipt className="w-4 h-4" />
            <span>Fees</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex flex-col items-center gap-1 text-xs">
            <File className="w-4 h-4" />
            <span>Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="clearances" className="flex flex-col items-center gap-1 text-xs">
            <UserCheck className="w-4 h-4" />
            <span>Clearances</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex flex-col items-center gap-1 text-xs">
            <CreditCard className="w-4 h-4" />
            <span>Cards</span>
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex flex-col items-center gap-1 text-xs">
            <Package className="w-4 h-4" />
            <span>Supplies</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex flex-col items-center gap-1 text-xs">
            <Ban className="w-4 h-4" />
            <span>Access</span>
          </TabsTrigger>
          
          {/* Planning & Management */}
          <TabsTrigger value="budgeting" className="flex flex-col items-center gap-1 text-xs">
            <PiggyBank className="w-4 h-4" />
            <span>Budget</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex flex-col items-center gap-1 text-xs">
            <Users className="w-4 h-4" />
            <span>Payroll</span>
          </TabsTrigger>
          <TabsTrigger value="procurement" className="flex flex-col items-center gap-1 text-xs">
            <ShoppingCart className="w-4 h-4" />
            <span>Procurement</span>
          </TabsTrigger>
          <TabsTrigger value="grants" className="flex flex-col items-center gap-1 text-xs">
            <Gift className="w-4 h-4" />
            <span>Grants</span>
          </TabsTrigger>
          
          {/* Configuration & Reports */}
          <TabsTrigger value="structures" className="flex flex-col items-center gap-1 text-xs">
            <Settings className="w-4 h-4" />
            <span>Structures</span>
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex flex-col items-center gap-1 text-xs">
            <FileBarChart className="w-4 h-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview" className="space-y-4">
          <StudentFeesOverview />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManagement />
        </TabsContent>

        <TabsContent value="clearances" className="space-y-4">
          <ClearanceManagement />
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <StudentCardManagement />
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <SupplyVerification />
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <AccessControl />
        </TabsContent>

        <TabsContent value="budgeting" className="space-y-4">
          <BudgetingPlanning />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollManagement />
        </TabsContent>

        <TabsContent value="procurement" className="space-y-4">
          <ProcurementOversight />
        </TabsContent>

        <TabsContent value="grants" className="space-y-4">
          <GrantsManagement />
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <FeeStructureManagement />
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <FinancialReporting />
        </TabsContent>
      </Tabs>
    </div>
  );
};
