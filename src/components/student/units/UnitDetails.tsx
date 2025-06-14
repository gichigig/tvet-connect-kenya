
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, PenTool, Calendar, Users, GraduationCap } from "lucide-react";
import { Unit } from './types';

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
              <div className="text-center py-8 text-gray-500">
                <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No assignments available yet.</p>
                <p className="text-sm">Assignments will appear here once the lecturer uploads them.</p>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No course materials available yet.</p>
                <p className="text-sm">Materials will appear here once the lecturer uploads them.</p>
              </div>
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No grades available yet.</p>
                <p className="text-sm">Grades will appear here once assignments are graded.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
