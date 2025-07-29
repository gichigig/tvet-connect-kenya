
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { UnitCard } from "./units/UnitCard";
import { UnitDetails } from "./units/UnitDetails";
import { EmptyUnitsState } from "./units/EmptyUnitsState";
import { Unit } from "./units/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, RotateCcw, BookOpen, Calendar, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RegisteredUnitsDisplay } from "./registration/RegisteredUnitsDisplay";

interface SemesterReport {
  studentId: string;
  course: string;
  year: number;
  semester: string;
  reportedAt: Date;
  status: 'active' | 'completed';
}

export const MyUnits = () => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unitsSynced, setUnitsSynced] = useState(false);
  const [semesterReport, setSemesterReport] = useState<SemesterReport | null>(null);
  const { user, pendingUnitRegistrations, addPendingUnitRegistration } = useAuth();
  const { createdUnits, getUnitsForStudent } = useUnits();
  const { toast } = useToast();
  const db = getFirestore();
  
  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Check if student has reported their semester
  useEffect(() => {
    if (user?.id) {
      checkSemesterReport();
    }
  }, [user?.id]);

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

  // Get available units for user's reported semester
  const rawUnits = unitsSynced && semesterReport 
    ? getUnitsForStudent(semesterReport.course, semesterReport.year, parseInt(semesterReport.semester))
    : [];

  // Convert units to AvailableUnit type with lecturer property
  const availableUnits = rawUnits.map(unit => ({
    ...unit,
    lecturer: unit.lecturerName ? {
      id: unit.lecturerId || '',
      name: unit.lecturerName,
      email: unit.lecturerEmail || ''
    } : undefined
  }));

  // Function to sync units based on reported semester
  const syncUnitsForSemesterAndYear = async () => {
    if (!semesterReport) {
      toast({
        title: "Semester Not Reported",
        description: "Please report your semester first in the Unit Registration tab",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      setUnitsSynced(true);
      toast({
        title: "Units Synced",
        description: `Loaded units for ${semesterReport.course} Year ${semesterReport.year} Semester ${semesterReport.semester}`,
      });
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync units. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Check if all available units are synced (no new units to add)
  const allUnitsSynced = unitsSynced && availableUnits.length > 0 && 
    availableUnits.every(unit => 
      pendingUnitRegistrations.some(reg => 
        reg.studentId === user?.id && reg.unitCode === unit.code
      )
    );

  // Convert approved registrations to Unit format with real lecturer info
  const registeredUnits: Unit[] = approvedRegistrations.map(reg => {
    const actualUnit = createdUnits.find(unit => unit.code === reg.unitCode);
    
    return {
      id: reg.id,
      code: reg.unitCode,
      name: reg.unitName,
      lecturer: actualUnit?.lecturerName || "Not Assigned",
      credits: actualUnit?.credits || 3,
      progress: Math.floor(Math.random() * 80) + 10,
      nextClass: actualUnit?.schedule || "Check schedule",
      status: 'active' as const,
      semester: `Semester ${reg.semester}`,
      lecturerEmail: actualUnit?.lecturerEmail,
      whatsappLink: actualUnit?.whatsappLink,
      hasDiscussionGroup: actualUnit?.hasDiscussionGroup || false,
      description: actualUnit?.description,
      department: actualUnit?.department,
      enrolled: actualUnit?.enrolled || 0,
      capacity: actualUnit?.capacity || 50
    };
  });

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  const handleBack = () => {
    setSelectedUnit(null);
  };

  if (selectedUnit) {
    return <UnitDetails unit={selectedUnit} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Units</h2>
        
        {/* Sync Button - shows when semester is reported and not all units are synced */}
        {semesterReport && !allUnitsSynced && (
          <Button
            onClick={syncUnitsForSemesterAndYear}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoading ? "Syncing..." : "Sync Units"}
          </Button>
        )}
      </div>

      {/* Semester Report Status */}
      {semesterReport && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-lg">Current Semester</CardTitle>
            <CardDescription className="text-blue-700">
              {semesterReport.course} - Year {semesterReport.year} - Semester {semesterReport.semester}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!semesterReport && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Semester Not Reported</CardTitle>
            <CardDescription className="text-amber-700">
              Please report your semester in the Unit Registration tab to view your units.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Available Units for Registration */}
      {unitsSynced && rawUnits.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Units for Registration</h3>
          <RegisteredUnitsDisplay
            units={availableUnits}
            registrations={pendingUnitRegistrations.filter(reg => reg.studentId === user?.id)}
            onRegister={handleRegister}
            onJoinWhatsApp={handleJoinWhatsApp}
            onJoinDiscussion={handleJoinDiscussion}
          />
        </div>
      )}

      {/* Approved/Enrolled Units */}
      {registeredUnits.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Enrolled Units</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {registeredUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleUnitClick(unit)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{unit.code}</CardTitle>
                      <CardDescription className="font-medium">{unit.name}</CardDescription>
                    </div>
                    <Badge variant="default">{unit.credits} Credits</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{unit.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${unit.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3" />
                      <span>{unit.lecturer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{unit.nextClass}</span>
                    </div>
                    {unit.whatsappLink && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(unit.whatsappLink, '_blank');
                          }}
                        >
                          WhatsApp Group
                        </Button>
                      </div>
                    )}
                    {unit.hasDiscussionGroup && (
                      <Badge variant="secondary" className="text-xs">
                        Discussion Group Active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {unitsSynced && rawUnits.length === 0 && semesterReport && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units available for your reported semester.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please contact the registrar to set up units for your course.
          </p>
        </div>
      )}

      {registeredUnits.length === 0 && !semesterReport && (
        <EmptyUnitsState />
      )}
    </div>
  );
};
