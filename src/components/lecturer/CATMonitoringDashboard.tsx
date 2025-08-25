// NOTE: This file is ready for public GitHub. Ensure no secrets or sensitive data are present in the codebase before pushing.
// All API endpoints, tokens, and local URLs should be managed via environment variables or configuration files, not hardcoded.
// If you have any .env or config files, add them to .gitignore before pushing.
//
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Monitor, 
  Camera, 
  Keyboard, 
  AlertTriangle, 
  Eye, 
  Users, 
  Clock, 
  Shield,
  X,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { proctorService, ProctorSession, ProctorViolation } from '@/services/proctorService';

interface CATMonitoringDashboardProps {
  examId: string;
  unitId: string;
  onClose: () => void;
}

export const CATMonitoringDashboard: React.FC<CATMonitoringDashboardProps> = ({
  examId,
  unitId,
  onClose
}) => {
  const { toast } = useToast();
  const [activeSessions, setActiveSessions] = useState<ProctorSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ProctorSession | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [violations, setViolations] = useState<ProctorViolation[]>([]);

  // Update sessions every 5 seconds
  useEffect(() => {
    const updateSessions = () => {
      const sessions = proctorService.getActiveSessionsForLecturer(unitId)
        .filter(session => session.examId === examId);
      setActiveSessions(sessions);
    };

    updateSessions();
    const interval = setInterval(updateSessions, 5000);
    
    return () => clearInterval(interval);
  }, [examId, unitId]);

  const handleViewSession = (session: ProctorSession) => {
    setSelectedSession(session);
    setViolations(proctorService.getViolations(session.id));
    setShowSessionDetails(true);
  };

  const handleTerminateSession = (sessionId: string, studentName: string) => {
    const reason = prompt(`Reason for terminating ${studentName}'s session:`);
    if (reason) {
      proctorService.terminateSession(sessionId, reason);
      toast({
        title: "Session Terminated",
        description: `${studentName}'s CAT session has been terminated.`,
        variant: "destructive"
      });
    }
  };

  const getViolationColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold">CAT Monitoring Dashboard</h1>
              <p className="text-blue-100 text-sm">Real-time proctoring oversight</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white text-blue-600">
              <Users className="w-4 h-4 mr-1" />
              {activeSessions.length} Active
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-blue-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Sessions</h3>
              <p className="text-gray-500">Students haven't started the CAT yet, or all sessions have ended.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeSessions.map((session) => {
                const totalViolations = session.violations.length;
                const highViolations = session.violations.filter(v => v.severity === 'high').length;
                
                return (
                  <Card key={session.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Student {session.studentId}</CardTitle>
                        <div className="flex items-center gap-2">
                          {session.screenStream && (
                            <Monitor className="w-4 h-4 text-green-600" aria-label="Screen sharing active" />
                          )}
                          {session.webcamStream && (
                            <Camera className="w-4 h-4 text-green-600" aria-label="Webcam active" />
                          )}
                          <Keyboard className="w-4 h-4 text-green-600" aria-label="Keyboard monitoring active" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Session Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-mono">{formatDuration(session.startTime)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant="default" className="bg-green-600 text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>

                      {/* Violations Summary */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Violations:</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${totalViolations === 0 ? 'text-green-600' : 
                              highViolations > 0 ? 'text-red-600' : 'text-orange-600'}`}
                          >
                            {totalViolations}
                          </Badge>
                        </div>
                        
                        {totalViolations > 0 && (
                          <div className="flex gap-1">
                            {session.violations.slice(-3).map((violation, index) => (
                              <div
                                key={index}
                                className={`text-xs px-2 py-1 rounded ${getViolationColor(violation.severity)}`}
                                title={violation.description}
                              >
                                {violation.type}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewSession(session)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleTerminateSession(session.id, session.studentId)}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Session Details - Student {selectedSession.studentId}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Session Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-3">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-mono text-sm">{formatDuration(selectedSession.startTime)}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-xs text-gray-500">Violations</p>
                    <p className="font-semibold text-sm">{violations.length}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <Keyboard className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <p className="text-xs text-gray-500">Key Logs</p>
                    <p className="font-semibold text-sm">{selectedSession.keyLogs.length}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <Shield className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant="default" className="bg-green-600 text-xs">
                      {selectedSession.status}
                    </Badge>
                  </div>
                </Card>
              </div>

              {/* Live Feeds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSession.screenStream && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Screen Share
                    </h4>
                    <div className="bg-gray-100 aspect-video rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Screen share feed would appear here</p>
                    </div>
                  </Card>
                )}
                
                {selectedSession.webcamStream && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Webcam
                    </h4>
                    <div className="bg-gray-100 aspect-video rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Webcam feed would appear here</p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Violations List */}
              {violations.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Violations ({violations.length})
                  </h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {violations.map((violation) => (
                        <div 
                          key={violation.id}
                          className={`p-3 rounded-lg border ${getViolationColor(violation.severity)}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{violation.type.replace('_', ' ')}</span>
                            <span className="text-xs">
                              {violation.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{violation.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CATMonitoringDashboard;
