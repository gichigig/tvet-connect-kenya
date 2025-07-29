import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  UserPlus,
  Mail,
  Phone
} from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const CourseApprovalManagement: React.FC = () => {
  const { courses, approveCourse, assignLecturerToCourse, getCoursesByStatus } = useCoursesContext();
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [assigningLecturer, setAssigningLecturer] = useState(false);

  // Get pending courses for approval
  const pendingCourses = getCoursesByStatus('pending_approval');
  const approvedCourses = getCoursesByStatus('approved');
  
  // Get all lecturers
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(user => user.role === 'lecturer' && user.approved);

  const handleApproveCourse = async (courseId: string, courseTitle: string) => {
    try {
      await approveCourse(courseId);
      toast({
        title: "Course Approved",
        description: `Course "${courseTitle}" has been approved and is now ready for lecturer assignment and fee structure setup.`
      });
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error approving course:', error);
      toast({
        title: "Error",
        description: "Failed to approve course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAssignLecturer = async (courseId: string, lecturerId: string) => {
    try {
      await assignLecturerToCourse(courseId, lecturerId);
      const lecturer = lecturers.find(l => l.id === lecturerId);
      const course = courses.find(c => c.id === courseId);
      
      toast({
        title: "Lecturer Assigned",
        description: `${lecturer?.firstName} ${lecturer?.lastName} has been assigned to ${course?.name}`
      });
      setAssigningLecturer(false);
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      toast({
        title: "Error",
        description: "Failed to assign lecturer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const CourseDetailModal = ({ course }: { course: Course }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{course.name}</span>
          <Badge variant="outline">{course.code}</Badge>
        </CardTitle>
        <CardDescription>{course.department} - {course.level.replace('_', ' ').toUpperCase()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Course Details</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Duration:</strong> {course.duration} {course.durationType}</div>
              <div><strong>Mode:</strong> {course.mode.replace('_', ' ').toUpperCase()}</div>
              <div><strong>Max Capacity:</strong> {course.maxCapacity} students</div>
              <div><strong>Start Date:</strong> {formatDate(course.startDate)}</div>
              <div><strong>Application Deadline:</strong> {formatDate(course.applicationDeadline)}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Status</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Status:</strong> 
                <Badge className="ml-2" variant={course.status === 'active' ? 'default' : 'secondary'}>
                  {course.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div><strong>Created:</strong> {formatDate(course.createdAt)}</div>
              <div><strong>Students Enrolled:</strong> {course.studentsEnrolled}</div>
              {course.lecturerIds.length > 0 && (
                <div><strong>Lecturers Assigned:</strong> {course.lecturerIds.length}</div>
              )}
            </div>
          </div>
        </div>

        {course.description && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm">{course.description}</p>
          </div>
        )}

        {(course as any).requirements?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Entry Requirements</h4>
            <ul className="text-sm space-y-1">
              {(course as any).requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}


        {course.status === 'pending_approval' && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => handleApproveCourse(course.id, course.name)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Course
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCourse(null)}
            >
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Approval & Management</h2>
          <p className="text-muted-foreground">Review and approve new courses, assign lecturers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCourses.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCourses.length}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
        </div>
      </div>

      {/* Course Detail View */}
      {selectedCourse && <CourseDetailModal course={selectedCourse} />}

      {/* Pending Courses for Approval */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Courses Pending Approval
          </CardTitle>
          <CardDescription>
            Review course details and approve for lecturer assignment and fee structure setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No courses pending approval
              </h3>
              <p className="text-sm text-muted-foreground">
                All submitted courses have been reviewed.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Details</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCourses.map((course) => (
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
                      <TableCell>{course.duration} {course.durationType}</TableCell>
                      <TableCell>{formatDate(course.startDate)}</TableCell>
                      <TableCell>{course.maxCapacity} students</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCourse(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveCourse(course.id, course.name)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
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

      {/* Approved Courses - Lecturer Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Approved Courses - Lecturer Assignment
          </CardTitle>
          <CardDescription>
            Assign lecturers to approved courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedCourses.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No approved courses available
              </h3>
              <p className="text-sm text-muted-foreground">
                Courses will appear here after approval.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Details</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Lecturers</TableHead>
                    <TableHead>Available Lecturers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedCourses.map((course) => {
                    const assignedLecturers = lecturers.filter(l => course.lecturerIds.includes(l.id));
                    const availableLecturers = lecturers.filter(l => !course.lecturerIds.includes(l.id));
                    
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-muted-foreground">{course.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{course.department}</TableCell>
                        <TableCell>
                          {assignedLecturers.length > 0 ? (
                            <div className="space-y-1">
                              {assignedLecturers.map((lecturer) => (
                                <div key={lecturer.id} className="flex items-center gap-2">
                                  <Badge variant="default" className="text-xs">
                                    {lecturer.firstName} {lecturer.lastName}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No lecturers assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {availableLecturers.length > 0 ? (
                            <Select onValueChange={(lecturerId) => handleAssignLecturer(course.id, lecturerId)}>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select lecturer" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableLecturers.map((lecturer) => (
                                  <SelectItem key={lecturer.id} value={lecturer.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{lecturer.firstName} {lecturer.lastName}</span>
                                      <span className="text-xs text-muted-foreground">{lecturer.email}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground text-sm">All lecturers assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCourse(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
