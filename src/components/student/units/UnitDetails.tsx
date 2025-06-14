
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, PenTool, Calendar, Users, GraduationCap, Download, Clock } from "lucide-react";
import { Unit } from './types';
import { useAuth } from "@/contexts/AuthContext";

interface UnitDetailsProps {
  unit: Unit;
  onBack: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const UnitDetails = ({ unit, onBack }: UnitDetailsProps) => {
  const { createdContent } = useAuth();

  // Get assignments for this unit
  const unitAssignments = createdContent.filter(
    content => content.type === 'assignment' && content.unitCode === unit.code
  );

  // Get notes for this unit
  const unitNotes = createdContent.filter(
    content => content.type === 'notes' && content.unitCode === unit.code
  );

  // Get online classes for this unit
  const unitClasses = createdContent.filter(
    content => content.type === 'online_class' && content.unitCode === unit.code
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadFile = (fileName: string) => {
    console.log(`Downloading file: ${fileName}`);
    // In a real app, this would trigger the actual file download
    alert(`Download started for: ${fileName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Units
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{unit.code} - {unit.name}</CardTitle>
              <CardDescription>Lecturer: {unit.lecturer}</CardDescription>
            </div>
            <Badge className={getStatusColor(unit.status)}>
              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Course Progress</span>
                <span>{unit.progress}%</span>
              </div>
              <Progress value={unit.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Next Class: {unit.nextClass}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>Credits: {unit.credits}</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">
                Assignments ({unitAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="materials">
                Materials ({unitNotes.length})
              </TabsTrigger>
              <TabsTrigger value="classes">
                Classes ({unitClasses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Online Classes</h3>
                      <p className="text-sm text-gray-600">{unitClasses.length} available</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Notes & Materials</h3>
                      <p className="text-sm text-gray-600">{unitNotes.length} files</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold">Assignments</h3>
                      <p className="text-sm text-gray-600">{unitAssignments.length} active</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {unitAssignments.length > 0 ? (
                <div className="space-y-4">
                  {unitAssignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>{assignment.description}</CardDescription>
                          </div>
                          <Badge variant="outline">
                            {assignment.assignmentType?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {assignment.dueDate && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span>Due: {formatDate(assignment.dueDate)}</span>
                          </div>
                        )}
                        
                        {assignment.questionFileName && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">{assignment.questionFileName}</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleDownloadFile(assignment.questionFileName)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {assignment.acceptedFormats && assignment.acceptedFormats.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Accepted submission formats:</p>
                            <div className="flex gap-2">
                              {assignment.acceptedFormats.map((format) => (
                                <Badge key={format} variant="secondary">
                                  {format.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button>Submit Assignment</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No assignments available yet.</p>
                  <p className="text-sm">Assignments will appear here once the lecturer uploads them.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              {unitNotes.length > 0 ? (
                <div className="space-y-4">
                  {unitNotes.map((note) => (
                    <Card key={note.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <CardDescription>{note.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {note.fileName && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">{note.fileName}</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleDownloadFile(note.fileName)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No course materials available yet.</p>
                  <p className="text-sm">Materials will appear here once the lecturer uploads them.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              {unitClasses.length > 0 ? (
                <div className="space-y-4">
                  {unitClasses.map((classItem) => (
                    <Card key={classItem.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{classItem.title}</CardTitle>
                        <CardDescription>{classItem.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(classItem.scheduledDate || classItem.createdAt)}</span>
                          </div>
                          <Button>Join Class</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No online classes scheduled yet.</p>
                  <p className="text-sm">Classes will appear here once the lecturer schedules them.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
