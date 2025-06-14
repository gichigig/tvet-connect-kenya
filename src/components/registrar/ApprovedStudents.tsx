
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, GraduationCap, Users, BookOpen } from "lucide-react";

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

  const formatLevel = (level?: string) => {
    if (!level) return 'N/A';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-blue-600">{approvedStudents.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-green-600">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Units</p>
                <p className="text-2xl font-bold text-purple-600">{approvedStudents.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course} value={course}>{course}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === "grouped" ? (
        /* Grouped View */
        <div className="space-y-6">
          {courses.map(course => (
            <Card key={course}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{course}</CardTitle>
                  <Badge variant="outline">{getTotalStudentsInGroup(course)} students</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={Object.keys(groupedStudents[course])[0]} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    {Object.keys(groupedStudents[course]).map(year => (
                      <TabsTrigger key={year} value={year}>
                        Year {year} ({getTotalStudentsInGroup(course, year)})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.entries(groupedStudents[course]).map(([year, semesterData]) => (
                    <TabsContent key={year} value={year} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(semesterData).map(([semester, students]) => (
                          <Card key={semester}>
                            <CardHeader>
                              <CardTitle className="text-lg">Semester {semester}</CardTitle>
                              <CardDescription>{students.length} students</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {students.map((student: any) => (
                                  <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                                      <div className="text-sm text-gray-500">
                                        {student.admissionNumber} • {student.email}
                                      </div>
                                    </div>
                                    <Badge variant="secondary">{formatLevel(student.level)}</Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>All Approved Students</CardTitle>
            <CardDescription>Complete list of approved students ready for unit allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Course & Level</TableHead>
                  <TableHead>Year & Semester</TableHead>
                  <TableHead>Admission Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.course || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {formatLevel(student.level)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Year {student.year || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Semester {student.semester || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.admissionNumber}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No approved students found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
