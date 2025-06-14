
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Edit, Calendar, Award, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  hireDate: string;
  status: "active" | "leave" | "probation";
  workload: number;
  performance: "excellent" | "good" | "average" | "needs_improvement";
}

export const StaffManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Dr. John Kamau",
      email: "j.kamau@institution.ac.ke",
      position: "Senior Lecturer",
      department: "Mechanical Engineering",
      hireDate: "2020-03-15",
      status: "active",
      workload: 85,
      performance: "excellent"
    },
    {
      id: "2",
      name: "Ms. Sarah Wanjiku",
      email: "s.wanjiku@institution.ac.ke",
      position: "Lecturer",
      department: "Mechanical Engineering",
      hireDate: "2021-08-20",
      status: "active",
      workload: 75,
      performance: "good"
    },
    {
      id: "3",
      name: "Mr. Peter Ochieng",
      email: "p.ochieng@institution.ac.ke",
      position: "Assistant Lecturer",
      department: "Mechanical Engineering",
      hireDate: "2023-01-10",
      status: "probation",
      workload: 60,
      performance: "average"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'leave':
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>;
      case 'probation':
        return <Badge className="bg-orange-100 text-orange-800">Probation</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPerformanceBadge = (performance: string) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'average': 'bg-yellow-100 text-yellow-800',
      'needs_improvement': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[performance as keyof typeof colors]}>{performance.replace('_', ' ')}</Badge>;
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || staff.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleScheduleAppraisal = (staff: StaffMember) => {
    toast({
      title: "Appraisal Scheduled",
      description: `Performance appraisal scheduled for ${staff.name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Management
          </CardTitle>
          <CardDescription>
            Manage department lecturers, workloads, and performance evaluations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </div>

          {/* Staff Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-sm text-gray-500">{staff.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>{getStatusBadge(staff.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${staff.workload}%`}}
                        ></div>
                      </div>
                      <span className="text-sm">{staff.workload}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPerformanceBadge(staff.performance)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleScheduleAppraisal(staff)}>
                        <Award className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
