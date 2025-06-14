
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StaffFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onAddStaff: () => void;
}

export const StaffFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  onAddStaff 
}: StaffFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Input
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="leave">On Leave</SelectItem>
          <SelectItem value="probation">Probation</SelectItem>
        </SelectContent>
      </Select>
      <Button className="flex items-center gap-2" onClick={onAddStaff}>
        <Plus className="w-4 h-4" />
        Add Staff
      </Button>
    </div>
  );
};
