
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, CheckCircle, Clock, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  code: string;
  title: string;
  level: string;
  credits: number;
  instructor: string;
  status: "active" | "under_review" | "needs_update";
  lastReviewed: string;
  enrollmentCount: number;
}

interface CurriculumReview {
  id: string;
  courseCode: string;
  reviewType: "annual" | "accreditation" | "content_update";
  status: "scheduled" | "in_progress" | "completed";
  dueDate: string;
  reviewer: string;
  priority: "high" | "medium" | "low";
}

export const CurriculumOversight = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      code: "ME101",
      title: "Introduction to Mechanical Engineering",
      level: "Certificate",
      credits: 4,
      instructor: "Dr. John Kamau",
      status: "active",
      lastReviewed: "2024-01-15",
      enrollmentCount: 45
    },
    {
      id: "2",
      code: "ME102",
      title: "Engineering Mathematics",
      level: "Certificate",
      credits: 3,
      instructor: "Ms. Sarah Wanjiku",
      status: "under_review",
      lastReviewed: "2023-09-20",
      enrollmentCount: 42
    },
    {
      id: "3",
      code: "ME201",
      title: "Thermodynamics",
      level: "Diploma",
      credits: 5,
      instructor: "Dr. John Kamau",
      status: "needs_update",
      lastReviewed: "2023-06-10",
      enrollmentCount: 38
    }
  ]);

  const [curriculumReviews, setCurriculumReviews] = useState<CurriculumReview[]>([
    {
      id: "1",
      courseCode: "ME102",
      reviewType: "annual",
      status: "in_progress",
      dueDate: "2024-07-15",
      reviewer: "Dr. John Kamau",
      priority: "high"
    },
    {
      id: "2",
      courseCode: "ME201",
      reviewType: "content_update",
      status: "scheduled",
      dueDate: "2024-08-20",
      reviewer: "Ms. Sarah Wanjiku",
      priority: "medium"
    },
    {
      id: "3",
      courseCode: "ME301",
      reviewType: "accreditation",
      status: "completed",
      dueDate: "2024-06-01",
      reviewer: "External Reviewer",
      priority: "high"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'needs_update':
        return <Badge className="bg-red-100 text-red-800">Needs Update</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.status === 'active').length;
  const pendingReviews = curriculumReviews.filter(r => r.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCourses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReviews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Management
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Curriculum Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Course Portfolio
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Course
                </Button>
              </CardTitle>
              <CardDescription>
                Manage department courses and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Reviewed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.code}</div>
                          <div className="text-sm text-gray-500">{course.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{course.level}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell>{course.enrollmentCount}</TableCell>
                      <TableCell>{getStatusBadge(course.status)}</TableCell>
                      <TableCell>{course.lastReviewed}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Review Schedule</CardTitle>
              <CardDescription>
                Track curriculum reviews and accreditation compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Review Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {curriculumReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.courseCode}</TableCell>
                      <TableCell>{review.reviewType.replace('_', ' ')}</TableCell>
                      <TableCell>{review.dueDate}</TableCell>
                      <TableCell>{review.reviewer}</TableCell>
                      <TableCell>{getPriorityBadge(review.priority)}</TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>
                        {review.status !== 'completed' && (
                          <Button size="sm" variant="outline">
                            Update
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
