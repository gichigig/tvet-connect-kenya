
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  hireDate: string;
  status: "active" | "leave" | "probation";
  workload: number;
  performance: "excellent" | "good" | "average" | "needs_improvement";
}
