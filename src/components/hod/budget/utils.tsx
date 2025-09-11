import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

// Budget utility functions (single clean copy)
export const formatCurrency = (amount: number, currency: string = "KES"): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-KE").format(num);
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

export const calculateVariance = (
  actual: number,
  budgeted: number
): {
  amount: number;
  percentage: number;
  type: "over" | "under" | "on-target";
} => {
  const amount = actual - budgeted;
  const percentage = budgeted === 0 ? 0 : Math.round((amount / budgeted) * 100);

  let type: "over" | "under" | "on-target";
  if (Math.abs(percentage) <= 5) {
    type = "on-target";
  } else if (amount > 0) {
    type = "over";
  } else {
    type = "under";
  }

  return { amount, percentage, type };
};

export const getBudgetStatus = (actual: number, budgeted: number): {
  status: "within-budget" | "over-budget" | "under-budget";
  color: string;
} => {
  const variance = calculateVariance(actual, budgeted);

  if (variance.type === "on-target") {
    return { status: "within-budget", color: "green" };
  } else if (variance.type === "over") {
    return { status: "over-budget", color: "red" };
  } else {
    return { status: "under-budget", color: "blue" };
  }
};

export const getStatusBadge = (status: string): ReactNode => {
  switch (status) {
    case "within-budget":
      return <Badge className="bg-green-100 text-green-800">Within Budget</Badge>;
    case "over-budget":
      return <Badge className="bg-red-100 text-red-800">Over Budget</Badge>;
    case "under-budget":
      return <Badge className="bg-blue-100 text-blue-800">Under Budget</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const formatBudgetPeriod = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
  });
  const end = endDate.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
  });

  return `${start} - ${end}`;
};

export const calculateBudgetUtilization = (spent: number, allocated: number): number => {
  if (allocated === 0) return 0;
  return Math.min(Math.round((spent / allocated) * 100), 100);
};

export const getBudgetHealthScore = (
  categories: Array<{
    allocated: number;
    spent: number;
  }>
): number => {
  if (categories.length === 0) return 0;

  const scores = categories.map((category) => {
    const utilization = calculateBudgetUtilization(category.spent, category.allocated);
    // Optimal utilization is between 70-95%
    if (utilization >= 70 && utilization <= 95) return 100;
    if (utilization >= 50 && utilization < 70) return 80;
    if (utilization >= 30 && utilization < 50) return 60;
    if (utilization < 30) return 40;
    if (utilization > 95) return Math.max(20, 100 - (utilization - 95) * 2);
    return 0;
  });

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};
