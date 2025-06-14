
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StaffMember } from "./types";
import { StaffStatusBadge } from "./StaffStatusBadge";
import { PerformanceBadge } from "./PerformanceBadge";
import { WorkloadDisplay } from "./WorkloadDisplay";
import { StaffActions } from "./StaffActions";

interface StaffTableProps {
  staffMembers: StaffMember[];
  onScheduleAppraisal: (staff: StaffMember) => void;
}

export const StaffTable = ({ staffMembers, onScheduleAppraisal }: StaffTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Workload</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staffMembers.map((staff) => (
          <TableRow key={staff.id}>
            <TableCell>
              <div>
                <div className="font-medium">{staff.name}</div>
                <div className="text-sm text-gray-500">{staff.email}</div>
              </div>
            </TableCell>
            <TableCell>{staff.position}</TableCell>
            <TableCell>
              <StaffStatusBadge status={staff.status} />
            </TableCell>
            <TableCell>
              <WorkloadDisplay workload={staff.workload} />
            </TableCell>
            <TableCell>
              <PerformanceBadge performance={staff.performance} />
            </TableCell>
            <TableCell>
              <StaffActions staff={staff} onScheduleAppraisal={onScheduleAppraisal} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
