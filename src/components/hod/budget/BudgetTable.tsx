
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { BudgetItem } from "./types";
import { formatCurrency, getStatusBadge } from "./utils.tsx";

interface BudgetTableProps {
  budgetItems: BudgetItem[];
}

export const BudgetTable = ({ budgetItems }: BudgetTableProps) => {
  return (
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
  );
};
