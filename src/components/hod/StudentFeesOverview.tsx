
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Unit } from '@/types/unitManagement';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { FeesSummaryCards } from "./student-fees-overview/FeesSummaryCards";
import { FeesFilters } from "./student-fees-overview/FeesFilters";
import { FeesTable } from "./student-fees-overview/FeesTable";

interface StudentFeesOverviewProps {
  units?: Unit[];
}

export const StudentFeesOverview = ({ units }: StudentFeesOverviewProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  
  // Mock student fees data since it's not available in context
  const [studentFees] = useState<any[]>([]);

  const handleMarkAsPaid = (feeId: string, studentName: string) => {
    // Mock implementation
    toast({
      title: "Payment Recorded",
      description: `Payment for ${studentName} has been recorded.`,
    });
  };

  const handleMarkAsOverdue = (feeId: string, studentName: string) => {
    // Mock implementation
    toast({
      title: "Fee Marked Overdue",
      description: `Fee for ${studentName} has been marked as overdue.`,
      variant: "destructive",
    });
  };

  const filteredFees = studentFees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.unitCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || fee.status === filterStatus;
    const matchesType = filterType === "all" || fee.feeType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Fees Overview</h2>
          <p className="text-gray-600">Monitor and manage all student fee payments</p>
        </div>
      </div>

      {/* <FeesSummaryCards studentFees={studentFees} /> */}
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student fees overview will be displayed here.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Student Fees</CardTitle>
          <CardDescription>
            Track all fee payments across the institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <FeesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
          />

          <FeesTable
            fees={filteredFees}
            onMarkAsPaid={handleMarkAsPaid}
            onMarkAsOverdue={handleMarkAsOverdue}
          /> */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">Fees filters and table will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
