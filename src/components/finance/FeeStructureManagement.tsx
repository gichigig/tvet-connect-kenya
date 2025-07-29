import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Eye, 
  CheckCircle,
  Calculator,
  FileText,
  Save,
  X,
  List,
  Grid
} from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course, FeeStructure } from '@/types/course';
import { useToast } from '@/hooks/use-toast';
import { CourseFeesContainer } from './CourseFeesContainer';

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
  const [viewingFeeStructure, setViewingFeeStructure] = useState<FeeStructure | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'containers'>('containers');
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

  // Get all courses that need fee structures (all courses without fee structures)
  const allCourses = courses.filter(course => {
    // Filter out courses with invalid data
    return course && course.id && course.name;
  });
  
  const coursesNeedingFees = allCourses.filter(course => !getFeeStructureByCourseId(course.id));
  const coursesWithFees = allCourses.filter(course => getFeeStructureByCourseId(course.id));

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

  const initializeEditForm = (feeStructure: FeeStructure) => {
    setEditingFeeStructure(feeStructure);
    setFeeFormData({
      courseId: feeStructure.courseId,
      courseName: feeStructure.courseName,
      academicYear: feeStructure.academicYear,
      tuitionFees: feeStructure.breakdown.tuitionFees,
      examFees: feeStructure.breakdown.examFees,
      labFees: feeStructure.breakdown.labFees,
      libraryFees: feeStructure.breakdown.libraryFees,
      registrationFees: feeStructure.breakdown.registrationFees,
      otherFees: feeStructure.breakdown.otherFees
    });
  };

  const handleUpdateFeeStructure = async () => {
    if (!editingFeeStructure || !feeFormData.tuitionFees) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalFee = calculateTotalFee(feeFormData);
      
      const updates: Partial<FeeStructure> = {
        academicYear: feeFormData.academicYear || editingFeeStructure.academicYear,
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
            dueDate: new Date(new Date().getFullYear(), 2, 15).toISOString()
          },
          {
            semester: 2,
            amount: totalFee / 2,
            dueDate: new Date(new Date().getFullYear(), 8, 15).toISOString()
          }
        ]
      };

      await updateFeeStructure(editingFeeStructure.id, updates);

      toast({
        title: "Fee Structure Updated",
        description: `Fee structure for ${editingFeeStructure.courseName} has been updated successfully.`
      });

      setEditingFeeStructure(null);
      setFeeFormData({});
    } catch (error) {
      console.error('Error updating fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to update fee structure. Please try again.",
        variant: "destructive"
      });
    }
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

      toast({
        title: "Fee Structure Created",
        description: `Fee structure for ${selectedCourse.name} has been created successfully.`
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

  const ViewFeeStructureModal = ({ feeStructure }: { feeStructure: FeeStructure }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Fee Structure Details - {feeStructure.courseName}</DialogTitle>
        <DialogDescription>
          View complete fee breakdown and payment schedule
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Academic Year</Label>
            <p className="text-sm text-muted-foreground">{feeStructure.academicYear}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Total Fees</Label>
            <p className="text-lg font-bold text-green-600">{formatCurrency(feeStructure.totalFees)}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fee Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tuition Fees</Label>
              <p className="font-medium">{formatCurrency(feeStructure.breakdown.tuitionFees)}</p>
            </div>
            <div className="space-y-2">
              <Label>Examination Fees</Label>
              <p className="font-medium">{formatCurrency(feeStructure.breakdown.examFees)}</p>
            </div>
            <div className="space-y-2">
              <Label>Laboratory Fees</Label>
              <p className="font-medium">{formatCurrency(feeStructure.breakdown.labFees)}</p>
            </div>
            <div className="space-y-2">
              <Label>Library Fees</Label>
              <p className="font-medium">{formatCurrency(feeStructure.breakdown.libraryFees)}</p>
            </div>
            <div className="space-y-2">
              <Label>Registration Fees</Label>
              <p className="font-medium">{formatCurrency(feeStructure.breakdown.registrationFees)}</p>
            </div>
            <div className="space-y-2">
              <Label>Other Fees</Label>
              <p className="font-medium">{formatCurrency(feeStructure.breakdown.otherFees)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Schedule</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructure.paymentSchedule.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>Semester {payment.semester}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  const EditFeeStructureForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Edit Fee Structure - {editingFeeStructure?.courseName}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setEditingFeeStructure(null);
              setFeeFormData({});
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Update the fee structure for {editingFeeStructure?.courseName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editAcademicYear">Academic Year</Label>
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
              <Label htmlFor="editTuitionFees">Tuition Fees (KES) *</Label>
              <Input
                id="editTuitionFees"
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
              <Label htmlFor="editExamFees">Examination Fees (KES)</Label>
              <Input
                id="editExamFees"
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
              <Label htmlFor="editLabFees">Laboratory Fees (KES)</Label>
              <Input
                id="editLabFees"
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
              <Label htmlFor="editLibraryFees">Library Fees (KES)</Label>
              <Input
                id="editLibraryFees"
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
              <Label htmlFor="editRegistrationFees">Registration Fees (KES)</Label>
              <Input
                id="editRegistrationFees"
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
              <Label htmlFor="editOtherFees">Other Fees (KES)</Label>
              <Input
                id="editOtherFees"
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
          <Button onClick={handleUpdateFeeStructure}>
            <Save className="h-4 w-4 mr-2" />
            Update Fee Structure
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setEditingFeeStructure(null);
              setFeeFormData({});
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          <p className="text-muted-foreground">Set up and manage fee structures for all courses</p>
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

      {/* Fee Structure Editing Form */}
      {editingFeeStructure && <EditFeeStructureForm />}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Courses Without Fees
            {coursesNeedingFees.length > 0 && (
              <Badge variant="secondary">{coursesNeedingFees.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Courses With Fees
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
                These courses need fee structures to be assigned
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
                    All courses have fee structures assigned.
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Courses with Fee Structures
                  </CardTitle>
                  <CardDescription>
                    All courses with established fee structures
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'containers' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('containers')}
                    className="flex items-center gap-2"
                  >
                    <Grid className="w-4 h-4" />
                    Cards
                  </Button>
                </div>
              </div>
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
              ) : viewMode === 'containers' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesWithFees.map((course) => {
                    const feeStructure = getFeeStructureByCourseId(course.id);
                    return (
                      <CourseFeesContainer
                        key={course.id}
                        course={course}
                        feeStructure={feeStructure}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Details</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Fee</TableHead>
                        <TableHead>Academic Year</TableHead>
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
                              {feeStructure && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Tuition: {formatCurrency(feeStructure.breakdown.tuitionFees)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {feeStructure?.academicYear || 'N/A'}
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
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setViewingFeeStructure(feeStructure)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  {viewingFeeStructure && feeStructure?.id === viewingFeeStructure.id && (
                                    <ViewFeeStructureModal feeStructure={viewingFeeStructure} />
                                  )}
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (feeStructure) {
                                      initializeEditForm(feeStructure);
                                    }
                                  }}
                                >
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
