import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import BigBlueButtonAPI, { BBBMeetingConfig, BBBJoinConfig } from "@/lib/bigbluebutton";
import { 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  Settings, 
  Play, 
  Square, 
  ArrowLeft,
  ExternalLink,
  Camera,
  Loader2
} from "lucide-react";

interface BigBlueButtonClassroomProps {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
}

interface ClassSession {
  id: string;
  title: string;
  scheduledTime: Date;
  duration: number; // in minutes
  isRecorded: boolean;
  maxParticipants?: number;
  description?: string;
  meetingID?: string;
  isActive: boolean;
}

export const BigBlueButtonClassroom: React.FC<BigBlueButtonClassroomProps> = ({ 
  courseId, 
  courseTitle, 
  onBack 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // BBB Configuration - In production, these should come from environment variables
  const BBB_URL = import.meta.env.VITE_BBB_URL || 'https://your-bbb-server.com/bigbluebutton';
  const BBB_SECRET = import.meta.env.VITE_BBB_SECRET || 'your-bbb-secret';
  
  const bbbAPI = new BigBlueButtonAPI(BBB_URL, BBB_SECRET);
  
  const [sessions, setSessions] = useState<ClassSession[]>([
    {
      id: '1',
      title: 'Introduction to Programming',
      scheduledTime: new Date(),
      duration: 90,
      isRecorded: true,
      maxParticipants: 30,
      description: 'Basic programming concepts and introduction to variables',
      isActive: false
    }
  ]);
  
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<{[key: string]: boolean}>({});
  
  // New session form state
  const [newSession, setNewSession] = useState({
    title: '',
    scheduledTime: new Date().toISOString().slice(0, 16),
    duration: 60,
    isRecorded: false,
    maxParticipants: 30,
    description: ''
  });

  const isLecturer = user?.role === 'lecturer';

  // Check meeting status periodically
  useEffect(() => {
    const checkMeetingStatus = async () => {
      for (const session of sessions) {
        if (session.meetingID) {
          const result = await bbbAPI.isMeetingRunning(session.meetingID);
          if (result.success) {
            setMeetingStatus(prev => ({
              ...prev,
              [session.id]: result.running || false
            }));
          }
        }
      }
    };

    const interval = setInterval(checkMeetingStatus, 30000); // Check every 30 seconds
    checkMeetingStatus(); // Initial check

    return () => clearInterval(interval);
  }, [sessions]);

  const generateMeetingID = (sessionTitle: string): string => {
    const timestamp = Date.now();
    const coursePrefix = courseId.slice(0, 4).toUpperCase();
    const titlePrefix = sessionTitle.slice(0, 3).toUpperCase().replace(/\s/g, '');
    return `${coursePrefix}-${titlePrefix}-${timestamp}`;
  };

  const createSession = async () => {
    if (!isLecturer) {
      toast({
        title: "Access Denied",
        description: "Only lecturers can create class sessions.",
        variant: "destructive"
      });
      return;
    }

    if (!newSession.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a session title.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingSession(true);

    try {
      const meetingID = generateMeetingID(newSession.title);
      const attendeePW = `student_${Date.now()}`;
      const moderatorPW = `lecturer_${Date.now()}`;

      const meetingConfig: BBBMeetingConfig = {
        meetingID,
        meetingName: `${courseTitle} - ${newSession.title}`,
        attendeePW,
        moderatorPW,
        welcome: `Welcome to ${newSession.title}! Please mute your microphone when not speaking.`,
        maxParticipants: newSession.maxParticipants,
        record: newSession.isRecorded,
        duration: newSession.duration,
        logoutURL: window.location.href,
        meta: {
          'course-id': courseId,
          'course-title': courseTitle,
          'session-title': newSession.title,
          'lecturer-name': `${user?.firstName} ${user?.lastName}`,
          'lecturer-id': user?.id || ''
        }
      };

      const result = await bbbAPI.createMeeting(meetingConfig);

      if (result.success) {
        const session: ClassSession = {
          id: Date.now().toString(),
          title: newSession.title,
          scheduledTime: new Date(newSession.scheduledTime),
          duration: newSession.duration,
          isRecorded: newSession.isRecorded,
          maxParticipants: newSession.maxParticipants,
          description: newSession.description,
          meetingID,
          isActive: true
        };

        setSessions(prev => [...prev, session]);
        setActiveSession(session);
        
        // Store passwords for this session (in production, store securely)
        sessionStorage.setItem(`bbb_${meetingID}_attendee`, attendeePW);
        sessionStorage.setItem(`bbb_${meetingID}_moderator`, moderatorPW);

        toast({
          title: "Session Created",
          description: `${newSession.title} has been created successfully.`
        });

        // Reset form
        setNewSession({
          title: '',
          scheduledTime: new Date().toISOString().slice(0, 16),
          duration: 60,
          isRecorded: false,
          maxParticipants: 30,
          description: ''
        });
      } else {
        toast({
          title: "Failed to Create Session",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  const joinSession = async (session: ClassSession) => {
    if (!session.meetingID) {
      toast({
        title: "Error",
        description: "Meeting ID not found for this session.",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);

    try {
      // Get appropriate password based on user role
      const password = isLecturer 
        ? sessionStorage.getItem(`bbb_${session.meetingID}_moderator`) || 'moderator123'
        : sessionStorage.getItem(`bbb_${session.meetingID}_attendee`) || 'attendee123';

      const joinConfig: BBBJoinConfig = {
        meetingID: session.meetingID,
        password,
        fullName: `${user?.firstName} ${user?.lastName}`,
        userID: user?.id,
        joinViaHtml5: true,
        guest: false,
        redirect: true
      };

      const joinURL = await bbbAPI.getJoinURL(joinConfig);
      
      // Open in new window/tab
      window.open(joinURL, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Joining Session",
        description: "Opening BigBlueButton in a new tab..."
      });

    } catch (error) {
      toast({
        title: "Failed to Join",
        description: "Unable to join the session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const endSession = async (session: ClassSession) => {
    if (!isLecturer || !session.meetingID) return;

    try {
      const moderatorPW = sessionStorage.getItem(`bbb_${session.meetingID}_moderator`) || 'moderator123';
      const result = await bbbAPI.endMeeting(session.meetingID, moderatorPW);

      if (result.success) {
        setSessions(prev => prev.map(s => 
          s.id === session.id ? { ...s, isActive: false } : s
        ));
        
        if (activeSession?.id === session.id) {
          setActiveSession(null);
        }

        toast({
          title: "Session Ended",
          description: `${session.title} has been ended successfully.`
        });
      } else {
        toast({
          title: "Failed to End Session",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Virtual Classroom</h1>
            <p className="text-muted-foreground">{courseTitle}</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Video className="h-3 w-3" />
          <span>BigBlueButton Integration</span>
        </Badge>
      </div>

      {/* Create New Session (Lecturers Only) */}
      {isLecturer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Create New Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Scheduled Time</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={newSession.scheduledTime}
                  onChange={(e) => setNewSession(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={newSession.duration}
                  onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="100"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newSession.description}
                onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the session content..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="record"
                checked={newSession.isRecorded}
                onCheckedChange={(checked) => setNewSession(prev => ({ ...prev, isRecorded: checked }))}
              />
              <Label htmlFor="record" className="flex items-center space-x-1">
                <Camera className="h-4 w-4" />
                <span>Record this session</span>
              </Label>
            </div>
            
            <Button onClick={createSession} disabled={isCreatingSession} className="w-full">
              {isCreatingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Create & Start Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => {
          const isRunning = meetingStatus[session.id] || false;
          const isPast = session.scheduledTime < new Date();
          
          return (
            <Card key={session.id} className={`${isRunning ? 'border-green-500' : isPast ? 'border-gray-300' : 'border-blue-500'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <Badge variant={isRunning ? 'default' : isPast ? 'secondary' : 'outline'}>
                    {isRunning ? 'Live' : isPast ? 'Ended' : 'Scheduled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{session.scheduledTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{session.scheduledTime.toLocaleTimeString()} ({session.duration} min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Max {session.maxParticipants} participants</span>
                  </div>
                  {session.isRecorded && (
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Recording enabled</span>
                    </div>
                  )}
                </div>
                
                {session.description && (
                  <p className="text-sm text-gray-600">{session.description}</p>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => joinSession(session)}
                    disabled={isJoining || (!isRunning && !isLecturer)}
                    className="flex-1"
                    variant={isRunning ? "default" : "outline"}
                  >
                    {isJoining ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    {isRunning ? 'Join Now' : 'Join Session'}
                  </Button>
                  
                  {isLecturer && isRunning && (
                    <Button 
                      onClick={() => endSession(session)}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Notice */}
      <Card className="border-yellow-500 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">BigBlueButton Configuration</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Make sure to configure your BigBlueButton server URL and secret in the environment variables:
                <br />
                <code className="bg-yellow-100 px-1 rounded text-xs">VITE_BBB_URL</code> and <code className="bg-yellow-100 px-1 rounded text-xs">VITE_BBB_SECRET</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
