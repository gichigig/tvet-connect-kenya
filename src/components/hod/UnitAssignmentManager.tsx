import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  Search,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Unit {
  id: string;
  name: string;
  code: string;
  course: string;
  semester: number;
  year: number;
  credits: number;
  department: string;
}

interface Lecturer {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
}

interface UnitAssignment {
  id: string;
  unit_id: string;
  lecturer_id: string;
  assigned_by: string;
  academic_year: string;
  is_active: boolean;
  assigned_at: string;
  unit: Unit;
  lecturer: Lecturer;
}

interface CampusBranch {
  id: string;
  name: string;
  code: string;
}

export const UnitAssignmentManager: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [assignments, setAssignments] = useState<UnitAssignment[]>([]);
  const [campusBranches, setCampusBranches] = useState<CampusBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    unit_id: '',
    lecturer_id: '',
    campus_branch_id: '',
    academic_year: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
  });

  const loadData = async () => {
    try {
      setLoading(true);

      // Load units
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .order('code');

      if (unitsError) throw unitsError;
      setUnits(unitsData || []);

      // Load lecturers from profiles
      const { data: lecturersData, error: lecturersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'lecturer')
        .eq('approved', true)
        .order('first_name');

      if (lecturersError) throw lecturersError;
      setLecturers(lecturersData || []);

      // Load campus branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('campus_branches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (branchesError) throw branchesError;
      setCampusBranches(branchesData || []);

      // Load existing assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('unit_assignments')
        .select(`
          *,
          unit:units(*),
          lecturer:profiles(*)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignUnit = async () => {
    if (!assignmentForm.unit_id || !assignmentForm.lecturer_id) {
      toast.error('Please select both unit and lecturer');
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('unit_assignments')
        .select('*')
        .eq('unit_id', assignmentForm.unit_id)
        .eq('academic_year', assignmentForm.academic_year)
        .eq('is_active', true)
        .single();

      if (existing) {
        toast.error('This unit is already assigned for the selected academic year');
        return;
      }

      const { error } = await supabase
        .from('unit_assignments')
        .insert([{
          unit_id: assignmentForm.unit_id,
          lecturer_id: assignmentForm.lecturer_id,
          assigned_by: user.user?.id,
          campus_branch_id: assignmentForm.campus_branch_id || null,
          academic_year: assignmentForm.academic_year,
          is_active: true
        }]);

      if (error) throw error;

      toast.success('Unit assigned successfully!');
      setAssignmentForm({
        unit_id: '',
        lecturer_id: '',
        campus_branch_id: '',
        academic_year: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
      });
      
      await loadData();
    } catch (error) {
      console.error('Error assigning unit:', error);
      toast.error('Failed to assign unit');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      const { error } = await supabase
        .from('unit_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment removed successfully!');
      await loadData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assignment.unit?.name?.toLowerCase().includes(searchLower) ||
      assignment.unit?.code?.toLowerCase().includes(searchLower) ||
      assignment.lecturer?.first_name?.toLowerCase().includes(searchLower) ||
      assignment.lecturer?.last_name?.toLowerCase().includes(searchLower) ||
      assignment.lecturer?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getAssignedUnitIds = () => {
    return assignments
      .filter(a => a.academic_year === assignmentForm.academic_year)
      .map(a => a.unit_id);
  };

  const availableUnits = units.filter(unit => 
    !getAssignedUnitIds().includes(unit.id)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Assign Unit to Lecturer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Input
                value={assignmentForm.academic_year}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, academic_year: e.target.value }))}
                placeholder="e.g., 2024/2025"
              />
            </div>
            <div>
              <Label>Campus Branch (Optional)</Label>
              <Select
                value={assignmentForm.campus_branch_id}
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, campus_branch_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campus branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Campuses</SelectItem>
                  {campusBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Unit</Label>
              <Select
                value={assignmentForm.unit_id}
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, unit_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div>
                        <div className="font-medium">{unit.code} - {unit.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {unit.course} • Year {unit.year} • Semester {unit.semester}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableUnits.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  All units are assigned for {assignmentForm.academic_year}
                </p>
              )}
            </div>

            <div>
              <Label>Lecturer</Label>
              <Select
                value={assignmentForm.lecturer_id}
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, lecturer_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer) => (
                    <SelectItem key={lecturer.user_id} value={lecturer.user_id}>
                      <div>
                        <div className="font-medium">
                          {lecturer.first_name} {lecturer.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lecturer.email}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAssignUnit}
            className="w-full"
            disabled={!assignmentForm.unit_id || !assignmentForm.lecturer_id}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Assign Unit
          </Button>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Unit Assignments
            </CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No unit assignments found</p>
              <p className="text-sm">Start by assigning units to lecturers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4" />
                          <h4 className="font-medium">
                            {assignment.unit?.code} - {assignment.unit?.name}
                          </h4>
                          <Badge variant="outline">
                            {assignment.academic_year}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              <strong>Course:</strong> {assignment.unit?.course}
                            </p>
                            <p className="text-muted-foreground">
                              <strong>Year/Semester:</strong> Year {assignment.unit?.year}, Semester {assignment.unit?.semester}
                            </p>
                            <p className="text-muted-foreground">
                              <strong>Credits:</strong> {assignment.unit?.credits}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              <strong>Lecturer:</strong> {assignment.lecturer?.first_name} {assignment.lecturer?.last_name}
                            </p>
                            <p className="text-muted-foreground">
                              <strong>Email:</strong> {assignment.lecturer?.email}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <strong>Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        size="sm"
                        variant="destructive"
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{units.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned Units</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Lecturers</p>
                <p className="text-2xl font-bold">{lecturers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};