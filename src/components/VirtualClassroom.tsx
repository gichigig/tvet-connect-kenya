
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BigBlueButtonClassroom } from "./BigBlueButtonClassroom";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Hand, 
  Users, 
  Volume2, 
  VolumeX,
  ArrowLeft,
  ExternalLink,
  Monitor
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: 'lecturer' | 'student';
  isAudioOn: boolean;
  isVideoOn: boolean;
  handRaised: boolean;
  isMutedByLecturer: boolean;
}

interface VirtualClassroomProps {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
}

export const VirtualClassroom = ({ courseId, courseTitle, onBack }: VirtualClassroomProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [classroomMode, setClassroomMode] = useState<'bbb' | 'basic'>('basic');
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: user?.id || '1',
      name: `${user?.firstName} ${user?.lastName}`,
      role: user?.role === 'lecturer' ? 'lecturer' : 'student',
      isAudioOn: false,
      isVideoOn: false,
      handRaised: false,
      isMutedByLecturer: false
    },
    // Mock participants for demo
    {
      id: '2',
      name: 'John Doe',
      role: 'student',
      isAudioOn: true,
      isVideoOn: false,
      handRaised: true,
      isMutedByLecturer: false
    },
    {
      id: '3',
      name: 'Jane Smith',
      role: 'student',
      isAudioOn: false,
      isVideoOn: true,
      handRaised: false,
      isMutedByLecturer: false
    }
  ]);

  const isLecturer = user?.role === 'lecturer';
  
  const toggleAudio = () => {
    const currentParticipant = participants.find(p => p.id === user?.id);
    if (currentParticipant?.isMutedByLecturer && !isLecturer) {
      toast({
        title: "Microphone Disabled",
        description: "Your microphone has been disabled by the lecturer.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAudioOn(!isAudioOn);
    setParticipants(prev => prev.map(p => 
      p.id === user?.id ? { ...p, isAudioOn: !isAudioOn } : p
    ));
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    setParticipants(prev => prev.map(p => 
      p.id === user?.id ? { ...p, isVideoOn: !isVideoOn } : p
    ));
  };

  const toggleScreenShare = async () => {
    if (!isLecturer) {
      toast({
        title: "Access Denied",
        description: "Only lecturers can share their screen.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!isScreenSharing) {
        // Mock screen sharing - in real implementation, this would use navigator.mediaDevices.getDisplayMedia()
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
          description: "You are now sharing your screen with students."
        });
      } else {
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing Stopped",
          description: "You have stopped sharing your screen."
        });
      }
    } catch (error) {
      toast({
        title: "Screen Share Failed",
        description: "Unable to start screen sharing.",
        variant: "destructive"
      });
    }
  };

  const toggleHandRaise = () => {
    if (isLecturer) return;
    
    setHandRaised(!handRaised);
    setParticipants(prev => prev.map(p => 
      p.id === user?.id ? { ...p, handRaised: !handRaised } : p
    ));
    
    toast({
      title: handRaised ? "Hand Lowered" : "Hand Raised",
      description: handRaised ? "You lowered your hand." : "You raised your hand to ask a question."
    });
  };

  const muteParticipant = (participantId: string) => {
    if (!isLecturer) return;
    
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, isMutedByLecturer: !p.isMutedByLecturer, isAudioOn: false } : p
    ));
    
    const participant = participants.find(p => p.id === participantId);
    toast({
      title: "Participant Muted",
      description: `${participant?.name} has been muted.`
    });
  };

  const raisedHands = participants.filter(p => p.handRaised && p.role === 'student');

  return (
    <>
      {classroomMode === 'bbb' ? (
        <BigBlueButtonClassroom 
          courseId={courseId} 
          courseTitle={courseTitle} 
          onBack={onBack} 
        />
      ) : (
        <>
          {/* Mode Selection */}
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Classroom Mode</h3>
                    <p className="text-sm text-muted-foreground">Choose your preferred virtual classroom experience</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant={classroomMode === 'bbb' ? 'default' : 'outline'}
                      onClick={() => setClassroomMode('bbb')}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>BigBlueButton</span>
                    </Button>
                    <Button 
                      variant={classroomMode === 'basic' ? 'default' : 'outline'}
                      onClick={() => setClassroomMode('basic')}
                      className="flex items-center space-x-2"
                    >
                      <Monitor className="h-4 w-4" />
                      <span>Basic Mode</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Virtual Classroom (Original Implementation) */}
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            <h1 className="text-xl font-semibold">{courseTitle} - Virtual Classroom</h1>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participants.length} participants</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <Card className="h-96">
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                  {isScreenSharing ? (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <ScreenShare className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg">Screen is being shared</p>
                        <p className="text-sm opacity-75">Lecturer is presenting</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg">Virtual Classroom</p>
                        <p className="text-sm opacity-75">Join the audio to participate</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Control Bar */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2">
                      <Button
                        size="sm"
                        variant={isAudioOn ? "default" : "secondary"}
                        onClick={toggleAudio}
                        className="rounded-full"
                      >
                        {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={isVideoOn ? "default" : "secondary"}
                        onClick={toggleVideo}
                        className="rounded-full"
                      >
                        {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      
                      {isLecturer && (
                        <Button
                          size="sm"
                          variant={isScreenSharing ? "default" : "secondary"}
                          onClick={toggleScreenShare}
                          className="rounded-full"
                        >
                          <ScreenShare className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {!isLecturer && (
                        <Button
                          size="sm"
                          variant={handRaised ? "default" : "secondary"}
                          onClick={toggleHandRaise}
                          className="rounded-full"
                        >
                          <Hand className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Raised Hands */}
              {isLecturer && raisedHands.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Hand className="w-4 h-4 mr-2" />
                      Raised Hands ({raisedHands.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {raisedHands.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <span className="text-sm">{participant.name}</span>
                        <Badge variant="secondary">Waiting</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Participants List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Participants ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          <div className="flex items-center space-x-1">
                            <Badge variant={participant.role === 'lecturer' ? 'default' : 'secondary'} className="text-xs">
                              {participant.role}
                            </Badge>
                            {participant.handRaised && (
                              <Hand className="w-3 h-3 text-orange-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {participant.isAudioOn ? (
                          <Mic className="w-3 h-3 text-green-500" />
                        ) : (
                          <MicOff className="w-3 h-3 text-red-500" />
                        )}
                        {participant.isVideoOn ? (
                          <Video className="w-3 h-3 text-green-500" />
                        ) : (
                          <VideoOff className="w-3 h-3 text-gray-400" />
                        )}
                        
                        {isLecturer && participant.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => muteParticipant(participant.id)}
                            className="h-6 w-6 p-0"
                          >
                            {participant.isMutedByLecturer ? (
                              <VolumeX className="w-3 h-3 text-red-500" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
        </>
      )}
    </>
  );
};
