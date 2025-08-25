
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { UnitCard } from "./units/UnitCard";
import { UnitDetails } from "./units/UnitDetails";
import { EmptyUnitsState } from "./units/EmptyUnitsState";
import { Unit } from "./units/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
import { Badge } from "@/components/ui/badge";
import { RefreshCw, RotateCcw, BookOpen, Calendar, User, MessageSquare, Building, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RegisteredUnitsDisplay } from "./registration/RegisteredUnitsDisplay";
import { StudentCampusRegistration } from "./StudentCampusRegistration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [hasNewUnitsToSync, setHasNewUnitsToSync] = useState(false);
  const [showCampusRegistration, setShowCampusRegistration] = useState(false);
  const { user, pendingUnitRegistrations, addPendingUnitRegistration } = useAuth();
  const { createdUnits, getUnitsForStudent } = useUnits();
  const { toast } = useToast();
  const db = getFirestore();
  
  // Get approved units for the current user (including synced ones)
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );
  
  console.log('Debug MyUnits - Current state:', {
    userId: user?.id,
    totalPendingRegistrations: pendingUnitRegistrations.length,
    approvedRegistrations: approvedRegistrations.length,
    approvedUnits: approvedRegistrations.map(reg => ({ unitCode: reg.unitCode, status: reg.status }))
  });

  // Note: Units are now loaded from backend context, not localStorage
  useEffect(() => {
    if (user?.id) {
      console.log('Units are now loaded from backend context for user:', user.id);
      // Units are automatically loaded through the context providers
    }
  }, [user?.id]); // Units are managed by backend context

  // Auto-sync units on page load and set up periodic checks
  useEffect(() => {
    if (user?.id) {
      checkSemesterReport();
      loadLastSyncTime();
      
      // Auto-sync approved units on page load if none exist locally
      if (approvedRegistrations.length === 0) {
        console.log('No approved units found locally, auto-syncing...');
        syncApprovedUnits();
      }
      
      // Check for new units on load (only once)
      checkForNewUnits();
    }
  }, [user?.id]); // Remove lastSyncTime dependency to prevent loops

  // Separate effect for periodic checks (only set up once)
  useEffect(() => {
    if (!user?.id) return;
    
    // Set up periodic check for new units every 5 minutes
    const intervalId = setInterval(() => {
      console.log('Periodic unit check (5min interval)');
      checkForNewUnits();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      console.log('Clearing periodic unit check interval');
      clearInterval(intervalId);
    };
  }, [user?.id]); // Only depend on user?.id, not lastSyncTime

  // Save sync time to backend for cross-device persistence
  const saveSyncTimeToBackend = async (syncTime: string) => {
    if (!user?.id) return;
    
    try {
      const apiUrl = `${API_BASE_URL}/api/students/sync-status/${user.id}`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lastSyncTime: syncTime })
      });
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  };

  // Load persistent sync status from backend
  const loadLastSyncTime = async () => {
    if (!user?.id) return;
    
    try {
      const apiUrl = `${API_BASE_URL}/api/students/sync-status/${user.id}`;
      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const syncData = await response.json();
        if (syncData.lastSyncTime) {
          setLastSyncTime(syncData.lastSyncTime);
          setUnitsSynced(true);
          console.log('Loaded persistent sync status:', syncData.lastSyncTime);
        }
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  // Check if there are new units on the server that haven't been synced
  const checkForNewUnits = async () => {
    if (!user?.id) return;
    
    try {
      const lookupKey = user.email || user.id;
      const apiUrl = `${API_BASE_URL}/api/students/approved-units/${encodeURIComponent(lookupKey)}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const serverUnits = data.units || [];
        
        // Check if there are units on server that aren't in our current approved registrations
        const newUnitsCount = serverUnits.filter((serverUnit: any) => 
          !approvedRegistrations.some(reg => reg.unitCode === serverUnit.unitCode)
        ).length;
        
        setHasNewUnitsToSync(newUnitsCount > 0);
        console.log(`Found ${newUnitsCount} new units to sync`);
      }
    } catch (error) {
      console.error('Error checking for new units:', error);
    }
  };

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

  // Function to sync approved units from the server
  const syncApprovedUnits = async () => {
    if (!user?.id) {
      console.log('No user ID available for sync');
      return;
    }

    // Use email as the lookup key since the backend can handle email lookups
    // and map them to the correct Firestore student document ID
    const lookupKey = user.email || user.id;
    console.log('Syncing approved units for user:', { id: user.id, email: user.email, lookupKey });
    setIsLoading(true);
    
    try {
      const apiUrl = `${API_BASE_URL}/api/students/approved-units/${encodeURIComponent(lookupKey)}`;
      console.log('Making API call to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error('Failed to fetch approved units');
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      // Add approved units to pending registrations if not already there
      if (data.units && data.units.length > 0) {
        console.log(`Found ${data.units.length} approved units`);
        const newUnits: any[] = [];
        
        data.units.forEach((unit: any) => {
          const existingRegistration = pendingUnitRegistrations.find(
            reg => reg.studentId === user.id && reg.unitCode === unit.unitCode
          );
          
          if (!existingRegistration) {
            const syncedUnit = {
              id: `sync-${Date.now()}-${unit.unitCode}`,
              studentId: user.id,
              unitId: unit.unitId,
              unitCode: unit.unitCode,
              unitName: unit.unitName,
              status: 'approved',
              dateRegistered: unit.approvedAt || new Date().toISOString(),
              semester: unit.semester,
              year: unit.year,
              approvedAt: unit.approvedAt,
              approvedBy: unit.approvedBy,
              remarks: unit.remarks || ''
            };
            
            console.log('Adding synced unit from API:', unit.unitCode);
            addPendingUnitRegistration(syncedUnit);
            newUnits.push(syncedUnit);
          }
        });

        // Save synced units to backend context for persistence
        if (newUnits.length > 0) {
          // Units are now persisted in backend, sync across all devices
          console.log('Synced units saved to backend context:', newUnits.length);
        }

        toast({
          title: "Approved Units Synced",
          description: `Successfully synced ${data.units.length} approved units from server`,
        });
        
        // Save sync time to backend for persistence across devices
        const syncTime = new Date().toISOString();
        await saveSyncTimeToBackend(syncTime);
        setLastSyncTime(syncTime);
        setHasNewUnitsToSync(false);
      } else {
        console.log('No approved units found on server for student:', user.id);
        toast({
          title: "No Approved Units",
          description: "No approved units found on the server",
        });
        
        // Still save sync time even if no units found
        const syncTime = new Date().toISOString();
        await saveSyncTimeToBackend(syncTime);
        setLastSyncTime(syncTime);
        setHasNewUnitsToSync(false);
      }
      
    } catch (error) {
      console.error('Error syncing approved units:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync approved units from server. Please try again.",
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
    
    const mappedUnit = {
      id: reg.unitId, // Use the actual unit ID, not the registration ID
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
    
    return mappedUnit;
  });
  
  console.log('Debug registeredUnits mapping:', {
    approvedRegistrationsCount: approvedRegistrations.length,
    registeredUnitsCount: registeredUnits.length,
    registeredUnits: registeredUnits.map(unit => ({ code: unit.code, name: unit.name }))
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
        
        <div className="flex gap-2">
          {/* Campus Registration Button */}
          <Dialog open={showCampusRegistration} onOpenChange={setShowCampusRegistration}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <Plus className="w-3 h-3" />
                Register for Campus
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Campus Registration
                </DialogTitle>
                <DialogDescription>
                  Register for units at different campus locations
                </DialogDescription>
              </DialogHeader>
              <StudentCampusRegistration 
                availableUnits={createdUnits.filter(unit => unit.status === 'active')} 
                onRegistrationComplete={() => {
                  setShowCampusRegistration(false);
                  // Trigger a sync to load new registrations
                  syncApprovedUnits();
                  toast({
                    title: "Registration Completed",
                    description: "Your campus registration has been submitted successfully.",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
          
          {/* Sync Approved Units Button - disabled when no new units available */}
          <Button
            onClick={syncApprovedUnits}
            disabled={isLoading || (lastSyncTime && !hasNewUnitsToSync)}
            variant={approvedRegistrations.length > 0 ? "secondary" : "outline"}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoading 
              ? "Syncing..." 
              : (lastSyncTime && !hasNewUnitsToSync)
                ? "All Synced"
                : approvedRegistrations.length > 0 
                  ? "Re-sync Approved" 
                  : "Sync Approved"
            }
          </Button>

          {/* Check for New Units Button - shows when sync is disabled */}
          {lastSyncTime && !hasNewUnitsToSync && (
            <Button
              onClick={checkForNewUnits}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Check for New
            </Button>
          )}

          {/* Sync Units Button - shows when semester is reported and not all units are synced */}
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

      {/* Last Sync Status */}
      {lastSyncTime && (
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-800 text-sm flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                {hasNewUnitsToSync ? "Updates Available" : "Up to Date"}
              </Badge>
              Last Synced
            </CardTitle>
            <CardDescription className="text-gray-600">
              {new Date(lastSyncTime).toLocaleString()}
              {hasNewUnitsToSync && (
                <span className="text-blue-600 ml-2">• New units available</span>
              )}
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
              <UnitCard
                key={unit.id}
                unit={unit}
                onUnitClick={handleUnitClick}
                onJoinWhatsApp={handleJoinWhatsApp}
              />
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
