import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Eye, 
  CheckCircle,
  Calculator,
  FileText
} from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course, FeeStructure } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

export function FeeStructureManagement() {
  const { 
    courses, 
    feeStructures, 
    getCoursesByStatus, 
    getFeeStructureByCourseId,
    createFeeStructure,
    updateFeeStructure,
    activateCourse
  } = useCoursesContext();
  const { toast } = useToast();
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingFeeStructure, setEditingFeeStructure] = useState<FeeStructure | null>(null);
  const [feeFormData, setFeeFormData] = useState<{
    courseId?: string;
    courseName?: string;
    academicYear?: string;
    totalFees?: number;
    tuitionFees?: number;
    examFees?: number;
    labFees?: number;
    libraryFees?: number;
    registrationFees?: number;
    otherFees?: number;
  }>({});

  // Get courses that need fee structures (approved courses without fee structures)
  const approvedCourses = getCoursesByStatus('approved');
  const coursesNeedingFees = approvedCourses.filter(course => !getFeeStructureByCourseId(course.id));
  const coursesWithFees = approvedCourses.filter(course => getFeeStructureByCourseId(course.id));

  const initializeFeeForm = (course: Course) => {
    setFeeFormData({
      courseId: course.id,
      courseName: course.name,
      academicYear: new Date().getFullYear().toString(),
      tuitionFees: 0,
      examFees: 1000,
      labFees: 500,
      libraryFees: 500,
      registrationFees: 300,
      otherFees: 200
    });
  };

  const calculateTotalFee = (feeData: {
    tuitionFees?: number;
    examFees?: number;
    labFees?: number;
    libraryFees?: number;
    registrationFees?: number;
    otherFees?: number;
  }) => {
    const {
      tuitionFees = 0,
      examFees = 0,
      labFees = 0,
      libraryFees = 0,
      registrationFees = 0,
      otherFees = 0
    } = feeData;
    
    return tuitionFees + examFees + labFees + libraryFees + registrationFees + otherFees;
  };

  const handleCreateFeeStructure = async () => {
    if (!selectedCourse || !feeFormData.tuitionFees) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalFee = calculateTotalFee(feeFormData);
      
      const feeStructure: Omit<FeeStructure, 'id' | 'createdAt' | 'createdBy'> = {
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        academicYear: feeFormData.academicYear || new Date().getFullYear().toString(),
        totalFees: totalFee,
        breakdown: {
          tuitionFees: feeFormData.tuitionFees || 0,
          examFees: feeFormData.examFees || 0,
          labFees: feeFormData.labFees || 0,
          libraryFees: feeFormData.libraryFees || 0,
          registrationFees: feeFormData.registrationFees || 0,
          otherFees: feeFormData.otherFees || 0
        },
        paymentSchedule: [
          {
            semester: 1,
            amount: totalFee / 2,
            dueDate: new Date(new Date().getFullYear(), 2, 15).toISOString() // March 15
          },
          {
            semester: 2,
            amount: totalFee / 2,
            dueDate: new Date(new Date().getFullYear(), 8, 15).toISOString() // September 15
          }
        ],
        isActive: true
      };

      await createFeeStructure(feeStructure);
      
      // Activate the course now that it has a fee structure
      await activateCourse(selectedCourse.id);

      toast({
        title: "Fee Structure Created",
        description: `Fee structure for ${selectedCourse.name} has been created and the course is now active.`
      });

      setSelectedCourse(null);
      setFeeFormData({});
    } catch (error) {
      console.error('Error creating fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to create fee structure. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const FeeStructureForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          Create Fee Structure - {selectedCourse?.name}
        </CardTitle>
        <CardDescription>
          Set up the fee structure for {selectedCourse?.code}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Select 
              value={feeFormData.academicYear} 
              onValueChange={(value) => setFeeFormData(prev => ({ ...prev, academicYear: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fee Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tuitionFees">Tuition Fees (KES) *</Label>
              <Input
                id="tuitionFees"
                type="number"
                value={feeFormData.tuitionFees || ''}
                onChange={(e) => setFeeFormData(prev => ({ 
                  ...prev, 
                  tuitionFees: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 50000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examFees">Examination Fees (KES)</Label>
              <Input
                id="examFees"
                type="number"
                value={feeFormData.examFees || ''}
                onChange={(e) => setFeeFormData(prev => ({ 
                  ...prev, 
                  examFees: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labFees">Laboratory Fees (KES)</Label>
              <Input
                id="labFees"
                type="number"
                value={feeFormData.labFees || ''}
                onChange={(e) => setFeeFormData(prev => ({ 
                  ...prev, 
                  labFees: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="libraryFees">Library Fees (KES)</Label>
              <Input
                id="libraryFees"
                type="number"
                value={feeFormData.libraryFees || ''}
                onChange={(e) => setFeeFormData(prev => ({ 
                  ...prev, 
                  libraryFees: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationFees">Registration Fees (KES)</Label>
              <Input
                id="registrationFees"
                type="number"
                value={feeFormData.registrationFees || ''}
                onChange={(e) => setFeeFormData(prev => ({ 
                  ...prev, 
                  registrationFees: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherFees">Other Fees (KES)</Label>
              <Input
                id="otherFees"
                type="number"
                value={feeFormData.otherFees || ''}
                onChange={(e) => setFeeFormData(prev => ({ 
                  ...prev, 
                  otherFees: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 200"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Fee:</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(calculateTotalFee(feeFormData))}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCreateFeeStructure}>
            <Plus className="h-4 w-4 mr-2" />
            Create Fee Structure
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedCourse(null);
              setFeeFormData({});
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Structure Management</h2>
          <p className="text-muted-foreground">Set up and manage course fee structures</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{coursesNeedingFees.length}</div>
            <div className="text-sm text-muted-foreground">Need Fees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{coursesWithFees.length}</div>
            <div className="text-sm text-muted-foreground">Have Fees</div>
          </div>
        </div>
      </div>

      {/* Fee Structure Creation Form */}
      {selectedCourse && <FeeStructureForm />}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Courses Needing Fee Structures
            {coursesNeedingFees.length > 0 && (
              <Badge variant="secondary">{coursesNeedingFees.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Courses with Fee Structures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Courses Requiring Fee Structure Setup
              </CardTitle>
              <CardDescription>
                These approved courses need fee structures before they can be activated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesNeedingFees.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No courses requiring fee structures
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All approved courses have fee structures assigned.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Details</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Lecturers</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coursesNeedingFees.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{course.name}</div>
                              <div className="text-sm text-muted-foreground">{course.code}</div>
                            </div>
                          </TableCell>
                          <TableCell>{course.department}</TableCell>
                          <TableCell>{course.duration} years</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {course.lecturerIds.length} assigned
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCourse(course);
                                initializeFeeForm(course);
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Set Fees
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Courses with Fee Structures
              </CardTitle>
              <CardDescription>
                Active courses with established fee structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesWithFees.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No courses with fee structures yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fee structures will appear here once created.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Details</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Fee</TableHead>
                        <TableHead>Payment Schedule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coursesWithFees.map((course) => {
                        const feeStructure = getFeeStructureByCourseId(course.id);
                        return (
                          <TableRow key={course.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{course.name}</div>
                                <div className="text-sm text-muted-foreground">{course.code}</div>
                              </div>
                            </TableCell>
                            <TableCell>{course.department}</TableCell>
                            <TableCell>
                              <span className="font-medium text-green-600">
                                {feeStructure ? formatCurrency(feeStructure.totalFees) : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {feeStructure?.paymentSchedule?.length || 0} payments
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">
                                {course.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
