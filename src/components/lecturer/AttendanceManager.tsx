
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  present: boolean;
}

interface AttendanceRecord {
  id: string;
  unitCode: string;
  unitName: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  attendanceRate: number;
}

export const AttendanceManager = () => {
  const { toast } = useToast();
  const { user, createdUnits } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  // Mock students for the selected unit - in a real app, this would come from enrollment data
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'John Smith', studentId: 'CS001', email: 'john@student.edu', present: false },
    { id: '2', name: 'Jane Doe', studentId: 'CS002', email: 'jane@student.edu', present: false },
    { id: '3', name: 'Bob Johnson', studentId: 'CS003', email: 'bob@student.edu', present: false },
    { id: '4', name: 'Alice Brown', studentId: 'CS004', email: 'alice@student.edu', present: false },
    { id: '5', name: 'Charlie Davis', studentId: 'CS005', email: 'charlie@student.edu', present: false },
  ]);

  const handleStudentAttendance = (studentId: string, present: boolean) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, present } : student
    ));
  };

  const handleMarkAll = (present: boolean) => {
    setStudents(students.map(student => ({ ...student, present })));
  };

  const handleSaveAttendance = () => {
    if (!selectedUnit) {
      toast({
        title: "Error",
        description: "Please select a unit first.",
        variant: "destructive",
      });
      return;
    }

    const selectedUnitData = assignedUnits.find(unit => unit.code === selectedUnit);
    if (!selectedUnitData) {
      toast({
        title: "Error",
        description: "Selected unit not found.",
        variant: "destructive",
      });
      return;
    }

    const presentStudents = students.filter(s => s.present).length;
    const attendanceRate = Math.round((presentStudents / students.length) * 100 * 10) / 10;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      unitCode: selectedUnitData.code,
      unitName: selectedUnitData.name,
      date: selectedDate,
      totalStudents: students.length,
      presentStudents,
      attendanceRate
    };

    setAttendanceHistory([newRecord, ...attendanceHistory]);

    toast({
      title: "Attendance Saved",
      description: `Attendance for ${selectedUnitData.code} on ${selectedDate} has been saved.`,
    });

    // Reset attendance for next session
    setStudents(students.map(student => ({ ...student, present: false })));
  };

  const presentCount = students.filter(s => s.present).length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100 * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manual Attendance</h2>
          <p className="text-gray-600">Take attendance for your classes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Attendance Taking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Take Attendance</CardTitle>
          <CardDescription>Mark student attendance for today's class</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {assignedUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.code}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {selectedUnit && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {presentCount}/{students.length} Present ({attendanceRate}%)
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll(true)}>
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkAll(false)}>
                    Mark All Absent
                  </Button>
                </div>
              </div>

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
                            handleStudentAttendance(student.id, checked as boolean)
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

              <div className="flex justify-end space-x-2">
                <Button onClick={handleSaveAttendance}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
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
    </div>
  );
};
