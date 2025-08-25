
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, Play, GraduationCap, ExternalLink, BookOpen } from "lucide-react";
import { format, isAfter, isBefore, isToday } from "date-fns";

interface SyncedOnlineClass {
  id: string;
  title: string;
  description: string;
  unitCode: string;
  unitName: string;
  date: Date;
  startTime: string;
  endTime: string;
  platform: string;
  meetingLink?: string;
  meetingId?: string;
  passcode?: string;
  status: string;
  weekNumber?: number;
  isFromSemesterPlan?: boolean;
}

export const OnlineClasses = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'recorded'>('all');
  
  // Get synced online classes from semester plans
  const { getContentByType } = useDashboardSync('student');
  const syncedOnlineClasses = getContentByType('online-class') as SyncedOnlineClass[];

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Filter online classes for units the student is registered for
  const registeredUnitIds = approvedRegistrations.map(reg => reg.unitId);
  const availableClasses = syncedOnlineClasses.filter(onlineClass => 
    registeredUnitIds.includes(onlineClass.unitId)
  );

  // Categorize classes
  const now = new Date();
  const upcomingClasses = availableClasses.filter(cls => {
    const classDate = new Date(cls.date);
    return isAfter(classDate, now) || isToday(classDate);
  });

  const liveClasses = availableClasses.filter(cls => {
    if (!isToday(new Date(cls.date))) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = cls.startTime.split(':').map(Number);
    const [endHour, endMin] = cls.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return currentTime >= startMinutes && currentTime <= endMinutes;
  });

  const filteredClasses = filter === 'upcoming' ? upcomingClasses :
                         filter === 'live' ? liveClasses :
                         filter === 'recorded' ? [] : // No recorded classes implemented yet
                         availableClasses;

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getClassStatus = (onlineClass: SyncedOnlineClass) => {
    const classDate = new Date(onlineClass.date);
    if (liveClasses.includes(onlineClass)) return 'live';
    if (isAfter(classDate, now) || isToday(classDate)) return 'upcoming';
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (approvedRegistrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Online Classes</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Online Classes Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to have approved unit registrations to access online classes.
          </p>
          <div className="text-sm text-gray-500">
            <p>Register for units and wait for approval to see scheduled classes here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Online Classes</h2>
          <p className="text-gray-600">
            Access your scheduled virtual classes
            {availableClasses.length > 0 && (
              <span className="text-blue-600 ml-1">
                • {availableClasses.length} classes from semester plans
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({availableClasses.length})
          </Button>
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({upcomingClasses.length})
          </Button>
          <Button 
            variant={filter === 'live' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('live')}
          >
            Live ({liveClasses.length})
          </Button>
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter === 'all' ? '' : filter} Classes Available
            </h3>
            <p className="text-gray-600">
              {filter === 'upcoming' && "No upcoming classes scheduled."}
              {filter === 'live' && "No classes are currently live."}
              {filter === 'all' && "No online classes have been scheduled yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClasses.map((onlineClass) => (
            <Card key={onlineClass.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{onlineClass.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {onlineClass.unitCode} - {onlineClass.unitName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {onlineClass.isFromSemesterPlan && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Week {onlineClass.weekNumber}
                      </Badge>
                    )}
                    <Badge className={getStatusColor(getClassStatus(onlineClass))}>
                      {getClassStatus(onlineClass)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{onlineClass.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {format(new Date(onlineClass.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {formatTime(onlineClass.startTime)} - {formatTime(onlineClass.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{onlineClass.platform}</span>
                  </div>
                  {onlineClass.meetingId && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">ID: {onlineClass.meetingId}</span>
                    </div>
                  )}
                </div>

                {onlineClass.meetingLink && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(onlineClass.meetingLink, '_blank')}
                      disabled={getClassStatus(onlineClass) === 'completed'}
                      className={getClassStatus(onlineClass) === 'live' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {getClassStatus(onlineClass) === 'live' ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Join Live Class
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Meeting
                        </>
                      )}
                    </Button>
                    {onlineClass.passcode && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span>Passcode: <code className="bg-gray-100 px-1 rounded">{onlineClass.passcode}</code></span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
