
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  present: boolean;
}

interface StudentAttendanceTableProps {
  students: Student[];
  onStudentAttendanceChange: (studentId: string, present: boolean) => void;
}

export const StudentAttendanceTable = ({ students, onStudentAttendanceChange }: StudentAttendanceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Present</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>
              <Checkbox
                checked={student.present}
                onCheckedChange={(checked) => 
                  onStudentAttendanceChange(student.id, checked as boolean)
                }
              />
            </TableCell>
            <TableCell className="font-medium">{student.studentId}</TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
