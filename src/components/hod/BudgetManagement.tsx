
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BudgetSummary } from "./budget/BudgetSummary";
import { BudgetTable } from "./budget/BudgetTable";
import { ProcurementTable } from "./budget/ProcurementTable";
import { BudgetItem, ProcurementRequest } from "./budget/types";

export const BudgetManagement = () => {
  const [activeTab, setActiveTab] = useState<"budget" | "procurement">("budget");

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

  return (
    <div className="space-y-6">
      <BudgetSummary budgetItems={budgetItems} />

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

      {activeTab === "budget" && <BudgetTable budgetItems={budgetItems} />}
      {activeTab === "procurement" && <ProcurementTable procurementRequests={procurementRequests} />}
    </div>
  );
};
