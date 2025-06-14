
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CourseYearSelectorProps {
  selectedCourse: string;
  selectedYear: string;
  onCourseChange: (course: string) => void;
  onYearChange: (year: string) => void;
}

export const CourseYearSelector = ({ 
  selectedCourse, 
  selectedYear, 
  onCourseChange, 
  onYearChange 
}: CourseYearSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="course">Select Course</Label>
        <Select value={selectedCourse} onValueChange={onCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Software Engineering">Software Engineering</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Information Technology">Information Technology</SelectItem>
            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Select Year</Label>
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose academic year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Year 1</SelectItem>
            <SelectItem value="2">Year 2</SelectItem>
            <SelectItem value="3">Year 3</SelectItem>
            <SelectItem value="4">Year 4</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
