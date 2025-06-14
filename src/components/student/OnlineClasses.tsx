
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, Play, GraduationCap } from "lucide-react";

export const OnlineClasses = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'recorded'>('all');

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

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

      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Scheduled Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your lecturers haven't scheduled any online classes yet for your registered units.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Registered Units:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {approvedRegistrations.map((reg) => (
              <Badge key={reg.id} variant="outline">
                {reg.unitCode} - {reg.unitName}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
