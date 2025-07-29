import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { useCoursesContext } from "@/contexts/courses/CoursesContext";
import { PendingRegistrations } from "./registration/PendingRegistrations";
import { SyncUnitsButton } from "./registration/SyncUnitsButton";
import { UnitCard } from "./registration/UnitCard";
import { RegisteredUnitsDisplay } from "./registration/RegisteredUnitsDisplay";
import { SemesterReporting } from "./SemesterReporting";
import { PendingRegistration, AvailableUnit } from "./registration/types";
import { doc, getDoc, getFirestore } from "firebase/firestore";

interface SemesterReport {
  studentId: string;
  course: string;
  year: number;
  semester: string;
  reportedAt: Date;
  status: 'active' | 'completed';
}

export const UnitRegistration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [unitsSynced, setUnitsSynced] = useState(false);
  const [semesterReport, setSemesterReport] = useState<SemesterReport | null>(null);
  const { toast } = useToast();
  const { user, addPendingUnitRegistration, pendingUnitRegistrations } = useAuth();
  const { getUnitsForStudent, createdUnits } = useUnits();
  const { courses } = useCoursesContext();
  const db = getFirestore();

  console.log('🎓 UNIT REGISTRATION DEBUG - All available data:', {
    totalUnits: createdUnits.length,
    totalCourses: courses.length,
    availableCourseNames: courses.map(c => c.name),
    unitCourses: createdUnits.map(u => ({ code: u.code, course: u.course, year: u.year, semester: u.semester }))
  });

  // Check if student has reported their semester and auto-sync units
  useEffect(() => {
    if (user?.id) {
      checkSemesterReport();
    }
  }, [user?.id]);

  // Auto-sync units when semester report is available
  useEffect(() => {
    if (semesterReport && !unitsSynced) {
      // Automatically sync units when semester is reported
      setUnitsSynced(true);
    }
  }, [semesterReport, unitsSynced]);

  const checkSemesterReport = async () => {
    if (!user?.id) return;
    
    try {
      const reportDoc = await getDoc(doc(db, 'semesterReports', user.id));
      if (reportDoc.exists()) {
        const report = reportDoc.data() as SemesterReport;
        if (report.status === 'active') {
          setSemesterReport(report);
        }
      }
    } catch (error) {
      console.error('Error checking semester report:', error);
    }
  };

  // Filter pending registrations for current user
  const userPendingRegistrations: PendingRegistration[] = pendingUnitRegistrations
    .filter(reg => reg.studentId === user?.id)
    .map(reg => ({
      id: reg.id,
      unitCode: reg.unitCode,
      unitName: reg.unitName,
      status: reg.status,
      submittedDate: reg.submittedDate
    }));

  // Get available units for user's reported semester after sync
  const rawUnits = unitsSynced && semesterReport
    ? getUnitsForStudent(semesterReport.course, semesterReport.year, parseInt(semesterReport.semester))
    : [];

  console.log('🎓 UNIT REGISTRATION DEBUG:', {
    unitsSynced,
    semesterReport,
    userId: user?.id,
    userCourse: user?.courseName || user?.course,
    reportCourse: semesterReport?.course,
    availableUnitsCount: rawUnits.length
  });

  // Convert units to AvailableUnit type with lecturer property
  const availableUnits: AvailableUnit[] = rawUnits.map(unit => ({
    ...unit,
    lecturer: unit.lecturerName ? {
      id: unit.lecturerId || '',
      name: unit.lecturerName,
      email: unit.lecturerEmail || ''
    } : undefined
  }));

  const filteredUnits = availableUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegister = (unitId: string) => {
    const unit = availableUnits.find(u => u.id === unitId);
    if (unit && user && semesterReport) {
      // Check if already registered or pending
      const existingRegistration = pendingUnitRegistrations.find(
        reg => reg.studentId === user.id && reg.unitCode === unit.code
      );
      
      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: `You already have a ${existingRegistration.status} registration for ${unit.code}.`,
          variant: "destructive",
        });
        return;
      }

      // Add to global context with unitId included
      addPendingUnitRegistration({
        studentId: user.id,
        studentName: `${user.firstName} ${user.lastName}`,
        studentEmail: user.email,
        unitId: unit.id,
        unitCode: unit.code,
        unitName: unit.name,
        course: semesterReport.course,
        year: semesterReport.year,
        semester: unit.semester
      });
      
      toast({
        title: "Registration Pending for Approval", 
        description: `Your registration for ${unit.code} - ${unit.name} is now pending for approval by the HoD.`,
      });
    }
  };

  const handleJoinWhatsApp = (link: string) => {
    window.open(link, '_blank');
  };

  const handleJoinDiscussion = (unitCode: string) => {
    toast({
      title: "Discussion Group",
      description: `Joining discussion group for ${unitCode}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Unit Registration</h2>
      </div>

      {/* Semester Reporting Component */}
      <SemesterReporting />

      <PendingRegistrations registrations={userPendingRegistrations} />

      {/* Show units automatically after semester reporting */}
      {semesterReport && rawUnits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Available Units</h3>
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {rawUnits.length} units found for {semesterReport.course} Year {semesterReport.year} Semester {semesterReport.semester}
            </div>
          </div>
          <RegisteredUnitsDisplay
            units={availableUnits}
            registrations={userPendingRegistrations}
            onRegister={handleRegister}
            onJoinWhatsApp={handleJoinWhatsApp}
            onJoinDiscussion={handleJoinDiscussion}
          />
        </div>
      )}

      {semesterReport && rawUnits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units have been created yet for your course/year/semester.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Course: {semesterReport.course}, Year: {semesterReport.year}, Semester: {semesterReport.semester}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Please contact the registrar to set up units for your course.
          </p>
          
          {/* Debug Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h4 className="font-semibold text-blue-900 mb-2">🔍 Debug Information</h4>
            <div className="text-sm space-y-1">
              <div><strong>Student Course:</strong> {semesterReport.course}</div>
              <div><strong>Student Year:</strong> {semesterReport.year}</div>
              <div><strong>Student Semester:</strong> {semesterReport.semester}</div>
              <div><strong>Total Units in System:</strong> {createdUnits.length}</div>
              <div><strong>Total Courses in System:</strong> {courses.length}</div>
              <div><strong>User Course Field:</strong> {user?.courseName || user?.course || 'None'}</div>
              <div className="mt-2">
                <strong>Available Courses in System:</strong>
                <ul className="list-disc list-inside mt-1">
                  {courses.map(course => (
                    <li key={course.id}>{course.name}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <strong>Available Unit Courses:</strong>
                <ul className="list-disc list-inside mt-1">
                  {Array.from(new Set(createdUnits.map(u => u.course))).map(course => (
                    <li key={course}>{course}</li>
                  ))}
                </ul>
              </div>
              {createdUnits.length > 0 && (
                <div className="mt-2">
                  <strong>Sample Units:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {createdUnits.slice(0, 3).map(unit => (
                      <li key={unit.id}>
                        {unit.code} - {unit.course} (Y{unit.year} S{unit.semester})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Course Mismatch Warning */}
              {semesterReport?.course && createdUnits.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm">
                    <strong>⚠️ Potential Issue:</strong> Your course "{semesterReport.course}" doesn't match any units in the system.
                    <br />
                    <strong>Solution:</strong> Either:
                    <ul className="list-decimal list-inside mt-1 ml-2">
                      <li>Ask the registrar to create units for "{semesterReport.course}"</li>
                      <li>Or select a different course that has units available</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!semesterReport && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Please report your semester first to proceed with unit registration.
          </p>
        </div>
      )}
    </div>
  );
};
