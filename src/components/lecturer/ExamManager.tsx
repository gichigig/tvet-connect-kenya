
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, FileText, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  title: string;
  course: string;
  type: 'cat' | 'exam';
  date: string;
  time: string;
  duration: number; // in minutes
  venue: string;
  totalMarks: number;
  instructions: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  studentsEnrolled: number;
  studentsSubmitted: number;
}

export const ExamManager = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('cats');
  
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      title: 'Data Structures CAT 1',
      course: 'Computer Science 101',
      type: 'cat',
      date: '2024-06-25',
      time: '10:00',
      duration: 60,
      venue: 'Lab 1',
      totalMarks: 30,
      instructions: 'Answer all questions. No calculators allowed.',
      status: 'scheduled',
      studentsEnrolled: 25,
      studentsSubmitted: 0
    },
    {
      id: '2',
      title: 'Calculus Final Exam',
      course: 'Mathematics 201',
      type: 'exam',
      date: '2024-07-15',
      time: '09:00',
      duration: 180,
      venue: 'Main Hall',
      totalMarks: 100,
      instructions: 'Bring your student ID and writing materials.',
      status: 'scheduled',
      studentsEnrolled: 30,
      studentsSubmitted: 0
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    type: 'cat' as 'cat' | 'exam',
    date: '',
    time: '',
    duration: '',
    venue: '',
    totalMarks: '',
    instructions: ''
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExam: Exam = {
      id: Date.now().toString(),
      title: formData.title,
      course: formData.course,
      type: formData.type,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration),
      venue: formData.venue,
      totalMarks: parseInt(formData.totalMarks),
      instructions: formData.instructions,
      status: 'scheduled',
      studentsEnrolled: 25, // Mock data
      studentsSubmitted: 0
    };

    setExams([...exams, newExam]);
    setFormData({
      title: '',
      course: '',
      type: 'cat',
      date: '',
      time: '',
      duration: '',
      venue: '',
      totalMarks: '',
      instructions: ''
    });
    setShowCreateForm(false);

    toast({
      title: `${formData.type.toUpperCase()} Created`,
      description: `${newExam.title} has been scheduled successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExams = exams.filter(exam => 
    activeTab === 'cats' ? exam.type === 'cat' : exam.type === 'exam'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exams & CATs Management</h2>
          <p className="text-gray-600">Schedule and manage continuous assessments and examinations</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule {activeTab === 'cats' ? 'CAT' : 'Exam'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New {activeTab === 'cats' ? 'CAT' : 'Exam'}</CardTitle>
            <CardDescription>
              Create a new {activeTab === 'cats' ? 'continuous assessment test' : 'examination'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={`Enter ${activeTab === 'cats' ? 'CAT' : 'exam'} title`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science 101">Computer Science 101</SelectItem>
                      <SelectItem value="Mathematics 201">Mathematics 201</SelectItem>
                      <SelectItem value="Physics 301">Physics 301</SelectItem>
                      <SelectItem value="Chemistry 101">Chemistry 101</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: 'cat' | 'exam') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat">CAT (Continuous Assessment Test)</SelectItem>
                    <SelectItem value="exam">Exam (Final Examination)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter venue/location"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    placeholder="e.g., 30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enter exam instructions for students"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Schedule {formData.type.toUpperCase()}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cats">CATs</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="cats">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Assessment Tests (CATs)</CardTitle>
              <CardDescription>Manage your scheduled CATs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                          <Clock className="w-4 h-4 text-gray-400 ml-2" />
                          <span>{exam.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>{exam.duration} min</TableCell>
                      <TableCell>{exam.venue}</TableCell>
                      <TableCell>{exam.totalMarks}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{exam.studentsSubmitted}/{exam.studentsEnrolled}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Final Examinations</CardTitle>
              <CardDescription>Manage your scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                          <Clock className="w-4 h-4 text-gray-400 ml-2" />
                          <span>{exam.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>{exam.duration} min</TableCell>
                      <TableCell>{exam.venue}</TableCell>
                      <TableCell>{exam.totalMarks}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{exam.studentsSubmitted}/{exam.studentsEnrolled}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
