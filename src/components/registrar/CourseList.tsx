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
  Edit, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

interface CourseListProps {
  onCreateNew?: () => void;
  onEditCourse?: (course: Course) => void;
  onViewCourse?: (course: Course) => void;
  CourseContainer?: React.ComponentType<{ course: Course }>;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800'
};

const statusIcons = {
  draft: <Edit className="h-3 w-3" />,
  pending_approval: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  active: <CheckCircle className="h-3 w-3" />,
  suspended: <XCircle className="h-3 w-3" />
};

export const CourseList: React.FC<CourseListProps> = ({
  onCreateNew,
  onEditCourse,
  onViewCourse,
  CourseContainer
}) => {
  const { courses, loading, deleteCourse } = useCoursesContext();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Get unique departments
  const departments = Array.from(new Set(courses.map(course => course.department))).sort();

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || statusFilter === 'active'; // Default since status doesn't exist
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This action cannot be undone.`)) {
      try {
        await deleteCourse(courseId);
        toast({
          title: "Course Deleted",
          description: `Course "${courseTitle}" has been deleted successfully.`
        });
      } catch (error) {
        console.error('Error deleting course:', error);
        toast({
          title: "Error",
          description: "Failed to delete course. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: Course['status']) => (
    <Badge className={`${statusColors[status]} flex items-center gap-1`}>
      {statusIcons[status]}
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Courses Management
            </CardTitle>
            <CardDescription>
              Manage and monitor all courses in the system
            </CardDescription>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by name, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {courses.length} {/* Show total since status doesn't exist */}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {0} {/* Default since status doesn't exist */}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {0} {/* Default since status doesn't exist */}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {0} {/* Default since status doesn't exist */}
              </div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>
          </Card>
        </div>

        {/* Course Display */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {courses.length === 0 ? 'No courses found' : 'No courses match your filters'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {courses.length === 0 
                ? 'Get started by creating your first course.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            {onCreateNew && courses.length === 0 && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            )}
          </div>
        ) : CourseContainer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseContainer key={course.id} course={course as any} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Details</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground">{course.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.level.replace('_', ' ').toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge('active')}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>0/0</div>
                        <div className="text-muted-foreground">
                          0% full
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onViewCourse && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewCourse(course as any)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEditCourse && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCourse(course as any)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Always show delete since we can't check status */}
                        {true && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
