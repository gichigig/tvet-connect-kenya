
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allCourses } from "@/data/zetechCourses";
import { Search } from "lucide-react";

interface ApprovedStudentsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
}

export const ApprovedStudentsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCourse,
  setSelectedCourse
}: ApprovedStudentsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or admission number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder="Filter by course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {allCourses.map(course => (
            <SelectItem key={course} value={course}>{course}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
