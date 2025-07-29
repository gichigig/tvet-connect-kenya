import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, DollarSign, Calendar, BookOpen, Plus } from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { useToast } from '@/hooks/use-toast';

interface FeeStructure {
  id: string;
  courseId: string;
  courseName: string;
  academicYear: string;
  semester: number;
  totalFees: number;
  breakdown: {
    tuitionFees: number;
    examFees: number;
    labFees: number;
    libraryFees: number;
    registrationFees: number;
    otherFees: number;
  };
  isActive: boolean;
  createdAt: string;
}

export const CourseFeesManagement = () => {
  const { courses, getFeeStructureByCourseId, createFeeStructure, updateFeeStructure } = useCoursesContext();
  const { toast } = useToast();
  
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [feeForm, setFeeForm] = useState({
    academicYear: new Date().getFullYear().toString(),
    semester: 1,
    tuitionFees: 0,
    examFees: 1000,
    labFees: 500,
    libraryFees: 500,
    registrationFees: 300,
    otherFees: 200
  });

  const activeCourses = courses.filter(course => course.status === 'active');

  const handleCreateFeeStructure = async () => {
    if (!selectedCourse || !feeForm.tuitionFees) {
      toast({
        title: "Error",
        description: "Please select a course and fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalFees = (Object.values(feeForm).reduce<number>((sum, val) => 
        typeof val === 'number' ? sum + val : sum, 0
      )) - feeForm.semester; // Exclude semester from sum

      const feeStructure = {
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        academicYear: feeForm.academicYear,
        semester: feeForm.semester,
        totalFees,
        breakdown: {
          tuitionFees: feeForm.tuitionFees,
          examFees: feeForm.examFees,
          labFees: feeForm.labFees,
          libraryFees: feeForm.libraryFees,
          registrationFees: feeForm.registrationFees,
          otherFees: feeForm.otherFees
        },
        paymentSchedule: [],
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await createFeeStructure(feeStructure);
      
      toast({
        title: "Fee Structure Created",
        description: `Fee structure for ${selectedCourse.name} (${feeForm.academicYear} Semester ${feeForm.semester}) has been created.`
      });

      setIsCreateDialogOpen(false);
      setSelectedCourse(null);
      setFeeForm({
        academicYear: new Date().getFullYear().toString(),
        semester: 1,
        tuitionFees: 0,
        examFees: 1000,
        labFees: 500,
        libraryFees: 500,
        registrationFees: 300,
        otherFees: 200
      });
    } catch (error) {
      console.error('Error creating fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to create fee structure. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditFeeStructure = async () => {
    if (!editingFee) return;

    try {
      const totalFees = Object.values(feeForm).reduce<number>((sum, val) => 
        typeof val === 'number' ? sum + val : sum, 0
      ) - feeForm.semester; // Exclude semester from sum

      const updates = {
        academicYear: feeForm.academicYear,
        semester: feeForm.semester,
        totalFees,
        breakdown: {
          tuitionFees: feeForm.tuitionFees,
          examFees: feeForm.examFees,
          labFees: feeForm.labFees,
          libraryFees: feeForm.libraryFees,
          registrationFees: feeForm.registrationFees,
          otherFees: feeForm.otherFees
        }
      };

      await updateFeeStructure(editingFee.id, updates);
      
      toast({
        title: "Fee Structure Updated",
        description: `Fee structure for ${editingFee.courseName} has been updated.`
      });

      setIsEditDialogOpen(false);
      setEditingFee(null);
    } catch (error) {
      console.error('Error updating fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to update fee structure. Please try again.",
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

  const openEditDialog = (feeStructure: FeeStructure) => {
    setEditingFee(feeStructure);
    setFeeForm({
      academicYear: feeStructure.academicYear,
      semester: feeStructure.semester,
      tuitionFees: feeStructure.breakdown.tuitionFees,
      examFees: feeStructure.breakdown.examFees,
      labFees: feeStructure.breakdown.labFees,
      libraryFees: feeStructure.breakdown.libraryFees,
      registrationFees: feeStructure.breakdown.registrationFees,
      otherFees: feeStructure.breakdown.otherFees
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Fees Management</h2>
          <p className="text-muted-foreground">View and manage course fees by semester and year</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Fee Structure</DialogTitle>
              <DialogDescription>
                Set up fees for a specific course, year, and semester
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select onValueChange={(value) => {
                  const course = activeCourses.find(c => c.id === value);
                  setSelectedCourse(course);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select value={feeForm.academicYear} onValueChange={(value) => 
                    setFeeForm(prev => ({ ...prev, academicYear: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={feeForm.semester.toString()} onValueChange={(value) => 
                    setFeeForm(prev => ({ ...prev, semester: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fee Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tuition Fees (KES) *</Label>
                    <Input
                      type="number"
                      value={feeForm.tuitionFees}
                      onChange={(e) => setFeeForm(prev => ({ 
                        ...prev, 
                        tuitionFees: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Examination Fees (KES)</Label>
                    <Input
                      type="number"
                      value={feeForm.examFees}
                      onChange={(e) => setFeeForm(prev => ({ 
                        ...prev, 
                        examFees: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Laboratory Fees (KES)</Label>
                    <Input
                      type="number"
                      value={feeForm.labFees}
                      onChange={(e) => setFeeForm(prev => ({ 
                        ...prev, 
                        labFees: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Library Fees (KES)</Label>
                    <Input
                      type="number"
                      value={feeForm.libraryFees}
                      onChange={(e) => setFeeForm(prev => ({ 
                        ...prev, 
                        libraryFees: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Fees (KES)</Label>
                    <Input
                      type="number"
                      value={feeForm.registrationFees}
                      onChange={(e) => setFeeForm(prev => ({ 
                        ...prev, 
                        registrationFees: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Other Fees (KES)</Label>
                    <Input
                      type="number"
                      value={feeForm.otherFees}
                      onChange={(e) => setFeeForm(prev => ({ 
                        ...prev, 
                        otherFees: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="e.g., 200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeeStructure}>
                  Create Fee Structure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses with Fee Structures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCourses.map(course => {
          const feeStructures = []; // This would come from your context/API
          
          return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {course.name}
                    </CardTitle>
                    <CardDescription>{course.code} • {course.department}</CardDescription>
                  </div>
                  <Badge variant={course.isActive ? "default" : "secondary"}>
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{course.duration} Year{course.duration > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="font-medium">Students:</span>
                    <p>{course.studentsEnrolled}</p>
                  </div>
                </div>

                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Current Fees</TabsTrigger>
                    <TabsTrigger value="history">Fee History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current" className="space-y-2">
                    {feeStructures.filter((fs: any) => fs.isActive).length > 0 ? (
                      feeStructures.filter((fs: any) => fs.isActive).map((feeStructure: any) => (
                        <div key={feeStructure.id} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{feeStructure.academicYear} - Sem {feeStructure.semester}</div>
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(feeStructure.totalFees)}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(feeStructure)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No fee structure set</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-2">
                    {feeStructures.filter((fs: any) => !fs.isActive).length > 0 ? (
                      feeStructures.filter((fs: any) => !fs.isActive).map((feeStructure: any) => (
                        <div key={feeStructure.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{feeStructure.academicYear} - Sem {feeStructure.semester}</div>
                              <div className="text-sm text-gray-600">
                                {formatCurrency(feeStructure.totalFees)}
                              </div>
                            </div>
                            <Badge variant="secondary">Archived</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No fee history</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Fee Structure Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Fee Structure</DialogTitle>
            <DialogDescription>
              Update fee structure for {editingFee?.courseName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={feeForm.academicYear} onValueChange={(value) => 
                  setFeeForm(prev => ({ ...prev, academicYear: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={feeForm.semester.toString()} onValueChange={(value) => 
                  setFeeForm(prev => ({ ...prev, semester: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fee Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tuition Fees (KES) *</Label>
                  <Input
                    type="number"
                    value={feeForm.tuitionFees}
                    onChange={(e) => setFeeForm(prev => ({ 
                      ...prev, 
                      tuitionFees: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Examination Fees (KES)</Label>
                  <Input
                    type="number"
                    value={feeForm.examFees}
                    onChange={(e) => setFeeForm(prev => ({ 
                      ...prev, 
                      examFees: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Laboratory Fees (KES)</Label>
                  <Input
                    type="number"
                    value={feeForm.labFees}
                    onChange={(e) => setFeeForm(prev => ({ 
                      ...prev, 
                      labFees: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Library Fees (KES)</Label>
                  <Input
                    type="number"
                    value={feeForm.libraryFees}
                    onChange={(e) => setFeeForm(prev => ({ 
                      ...prev, 
                      libraryFees: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Fees (KES)</Label>
                  <Input
                    type="number"
                    value={feeForm.registrationFees}
                    onChange={(e) => setFeeForm(prev => ({ 
                      ...prev, 
                      registrationFees: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Other Fees (KES)</Label>
                  <Input
                    type="number"
                    value={feeForm.otherFees}
                    onChange={(e) => setFeeForm(prev => ({ 
                      ...prev, 
                      otherFees: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditFeeStructure}>
                Update Fee Structure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
