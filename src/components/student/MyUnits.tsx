
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Video, FileText, PenTool, Calendar, Users } from "lucide-react";

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

const mockUnits: Unit[] = [
  {
    id: "1",
    code: "SE101",
    name: "Introduction to Software Engineering",
    lecturer: "Dr. John Kamau",
    credits: 3,
    progress: 75,
    nextClass: "Tomorrow 2:00 PM",
    status: 'active',
    semester: "Semester 1"
  },
  {
    id: "2",
    code: "DB201",
    name: "Database Management Systems",
    lecturer: "Prof. Mary Wanjiku",
    credits: 4,
    progress: 60,
    nextClass: "Friday 10:00 AM",
    status: 'active',
    semester: "Semester 1"
  },
  {
    id: "3",
    code: "WEB301",
    name: "Web Development",
    lecturer: "Mr. Peter Mwangi",
    credits: 3,
    progress: 85,
    nextClass: "Monday 3:00 PM",
    status: 'active',
    semester: "Semester 1"
  },
  {
    id: "4",
    code: "PROG101",
    name: "Programming Fundamentals",
    lecturer: "Ms. Grace Njeri",
    credits: 4,
    progress: 100,
    nextClass: "Completed",
    status: 'completed',
    semester: "Semester 1"
  }
];

export const MyUnits = () => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Units</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockUnits.map((unit) => (
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
