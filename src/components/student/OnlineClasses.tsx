
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, Play } from "lucide-react";

interface OnlineClass {
  id: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'live' | 'ended' | 'recorded';
  attendees: number;
  maxAttendees: number;
  meetingLink?: string;
  recordingUrl?: string;
}

const onlineClasses: OnlineClass[] = [
  {
    id: "1",
    unitCode: "SE101",
    unitName: "Introduction to Software Engineering",
    lecturer: "Dr. John Kamau",
    date: "2024-01-20",
    time: "14:00",
    duration: "2 hours",
    status: 'live',
    attendees: 45,
    maxAttendees: 50,
    meetingLink: "https://meet.example.com/se101-intro"
  },
  {
    id: "2",
    unitCode: "DB201",
    unitName: "Database Management Systems",
    lecturer: "Prof. Mary Wanjiku",
    date: "2024-01-21",
    time: "10:00",
    duration: "1.5 hours",
    status: 'upcoming',
    attendees: 0,
    maxAttendees: 40
  },
  {
    id: "3",
    unitCode: "WEB301",
    unitName: "Web Development",
    lecturer: "Mr. Peter Mwangi",
    date: "2024-01-19",
    time: "15:00",
    duration: "2 hours",
    status: 'ended',
    attendees: 38,
    maxAttendees: 45,
    recordingUrl: "https://recordings.example.com/web301-session1"
  },
  {
    id: "4",
    unitCode: "PROG101",
    unitName: "Programming Fundamentals",
    lecturer: "Ms. Grace Njeri",
    date: "2024-01-18",
    time: "09:00",
    duration: "2 hours",
    status: 'recorded',
    attendees: 42,
    maxAttendees: 50,
    recordingUrl: "https://recordings.example.com/prog101-session2"
  }
];

export const OnlineClasses = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'recorded'>('all');

  const filteredClasses = filter === 'all' 
    ? onlineClasses 
    : onlineClasses.filter(cls => cls.status === filter || (filter === 'recorded' && cls.status === 'ended' && cls.recordingUrl));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'recorded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Video className="w-4 h-4" />;
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'ended':
      case 'recorded':
        return <Play className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleJoinClass = (classItem: OnlineClass) => {
    if (classItem.status === 'live' && classItem.meetingLink) {
      window.open(classItem.meetingLink, '_blank');
    }
  };

  const handleWatchRecording = (classItem: OnlineClass) => {
    if (classItem.recordingUrl) {
      window.open(classItem.recordingUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Online Classes</h2>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'live' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('live')}
          >
            Live
          </Button>
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === 'recorded' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('recorded')}
          >
            Recorded
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{classItem.unitCode}</CardTitle>
                  <CardDescription>{classItem.unitName}</CardDescription>
                </div>
                <Badge className={getStatusColor(classItem.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(classItem.status)}
                    {classItem.status === 'live' ? 'LIVE' : classItem.status.toUpperCase()}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(classItem.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{classItem.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{classItem.attendees}/{classItem.maxAttendees}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>{classItem.duration}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Lecturer: {classItem.lecturer}</p>
              </div>

              <div className="flex gap-2">
                {classItem.status === 'live' && (
                  <Button 
                    onClick={() => handleJoinClass(classItem)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Live Class
                  </Button>
                )}
                
                {classItem.status === 'upcoming' && (
                  <Button variant="outline" className="flex-1" disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    Scheduled
                  </Button>
                )}
                
                {(classItem.status === 'ended' || classItem.status === 'recorded') && classItem.recordingUrl && (
                  <Button 
                    onClick={() => handleWatchRecording(classItem)}
                    variant="outline" 
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Recording
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No classes found for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};
