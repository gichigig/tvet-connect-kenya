import { useState, useEffect, Fragment } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Download, Users } from "lucide-react";

interface TimetableEntry {
  id: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  day: string;
  time: string;
  venue: string;
  duration: string;
  course: string;
  year: number;
  semester: number;
}

interface Timetable {
  id: string;
  name: string;
  description: string;
  course: string;
  year: number;
  semester: number;
  entries: TimetableEntry[];
  createdDate: string;
  isActive: boolean;
}

export const TimetableViewer = () => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);

  // Mock timetables - in a real app, these would be fetched from Firebase
  useEffect(() => {
    if (!user) return;

    // Sample timetables for demonstration
    const sampleTimetables: Timetable[] = [
      {
        id: "1",
        name: `${user.course || 'Computer Science'} Year ${user.year || 1} Semester ${user.semester || 1} - 2025`,
        description: "Current semester timetable",
        course: user.course || 'Computer Science',
        year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
        semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1,
        isActive: true,
        createdDate: "2025-01-20",
        entries: [
          {
            id: "1",
            unitCode: "CS101",
            unitName: "Introduction to Programming",
            lecturer: "Dr. John Smith",
            day: "Monday",
            time: "08:00",
            venue: "Lab 1",
            duration: "2",
            course: user.course || 'Computer Science',
            year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
            semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1
          },
          {
            id: "2",
            unitCode: "CS102",
            unitName: "Computer Systems",
            lecturer: "Prof. Jane Doe",
            day: "Monday",
            time: "10:00",
            venue: "Room 201",
            duration: "2",
            course: user.course || 'Computer Science',
            year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
            semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1
          },
          {
            id: "3",
            unitCode: "CS103",
            unitName: "Mathematics for CS",
            lecturer: "Dr. Mike Johnson",
            day: "Tuesday",
            time: "08:00",
            venue: "Room 105",
            duration: "2",
            course: user.course || 'Computer Science',
            year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
            semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1
          },
          {
            id: "4",
            unitCode: "CS101",
            unitName: "Introduction to Programming",
            lecturer: "Dr. John Smith",
            day: "Wednesday",
            time: "14:00",
            venue: "Lab 1",
            duration: "3",
            course: user.course || 'Computer Science',
            year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
            semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1
          },
          {
            id: "5",
            unitCode: "CS104",
            unitName: "Database Systems",
            lecturer: "Dr. Sarah Wilson",
            day: "Thursday",
            time: "10:00",
            venue: "Lab 2",
            duration: "2",
            course: user.course || 'Computer Science',
            year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
            semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1
          },
          {
            id: "6",
            unitCode: "CS102",
            unitName: "Computer Systems",
            lecturer: "Prof. Jane Doe",
            day: "Friday",
            time: "08:00",
            venue: "Room 201",
            duration: "2",
            course: user.course || 'Computer Science',
            year: typeof user.year === 'string' ? parseInt(user.year) || 1 : user.year || 1,
            semester: typeof user.semester === 'string' ? parseInt(user.semester) || 1 : user.semester || 1
          }
        ]
      }
    ];

    setTimetables(sampleTimetables);
    if (sampleTimetables.length > 0) {
      setSelectedTimetable(sampleTimetables[0]);
    }
  }, [user]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getEntriesForDayAndTime = (day: string, time: string) => {
    if (!selectedTimetable) return [];
    return selectedTimetable.entries.filter(entry => entry.day === day && entry.time === time);
  };

  const getTimetableStats = () => {
    if (!selectedTimetable) return { totalClasses: 0, totalUnits: 0, totalHours: 0 };
    
    const totalClasses = selectedTimetable.entries.length;
    const totalUnits = new Set(selectedTimetable.entries.map(e => e.unitCode)).size;
    const totalHours = selectedTimetable.entries.reduce((sum, entry) => sum + parseInt(entry.duration), 0);
    
    return { totalClasses, totalUnits, totalHours };
  };

  const stats = getTimetableStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Timetable</h2>
          <p className="text-gray-600">View your class schedule and important information</p>
        </div>
        {selectedTimetable && (
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Classes per week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">Different subjects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">Contact hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Selection */}
      {timetables.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Timetables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {timetables.map(timetable => (
                <Button
                  key={timetable.id}
                  variant={selectedTimetable?.id === timetable.id ? "default" : "outline"}
                  onClick={() => setSelectedTimetable(timetable)}
                >
                  {timetable.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      {selectedTimetable ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTimetable.name}</CardTitle>
            <CardDescription>
              {selectedTimetable.description} - {selectedTimetable.entries.length} classes scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-2 min-w-[800px]">
                {/* Header Row */}
                <div className="font-medium p-2 bg-gray-100 rounded">Time</div>
                {days.slice(0, 5).map(day => (
                  <div key={day} className="font-medium p-2 bg-gray-100 rounded text-center">
                    {day}
                  </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map(time => (
                  <Fragment key={time}>
                    <div className="p-2 bg-gray-50 rounded font-medium text-sm">{time}</div>
                    {days.slice(0, 5).map(day => {
                      const entries = getEntriesForDayAndTime(day, time);
                      return (
                        <div key={`${day}-${time}`} className="p-1">
                          {entries.map(entry => (
                            <div
                              key={entry.id}
                              className="p-2 bg-blue-100 border border-blue-300 rounded text-xs space-y-1"
                            >
                              <div className="font-medium text-blue-800">{entry.unitCode}</div>
                              <div className="text-blue-700">{entry.unitName}</div>
                              <div className="flex items-center text-blue-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {entry.venue}
                              </div>
                              <div className="flex items-center text-blue-600">
                                <Clock className="w-3 h-3 mr-1" />
                                {entry.duration}hrs
                              </div>
                              <div className="text-blue-600 text-xs">{entry.lecturer}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No timetables available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unit Details */}
      {selectedTimetable && (
        <Card>
          <CardHeader>
            <CardTitle>Unit Details</CardTitle>
            <CardDescription>Information about your registered units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(new Set(selectedTimetable.entries.map(e => e.unitCode))).map(unitCode => {
                const unitEntries = selectedTimetable.entries.filter(e => e.unitCode === unitCode);
                const firstEntry = unitEntries[0];
                const totalHours = unitEntries.reduce((sum, entry) => sum + parseInt(entry.duration), 0);
                
                return (
                  <div key={unitCode} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{unitCode}</h3>
                      <Badge variant="outline">{totalHours}hrs/week</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{firstEntry.unitName}</p>
                    <p className="text-sm text-gray-500">Lecturer: {firstEntry.lecturer}</p>
                    <div className="text-xs text-gray-500">
                      {unitEntries.length} session{unitEntries.length > 1 ? 's' : ''} per week
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
