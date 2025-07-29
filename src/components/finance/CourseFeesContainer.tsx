import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, DollarSign, GraduationCap, Calendar, Users, BookOpen, Eye } from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course, FeeStructure } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

interface CourseFeesContainerProps {
  course: Course;
  feeStructure: FeeStructure | null;
}

export const CourseFeesContainer: React.FC<CourseFeesContainerProps> = ({ 
  course, 
  feeStructure 
}) => {
  const { updateFeeStructure } = useCoursesContext();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({
    academicYear: feeStructure?.academicYear || new Date().getFullYear().toString(),
    tuitionFees: feeStructure?.breakdown.tuitionFees || 0,
    examFees: feeStructure?.breakdown.examFees || 0,
    labFees: feeStructure?.breakdown.labFees || 0,
    libraryFees: feeStructure?.breakdown.libraryFees || 0,
    registrationFees: feeStructure?.breakdown.registrationFees || 0,
    otherFees: feeStructure?.breakdown.otherFees || 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handleEditFeeStructure = async () => {
    if (!feeStructure) return;

    try {
      const totalFees = Object.values(feeForm).reduce<number>((sum, val) => 
        typeof val === 'number' ? sum + val : sum, 0
      ) - (parseInt(feeForm.academicYear) || 0); // Exclude academic year from sum

      const updates = {
        academicYear: feeForm.academicYear,
        totalFees,
        breakdown: {
          tuitionFees: feeForm.tuitionFees,
          examFees: feeForm.examFees,
          labFees: feeForm.labFees,
          libraryFees: feeForm.libraryFees,
          registrationFees: feeForm.registrationFees,
          otherFees: feeForm.otherFees
        },
        paymentSchedule: [
          {
            semester: 1,
            amount: totalFees / 2,
            dueDate: new Date(new Date().getFullYear(), 2, 15).toISOString()
          },
          {
            semester: 2,
            amount: totalFees / 2,
            dueDate: new Date(new Date().getFullYear(), 8, 15).toISOString()
          }
        ]
      };

      await updateFeeStructure(feeStructure.id, updates);

      toast({
        title: "Fee Structure Updated",
        description: `Fee structure for ${course.name} has been updated successfully.`
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to update fee structure. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {course.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {course.code} • {course.department}
            </CardDescription>
          </div>
          <Badge variant={course.status === 'active' ? "default" : "secondary"}>
            {course.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{course.duration} Year{course.duration > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{course.studentsEnrolled || 0} Student{course.studentsEnrolled !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Fee Structure Info */}
        {feeStructure ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium">Total Fees</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(feeStructure.totalFees)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Academic Year:</span>
                <p className="font-medium">{feeStructure.academicYear}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Schedule:</span>
                <p className="font-medium">{feeStructure.paymentSchedule?.length || 0} installments</p>
              </div>
            </div>

            {/* Quick Fee Breakdown */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Fee Breakdown:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Tuition:</span>
                  <span className="font-medium">{formatCurrency(feeStructure.breakdown.tuitionFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exam:</span>
                  <span className="font-medium">{formatCurrency(feeStructure.breakdown.examFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lab:</span>
                  <span className="font-medium">{formatCurrency(feeStructure.breakdown.labFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span className="font-medium">{formatCurrency(feeStructure.breakdown.libraryFees + feeStructure.breakdown.registrationFees + feeStructure.breakdown.otherFees)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Fee Structure Details - {course.name}</DialogTitle>
                    <DialogDescription>
                      Complete fee breakdown and payment schedule for {course.code}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Course</Label>
                        <p className="text-sm text-muted-foreground">{course.name} ({course.code})</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Academic Year</Label>
                        <p className="text-sm text-muted-foreground">{feeStructure.academicYear}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Department</Label>
                        <p className="text-sm text-muted-foreground">{course.department}</p>
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

                    {feeStructure.paymentSchedule && feeStructure.paymentSchedule.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Payment Schedule</h3>
                        <div className="space-y-2">
                          {feeStructure.paymentSchedule.map((payment, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium">Semester {payment.semester}</div>
                                <div className="text-sm text-muted-foreground">
                                  Due: {new Date(payment.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="font-bold text-green-600">
                                {formatCurrency(payment.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Fees
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Fee Structure - {course.name}</DialogTitle>
                    <DialogDescription>
                      Update the fee structure for {course.code}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select 
                        value={feeForm.academicYear} 
                        onValueChange={(value) => setFeeForm(prev => ({ ...prev, academicYear: value }))}
                      >
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
          </div>
        ) : (
          <div className="text-center py-6">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Fee Structure
            </h3>
            <p className="text-sm text-muted-foreground">
              This course needs a fee structure to be assigned.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
