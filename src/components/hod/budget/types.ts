
export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  allocated: number;
  spent: number;
  status: "on_track" | "overspent" | "underutilized";
  priority: "high" | "medium" | "low";
}

export interface ProcurementRequest {
  id: string;
  item: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  urgency: "urgent" | "normal" | "low";
}
