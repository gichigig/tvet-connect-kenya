import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  CalendarIcon, 
  Plus, 
  Edit3, 
  FileText, 
  PenTool, 
  GraduationCap, 
  Clock, 
  Users,
  School,
  BookOpen,
  Settings,
  Eye,
  Download,
  Upload,
  Save,
  Copy,
  Filter
} from 'lucide-react';
import { format, addWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface EducationLevel {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface SemesterProgramme {
  id: string;
  title: string;
  description: string;
  academicYearId: string;
  academicYearName: string;
  semesterNumber: number; // 1 or 2
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
  educationLevels: string[]; // Array of level IDs this programme applies to
  status: 'draft' | 'published' | 'active' | 'completed';
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  weeklyPlans: ProgrammeWeek[];
}

interface ProgrammeWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  theme?: string;
  description?: string;
  activities: WeekActivity[];
}

interface WeekActivity {
  id: string;
  type: 'material' | 'assignment' | 'exam' | 'cat' | 'event';
  title: string;
  description: string;
  scheduledDate: Date;
  scheduledTime?: string;
  duration?: number; // in minutes for exams/events
  applicableLevels: string[]; // Which education levels this applies to
  unitCodes?: string[]; // Specific units if applicable
  venue?: string;
  instructions?: string;
  maxMarks?: number;
  isPublished: boolean;
  createdBy: string;
}

interface SemesterProgrammeManagerProps {
  userRole: 'registrar' | 'hod' | 'lecturer' | 'student';
}

export const SemesterProgrammeManager: React.FC<SemesterProgrammeManagerProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [programmes, setProgrammes] = useState<SemesterProgramme[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState<SemesterProgramme | null>(null);
  const [educationLevels] = useState<EducationLevel[]>([
    { id: 'cert1', name: 'Certificate Level 1', code: 'CERT1', description: 'First year certificate students' },
    { id: 'cert2', name: 'Certificate Level 2', code: 'CERT2', description: 'Second year certificate students' },
    { id: 'dip1', name: 'Diploma Level 1', code: 'DIP1', description: 'First year diploma students' },
    { id: 'dip2', name: 'Diploma Level 2', code: 'DIP2', description: 'Second year diploma students' },
    { id: 'dip3', name: 'Diploma Level 3', code: 'DIP3', description: 'Third year diploma students' },
    { id: 'degree1', name: 'Degree Level 1', code: 'DEG1', description: 'First year degree students' },
    { id: 'degree2', name: 'Degree Level 2', code: 'DEG2', description: 'Second year degree students' },
    { id: 'degree3', name: 'Degree Level 3', code: 'DEG3', description: 'Third year degree students' },
    { id: 'degree4', name: 'Degree Level 4', code: 'DEG4', description: 'Fourth year degree students' }
  ]);
  
  const [academicYears] = useState<AcademicYear[]>([
    { 
      id: 'ay2025', 
      name: '2025/2026', 
      startDate: new Date('2025-09-01'), 
      endDate: new Date('2026-08-31'), 
      isActive: true 
    }
  ]);

  // Form states
  const [programmeForm, setProgrammeForm] = useState({
    title: '',
    description: '',
    academicYearId: '',
    semesterNumber: 1,
    startDate: new Date(),
    endDate: new Date(),
    totalWeeks: 15,
    educationLevels: [] as string[]
  });

  const [weekActivityForm, setWeekActivityForm] = useState({
    type: 'material' as WeekActivity['type'],
    title: '',
    description: '',
    scheduledDate: new Date(),
    scheduledTime: '08:00',
    duration: 90,
    applicableLevels: [] as string[],
    unitCodes: [] as string[],
    venue: '',
    instructions: '',
    maxMarks: 100
  });

  const [selectedWeek, setSelectedWeek] = useState<ProgrammeWeek | null>(null);
  const [isCreateProgrammeOpen, setIsCreateProgrammeOpen] = useState(false);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create new semester programme
  const createSemesterProgramme = () => {
    if (!programmeForm.title || !programmeForm.academicYearId || programmeForm.educationLevels.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one education level",
        variant: "destructive"
      });
      return;
    }

    const weeklyPlans: ProgrammeWeek[] = [];
    for (let i = 1; i <= programmeForm.totalWeeks; i++) {
      const weekStart = addWeeks(programmeForm.startDate, i - 1);
      weeklyPlans.push({
        weekNumber: i,
        startDate: startOfWeek(weekStart, { weekStartsOn: 1 }), // Monday
        endDate: endOfWeek(weekStart, { weekStartsOn: 1 }), // Sunday
        activities: []
      });
    }

    const newProgramme: SemesterProgramme = {
      id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      title: programmeForm.title,
      description: programmeForm.description,
      academicYearId: programmeForm.academicYearId,
      academicYearName: academicYears.find(ay => ay.id === programmeForm.academicYearId)?.name || '',
      semesterNumber: programmeForm.semesterNumber,
      startDate: programmeForm.startDate,
      endDate: programmeForm.endDate,
      totalWeeks: programmeForm.totalWeeks,
      educationLevels: programmeForm.educationLevels,
      status: 'draft',
      createdBy: user?.id || '',
      createdAt: new Date(),
      lastModified: new Date(),
      weeklyPlans
    };

    setProgrammes(prev => [...prev, newProgramme]);
    
    // Data is now managed in memory only (in real app, this would go to database)
    console.log('Semester programme created:', newProgramme.title);

    // Reset form
    setProgrammeForm({
      title: '',
      description: '',
      academicYearId: '',
      semesterNumber: 1,
      startDate: new Date(),
      endDate: new Date(),
      totalWeeks: 15,
      educationLevels: []
    });

    setIsCreateProgrammeOpen(false);
    toast({
      title: "Programme Created",
      description: `Semester programme "${newProgramme.title}" has been created successfully`
    });
  };

  // Add activity to selected week
  const addActivityToWeek = () => {
    if (!selectedWeek || !selectedProgramme || !weekActivityForm.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newActivity: WeekActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      type: weekActivityForm.type,
      title: weekActivityForm.title,
      description: weekActivityForm.description,
      scheduledDate: weekActivityForm.scheduledDate,
      scheduledTime: weekActivityForm.scheduledTime,
      duration: weekActivityForm.duration,
      applicableLevels: weekActivityForm.applicableLevels,
      unitCodes: weekActivityForm.unitCodes,
      venue: weekActivityForm.venue,
      instructions: weekActivityForm.instructions,
      maxMarks: weekActivityForm.maxMarks,
      isPublished: false,
      createdBy: user?.id || ''
    };

    // Update the programme
    const updatedProgramme = {
      ...selectedProgramme,
      weeklyPlans: selectedProgramme.weeklyPlans.map(week =>
        week.weekNumber === selectedWeek.weekNumber
          ? { ...week, activities: [...week.activities, newActivity] }
          : week
      ),
      lastModified: new Date()
    };

    setProgrammes(prev => prev.map(p => 
      p.id === selectedProgramme.id ? updatedProgramme : p
    ));
    setSelectedProgramme(updatedProgramme);

    // Programme updated in state, backend sync would happen here

    // Reset form
    setWeekActivityForm({
      type: 'material',
      title: '',
      description: '',
      scheduledDate: new Date(),
      scheduledTime: '08:00',
      duration: 90,
      applicableLevels: [],
      unitCodes: [],
      venue: '',
      instructions: '',
      maxMarks: 100
    });

    setIsCreateActivityOpen(false);
    toast({
      title: "Activity Added",
      description: `Added "${newActivity.title}" to Week ${selectedWeek.weekNumber}`
    });
  };

  // Publish programme
  const publishProgramme = (programme: SemesterProgramme) => {
    const updatedProgramme = {
      ...programme,
      status: 'published' as const,
      lastModified: new Date()
    };

    setProgrammes(prev => prev.map(p => 
      p.id === programme.id ? updatedProgramme : p
    ));

    toast({
      title: "Programme Published",
      description: `"${programme.title}" is now visible to all students, HODs, and lecturers`
    });
  };

  // Filter programmes based on role and selections
  const filteredProgrammes = programmes.filter(programme => {
    if (filterStatus !== 'all' && programme.status !== filterStatus) return false;
    if (filterLevel !== 'all' && !programme.educationLevels.includes(filterLevel)) return false;
    return true;
  });

  // Load programmes would be from backend context on component mount
  useEffect(() => {
    // Programmes would be loaded from backend context
    // setProgrammes(programmesFromBackend);
  }, []);

  const canEdit = userRole === 'registrar';
  const canView = ['registrar', 'hod', 'lecturer', 'student'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <School className="w-6 h-6" />
            Semester Programme of Activities
          </h2>
          <p className="text-gray-600">
            {userRole === 'registrar' && 'Create and manage semester programmes for all education levels'}
            {userRole === 'hod' && 'View and monitor semester programmes for your department'}
            {userRole === 'lecturer' && 'View semester programmes and upload materials for your units'}
            {userRole === 'student' && 'View your semester programme and scheduled activities'}
          </p>
        </div>
        {canEdit && (
          <Dialog open={isCreateProgrammeOpen} onOpenChange={setIsCreateProgrammeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Programme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Semester Programme</DialogTitle>
                <DialogDescription>
                  Create a comprehensive semester programme that will be visible to students, HODs, and lecturers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label>Programme Title</Label>
                  <Input
                    value={programmeForm.title}
                    onChange={(e) => setProgrammeForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Semester 1 Programme 2025/2026"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={programmeForm.description}
                    onChange={(e) => setProgrammeForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this semester programme"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select 
                      value={programmeForm.academicYearId} 
                      onValueChange={(value) => setProgrammeForm(prev => ({ ...prev, academicYearId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isActive && '(Active)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select 
                      value={programmeForm.semesterNumber.toString()} 
                      onValueChange={(value) => setProgrammeForm(prev => ({ ...prev, semesterNumber: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(programmeForm.startDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={programmeForm.startDate}
                          onSelect={(date) => date && setProgrammeForm(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(programmeForm.endDate, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={programmeForm.endDate}
                          onSelect={(date) => date && setProgrammeForm(prev => ({ ...prev, endDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Total Weeks</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={programmeForm.totalWeeks}
                    onChange={(e) => setProgrammeForm(prev => ({ ...prev, totalWeeks: parseInt(e.target.value) || 15 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Applicable Education Levels *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                    {educationLevels.map(level => (
                      <div key={level.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={level.id}
                          checked={programmeForm.educationLevels.includes(level.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setProgrammeForm(prev => ({ 
                                ...prev, 
                                educationLevels: [...prev.educationLevels, level.id] 
                              }));
                            } else {
                              setProgrammeForm(prev => ({ 
                                ...prev, 
                                educationLevels: prev.educationLevels.filter(id => id !== level.id) 
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={level.id} className="text-sm">
                          {level.code}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Select all education levels this program applies to. You can choose to serve all levels.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateProgrammeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createSemesterProgramme}>
                    Create Programme
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <Label>Filters:</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Label>Education Level:</Label>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {educationLevels.map(level => (
                <SelectItem key={level.id} value={level.id}>
                  {level.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Programmes List */}
      {filteredProgrammes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <School className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Programmes Found</h3>
            <p className="text-gray-500">
              {userRole === 'registrar' 
                ? 'Create your first semester programme to get started.' 
                : 'No semester programmes are available for your selected filters.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProgrammes.map((programme) => (
            <Card 
              key={programme.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProgramme?.id === programme.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedProgramme(programme)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{programme.title}</CardTitle>
                    <CardDescription>{programme.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {programme.academicYearName} - Sem {programme.semesterNumber}
                    </Badge>
                    <Badge 
                      variant={
                        programme.status === 'published' ? 'default' :
                        programme.status === 'active' ? 'secondary' :
                        programme.status === 'completed' ? 'secondary' : 'outline'
                      }
                      className={
                        programme.status === 'published' ? 'bg-green-100 text-green-800' :
                        programme.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        programme.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''
                      }
                    >
                      {programme.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-gray-600">{programme.totalWeeks} weeks</p>
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span>
                    <p className="text-gray-600">{format(programme.startDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span>
                    <p className="text-gray-600">{format(programme.endDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Activities:</span>
                    <p className="text-gray-600">
                      {programme.weeklyPlans.reduce((acc, week) => acc + week.activities.length, 0)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Education Levels:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {programme.educationLevels.map(levelId => {
                      const level = educationLevels.find(l => l.id === levelId);
                      return level ? (
                        <Badge key={levelId} variant="secondary" className="text-xs">
                          {level.code}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Created {format(programme.createdAt, 'MMM d, yyyy')} • 
                    Last modified {format(programme.lastModified, 'MMM d, yyyy')}
                  </div>
                  <div className="flex gap-2">
                    {canEdit && programme.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          publishProgramme(programme);
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Programme Weekly View */}
      {selectedProgramme && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Programme: {selectedProgramme.title}</CardTitle>
                <CardDescription>
                  {format(selectedProgramme.startDate, 'PPPP')} - {format(selectedProgramme.endDate, 'PPPP')}
                </CardDescription>
              </div>
              {canEdit && (
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Programme
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Week Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProgramme.weeklyPlans.map((week) => (
                  <Card 
                    key={week.weekNumber}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedWeek?.weekNumber === week.weekNumber ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedWeek(week)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Week {week.weekNumber}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
                        </Badge>
                      </div>
                      {week.theme && (
                        <CardDescription className="text-sm font-medium">
                          {week.theme}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Materials: {week.activities.filter(a => a.type === 'material').length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <PenTool className="w-3 h-3" />
                          Assignments: {week.activities.filter(a => a.type === 'assignment').length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Exams/CATs: {week.activities.filter(a => ['exam', 'cat'].includes(a.type)).length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Week Details */}
              {selectedWeek && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Week {selectedWeek.weekNumber} Activities</CardTitle>
                        <CardDescription>
                          {format(selectedWeek.startDate, 'PPPP')} - {format(selectedWeek.endDate, 'PPPP')}
                        </CardDescription>
                      </div>
                      {canEdit && (
                        <Dialog open={isCreateActivityOpen} onOpenChange={setIsCreateActivityOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Activity
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Add Activity to Week {selectedWeek.weekNumber}</DialogTitle>
                              <DialogDescription>
                                Schedule materials, assignments, exams, or events for this week
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Activity Type</Label>
                                  <Select 
                                    value={weekActivityForm.type} 
                                    onValueChange={(value: WeekActivity['type']) => 
                                      setWeekActivityForm(prev => ({ ...prev, type: value }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="material">Course Material</SelectItem>
                                      <SelectItem value="assignment">Assignment</SelectItem>
                                      <SelectItem value="cat">CAT</SelectItem>
                                      <SelectItem value="exam">Exam</SelectItem>
                                      <SelectItem value="event">Event</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    value={weekActivityForm.title}
                                    onChange={(e) => setWeekActivityForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Activity title"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={weekActivityForm.description}
                                  onChange={(e) => setWeekActivityForm(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Activity description"
                                />
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Scheduled Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(weekActivityForm.scheduledDate, "MMM d")}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={weekActivityForm.scheduledDate}
                                        onSelect={(date) => date && setWeekActivityForm(prev => ({ ...prev, scheduledDate: date }))}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Time</Label>
                                  <Input
                                    type="time"
                                    value={weekActivityForm.scheduledTime}
                                    onChange={(e) => setWeekActivityForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                  />
                                </div>
                                
                                {['exam', 'cat', 'event'].includes(weekActivityForm.type) && (
                                  <div className="space-y-2">
                                    <Label>Duration (min)</Label>
                                    <Input
                                      type="number"
                                      value={weekActivityForm.duration}
                                      onChange={(e) => setWeekActivityForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Applicable Education Levels</Label>
                                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-3">
                                  {educationLevels.filter(level => 
                                    selectedProgramme.educationLevels.includes(level.id)
                                  ).map(level => (
                                    <div key={level.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`activity-${level.id}`}
                                        checked={weekActivityForm.applicableLevels.includes(level.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setWeekActivityForm(prev => ({ 
                                              ...prev, 
                                              applicableLevels: [...prev.applicableLevels, level.id] 
                                            }));
                                          } else {
                                            setWeekActivityForm(prev => ({ 
                                              ...prev, 
                                              applicableLevels: prev.applicableLevels.filter(id => id !== level.id) 
                                            }));
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`activity-${level.id}`} className="text-sm">
                                        {level.code}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {['exam', 'cat', 'assignment'].includes(weekActivityForm.type) && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Maximum Marks</Label>
                                    <Input
                                      type="number"
                                      value={weekActivityForm.maxMarks}
                                      onChange={(e) => setWeekActivityForm(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 100 }))}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Venue</Label>
                                    <Input
                                      value={weekActivityForm.venue}
                                      onChange={(e) => setWeekActivityForm(prev => ({ ...prev, venue: e.target.value }))}
                                      placeholder="Room/Location"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <Label>Instructions</Label>
                                <Textarea
                                  value={weekActivityForm.instructions}
                                  onChange={(e) => setWeekActivityForm(prev => ({ ...prev, instructions: e.target.value }))}
                                  placeholder="Additional instructions or notes"
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateActivityOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={addActivityToWeek}>
                                  Add Activity
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {selectedWeek.activities.length > 0 ? (
                      <div className="space-y-3">
                        {selectedWeek.activities.map((activity) => (
                          <Card key={activity.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{activity.title}</h4>
                                  <Badge variant="outline" className="capitalize">
                                    {activity.type}
                                  </Badge>
                                  {activity.isPublished ? (
                                    <Badge variant="secondary" className="text-green-600">
                                      Published
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">
                                      Draft
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{format(activity.scheduledDate, 'MMM d, yyyy')}</span>
                                  {activity.scheduledTime && <span>at {activity.scheduledTime}</span>}
                                  {activity.duration && <span>{activity.duration} min</span>}
                                  {activity.venue && <span>{activity.venue}</span>}
                                  {activity.maxMarks && <span>{activity.maxMarks} marks</span>}
                                </div>
                                
                                {activity.applicableLevels.length > 0 && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <span className="text-xs text-gray-500">Levels:</span>
                                    {activity.applicableLevels.map(levelId => {
                                      const level = educationLevels.find(l => l.id === levelId);
                                      return level ? (
                                        <Badge key={levelId} variant="secondary" className="text-xs">
                                          {level.code}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {userRole === 'lecturer' && activity.type === 'material' && (
                                  <Button size="sm" variant="outline">
                                    <Upload className="w-3 h-3 mr-1" />
                                    Upload
                                  </Button>
                                )}
                                
                                {canEdit && (
                                  <Button size="sm" variant="ghost">
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No activities scheduled for this week</p>
                        {canEdit && (
                          <p className="text-sm">Click "Add Activity" to schedule activities</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
