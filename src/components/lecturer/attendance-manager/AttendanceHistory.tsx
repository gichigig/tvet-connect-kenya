
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface AttendanceRecord {
  id: string;
  unitCode: string;
  unitName: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  attendanceRate: number;
}

interface AttendanceHistoryProps {
  attendanceHistory: AttendanceRecord[];
}

export const AttendanceHistory = ({ attendanceHistory }: AttendanceHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance History</CardTitle>
        <CardDescription>View previous attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
        {attendanceHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.unitCode} - {record.unitName}
                  </TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.totalStudents}</TableCell>
                  <TableCell>{record.presentStudents}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.attendanceRate >= 80 ? "default" : "destructive"}
                    >
                      {record.attendanceRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No attendance records yet.</p>
            <p className="text-sm">Records will appear here after you save attendance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
