
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { BudgetItem } from "./types";
import { formatCurrency } from "./utils.tsx";

interface BudgetSummaryProps {
  budgetItems: BudgetItem[];
}

export const BudgetSummary = ({ budgetItems }: BudgetSummaryProps) => {
  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const utilizationRate = (totalSpent / totalAllocated) * 100;

  return (
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
  );
};
