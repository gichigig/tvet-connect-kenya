
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PendingRegistrations } from "./registration/PendingRegistrations";
import { CourseYearSelector } from "./registration/CourseYearSelector";
import { UnitCard } from "./registration/UnitCard";
import { courseUnits } from "./registration/courseUnitsData";
import { PendingRegistration } from "./registration/types";

const initialPendingRegistrations: PendingRegistration[] = [
  {
    id: "1",
    unitCode: "PROG101",
    unitName: "Introduction to Programming",
    status: 'pending',
    submittedDate: "2024-01-15"
  }
];

export const UnitRegistration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>(initialPendingRegistrations);
  const { toast } = useToast();

  const availableUnits = selectedCourse && selectedYear 
    ? courseUnits[selectedCourse]?.[parseInt(selectedYear)] || []
    : [];

  const filteredUnits = availableUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegister = (unitId: string) => {
    const unit = availableUnits.find(u => u.id === unitId);
    if (unit) {
      const newRegistration: PendingRegistration = {
        id: Date.now().toString(),
        unitCode: unit.code,
        unitName: unit.name,
        status: 'pending',
        submittedDate: new Date().toISOString().split('T')[0]
      };
      
      setPendingRegistrations(prev => [...prev, newRegistration]);
      
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

      <PendingRegistrations registrations={pendingRegistrations} />

      <CourseYearSelector
        selectedCourse={selectedCourse}
        selectedYear={selectedYear}
        onCourseChange={setSelectedCourse}
        onYearChange={setSelectedYear}
      />

      {selectedCourse && selectedYear && (
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

      {selectedCourse && selectedYear && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              pendingRegistrations={pendingRegistrations}
              onRegister={handleRegister}
              onJoinWhatsApp={handleJoinWhatsApp}
              onJoinDiscussion={handleJoinDiscussion}
            />
          ))}
        </div>
      )}

      {selectedCourse && selectedYear && filteredUnits.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units available for {selectedCourse} Year {selectedYear}.
          </p>
        </div>
      )}

      {selectedCourse && selectedYear && filteredUnits.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units found matching your search.
          </p>
        </div>
      )}

      {!selectedCourse || !selectedYear ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Please select your course and year to view available units.
          </p>
        </div>
      ) : null}
    </div>
  );
};
