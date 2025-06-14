
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UnitCard } from "./units/UnitCard";
import { UnitDetails } from "./units/UnitDetails";
import { EmptyUnitsState } from "./units/EmptyUnitsState";
import { Unit } from "./units/types";

export const MyUnits = () => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { user, pendingUnitRegistrations } = useAuth();
  
  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Convert approved registrations to Unit format
  const registeredUnits: Unit[] = approvedRegistrations.map(reg => ({
    id: reg.id,
    code: reg.unitCode,
    name: reg.unitName,
    lecturer: "TBD",
    credits: 3,
    progress: 0,
    nextClass: "Check schedule",
    status: 'active' as const,
    semester: `Semester ${reg.semester}`
  }));

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  const handleBack = () => {
    setSelectedUnit(null);
  };

  if (selectedUnit) {
    return <UnitDetails unit={selectedUnit} onBack={handleBack} />;
  }

  if (registeredUnits.length === 0) {
    return <EmptyUnitsState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Units</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registeredUnits.map((unit) => (
          <UnitCard 
            key={unit.id} 
            unit={unit} 
            onUnitClick={handleUnitClick}
          />
        ))}
      </div>
    </div>
  );
};
