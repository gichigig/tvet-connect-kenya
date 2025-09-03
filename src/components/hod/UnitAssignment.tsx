import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookOpen, User, Clock, CheckCircle, XCircle } from "lucide-react";

export const UnitAssignment = () => {
  const { user, getAllUsers } = useAuth();
  const { createdUnits, updateCreatedUnit } = useUnits();
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [schedule, setSchedule] = useState("");

  // Get all lecturers and units for the current HOD's department
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(u => u.role === 'lecturer' && u.department === user?.department);
  const departmentUnits = createdUnits.filter(unit => 
    unit.department === user?.department && unit.status === 'active'
  );

  const handleAssignLecturer = async () => {
    if (!selectedUnit || !selectedLecturer) {
      toast({
        title: "Error",
        description: "Please select both a unit and a lecturer",
        variant: "destructive"
      });
      return;
    }

    const lecturer = lecturers.find(l => l.id === selectedLecturer);
    if (!lecturer) return;

    try {
      await updateCreatedUnit(selectedUnit, {
        lecturerId: lecturer.id,
        lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
        lecturerEmail: lecturer.email,
        schedule: schedule || undefined
      });

      toast({
        title: "Success",
        description: "Lecturer assigned successfully",
      });

      setSelectedUnit("");
      setSelectedLecturer("");
      setSchedule("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign lecturer",
        variant: "destructive"
      });
    }
  };

  const getUnitStatusColor = (unit: any) => {
    if (unit.lecturerId) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getUnitStatusText = (unit: any) => {
    if (unit.lecturerId) return "Assigned";
    return "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Unit Assignment</h2>
        <p className="text-gray-600">Assign lecturers to department units</p>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Lecturer to Unit</CardTitle>
          <CardDescription>
            Select a unit and lecturer to create the assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Select Unit</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose unit" />
                </SelectTrigger>
                <SelectContent>
                  {departmentUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.code} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lecturer">Select Lecturer</Label>
              <Select value={selectedLecturer} onValueChange={setSelectedLecturer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer) => (
                    <SelectItem key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (Optional)</Label>
              <Input
                id="schedule"
                placeholder="e.g., Mon/Wed/Fri 9:00-11:00"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAssignLecturer} className="w-full md:w-auto">
            Assign Lecturer
          </Button>
        </CardContent>
      </Card>

      {/* Units Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentUnits.map((unit) => (
          <Card key={unit.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{unit.code}</CardTitle>
                <Badge className={getUnitStatusColor(unit)}>
                  {getUnitStatusText(unit)}
                </Badge>
              </div>
              <CardDescription>{unit.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                {unit.course} - Year {unit.year}
              </div>
              
              {unit.lecturerId ? (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">{unit.lecturerName}</span>
                  </div>
                  {unit.schedule && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {unit.schedule}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Assigned
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-sm text-yellow-600">
                  <XCircle className="w-4 h-4 mr-2" />
                  No lecturer assigned
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2 border-t">
                {unit.credits} credits • {unit.enrolled}/{unit.capacity} students
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departmentUnits.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Units Available</h3>
            <p className="text-gray-600">No units have been created for your department yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};