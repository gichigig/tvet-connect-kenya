
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Users, BookOpen } from "lucide-react";
import { ApprovedStudentsStats } from "./approved-students/ApprovedStudentsStats";
import { ApprovedStudentsFilters } from "./approved-students/ApprovedStudentsFilters";
import { GroupedStudentsView } from "./approved-students/GroupedStudentsView";
import { StudentsListView } from "./approved-students/StudentsListView";

interface GroupedStudents {
  [course: string]: {
    [year: string]: {
      [semester: string]: any[];
    };
  };
}

export const ApprovedStudents = () => {
  const { getAllUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped");

  const approvedStudents = getAllUsers().filter(u => u.role === 'student' && u.approved);

  // Group students by course, year, and semester
  const groupedStudents: GroupedStudents = approvedStudents.reduce((acc, student) => {
    const course = student.course || 'Unassigned';
    const year = student.year?.toString() || 'Unknown';
    const semester = student.semester?.toString() || 'Unknown';

    if (!acc[course]) acc[course] = {};
    if (!acc[course][year]) acc[course][year] = {};
    if (!acc[course][year][semester]) acc[course][year][semester] = [];
    
    acc[course][year][semester].push(student);
    return acc;
  }, {} as GroupedStudents);

  const courses = Object.keys(groupedStudents);

  const filteredStudents = approvedStudents.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const getTotalStudentsInGroup = (course: string, year?: string, semester?: string) => {
    if (semester && year) {
      return groupedStudents[course]?.[year]?.[semester]?.length || 0;
    }
    if (year) {
      return Object.values(groupedStudents[course]?.[year] || {}).reduce((sum, semesterStudents) => sum + semesterStudents.length, 0);
    }
    return Object.values(groupedStudents[course] || {}).reduce((sum, yearData) => 
      sum + Object.values(yearData).reduce((yearSum, semesterStudents) => yearSum + semesterStudents.length, 0), 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approved Students</h2>
          <p className="text-gray-600">Students categorized by course, year, and semester for unit allocation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grouped" ? "default" : "outline"}
            onClick={() => setViewMode("grouped")}
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Grouped View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>
      </div>

      <ApprovedStudentsStats 
        totalApproved={approvedStudents.length}
        totalCourses={courses.length}
      />

      <ApprovedStudentsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        courses={courses}
      />

      {viewMode === "grouped" ? (
        <GroupedStudentsView
          groupedStudents={groupedStudents}
          courses={courses}
          getTotalStudentsInGroup={getTotalStudentsInGroup}
        />
      ) : (
        <StudentsListView filteredStudents={filteredStudents} />
      )}
    </div>
  );
};
