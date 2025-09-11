
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, Calendar, Plus, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndustryPartner {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  partnershipType: "internship" | "research" | "equipment" | "guest_lectures" | "job_placement";
  status: "active" | "pending" | "inactive";
  establishedDate: string;
  location: string;
}

interface InternshipPlacement {
  id: string;
  studentName: string;
  studentId: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "pending_approval";
  supervisor: string;
}

interface GuestLecture {
  id: string;
  speakerName: string;
  company: string;
  topic: string;
  scheduledDate: string;
  duration: string;
  targetCourse: string;
  status: "scheduled" | "completed" | "cancelled";
  attendees?: number;
}

export const IndustryLiaison = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("partners");

  const [industryPartners, setIndustryPartners] = useState<IndustryPartner[]>([
    {
      id: "1",
      companyName: "Kenya Airways Engineering",
      contactPerson: "Jane Mwangi",
      email: "j.mwangi@ke.kenya-airways.com",
      phone: "+254-700-123456",
      industry: "Aviation",
      partnershipType: "internship",
      status: "active",
      establishedDate: "2023-02-15",
      location: "Nairobi"
    },
    {
      id: "2",
      companyName: "Bamburi Cement Limited",
      contactPerson: "David Kipkorir",
      email: "d.kipkorir@bamburi.co.ke",
      phone: "+254-711-987654",
      industry: "Manufacturing",
      partnershipType: "research",
      status: "active",
      establishedDate: "2022-09-20",
      location: "Mombasa"
    },
    {
      id: "3",
      companyName: "Safaricom PLC",
      contactPerson: "Mary Njoroge",
      email: "m.njoroge@safaricom.co.ke",
      phone: "+254-722-456789",
      industry: "Telecommunications",
      partnershipType: "guest_lectures",
      status: "pending",
      establishedDate: "2024-01-10",
      location: "Nairobi"
    }
  ]);

  const [internshipPlacements, setInternshipPlacements] = useState<InternshipPlacement[]>([
    {
      id: "1",
      studentName: "John Doe",
      studentId: "STU2024001",
      company: "Kenya Airways Engineering",
      position: "Mechanical Engineering Intern",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      status: "active",
      supervisor: "Jane Mwangi"
    },
    {
      id: "2",
      studentName: "Alice Wanjiku",
      studentId: "STU2024002",
      company: "Bamburi Cement Limited",
      position: "Process Engineering Intern",
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      status: "pending_approval",
      supervisor: "David Kipkorir"
    }
  ]);

  const [guestLectures, setGuestLectures] = useState<GuestLecture[]>([
    {
      id: "1",
      speakerName: "Dr. James Mwangi",
      company: "Kenya Airways Engineering",
      topic: "Aviation Maintenance Best Practices",
      scheduledDate: "2024-07-15",
      duration: "2 hours",
      targetCourse: "ME201",
      status: "scheduled"
    },
    {
      id: "2",
      speakerName: "Sarah Kimani",
      company: "Safaricom PLC",
      topic: "Digital Innovation in Industry",
      scheduledDate: "2024-06-20",
      duration: "1.5 hours",
      targetCourse: "ICT101",
      status: "completed",
      attendees: 45
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'pending_approval':
        return <Badge className="bg-orange-100 text-orange-800">Pending Approval</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800">Scheduled</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPartnershipTypeBadge = (type: string) => {
    const colors = {
      'internship': 'bg-blue-100 text-blue-800',
      'research': 'bg-green-100 text-green-800',
      'equipment': 'bg-purple-100 text-purple-800',
      'guest_lectures': 'bg-orange-100 text-orange-800',
      'job_placement': 'bg-indigo-100 text-indigo-800'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type.replace('_', ' ')}</Badge>;
  };

  const activePartners = industryPartners.filter(p => p.status === 'active').length;
  const activeInternships = internshipPlacements.filter(p => p.status === 'active').length;
  const scheduledLectures = guestLectures.filter(l => l.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePartners}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeInternships}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Lectures</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{scheduledLectures}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partnership Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-muted-foreground">Industry Engagement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Industry Partners
          </TabsTrigger>
          <TabsTrigger value="internships" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Internships
          </TabsTrigger>
          <TabsTrigger value="lectures" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Guest Lectures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Industry Partners
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Partner
                </Button>
              </CardTitle>
              <CardDescription>
                Manage industry partnerships and collaborations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Partnership Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {industryPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{partner.companyName}</div>
                          <div className="text-sm text-gray-500">Since {partner.establishedDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{partner.contactPerson}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {partner.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {partner.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{partner.industry}</TableCell>
                      <TableCell>{getPartnershipTypeBadge(partner.partnershipType)}</TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {partner.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Internship Placements
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Placement
                </Button>
              </CardTitle>
              <CardDescription>
                Track student internship placements and supervision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internshipPlacements.map((placement) => (
                    <TableRow key={placement.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{placement.studentName}</div>
                          <div className="text-sm text-gray-500">{placement.studentId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{placement.company}</TableCell>
                      <TableCell>{placement.position}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {placement.startDate} to {placement.endDate}
                        </div>
                      </TableCell>
                      <TableCell>{placement.supervisor}</TableCell>
                      <TableCell>{getStatusBadge(placement.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lectures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Guest Lectures
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule Lecture
                </Button>
              </CardTitle>
              <CardDescription>
                Coordinate guest lectures and industry expert sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Date & Duration</TableHead>
                    <TableHead>Target Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestLectures.map((lecture) => (
                    <TableRow key={lecture.id}>
                      <TableCell className="font-medium">{lecture.speakerName}</TableCell>
                      <TableCell>{lecture.company}</TableCell>
                      <TableCell className="max-w-xs truncate">{lecture.topic}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{lecture.scheduledDate}</div>
                          <div className="text-sm text-gray-500">{lecture.duration}</div>
                        </div>
                      </TableCell>
                      <TableCell>{lecture.targetCourse}</TableCell>
                      <TableCell>
                        <div>
                          {getStatusBadge(lecture.status)}
                          {lecture.attendees && (
                            <div className="text-sm text-gray-500 mt-1">
                              {lecture.attendees} attendees
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          {lecture.status === 'scheduled' ? 'Edit' : 'View'}
                        </Button>
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
