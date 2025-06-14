
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Clock, User, MessageCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailableUnit {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  semester: string;
  year: number;
  course: string;
  prerequisites: string[];
  description: string;
  schedule: string;
  whatsappLink?: string;
  hasDiscussionGroup: boolean;
}

interface PendingRegistration {
  id: string;
  unitCode: string;
  unitName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

const courseUnits: Record<string, Record<number, AvailableUnit[]>> = {
  "Software Engineering": {
    1: [
      {
        id: "se1-1",
        code: "PROG101",
        name: "Introduction to Programming",
        lecturer: "Dr. John Kamau",
        credits: 4,
        semester: "Semester 1",
        year: 1,
        course: "Software Engineering",
        prerequisites: [],
        description: "Fundamentals of programming using Python",
        schedule: "Mon, Wed, Fri 8:00-10:00 AM",
        whatsappLink: "https://chat.whatsapp.com/prog101-group",
        hasDiscussionGroup: true
      },
      {
        id: "se1-2",
        code: "MATH101",
        name: "Discrete Mathematics",
        lecturer: "Prof. Mary Wanjiku",
        credits: 3,
        semester: "Semester 1",
        year: 1,
        course: "Software Engineering",
        prerequisites: [],
        description: "Mathematical foundations for computer science",
        schedule: "Tue, Thu 10:00-12:00 PM",
        hasDiscussionGroup: false
      },
      {
        id: "se1-3",
        code: "COM101",
        name: "Computer Fundamentals",
        lecturer: "Mr. Peter Ochieng",
        credits: 3,
        semester: "Semester 1",
        year: 1,
        course: "Software Engineering",
        prerequisites: [],
        description: "Basic computer concepts and digital literacy",
        schedule: "Mon, Wed 2:00-4:00 PM",
        whatsappLink: "https://chat.whatsapp.com/com101-group",
        hasDiscussionGroup: true
      }
    ],
    2: [
      {
        id: "se2-1",
        code: "OOP201",
        name: "Object Oriented Programming",
        lecturer: "Dr. Sarah Kimani",
        credits: 4,
        semester: "Semester 1",
        year: 2,
        course: "Software Engineering",
        prerequisites: ["PROG101"],
        description: "Object-oriented programming concepts using Java",
        schedule: "Mon, Wed, Fri 9:00-11:00 AM",
        whatsappLink: "https://chat.whatsapp.com/oop201-group",
        hasDiscussionGroup: true
      },
      {
        id: "se2-2",
        code: "DSA201",
        name: "Data Structures and Algorithms",
        lecturer: "Mr. James Mwangi",
        credits: 4,
        semester: "Semester 1",
        year: 2,
        course: "Software Engineering",
        prerequisites: ["PROG101", "MATH101"],
        description: "Fundamental data structures and algorithmic thinking",
        schedule: "Tue, Thu 8:00-10:00 AM",
        hasDiscussionGroup: false
      }
    ],
    3: [
      {
        id: "se3-1",
        code: "WEB301",
        name: "Web Development",
        lecturer: "Ms. Grace Wanjiru",
        credits: 4,
        semester: "Semester 1",
        year: 3,
        course: "Software Engineering",
        prerequisites: ["OOP201"],
        description: "Full-stack web development with modern frameworks",
        schedule: "Mon, Wed, Fri 1:00-3:00 PM",
        whatsappLink: "https://chat.whatsapp.com/web301-group",
        hasDiscussionGroup: true
      },
      {
        id: "se3-2",
        code: "DB301",
        name: "Database Systems",
        lecturer: "Dr. Michael Kiprotich",
        credits: 3,
        semester: "Semester 1",
        year: 3,
        course: "Software Engineering",
        prerequisites: ["DSA201"],
        description: "Database design, SQL, and database management systems",
        schedule: "Tue, Thu 11:00-1:00 PM",
        hasDiscussionGroup: true
      }
    ]
  },
  "Computer Science": {
    1: [
      {
        id: "cs1-1",
        code: "CS101",
        name: "Introduction to Computer Science",
        lecturer: "Dr. Alice Njeri",
        credits: 4,
        semester: "Semester 1",
        year: 1,
        course: "Computer Science",
        prerequisites: [],
        description: "Overview of computer science fundamentals",
        schedule: "Mon, Wed, Fri 8:00-10:00 AM",
        hasDiscussionGroup: true
      },
      {
        id: "cs1-2",
        code: "CALC101",
        name: "Calculus I",
        lecturer: "Prof. Robert Kipchoge",
        credits: 4,
        semester: "Semester 1",
        year: 1,
        course: "Computer Science",
        prerequisites: [],
        description: "Differential and integral calculus",
        schedule: "Tue, Thu 9:00-11:00 AM",
        hasDiscussionGroup: false
      }
    ]
  }
};

const pendingRegistrations: PendingRegistration[] = [
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
      toast({
        title: "Registration Submitted",
        description: `Your registration for ${unit.code} - ${unit.name} has been submitted for approval.`,
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

      {/* Course and Year Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course">Select Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Software Engineering">Software Engineering</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Information Technology">Information Technology</SelectItem>
              <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Select Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Choose academic year" />
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

      {/* Search */}
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

      {/* Available Units */}
      {selectedCourse && selectedYear && (
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
                    <span>{unit.semester}, Year {unit.year}</span>
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

                {/* WhatsApp and Discussion Groups */}
                <div className="flex gap-2">
                  {unit.whatsappLink && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinWhatsApp(unit.whatsappLink!)}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  )}
                  {unit.hasDiscussionGroup && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinDiscussion(unit.code)}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Discussion
                    </Button>
                  )}
                </div>

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
