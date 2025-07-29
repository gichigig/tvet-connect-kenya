import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { CalendarDays, UserCheck, Clock } from "lucide-react";

interface SemesterReport {
  studentId: string;
  course: string;
  year: number;
  semester: string;
  reportedAt: Date;
  status: 'active' | 'completed';
}

interface SemesterReportingPeriod {
  id: string;
  isActive: boolean;
  academicYear: string;
  semester: string;
  startDate: Date;
  endDate: Date;
  activatedBy: string;
  activatedAt: Date;
}

export const SemesterReporting = () => {
  const { user } = useAuth();
  const { courses } = useCoursesContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportingPeriod, setReportingPeriod] = useState<SemesterReportingPeriod | null>(null);
  const [hasReported, setHasReported] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    year: '',
    semester: ''
  });

  const db = getFirestore();

  // Get user's assigned course or allow selection if none assigned
  const userCourse = user?.courseName || user?.course;
  const availableCourses = courses.map(c => c.name);

  useEffect(() => {
    checkReportingPeriodStatus();
    if (user?.id) {
      checkIfAlreadyReported();
    }
    // Set default course if user has one assigned
    if (userCourse && !formData.course) {
      setFormData(prev => ({ ...prev, course: userCourse }));
    }
  }, [user?.id, userCourse]);

  const checkReportingPeriodStatus = async () => {
    try {
      const periodDoc = await getDoc(doc(db, 'semesterReporting', 'currentPeriod'));
      if (periodDoc.exists()) {
        const data = periodDoc.data() as SemesterReportingPeriod;
        setReportingPeriod(data);
      }
    } catch (error) {
      console.error('Error checking reporting period:', error);
    }
  };

  const checkIfAlreadyReported = async () => {
    if (!user?.id || !reportingPeriod?.isActive) return;
    
    try {
      const reportDoc = await getDoc(doc(db, 'semesterReports', user.id));
      if (reportDoc.exists()) {
        const report = reportDoc.data() as SemesterReport;
        if (report.status === 'active') {
          setHasReported(true);
          setFormData({
            course: report.course,
            year: report.year.toString(),
            semester: report.semester
          });
        }
      }
    } catch (error) {
      console.error('Error checking report status:', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!user) return;
    
    if (!formData.course || !formData.year || !formData.semester) {
      toast({
        title: "Missing Information",
        description: "Please select course, year and semester",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const report: SemesterReport = {
        studentId: user.id,
        course: formData.course,
        year: parseInt(formData.year),
        semester: formData.semester,
        reportedAt: new Date(),
        status: 'active'
      };

      await setDoc(doc(db, 'semesterReports', user.id), report);
      
      setHasReported(true);
      toast({
        title: "Semester Reported Successfully",
        description: `You have reported for Year ${formData.year} Semester ${formData.semester}. Units will now be loaded for registration.`,
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit semester report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!reportingPeriod?.isActive) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Clock className="w-5 h-5" />
            Semester Reporting Closed
          </CardTitle>
          <CardDescription className="text-amber-700">
            Semester reporting is currently not active. Please wait for the HoD to activate the next reporting period.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (hasReported) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <UserCheck className="w-5 h-5" />
            Semester Reported
          </CardTitle>
          <CardDescription className="text-green-700">
            You have successfully reported for Year {formData.year} Semester {formData.semester}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Course:</span>
              <span>{formData.course}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Year of Study:</span>
              <span>{formData.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Semester:</span>
              <span>{formData.semester}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Report Your Semester
        </CardTitle>
        <CardDescription>
          Please report your current year and semester of study to load the appropriate units for registration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            {userCourse ? (
              <Input
                id="course"
                value={userCourse}
                disabled
                className="bg-gray-50"
              />
            ) : (
              <Select value={formData.course} onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year of Study</Label>
            <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semester 1</SelectItem>
              <SelectItem value="2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSubmitReport} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Submitting..." : "Submit Semester Report"}
        </Button>
      </CardContent>
    </Card>
  );
};
