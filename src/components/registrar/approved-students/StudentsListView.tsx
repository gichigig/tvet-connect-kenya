
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course?: string;
  level?: string;
  year?: number;
  semester?: number;
  admissionNumber?: string;
}

interface StudentsListViewProps {
  filteredStudents: User[];
}

const formatLevel = (level?: string) => {
  if (!level) return 'N/A';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

export const StudentsListView = ({ filteredStudents }: StudentsListViewProps) => {
  return (
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
  );
};
