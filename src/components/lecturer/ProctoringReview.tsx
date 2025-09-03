import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  AlertTriangle, 
  Eye, 
  Clock, 
  User, 
  FileText, 
  Camera, 
  Monitor,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import {
  ExamSession,
  ProctorViolation,
  getExamSessionsForReview,
  getViolationsForReview,
  getViolationsForSession,
  reviewViolation,
  getSessionRecordings,
  ExamRecording
} from '@/integrations/firebase/examProctoring';

export const ProctoringReview: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [sessionViolations, setSessionViolations] = useState<ProctorViolation[]>([]);
  const [sessionRecordings, setSessionRecordings] = useState<ExamRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ProctorViolation | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSeverity, setReviewSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionsData, violationsData] = await Promise.all([
        getExamSessionsForReview(),
        getViolationsForReview()
      ]);
      
      setExamSessions(sessionsData);
      setViolations(violationsData);
    } catch (error) {
      console.error('Error loading proctoring data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proctoring data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionDetails = async (session: ExamSession) => {
    if (!session.id) return;
    
    try {
      const [sessionViolationsData, recordingsData] = await Promise.all([
        getViolationsForSession(session.id),
        getSessionRecordings(session.id)
      ]);
      
      setSessionViolations(sessionViolationsData);
      setSessionRecordings(recordingsData);
      setSelectedSession(session);
    } catch (error) {
      console.error('Error loading session details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session details',
        variant: 'destructive',
      });
    }
  };

  const handleReviewViolation = async () => {
    if (!selectedViolation?.id || !user?.id) return;
    
    try {
      await reviewViolation(
        selectedViolation.id,
        user.id,
        reviewNotes,
        reviewSeverity
      );
      
      toast({
        title: 'Violation Reviewed',
        description: 'Violation has been reviewed and marked accordingly.',
      });
      
      setReviewDialogOpen(false);
      setReviewNotes('');
      setSelectedViolation(null);
      
      // Reload data
      loadData();
      if (selectedSession?.id) {
        loadSessionDetails(selectedSession);
      }
    } catch (error) {
      console.error('Error reviewing violation:', error);
      toast({
        title: 'Error',
        description: 'Failed to review violation',
        variant: 'destructive',
      });
    }
  };

  const getViolationSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unreviewed</Badge>;
    }
  };

  const getViolationTypeIcon = (type: string) => {
    switch (type) {
      case 'head_turn':
        return <Eye className="w-4 h-4" />;
      case 'multiple_faces':
        return <User className="w-4 h-4" />;
      case 'no_face':
        return <XCircle className="w-4 h-4" />;
      case 'tab_switch':
        return <Monitor className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading proctoring data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Proctoring Review</h2>
          <p className="text-gray-600">Review exam sessions and violations</p>
        </div>
        <Button onClick={loadData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Exam Sessions</TabsTrigger>
          <TabsTrigger value="violations">
            Violations 
            <Badge variant="destructive" className="ml-2">
              {violations.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exam Sessions</CardTitle>
              <CardDescription>
                Review completed and ongoing exam sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.studentName}</TableCell>
                      <TableCell>{session.examTitle}</TableCell>
                      <TableCell>{formatDateTime(session.startTime)}</TableCell>
                      <TableCell>
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.violations.length > 0 ? 'destructive' : 'default'}>
                          {session.violations.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.score !== undefined ? `${session.score}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadSessionDetails(session)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Unreviewed Violations</CardTitle>
              <CardDescription>
                Violations that require review and action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getViolationTypeIcon(violation.type)}
                          <span className="capitalize">{violation.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{violation.studentId}</TableCell>
                      <TableCell>{violation.examId}</TableCell>
                      <TableCell>{formatDateTime(violation.timestamp)}</TableCell>
                      <TableCell>{getViolationSeverityBadge(violation.severity)}</TableCell>
                      <TableCell>
                        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedViolation(violation)}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Violation</DialogTitle>
                              <DialogDescription>
                                Review and assess this proctoring violation
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedViolation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Violation Type</label>
                                    <p className="capitalize">{selectedViolation.type.replace('_', ' ')}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Timestamp</label>
                                    <p>{formatDateTime(selectedViolation.timestamp)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <p>{selectedViolation.description}</p>
                                </div>
                                
                                {selectedViolation.imageUrl && (
                                  <div>
                                    <label className="text-sm font-medium">Captured Image</label>
                                    <img
                                      src={selectedViolation.imageUrl}
                                      alt="Violation capture"
                                      className="mt-2 max-w-full h-48 object-cover rounded border"
                                    />
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-sm font-medium">Severity Assessment</label>
                                  <Select value={reviewSeverity} onValueChange={(value: 'low' | 'medium' | 'high') => setReviewSeverity(value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low - Minor infraction</SelectItem>
                                      <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                                      <SelectItem value="high">High - Serious violation</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Review Notes</label>
                                  <Textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add your review notes and recommendations..."
                                    rows={4}
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleReviewViolation}>
                                    Submit Review
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Detail Modal */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Exam Session Review</DialogTitle>
              <DialogDescription>
                {selectedSession.studentName} - {selectedSession.examTitle}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Session Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <p>{formatDateTime(selectedSession.startTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p>{selectedSession.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={selectedSession.status === 'completed' ? 'default' : 'secondary'}>
                    {selectedSession.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Score</label>
                  <p>{selectedSession.score !== undefined ? `${selectedSession.score}%` : 'N/A'}</p>
                </div>
              </div>

              {/* Violations */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Violations ({sessionViolations.length})</h4>
                {sessionViolations.length > 0 ? (
                  <div className="space-y-3">
                    {sessionViolations.map((violation) => (
                      <div key={violation.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getViolationTypeIcon(violation.type)}
                            <span className="font-medium capitalize">
                              {violation.type.replace('_', ' ')}
                            </span>
                            {getViolationSeverityBadge(violation.severity)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(violation.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                        {violation.imageUrl && (
                          <img
                            src={violation.imageUrl}
                            alt="Violation"
                            className="mt-2 h-20 w-20 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(violation.imageUrl, '_blank')}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No violations recorded</p>
                )}
              </div>

              {/* Recordings */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Recordings ({sessionRecordings.length})</h4>
                {sessionRecordings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessionRecordings.map((recording) => (
                      <div key={recording.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {recording.type === 'screen' ? (
                              <Monitor className="w-4 h-4" />
                            ) : (
                              <Camera className="w-4 h-4" />
                            )}
                            <span className="font-medium capitalize">{recording.type} Recording</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round(recording.duration)}s
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(recording.recordingUrl, '_blank')}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Recording
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recordings available</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProctoringReview;
