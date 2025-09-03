import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Video, Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import { Badge } from "@/components/ui/badge";

interface OnlineClass {
  id: string;
  title: string;
  description: string;
  unitId: string;
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

export const OnlineClassManager = () => {
  const { user, createdContent } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Get synced online classes from semester plans
  const { getContentByType } = useDashboardSync('lecturer');
  const syncedOnlineClasses = getContentByType('online-class') as OnlineClass[];

  // Get manually created online classes by current lecturer
  const manualOnlineClasses = createdContent.filter(content => 
    content.type === 'online-class' && content.lecturerId === user?.id
  ) as OnlineClass[];

  // Combine manual and synced online classes, removing duplicates
  const allOnlineClasses = [
    ...manualOnlineClasses,
    ...syncedOnlineClasses.filter(synced => 
      !manualOnlineClasses.some(manual => manual.id === synced.id)
    )
  ];

  // Sort by date and time
  const sortedClasses = allOnlineClasses.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  console.log('OnlineClassManager Debug:', {
    manualCount: manualOnlineClasses.length,
    syncedCount: syncedOnlineClasses.length,
    totalCount: allOnlineClasses.length,
    syncedSample: syncedOnlineClasses.slice(0, 2)
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPastClass = (date: Date, endTime: string) => {
    const classDateTime = new Date(date);
    const [hours, minutes] = endTime.split(':').map(Number);
    classDateTime.setHours(hours, minutes);
    return classDateTime < new Date();
  };

  const isUpcoming = (date: Date, startTime: string) => {
    const classDateTime = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    classDateTime.setHours(hours, minutes);
    const now = new Date();
    const diffHours = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Online Classes Management</h2>
          <p className="text-gray-600">
            Schedule and manage your virtual classes
            {syncedOnlineClasses.length > 0 && (
              <span className="text-blue-600 ml-1">
                • {syncedOnlineClasses.length} synced from semester plans
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Online Class</CardTitle>
            <CardDescription>Create a new virtual class session</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manual online class creation form would go here. 
              Currently, online classes are created through the Semester Planning tab.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
              className="mt-4"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sortedClasses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Online Classes Scheduled</h3>
              <p className="text-gray-600 mb-4">
                You haven't scheduled any online classes yet. Create your first virtual class session.
              </p>
              <p className="text-sm text-blue-600">
                Tip: You can schedule online classes through the Semester Planning tab or create them manually here.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedClasses.map((onlineClass) => (
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
                    <Badge className={getStatusColor(onlineClass.status)}>
                      {onlineClass.status}
                    </Badge>
                    {onlineClass.isFromSemesterPlan && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Week {onlineClass.weekNumber}
                      </Badge>
                    )}
                    {isUpcoming(onlineClass.date, onlineClass.startTime) && (
                      <Badge className="bg-orange-100 text-orange-800">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{onlineClass.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatDate(onlineClass.date)}</span>
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
                      <span className="text-sm">Meeting ID: {onlineClass.meetingId}</span>
                    </div>
                  )}
                </div>

                {onlineClass.meetingLink && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(onlineClass.meetingLink, '_blank')}
                      disabled={isPastClass(onlineClass.date, onlineClass.endTime)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Meeting
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
          ))
        )}
      </div>
    </div>
  );
};
