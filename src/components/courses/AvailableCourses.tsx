import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Search,
  Filter,
  GraduationCap,
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';

interface AvailableCoursesProps {
  userRole?: 'student' | 'lecturer' | 'all';
  showEnrollment?: boolean;
  onEnrollInCourse?: (courseId: string) => void;
}

export const AvailableCourses: React.FC<AvailableCoursesProps> = ({
  userRole = 'all',
  showEnrollment = false,
  onEnrollInCourse
}) => {
  const { courses, feeStructures, getCoursesByStatus, getFeeStructureByCourseId } = useCoursesContext();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  // Get active courses
  const activeCourses = getCoursesByStatus('active');

  // Filter courses based on user role
  const filteredByRole = activeCourses.filter(course => {
    if (userRole === 'lecturer' && user) {
      return course.lecturerIds.includes(user.id);
    }
    return true; // For students and 'all', show all active courses
  });

  // Get unique filter options
  const departments = Array.from(new Set(activeCourses.map(course => course.department))).sort();
  const levels = Array.from(new Set(activeCourses.map(course => course.level))).sort();
  const modes = Array.from(new Set(activeCourses.map(course => course.mode))).sort();

  // Apply filters
  const filteredCourses = filteredByRole.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    const matchesMode = modeFilter === 'all' || course.mode === modeFilter;

    return matchesSearch && matchesDepartment && matchesLevel && matchesMode;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const isApplicationOpen = (course: Course) => {
    const deadline = new Date(course.applicationDeadline);
    const now = new Date();
    return now <= deadline;
  };

  const getAvailableSpots = (course: Course) => {
    return course.maxCapacity - course.studentsEnrolled;
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const feeStructure = getFeeStructureByCourseId(course.id);
    const applicationOpen = isApplicationOpen(course);
    const availableSpots = getAvailableSpots(course);

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{course.name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="outline" className="mr-2">{course.code}</Badge>
                {course.department}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                {course.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {feeStructure && (
                <Badge variant="outline" className="text-green-600">
                  {formatCurrency(feeStructure.totalFees)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>{course.level.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{course.duration} {course.durationType}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{course.mode.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{course.studentsEnrolled}/{course.maxCapacity}</span>
            </div>
          </div>

          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {course.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Application Deadline:</span>
              <span className={applicationOpen ? 'text-green-600' : 'text-red-600'}>
                {formatDate(course.applicationDeadline)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Start Date:</span>
              <span>{formatDate(course.startDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Spots:</span>
              <span className={availableSpots > 0 ? 'text-green-600' : 'text-red-600'}>
                {availableSpots} remaining
              </span>
            </div>
          </div>

          {showEnrollment && onEnrollInCourse && userRole === 'student' && (
            <div className="pt-4 border-t">
              <Button 
                className="w-full" 
                disabled={!applicationOpen || availableSpots <= 0}
                onClick={() => onEnrollInCourse(course.id)}
              >
                {!applicationOpen ? 'Application Closed' : 
                 availableSpots <= 0 ? 'Course Full' : 
                 'Apply for Course'}
              </Button>
            </div>
          )}

          {userRole === 'lecturer' && course.lecturerIds.includes(user?.id || '') && (
            <div className="pt-4 border-t">
              <Badge variant="default" className="w-full justify-center">
                You are assigned to this course
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {userRole === 'lecturer' ? 'My Assigned Courses' : 'Available Courses'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'lecturer' 
              ? 'Courses you are assigned to teach'
              : 'Explore and enroll in available courses'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredCourses.length}</div>
            <div className="text-sm text-muted-foreground">
              {userRole === 'lecturer' ? 'Assigned' : 'Available'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {modes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Results */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {activeCourses.length === 0 
                  ? 'No active courses available' 
                  : 'No courses match your filters'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeCourses.length === 0 
                  ? 'Courses will appear here once they are activated.'
                  : 'Try adjusting your search criteria or filters.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};
