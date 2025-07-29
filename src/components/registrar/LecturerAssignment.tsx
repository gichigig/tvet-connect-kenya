import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, UserPlus, User, BookOpen, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { notifyLecturerOfUnitAssignment } from "@/utils/notificationUtils";
import { Input } from "@/components/ui/input";

export const LecturerAssignment = () => {
  const { toast } = useToast();
  const { getAllUsers } = useAuth();
  const { createdUnits, updateCreatedUnit, getUnassignedUnits } = useUnits();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Get all users and filter for approved lecturers
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(user => user.role === 'lecturer' && user.approved);
  
  // Get unassigned units
  const unassignedUnits = getUnassignedUnits();
  
  // Get all units with lecturer info for display
  const allUnitsWithLecturers = createdUnits.filter(unit => unit.status === 'active');

  // Filter units based on search
  const filteredUnits = allUnitsWithLecturers.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.lecturerName && unit.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssignLecturer = async () => {
    if (!selectedUnit || !selectedLecturer) {
      toast({
        title: "Error",
        description: "Please select both a unit and a lecturer.",
        variant: "destructive",
      });
      return;
    }

    const lecturer = lecturers.find(l => l.id === selectedLecturer);
    if (!lecturer) {
      toast({
        title: "Error",
        description: "Selected lecturer not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const unit = createdUnits.find(u => u.id === selectedUnit);
      await updateCreatedUnit(selectedUnit, {
        lecturerId: lecturer.id,
        lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
        lecturerEmail: lecturer.email
      });

      // Send notification to the lecturer
      if (unit) {
        await notifyLecturerOfUnitAssignment(lecturer.id, unit.code, unit.name);
      }

      toast({
        title: "Success",
        description: `Unit assigned to ${lecturer.firstName} ${lecturer.lastName}`,
      });

      setSelectedUnit("");
      setSelectedLecturer("");
      setIsAssignDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnassignLecturer = async (unitId: string) => {
    try {
      await updateCreatedUnit(unitId, {
        lecturerId: "",
        lecturerName: "",
        lecturerEmail: ""
      });

      toast({
        title: "Success",
        description: "Lecturer unassigned from unit",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lecturer Assignment</h2>
          <p className="text-gray-600">Assign lecturers to units for coursework management</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Lecturer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Lecturer to Unit</DialogTitle>
              <DialogDescription>
                Select an unassigned unit and a lecturer to assign.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Unit</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an unassigned unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name} ({unit.course}, Year {unit.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Select Lecturer</label>
                <Select value={selectedLecturer} onValueChange={setSelectedLecturer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map(lecturer => (
                      <SelectItem key={lecturer.id} value={lecturer.id}>
                        {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignLecturer}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUnitsWithLecturers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Units</CardTitle>
            <User className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUnitsWithLecturers.filter(u => u.lecturerId).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Units</CardTitle>
            <UserPlus className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedUnits.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search units or lecturers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Lecturer Assignments</CardTitle>
          <CardDescription>
            Manage lecturer assignments for all units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Code</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year/Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Assigned Lecturer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.code}</TableCell>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell>{unit.course}</TableCell>
                  <TableCell>Year {unit.year}, Sem {unit.semester}</TableCell>
                  <TableCell>{unit.credits}</TableCell>
                  <TableCell>
                    {unit.lecturerName ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          {unit.lecturerName}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {unit.lecturerName ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassignLecturer(unit.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Unassign
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUnit(unit.id);
                          setIsAssignDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Assign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUnits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No units found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
