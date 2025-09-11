import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { StudentService, CreateStudentData } from '@/services/StudentService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { DepartmentService } from '@/services/DepartmentService';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { useStudents } from '@/contexts/students/StudentsContext';

const AddStudentForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { courses } = useCoursesContext();
  const { refreshStudents } = useStudents();
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    guardianPhone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    institutionBranch: 'Main Campus',
    department: '',
    course: '',
    level: '',
    semester: '',
    academicYear: new Date().getFullYear().toString()
  });

  // Load departments on component mount
  React.useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await DepartmentService.getDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };
    loadDepartments();
  }, []);

  const handleInputChange = useCallback((field: keyof CreateStudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const filteredCourses = courses.filter(course => 
    formData.department ? course.department === formData.department : true
  );

  const validateForm = (): boolean => {
    const required = ['firstName', 'lastName', 'email', 'department', 'course', 'level'];
    
    for (const field of required) {
      if (!formData[field as keyof CreateStudentData]) {
        toast({
          title: "Missing Information",
          description: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCreateStudent = async () => {
    if (!validateForm() || !user?.id) return;
    
    setIsLoading(true);

    try {
      const student = await StudentService.createStudent(formData, user.id);
      
      toast({
        title: 'Student Created Successfully',
        description: `${student.firstName} ${student.lastName} has been enrolled with admission number: ${student.admissionNumber}`,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationalId: '',
        guardianPhone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        institutionBranch: 'Main Campus',
        department: '',
        course: '',
        level: '',
        semester: '',
        academicYear: new Date().getFullYear().toString()
      });

      // Refresh students list
      await refreshStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: 'Error Creating Student',
        description: error instanceof Error ? error.message : 'Failed to create student. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
        <CardDescription>
          Create a new student record in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  placeholder="Enter national ID number"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => {
                  handleInputChange('department', value);
                  handleInputChange('course', ''); // Reset course when department changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)} disabled={!formData.department}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.department ? "Select course" : "Select department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.map(course => (
                      <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="higher_diploma">Higher Diploma</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Current Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact & Emergency Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter physical address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Guardian Phone</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                  placeholder="Enter guardian phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleCreateStudent}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Creating Student...' : 'Create Student'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddStudentForm;