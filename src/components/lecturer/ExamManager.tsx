
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const ExamManager = () => {
  const [activeTab, setActiveTab] = useState('cats');
  const { user, createdContent } = useAuth();

  // Get content created by current lecturer
  const lecturerContent = createdContent.filter(content => content.lecturerId === user?.id);
  const cats = lecturerContent.filter(content => content.type === 'cat');
  const exams = lecturerContent.filter(content => content.type === 'exam');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredContent = activeTab === 'cats' ? cats : exams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exams & CATs Management</h2>
          <p className="text-gray-600">Manage your continuous assessments and examinations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cats">CATs ({cats.length})</TabsTrigger>
          <TabsTrigger value="exams">Exams ({exams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cats">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Assessment Tests (CATs)</CardTitle>
              <CardDescription>Manage your scheduled CATs</CardDescription>
            </CardHeader>
            <CardContent>
              {cats.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No CATs Created</h3>
                  <p className="text-gray-500">
                    Create CATs from your unit management panel by clicking on a unit.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cats.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.title}</TableCell>
                        <TableCell>{cat.unitName || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(cat.scheduledDate)}</span>
                            <Clock className="w-4 h-4 text-gray-400 ml-2" />
                            <span>{formatTime(cat.scheduledDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{cat.duration} min</TableCell>
                        <TableCell>{cat.questions?.length || 0}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(cat.status)}>
                            {cat.status?.replace('_', ' ').toUpperCase() || 'SCHEDULED'}
                          </Badge>
                        </TableCell>
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
              )}
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
              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Created</h3>
                  <p className="text-gray-500">
                    Create exams from your unit management panel by clicking on a unit.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{exam.unitName || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(exam.scheduledDate)}</span>
                            <Clock className="w-4 h-4 text-gray-400 ml-2" />
                            <span>{formatTime(exam.scheduledDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{exam.duration} min</TableCell>
                        <TableCell>{exam.venue}</TableCell>
                        <TableCell>{exam.questions?.length || 0}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(exam.status)}>
                            {exam.status?.replace('_', ' ').toUpperCase() || 'PENDING APPROVAL'}
                          </Badge>
                        </TableCell>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
