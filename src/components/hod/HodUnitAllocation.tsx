import { useState, useEffect } from "react";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Users, BookOpen, Filter } from "lucide-react";
import { notifyLecturerOfUnitAssignment } from "@/utils/notificationUtils";

export const HodUnitAllocation = () => {
  const { getAllActiveUnits, updateCreatedUnit } = useUnits();
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterAssignmentStatus, setFilterAssignmentStatus] = useState("");

  const units = getAllActiveUnits();
  const users = getAllUsers();
  const lecturers = users.filter(u => u.role === 'lecturer');

  // Filter units based on search and filters
  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !filterCourse || unit.course === filterCourse;
    const matchesYear = !filterYear || unit.year.toString() === filterYear;
    const matchesAssignment = !filterAssignmentStatus || 
                             (filterAssignmentStatus === 'assigned' && unit.lecturerId) ||
                             (filterAssignmentStatus === 'unassigned' && !unit.lecturerId);
    
    return matchesSearch && matchesCourse && matchesYear && matchesAssignment;
  });

  // Sort units to ensure consistent display (unassigned first, then by code)
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    // Unassigned units first
    if (!a.lecturerId && b.lecturerId) return -1;
    if (a.lecturerId && !b.lecturerId) return 1;
    // Then sort by unit code
    return a.code.localeCompare(b.code);
  });

  // Get unique courses and years for filtering
  const courses = [...new Set(units.map(u => u.course))];
  const years = [...new Set(units.map(u => u.year))].sort();

  const handleAssignLecturer = async (unitId: string, lecturerId: string) => {
    try {
      const lecturer = lecturers.find(l => l.id === lecturerId);
      if (!lecturer) {
        toast({
          title: "Error",
          description: "Lecturer not found.",
          variant: "destructive",
        });
        return;
      }

      const unit = units.find(u => u.id === unitId);
      if (!unit) {
        toast({
          title: "Error",
          description: "Unit not found.",
          variant: "destructive",
        });
        return;
      }

      await updateCreatedUnit(unitId, {
        lecturerId: lecturer.id,
        lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
        lecturerEmail: lecturer.email
      });

      // Send notification to lecturer
      await notifyLecturerOfUnitAssignment(lecturer.id, unit.code, unit.name);

      toast({
        title: "Lecturer Assigned",
        description: `${lecturer.firstName} ${lecturer.lastName} has been assigned to ${unit.code}.`,
      });
    } catch (error) {
      console.error('Error assigning lecturer:', error);
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
        lecturerId: '',
        lecturerName: '',
        lecturerEmail: ''
      });

      toast({
        title: "Lecturer Unassigned",
        description: "Lecturer has been removed from the unit.",
      });
    } catch (error) {
      console.error('Error unassigning lecturer:', error);
      toast({
        title: "Error",
        description: "Failed to unassign lecturer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalUnits: units.length,
    assignedUnits: units.filter(u => u.lecturerId).length,
    unassignedUnits: units.filter(u => !u.lecturerId).length,
    totalLecturers: lecturers.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unit Allocation</h2>
          <p className="text-gray-600">Assign lecturers to units for the department</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Units</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.assignedUnits}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unassignedUnits}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalLecturers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Units</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment Status</label>
              <Select value={filterAssignmentStatus} onValueChange={setFilterAssignmentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All units</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units List */}
      <Card>
        <CardHeader>
          <CardTitle>All Units ({sortedUnits.length})</CardTitle>
          <CardDescription>
            Manage lecturer assignments for all department units. Unassigned units are shown first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedUnits.length > 0 ? (
            <div className="space-y-4">
              {sortedUnits.map((unit, index) => {
                // Get available lecturers (not already assigned to this unit)
                const availableLecturers = lecturers.filter(lecturer => 
                  lecturer.id !== unit.lecturerId
                );
                
                return (
                  <div key={unit.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{unit.code}</h3>
                          <Badge variant={unit.lecturerId ? "default" : "destructive"}>
                            {unit.lecturerId ? "Assigned" : "Unassigned"}
                          </Badge>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                        <p className="text-gray-600 font-medium">{unit.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="bg-blue-50 px-2 py-1 rounded">{unit.course}</span>
                          <span>Year {unit.year}</span>
                          <span>Semester {unit.semester}</span>
                          <span>{unit.credits} Credits</span>
                          <span>{unit.enrolled || 0}/{unit.capacity || 50} Students</span>
                        </div>
                        {unit.description && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{unit.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t bg-gray-50 -mx-4 px-4 py-3">
                      <div className="flex items-center gap-4 flex-1">
                        {unit.lecturerId ? (
                          <div className="text-sm bg-green-50 p-2 rounded flex-1">
                            <span className="text-gray-500">Assigned to:</span>
                            <span className="font-medium ml-2 text-green-700">{unit.lecturerName}</span>
                            {unit.lecturerEmail && (
                              <span className="text-gray-500 ml-2">({unit.lecturerEmail})</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm bg-red-50 p-2 rounded flex-1">
                            <span className="text-red-600 font-medium">⚠️ No lecturer assigned</span>
                            <span className="text-gray-500 ml-2">- Please assign a lecturer</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {unit.lecturerId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignLecturer(unit.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Unassign
                          </Button>
                        )}
                        
                        {/* Always show assignment dropdown */}
                        <Select
                          value={unit.lecturerId || ""}
                          onValueChange={(lecturerId) => {
                            if (lecturerId && lecturerId !== unit.lecturerId) {
                              handleAssignLecturer(unit.id, lecturerId);
                            }
                          }}
                        >
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder={unit.lecturerId ? "Change lecturer" : "Assign lecturer"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLecturers.length > 0 ? (
                              availableLecturers.map(lecturer => (
                                <SelectItem key={lecturer.id} value={lecturer.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {lecturer.firstName} {lecturer.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">{lecturer.email}</span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-lecturers" disabled>
                                No available lecturers
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No units found</p>
              <p className="text-sm">Try adjusting your search filters or create new units.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
