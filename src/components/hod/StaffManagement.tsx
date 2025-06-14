
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StaffMember } from "./staff/types";
import { StaffFilters } from "./staff/StaffFilters";
import { StaffTable } from "./staff/StaffTable";

export const StaffManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Dr. John Kamau",
      email: "j.kamau@institution.ac.ke",
      position: "Senior Lecturer",
      department: "Mechanical Engineering",
      hireDate: "2020-03-15",
      status: "active",
      workload: 85,
      performance: "excellent"
    },
    {
      id: "2",
      name: "Ms. Sarah Wanjiku",
      email: "s.wanjiku@institution.ac.ke",
      position: "Lecturer",
      department: "Mechanical Engineering",
      hireDate: "2021-08-20",
      status: "active",
      workload: 75,
      performance: "good"
    },
    {
      id: "3",
      name: "Mr. Peter Ochieng",
      email: "p.ochieng@institution.ac.ke",
      position: "Assistant Lecturer",
      department: "Mechanical Engineering",
      hireDate: "2023-01-10",
      status: "probation",
      workload: 60,
      performance: "average"
    }
  ]);

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || staff.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleScheduleAppraisal = (staff: StaffMember) => {
    toast({
      title: "Appraisal Scheduled",
      description: `Performance appraisal scheduled for ${staff.name}.`,
    });
  };

  const handleAddStaff = () => {
    // Add staff logic here
    console.log("Add staff clicked");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Management
          </CardTitle>
          <CardDescription>
            Manage department lecturers, workloads, and performance evaluations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onAddStaff={handleAddStaff}
          />
          <StaffTable
            staffMembers={filteredStaff}
            onScheduleAppraisal={handleScheduleAppraisal}
          />
        </CardContent>
      </Card>
    </div>
  );
};
