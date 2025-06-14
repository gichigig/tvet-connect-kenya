
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, FileText, PenTool, Calendar, Users, GraduationCap, Download, Upload, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Unit {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  progress: number;
  nextClass: string;
  status: 'active' | 'completed' | 'pending';
  semester: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  maxGrade: number;
}

interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'slides';
  uploadDate: string;
  size: string;
}

export const MyUnits = () => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { user, pendingUnitRegistrations } = useAuth();
  
  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Convert approved registrations to Unit format
  const registeredUnits: Unit[] = approvedRegistrations.map(reg => ({
    id: reg.id,
    code: reg.unitCode,
    name: reg.unitName,
    lecturer: "TBD", // This would come from unit details in a real system
    credits: 3, // Default value, would come from unit details
    progress: 0, // Start at 0% for newly approved units
    nextClass: "Check schedule", // Placeholder
    status: 'active' as const,
    semester: `Semester ${reg.semester}`
  }));

  // Mock course work data for when units are available
  const mockAssignments: Assignment[] = [
    {
      id: "1",
      title: "Programming Assignment 1",
      dueDate: "2024-02-15",
      status: 'pending',
      maxGrade: 100
    },
    {
      id: "2",
      title: "Database Design Project",
      dueDate: "2024-02-10",
      status: 'submitted',
      maxGrade: 100
    },
    {
      id: "3",
      title: "Web Development Portfolio",
      dueDate: "2024-01-30",
      status: 'graded',
      grade: 85,
      maxGrade: 100
    }
  ];

  const mockMaterials: CourseMaterial[] = [
    {
      id: "1",
      title: "Introduction to Programming - Lecture Notes",
      type: 'pdf',
      uploadDate: "2024-01-15",
      size: "2.5 MB"
    },
    {
      id: "2",
      title: "Object-Oriented Programming Video Tutorial",
      type: 'video',
      uploadDate: "2024-01-20",
      size: "150 MB"
    },
    {
      id: "3",
      title: "Java Programming Slides",
      type: 'slides',
      uploadDate: "2024-01-18",
      size: "5.2 MB"
    }
  ];

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

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'slides':
        return <FileText className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  if (selectedUnit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedUnit(null)}>
            ← Back to Units
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedUnit.code} - {selectedUnit.name}</CardTitle>
                <CardDescription>Lecturer: {selectedUnit.lecturer}</CardDescription>
              </div>
              <Badge className={getStatusColor(selectedUnit.status)}>
                {selectedUnit.status.charAt(0).toUpperCase() + selectedUnit.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Course Progress</span>
                  <span>{selectedUnit.progress}%</span>
                </div>
                <Progress value={selectedUnit.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Next Class: {selectedUnit.nextClass}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Credits: {selectedUnit.credits}</span>
                </div>
              </div>
            </div>

            {/* Course Work Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Video className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">Online Classes</h3>
                        <p className="text-sm text-gray-600">Join live sessions</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold">Notes & Materials</h3>
                        <p className="text-sm text-gray-600">Download resources</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <PenTool className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-semibold">Assignments</h3>
                        <p className="text-sm text-gray-600">Submit work</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="assignments" className="space-y-4">
                <div className="space-y-4">
                  {mockAssignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{assignment.title}</h3>
                            <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                            {assignment.grade && (
                              <p className="text-sm font-medium">Grade: {assignment.grade}/{assignment.maxGrade}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getAssignmentStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                            {assignment.status === 'pending' && (
                              <Button size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Submit
                              </Button>
                            )}
                            {assignment.status === 'graded' && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="space-y-4">
                  {mockMaterials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFileIcon(material.type)}
                            <div>
                              <h3 className="font-semibold">{material.title}</h3>
                              <p className="text-sm text-gray-600">
                                Uploaded: {material.uploadDate} • Size: {material.size}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="grades" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Grade Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">85%</div>
                          <div className="text-sm text-gray-600">Current Average</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">3/5</div>
                          <div className="text-sm text-gray-600">Assignments Completed</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Individual Grades</h4>
                        {mockAssignments.filter(a => a.grade).map((assignment) => (
                          <div key={assignment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{assignment.title}</span>
                            <span className="font-medium">{assignment.grade}/{assignment.maxGrade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state when no units are registered
  if (registeredUnits.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Units</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Units Registered</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't registered for any units yet. Visit the Unit Registration tab to browse and register for available units.
          </p>
          <div className="text-sm text-gray-500">
            <p>Once you register for units and they are approved by the registrar,</p>
            <p>they will appear here in your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Units</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registeredUnits.map((unit) => (
          <Card 
            key={unit.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleUnitClick(unit)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{unit.code}</CardTitle>
                  <CardDescription className="text-sm">{unit.name}</CardDescription>
                </div>
                <Badge className={getStatusColor(unit.status)}>
                  {unit.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{unit.progress}%</span>
                </div>
                <Progress value={unit.progress} className="h-2" />
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{unit.lecturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{unit.nextClass}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{unit.credits} Credits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
