import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PendingRegistrations } from "./registration/PendingRegistrations";
import { SyncUnitsButton } from "./registration/SyncUnitsButton";
import { UnitCard } from "./registration/UnitCard";
import { PendingRegistration, AvailableUnit } from "./registration/types";

export const UnitRegistration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Remove manual course/year selection; use user context
  const [unitsSynced, setUnitsSynced] = useState(false);
  const { toast } = useToast();
  const { user, addPendingUnitRegistration, pendingUnitRegistrations, getAvailableUnits } = useAuth();

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

  // Get available units for user's course/year/semester after sync
  const rawUnits = unitsSynced && user?.course && user?.year && user?.semester
    ? getAvailableUnits(user.course, user.year, user.semester)
    : [];

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
    if (unit && user) {
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
        course: user.course,
        year: user.year,
        semester: unit.semester
      });
      
      toast({
        title: "Registration Pending for Approval", 
        description: `Your registration for ${unit.code} - ${unit.name} is now pending for approval by the registrar.`,
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

      <PendingRegistrations registrations={userPendingRegistrations} />


      <SyncUnitsButton onSync={() => setUnitsSynced(true)} />

      {unitsSynced && rawUnits.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="search">Search Available Units</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by unit name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {unitsSynced && rawUnits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              pendingRegistrations={userPendingRegistrations}
              onRegister={handleRegister}
              onJoinWhatsApp={handleJoinWhatsApp}
              onJoinDiscussion={handleJoinDiscussion}
            />
          ))}
        </div>
      )}

      {unitsSynced && rawUnits.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units have been created yet for your course/year/semester.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please contact the registrar to set up units for your course.
          </p>
        </div>
      )}

      {unitsSynced && rawUnits.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units found matching your search.
          </p>
        </div>
      )}

      {!unitsSynced ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Press the sync button to load units for your course, year, and semester.
          </p>
        </div>
      ) : null}
    </div>
  );
};
