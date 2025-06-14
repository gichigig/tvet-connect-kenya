
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, BookOpen, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailableUnit {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  semester: string;
  prerequisites: string[];
  description: string;
  schedule: string;
}

interface PendingRegistration {
  id: string;
  unitCode: string;
  unitName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

const availableUnits: AvailableUnit[] = [
  {
    id: "1",
    code: "AI401",
    name: "Artificial Intelligence",
    lecturer: "Dr. Sarah Kimani",
    credits: 4,
    semester: "Semester 2",
    prerequisites: ["PROG201", "MATH301"],
    description: "Introduction to AI concepts, machine learning, and neural networks",
    schedule: "Mon, Wed, Fri 9:00-11:00 AM"
  },
  {
    id: "2",
    code: "MOB301",
    name: "Mobile App Development",
    lecturer: "Mr. James Ochieng",
    credits: 3,
    semester: "Semester 2",
    prerequisites: ["PROG101", "WEB201"],
    description: "Develop mobile applications for iOS and Android platforms",
    schedule: "Tue, Thu 2:00-4:00 PM"
  },
  {
    id: "3",
    code: "CYB401",
    name: "Cybersecurity Fundamentals",
    lecturer: "Ms. Rachel Muthoni",
    credits: 3,
    semester: "Semester 2",
    prerequisites: ["NET201"],
    description: "Network security, ethical hacking, and digital forensics",
    schedule: "Wed, Fri 1:00-3:00 PM"
  }
];

const pendingRegistrations: PendingRegistration[] = [
  {
    id: "1",
    unitCode: "AI401",
    unitName: "Artificial Intelligence",
    status: 'pending',
    submittedDate: "2024-01-15"
  },
  {
    id: "2",
    unitCode: "MOB301",
    unitName: "Mobile App Development",
    status: 'approved',
    submittedDate: "2024-01-10"
  }
];

export const UnitRegistration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredUnits = availableUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegister = (unitId: string) => {
    const unit = availableUnits.find(u => u.id === unitId);
    if (unit) {
      toast({
        title: "Registration Submitted",
        description: `Your registration for ${unit.code} - ${unit.name} has been submitted for approval.`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Unit Registration</h2>
      </div>

      {/* Pending Registrations */}
      {pendingRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Registrations</CardTitle>
            <CardDescription>Units waiting for registrar approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{registration.unitCode} - {registration.unitName}</h3>
                    <p className="text-sm text-gray-600">Submitted: {registration.submittedDate}</p>
                  </div>
                  <Badge className={getStatusColor(registration.status)}>
                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
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

      {/* Available Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUnits.map((unit) => (
          <Card key={unit.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{unit.code}</CardTitle>
                  <CardDescription>{unit.name}</CardDescription>
                </div>
                <Badge variant="outline">{unit.credits} Credits</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{unit.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{unit.lecturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{unit.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{unit.semester}</span>
                </div>
              </div>

              {unit.prerequisites.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Prerequisites:</h4>
                  <div className="flex flex-wrap gap-2">
                    {unit.prerequisites.map((prereq) => (
                      <Badge key={prereq} variant="secondary" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => handleRegister(unit.id)}
                className="w-full"
                disabled={pendingRegistrations.some(p => p.unitCode === unit.code)}
              >
                {pendingRegistrations.some(p => p.unitCode === unit.code) ? 'Already Registered' : 'Register for Unit'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No units found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};
