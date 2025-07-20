import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Download, Send, FileText, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Timetable {
  id: string;
  title: string;
  course: string;
  year: number;
  semester: number;
  academicYear: string;
  schedule: TimetableEntry[];
  createdBy: string;
  createdDate: string;
  sentToStudents: boolean;
}

interface TimetableEntry {
  day: string;
  time: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  room?: string;
}

export const TimetableManager = () => {
  const { user, getAllUsers } = useAuth();
  const { createdUnits } = useUnits();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [timetableTitle, setTimetableTitle] = useState("");
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Get department units with assigned lecturers
  const departmentUnits = createdUnits.filter(unit => 
    unit.department === user?.department && 
    unit.status === 'active' &&
    unit.lecturerId
  );

  // Get unique courses and years
  const courses = [...new Set(departmentUnits.map(unit => unit.course))];
  const years = [...new Set(departmentUnits.map(unit => unit.year))].sort();

  const addTimetableEntry = () => {
    setSchedule([...schedule, {
      day: "",
      time: "",
      unitCode: "",
      unitName: "",
      lecturer: "",
      room: ""
    }]);
  };

  const updateTimetableEntry = (index: number, field: keyof TimetableEntry, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    
    // Auto-fill unit details when unit is selected
    if (field === 'unitCode') {
      const unit = departmentUnits.find(u => u.code === value);
      if (unit) {
        newSchedule[index].unitName = unit.name;
        newSchedule[index].lecturer = unit.lecturerName || "";
      }
    }
    
    setSchedule(newSchedule);
  };

  const removeTimetableEntry = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const createTimetable = () => {
    if (!timetableTitle || !selectedCourse || !selectedYear || !selectedSemester || !academicYear) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (schedule.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one timetable entry",
        variant: "destructive"
      });
      return;
    }

    const newTimetable: Timetable = {
      id: Date.now().toString(),
      title: timetableTitle,
      course: selectedCourse,
      year: parseInt(selectedYear),
      semester: parseInt(selectedSemester),
      academicYear,
      schedule: schedule.filter(entry => entry.day && entry.time && entry.unitCode),
      createdBy: user?.id || "",
      createdDate: new Date().toISOString(),
      sentToStudents: false
    };

    setTimetables([...timetables, newTimetable]);
    
    // Reset form
    setTimetableTitle("");
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");
    setAcademicYear("");
    setSchedule([]);
    setIsCreating(false);

    toast({
      title: "Success",
      description: "Timetable created successfully",
    });
  };

  const sendTimetableToStudents = (timetableId: string) => {
    setTimetables(timetables.map(t => 
      t.id === timetableId ? { ...t, sentToStudents: true } : t
    ));

    // Here you would typically integrate with the notification system
    toast({
      title: "Success",
      description: "Timetable sent to students and available in notifications",
    });
  };

  const downloadTimetable = (timetable: Timetable) => {
    // Create CSV content
    const csvContent = [
      ['Day', 'Time', 'Unit Code', 'Unit Name', 'Lecturer', 'Room'],
      ...timetable.schedule.map(entry => [
        entry.day,
        entry.time,
        entry.unitCode,
        entry.unitName,
        entry.lecturer,
        entry.room || ''
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${timetable.title}_${timetable.course}_Year${timetable.year}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Timetable downloaded successfully",
    });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timetable Management</h2>
          <p className="text-gray-600">Create and distribute class timetables</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Create Timetable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Timetable</DialogTitle>
              <DialogDescription>
                Create a class timetable for your department students
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Timetable Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Computer Science Year 1 Semester 1"
                    value={timetableTitle}
                    onChange={(e) => setTimetableTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    placeholder="e.g., 2024/2025"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule Entries */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Class Schedule</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTimetableEntry}>
                    Add Entry
                  </Button>
                </div>

                {schedule.map((entry, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-6 gap-2">
                        <Select value={entry.day} onValueChange={(value) => updateTimetableEntry(index, 'day', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}</SelectContent>
                        </Select>

                        <Select value={entry.time} onValueChange={(value) => updateTimetableEntry(index, 'time', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}</SelectContent>
                        </Select>

                        <Select value={entry.unitCode} onValueChange={(value) => updateTimetableEntry(index, 'unitCode', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentUnits.filter(u => 
                              (!selectedCourse || u.course === selectedCourse) &&
                              (!selectedYear || u.year === parseInt(selectedYear)) &&
                              (!selectedSemester || u.semester === parseInt(selectedSemester))
                            ).map((unit) => (
                              <SelectItem key={unit.id} value={unit.code}>
                                {unit.code} - {unit.name}
                              </SelectItem>
                            ))}</SelectContent>
                        </Select>

                        <Input
                          placeholder="Lecturer"
                          value={entry.lecturer}
                          onChange={(e) => updateTimetableEntry(index, 'lecturer', e.target.value)}
                          readOnly
                        />

                        <Input
                          placeholder="Room (optional)"
                          value={entry.room}
                          onChange={(e) => updateTimetableEntry(index, 'room', e.target.value)}
                        />

                        <Button type="button" variant="outline" size="sm" onClick={() => removeTimetableEntry(index)}>
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={createTimetable}>
                Create Timetable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Timetables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timetables.map((timetable) => (
          <Card key={timetable.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{timetable.title}</CardTitle>
                <Badge variant={timetable.sentToStudents ? "default" : "secondary"}>
                  {timetable.sentToStudents ? "Sent" : "Draft"}
                </Badge>
              </div>
              <CardDescription>
                {timetable.course} • Year {timetable.year} • Semester {timetable.semester}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Academic Year: {timetable.academicYear}
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-2" />
                  {timetable.schedule.length} class entries
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadTimetable(timetable)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {!timetable.sentToStudents && (
                  <Button 
                    size="sm" 
                    onClick={() => sendTimetableToStudents(timetable.id)}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to Students
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {timetables.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timetables Created</h3>
            <p className="text-gray-600">Create your first timetable to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
