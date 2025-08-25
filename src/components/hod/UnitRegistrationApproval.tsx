import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, User, BookOpen, Calendar, Search, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnitRegistration {
  id: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  status: 'pending' | 'approved' | 'rejected';
  dateRegistered: string;
  semester: string;
  year: number;
  approvedAt?: string;
  approvedBy?: string;
  remarks?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  email: string;
  course: string;
  year: number;
}

interface StudentRegistration {
  student: Student;
  units: UnitRegistration[];
  totalUnits: number;
  hasPendingUnits: boolean;
}

export const UnitRegistrationApproval = () => {
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentRegistration | null>(null);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showCourseApproval, setShowCourseApproval] = useState(false);
  const [courseApprovalRemarks, setCourseApprovalRemarks] = useState("");
  const [processingCourse, setProcessingCourse] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter, courseFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append('status', statusFilter);
      if (courseFilter !== "all") params.append('course', courseFilter);

      const response = await fetch(`http://localhost:3001/api/hod/unit-registrations?${params}`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch unit registrations."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApproval = async (studentId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(true);

      const response = await fetch('http://localhost:3001/api/hod/unit-registrations/approve-bulk', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          action,
          remarks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process bulk approval');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message
      });

      // Refresh the data
      await fetchRegistrations();
      setSelectedStudent(null);
      setRemarks("");
      setBulkAction(null);

    } catch (error) {
      console.error('Error processing bulk approval:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process bulk approval."
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleIndividualApproval = async (registrationId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('http://localhost:3001/api/hod/unit-registrations/approve-individual', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationId,
          action,
          remarks: ""
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process approval');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message
      });

      // Refresh the data
      await fetchRegistrations();

    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process approval."
      });
    }
  };

  const handleCourseApproval = async (course: string, action: 'approve' | 'reject') => {
    try {
      setProcessingCourse(true);

      const response = await fetch('http://localhost:3001/api/hod/unit-registrations/approve-course', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course,
          action,
          remarks: courseApprovalRemarks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process course approval');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message
      });

      // Refresh the data
      await fetchRegistrations();
      setShowCourseApproval(false);
      setCourseApprovalRemarks("");

    } catch (error) {
      console.error('Error processing course approval:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process course approval."
      });
    } finally {
      setProcessingCourse(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const student = reg.student;
    const searchMatch = !searchTerm || 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'rejected':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingCount = registrations.filter(r => r.hasPendingUnits).length;
  const approvedCount = registrations.filter(r => 
    r.units.every(u => u.status === 'approved')
  ).length;

  // Get unique courses with pending registrations
  const coursesWithPending = [...new Set(
    registrations
      .filter(r => r.hasPendingUnits)
      .map(r => r.student.course)
  )];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading unit registrations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Unit Registration Approval</h2>
        <p className="text-muted-foreground">
          Review and approve student unit registrations for the current semester.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Students with pending registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Fully approved students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
            <p className="text-xs text-muted-foreground">Students with registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Information Technology">Information Technology</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Bulk Approval */}
      {coursesWithPending.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              Course Bulk Approval
            </CardTitle>
            <CardDescription>
              Approve all pending unit registrations for entire courses at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {coursesWithPending.map((course) => {
                const courseCount = registrations.filter(r => 
                  r.student.course === course && r.hasPendingUnits
                ).length;
                
                return (
                  <Dialog key={course}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => setShowCourseApproval(true)}
                      >
                        <BookOpen className="w-4 h-4" />
                        {course} ({courseCount} students)
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Approve All Units - {course}</DialogTitle>
                        <DialogDescription>
                          This will approve all pending unit registrations for {courseCount} students in {course}.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="course-remarks">Remarks (Optional)</Label>
                          <Textarea
                            id="course-remarks"
                            placeholder="Add remarks for this course approval..."
                            value={courseApprovalRemarks}
                            onChange={(e) => setCourseApprovalRemarks(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleCourseApproval(course, 'approve')}
                            disabled={processingCourse}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {processingCourse ? 'Processing...' : 'Approve All'}
                          </Button>
                          <Button
                            onClick={() => handleCourseApproval(course, 'reject')}
                            disabled={processingCourse}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {processingCourse ? 'Processing...' : 'Reject All'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Unit Registrations</CardTitle>
          <CardDescription>
            Click on a student to view their detailed unit registrations and approve in bulk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Units Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {registration.student.firstName} {registration.student.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {registration.student.admissionNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{registration.student.course}</TableCell>
                  <TableCell>Year {registration.student.year}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {registration.totalUnits} units
                    </div>
                  </TableCell>
                  <TableCell>
                    {registration.hasPendingUnits ? (
                      <Badge className={getStatusColor('pending')}>
                        {getStatusIcon('pending')}
                        <span className="ml-1">Pending</span>
                      </Badge>
                    ) : registration.units.every(u => u.status === 'approved') ? (
                      <Badge className={getStatusColor('approved')}>
                        {getStatusIcon('approved')}
                        <span className="ml-1">Approved</span>
                      </Badge>
                    ) : (
                      <Badge className={getStatusColor('rejected')}>
                        {getStatusIcon('rejected')}
                        <span className="ml-1">Mixed</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStudent(registration)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Unit Registrations - {registration.student.firstName} {registration.student.lastName}
                          </DialogTitle>
                          <DialogDescription>
                            Review and approve unit registrations for this student.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                          {/* Student Info */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Student Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p>{registration.student.firstName} {registration.student.lastName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Admission Number</Label>
                                <p>{registration.student.admissionNumber}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Course</Label>
                                <p>{registration.student.course}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Year</Label>
                                <p>Year {registration.student.year}</p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Units Table */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Registered Units</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="max-h-60 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Unit Code</TableHead>
                                      <TableHead>Unit Name</TableHead>
                                      <TableHead>Semester</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                  {registration.units.map((unit) => (
                                    <TableRow key={unit.id}>
                                      <TableCell className="font-medium">{unit.unitCode}</TableCell>
                                      <TableCell>{unit.unitName}</TableCell>
                                      <TableCell>{unit.semester}</TableCell>
                                      <TableCell>
                                        <Badge className={getStatusColor(unit.status)}>
                                          {getStatusIcon(unit.status)}
                                          <span className="ml-1 capitalize">{unit.status}</span>
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {unit.status === 'pending' && (
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleIndividualApproval(unit.id, 'approve')}
                                            >
                                              <CheckCircle className="w-4 h-4 mr-1" />
                                              Approve
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleIndividualApproval(unit.id, 'reject')}
                                            >
                                              <XCircle className="w-4 h-4 mr-1" />
                                              Reject
                                            </Button>
                                          </div>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>                          {/* Bulk Actions */}
                          {registration.hasPendingUnits && (
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Bulk Actions</CardTitle>
                                <CardDescription>
                                  Approve or reject all pending units for this student at once.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                                  <Textarea
                                    id="remarks"
                                    placeholder="Add remarks for this approval..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleBulkApproval(registration.student.id, 'approve')}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve All Units
                                  </Button>
                                  <Button
                                    onClick={() => handleBulkApproval(registration.student.id, 'reject')}
                                    disabled={processing}
                                    variant="destructive"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject All Units
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || courseFilter !== "all" 
                  ? 'No registrations found matching your filters.' 
                  : 'No unit registrations found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
