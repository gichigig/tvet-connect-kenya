
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import {
  Exam,
  addExam,
  fetchExams,
  updateExam,
  subscribeToExams
} from "@/integrations/supabase/exams";
import { useToast } from "@/hooks/use-toast";



export const ExamManager = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [examType, setExamType] = useState<"supplementary" | "special">("supplementary");

  const [exams, setExams] = useState<Exam[]>([]);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubscribe = subscribeToExams((exams) => {
      setExams(exams);
    });
    return () => unsubscribe();
  }, []);

  const [newExam, setNewExam] = useState({
    title: "",
    unitCode: "",
    unitName: "",
    date: "",
    time: "",
    duration: 120,
    venue: "",
    reason: ""
  });

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.unitCode || !newExam.date || !newExam.time || !newExam.venue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const exam: Omit<Exam, 'id'> = {
      title: newExam.title,
      type: examType,
      unit_code: newExam.unitCode,
      unit_name: newExam.unitName,
      date: newExam.date,
      time: newExam.time,
      duration: newExam.duration,
      venue: newExam.venue,
      students: [],
      status: "scheduled",
      reason: examType === "special" ? newExam.reason : undefined
    };

    await addExam(exam);
    setNewExam({
      title: "",
      unitCode: "",
      unitName: "",
      date: "",
      time: "",
      duration: 120,
      venue: "",
      reason: ""
    });
    setIsDialogOpen(false);

    toast({
      title: "Exam Created",
      description: `${examType} exam has been scheduled successfully.`,
    });
  };

  const handleCancelExam = async (examId: string) => {
    await updateExam(examId, { status: 'cancelled' });
    toast({
      title: "Exam Cancelled",
      description: "The exam has been cancelled.",
    });
  };

  const handleCompleteExam = async (examId: string) => {
    await updateExam(examId, { status: 'completed' });
    toast({
      title: "Exam Completed",
      description: "The exam has been marked as completed.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'supplementary':
        return <Badge className="bg-orange-100 text-orange-800">Supplementary</Badge>;
      case 'special':
        return <Badge className="bg-purple-100 text-purple-800">Special</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Management</h2>
          <p className="text-gray-600">Schedule and manage supplementary and special exams</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Exam</DialogTitle>
              <DialogDescription>
                Create a supplementary or special exam for students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exam-type">Exam Type</Label>
                  <Select value={examType} onValueChange={(value: "supplementary" | "special") => setExamType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplementary">Supplementary</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exam-title">Exam Title</Label>
                  <Input
                    id="exam-title"
                    value={newExam.title}
                    onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Supplementary Exam - CS101"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit-code">Unit Code</Label>
                  <Input
                    id="unit-code"
                    value={newExam.unitCode}
                    onChange={(e) => setNewExam(prev => ({ ...prev, unitCode: e.target.value }))}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <Label htmlFor="unit-name">Unit Name</Label>
                  <Input
                    id="unit-name"
                    value={newExam.unitName}
                    onChange={(e) => setNewExam(prev => ({ ...prev, unitName: e.target.value }))}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="exam-date">Date</Label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="exam-time">Time</Label>
                  <Input
                    id="exam-time"
                    type="time"
                    value={newExam.time}
                    onChange={(e) => setNewExam(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={newExam.venue}
                  onChange={(e) => setNewExam(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="e.g., Computer Lab A"
                />
              </div>

              {examType === "special" && (
                <div>
                  <Label htmlFor="reason">Reason for Special Exam</Label>
                  <Textarea
                    id="reason"
                    value={newExam.reason}
                    onChange={(e) => setNewExam(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why this special exam is needed..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExam}>
                  Schedule Exam
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exams</CardTitle>
          <CardDescription>
            All supplementary and special exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{exam.title}</div>
                      <div className="text-sm text-gray-500">{exam.unit_code} - {exam.unit_name}</div>
                      {exam.reason && (
                        <div className="text-sm text-gray-500 mt-1">
                          <strong>Reason:</strong> {exam.reason}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(exam.type)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {exam.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {exam.time} ({exam.duration} min)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{exam.venue}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {exam.students.length} students
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  <TableCell>
                    {exam.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCompleteExam(exam.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelExam(exam.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {exams.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No exams scheduled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
