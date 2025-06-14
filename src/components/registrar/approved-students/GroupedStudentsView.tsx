
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber?: string;
  level?: string;
}

interface GroupedStudents {
  [course: string]: {
    [year: string]: {
      [semester: string]: User[];
    };
  };
}

interface GroupedStudentsViewProps {
  groupedStudents: GroupedStudents;
  courses: string[];
  getTotalStudentsInGroup: (course: string, year?: string, semester?: string) => number;
}

const formatLevel = (level?: string) => {
  if (!level) return 'N/A';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

export const GroupedStudentsView = ({ 
  groupedStudents, 
  courses, 
  getTotalStudentsInGroup 
}: GroupedStudentsViewProps) => {
  return (
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
                            {students.map((student: User) => (
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
  );
};
