
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, Calculator, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const BudgetingPlanning = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([
    { id: '1', department: 'Engineering', allocatedAmount: 5000000, spentAmount: 3200000, year: '2024/2025', status: 'active' },
    { id: '2', department: 'Business Studies', allocatedAmount: 3500000, spentAmount: 2100000, year: '2024/2025', status: 'active' },
    { id: '3', department: 'ICT', allocatedAmount: 4500000, spentAmount: 2800000, year: '2024/2025', status: 'active' }
  ]);

  const [newBudget, setNewBudget] = useState({
    department: '',
    allocatedAmount: '',
    year: '2024/2025',
    category: 'operational'
  });

  const handleAddBudget = () => {
    if (!newBudget.department || !newBudget.allocatedAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const budget = {
      id: Date.now().toString(),
      department: newBudget.department,
      allocatedAmount: parseInt(newBudget.allocatedAmount),
      spentAmount: 0,
      year: newBudget.year,
      status: 'active' as const
    };

    setBudgets(prev => [...prev, budget]);
    setNewBudget({ department: '', allocatedAmount: '', year: '2024/2025', category: 'operational' });
    
    toast({
      title: "Budget Created",
      description: `Budget allocation for ${newBudget.department} has been created.`,
    });
  };

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Budgeting & Planning
          </CardTitle>
          <CardDescription>
            Prepare annual budgets, allocate funds, and forecast revenue - your semester survival plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">KSh {totalAllocated.toLocaleString()}</div>
              <div className="text-sm text-blue-800">Total Allocated</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">KSh {totalSpent.toLocaleString()}</div>
              <div className="text-sm text-green-800">Total Spent</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">KSh {(totalAllocated - totalSpent).toLocaleString()}</div>
              <div className="text-sm text-orange-800">Remaining</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{utilizationRate}%</div>
              <div className="text-sm text-purple-800">Utilization Rate</div>
            </div>
          </div>

          <Tabs defaultValue="budgets" className="space-y-4">
            <TabsList>
              <TabsTrigger value="budgets">Budget Allocation</TabsTrigger>
              <TabsTrigger value="forecasting">Revenue Forecasting</TabsTrigger>
              <TabsTrigger value="planning">Annual Planning</TabsTrigger>
            </TabsList>

            <TabsContent value="budgets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <Select value={newBudget.department} onValueChange={(value) => setNewBudget(prev => ({...prev, department: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Business Studies">Business Studies</SelectItem>
                    <SelectItem value="ICT">ICT</SelectItem>
                    <SelectItem value="Applied Sciences">Applied Sciences</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Allocated amount"
                  type="number"
                  value={newBudget.allocatedAmount}
                  onChange={(e) => setNewBudget(prev => ({...prev, allocatedAmount: e.target.value}))}
                />
                <Select value={newBudget.year} onValueChange={(value) => setNewBudget(prev => ({...prev, year: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="capital">Capital</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddBudget}>Add Budget</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Allocated Amount</TableHead>
                    <TableHead>Spent Amount</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Utilization %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => {
                    const remaining = budget.allocatedAmount - budget.spentAmount;
                    const utilization = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount * 100).toFixed(1) : 0;
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.department}</TableCell>
                        <TableCell>KSh {budget.allocatedAmount.toLocaleString()}</TableCell>
                        <TableCell>KSh {budget.spentAmount.toLocaleString()}</TableCell>
                        <TableCell>KSh {remaining.toLocaleString()}</TableCell>
                        <TableCell>{utilization}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            budget.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {budget.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="forecasting" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Revenue Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Student Fees (Projected)</span>
                        <span className="font-medium">KSh 45,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Government Grants</span>
                        <span className="font-medium">KSh 15,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Donor Funding</span>
                        <span className="font-medium">KSh 8,000,000</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Projected Revenue</span>
                        <span>KSh 68,000,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Expenditure Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Staff Salaries</span>
                        <span className="font-medium">KSh 35,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operational Costs</span>
                        <span className="font-medium">KSh 12,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Infrastructure</span>
                        <span className="font-medium">KSh 8,000,000</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Projected Expenditure</span>
                        <span>KSh 55,000,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="planning" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Priorities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Infrastructure Development (30%)</li>
                      <li>• Academic Programs Enhancement (25%)</li>
                      <li>• Technology Upgrade (20%)</li>
                      <li>• Staff Development (15%)</li>
                      <li>• Emergency Fund (10%)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Q1: Budget Approval & Allocation</li>
                      <li>• Q2: Infrastructure Projects Start</li>
                      <li>• Q3: Mid-year Review & Adjustments</li>
                      <li>• Q4: Annual Assessment & Planning</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Mitigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• 10% Contingency Fund</li>
                      <li>• Diversified Revenue Sources</li>
                      <li>• Quarterly Budget Reviews</li>
                      <li>• Cost Control Measures</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
