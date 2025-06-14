
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PendingUnitRegistrations = () => {
  const { getPendingUnitRegistrations, updateUnitRegistrationStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const pendingRegistrations = getPendingUnitRegistrations();

  const filteredRegistrations = pendingRegistrations.filter(registration =>
    registration.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (registrationId: string, studentName: string, unitCode: string) => {
    updateUnitRegistrationStatus(registrationId, 'approved');
    toast({
      title: "Registration Approved",
      description: `Unit registration for ${studentName} - ${unitCode} has been approved.`,
    });
  };

  const handleReject = (registrationId: string, studentName: string, unitCode: string) => {
    updateUnitRegistrationStatus(registrationId, 'rejected');
    toast({
      title: "Registration Rejected",
      description: `Unit registration for ${studentName} - ${unitCode} has been rejected.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pending Unit Registrations</h2>
          <p className="text-gray-600">Review and approve student unit registration requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium">{pendingRegistrations.length} Pending</span>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Registrations</p>
              <p className="text-2xl font-bold text-orange-600">{pendingRegistrations.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unit Registration Requests</CardTitle>
          <CardDescription>Students waiting for unit registration approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name, email, or unit code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Details</TableHead>
                <TableHead>Unit Details</TableHead>
                <TableHead>Course & Year</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{registration.studentName}</div>
                      <div className="text-sm text-gray-500">{registration.studentEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{registration.unitCode}</div>
                      <div className="text-sm text-gray-500">{registration.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{registration.course}</div>
                      <div className="text-sm text-gray-500">Year {registration.year}, Semester {registration.semester}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{registration.submittedDate}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(registration.id, registration.studentName, registration.unitCode)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(registration.id, registration.studentName, registration.unitCode)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {pendingRegistrations.length === 0 
                ? "No pending unit registrations"
                : "No registrations found matching your search"
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
