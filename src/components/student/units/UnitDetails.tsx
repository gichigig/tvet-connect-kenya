
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, PenTool, Calendar, Users, GraduationCap, Download, Clock, MessageSquare, ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { Unit } from './types';
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

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

  // Get exams and CATs for this unit
  const unitExams = createdContent.filter(
    content => (content.type === 'exam' || content.type === 'cat') && content.unitCode === unit.code
  );

  const handleJoinWhatsApp = () => {
    if (unit.whatsappLink) {
      window.open(unit.whatsappLink, '_blank');
      toast({
        title: "Opening WhatsApp",
        description: `Joining ${unit.name} WhatsApp group`
      });
    }
  };

  const handleJoinDiscussion = () => {
    if (unit.hasDiscussionGroup) {
      toast({
        title: "Discussion Group",
        description: `Opening discussion for ${unit.name}`
      });
      // In a real app, this would navigate to the discussion interface
    }
  };

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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{unit.code} - {unit.name}</h1>
          <p className="text-muted-foreground">
            {unit.lecturer} • {unit.semester} • {unit.credits} Credits
          </p>
        </div>
      </div>
      
      {/* Unit Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Unit Overview
              </CardTitle>
              <CardDescription>Your progress and unit information</CardDescription>
            </div>
            <Badge className={getStatusColor(unit.status)}>
              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-muted-foreground">{unit.progress}%</span>
            </div>
            <Progress value={unit.progress} className="w-full" />
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Lecturer</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{unit.lecturer}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Next Class</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{unit.nextClass}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Enrollment</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{unit.enrolled || 0}/{unit.capacity || 50} students</span>
              </div>
            </div>
          </div>

          {/* Communication Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Communication & Groups</h4>
            <div className="flex flex-wrap gap-2">
              {unit.whatsappLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleJoinWhatsApp}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Group
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
              {unit.hasDiscussionGroup && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleJoinDiscussion}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Discussion Group
                </Button>
              )}
              {!unit.whatsappLink && !unit.hasDiscussionGroup && (
                <p className="text-sm text-muted-foreground">No communication groups available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
    </div>
  );
};
