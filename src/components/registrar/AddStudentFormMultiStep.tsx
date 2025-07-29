import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createStudent, CreateStudentData } from '@/integrations/firebase/users';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { UserPlus, Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

// Use the same departments as in course creation for consistency
const departments = [
  'Computer Science',
  'Engineering',
  'Business Studies',
  'Health Sciences',
  'Agriculture',
  'Hospitality',
  'Automotive',
  'Construction',
  'Fashion & Design',
  'Electrical'
];

export const AddStudentForm: React.FC = () => {
  const { toast } = useToast();
  const { courses, loading: coursesLoading } = useCoursesContext();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  
  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'male',
    course: '',
    department: '',
    level: 'certificate',
    year: 1,
    semester: 1,
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    guardianName: '',
    guardianPhone: '',
    address: '',
    nationalId: '',
  });

  // Filter courses by department and level - include active, approved, and published courses
  const filteredCourses = courses.filter(course => {
    const departmentMatch = !selectedDepartment || course.department === selectedDepartment;
    // Convert level to lowercase for matching since Course type uses lowercase
    const selectedLevelLower = selectedLevel?.toLowerCase();
    const levelMatch = !selectedLevel || 
      course.level === selectedLevelLower || 
      (selectedLevelLower === 'certificate' && course.level === 'certificate') ||
      (selectedLevelLower === 'diploma' && (course.level === 'diploma' || course.level === 'higher_diploma')) ||
      (selectedLevelLower === 'degree' && course.level === 'degree');
    // Include courses that are active, approved, or published - also include draft for testing
    const statusMatch = ['active', 'approved', 'published', 'draft'].includes(course.status);
    
    console.log('Course filter debug:', {
      courseName: course.name,
      courseDepartment: course.department,
      courseLevel: course.level,
      courseStatus: course.status,
      selectedDepartment,
      selectedLevel: selectedLevelLower,
      departmentMatch,
      levelMatch,
      statusMatch,
      finalMatch: departmentMatch && levelMatch && statusMatch
    });
    
    return departmentMatch && levelMatch && statusMatch;
  });

  // Use predefined departments list for consistency with course creation
  const availableDepartments = departments;

  // Also get departments from existing courses to show which ones have courses
  const departmentsWithCourses = [...new Set(courses.map(course => course.department))].filter(Boolean);

  // Debug logging to see course data
  useEffect(() => {
    console.log('Courses loaded:', courses.length);
    console.log('Available departments:', availableDepartments);
    console.log('Departments with courses:', departmentsWithCourses);
    console.log('Filtered courses:', filteredCourses.length);
    if (courses.length > 0) {
      console.log('Sample course:', courses[0]);
    }

    // Show toast notification when courses are loaded
    if (!coursesLoading && courses.length === 0) {
      toast({
        title: "No Courses Found",
        description: "Please create some courses first before adding students.",
        variant: "destructive",
      });
    }
  }, [courses, availableDepartments, departmentsWithCourses, filteredCourses, coursesLoading, toast]);

  // Watch for course changes and reset selections if they become invalid
  useEffect(() => {
    // If selected department is no longer available in the predefined list, reset it
    if (selectedDepartment && !availableDepartments.includes(selectedDepartment)) {
      setSelectedDepartment('');
      setSelectedLevel('');
      setFormData(prev => ({
        ...prev,
        department: '',
        course: '',
        level: 'certificate'
      }));
    }

    // If selected course is no longer available, reset it
    if (formData.course && !filteredCourses.find(c => c.name === formData.course)) {
      setFormData(prev => ({
        ...prev,
        course: ''
      }));
    }
  }, [selectedDepartment, availableDepartments, formData.course, filteredCourses]);

  // Generate a random password
  const generatePassword = useCallback(() => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  }, []);

  // Generate password on component mount
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleInputChange = useCallback((field: keyof CreateStudentData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Create memoized handlers for each field to prevent focus loss
  const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('firstName', e.target.value);
  }, [handleInputChange]);

  const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('lastName', e.target.value);
  }, [handleInputChange]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('email', e.target.value);
  }, [handleInputChange]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('phoneNumber', e.target.value);
  }, [handleInputChange]);

  const handleDateOfBirthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('dateOfBirth', e.target.value);
  }, [handleInputChange]);

  const handleNationalIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('nationalId', e.target.value);
  }, [handleInputChange]);

  const handleAcademicYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('academicYear', e.target.value);
  }, [handleInputChange]);

  const handleGuardianNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('guardianName', e.target.value);
  }, [handleInputChange]);

  const handleGuardianPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('guardianPhone', e.target.value);
  }, [handleInputChange]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange('address', e.target.value);
  }, [handleInputChange]);

  const handleGenderChange = useCallback((value: string) => {
    handleInputChange('gender', value);
  }, [handleInputChange]);

  const handleCourseChange = useCallback((value: string) => {
    handleInputChange('course', value);
  }, [handleInputChange]);

  const handleYearChange = useCallback((value: string) => {
    handleInputChange('year', parseInt(value));
  }, [handleInputChange]);

  const handleSemesterChange = useCallback((value: string) => {
    handleInputChange('semester', parseInt(value));
  }, [handleInputChange]);

  const handleDepartmentChange = useCallback((department: string) => {
    setSelectedDepartment(department);
    setSelectedLevel('');
    setFormData(prev => ({
      ...prev,
      department,
      level: 'certificate',
      course: '',
    }));
  }, []);

  const handleLevelChange = useCallback((level: 'certificate' | 'diploma' | 'degree') => {
    setSelectedLevel(level);
    setFormData(prev => ({
      ...prev,
      level,
      course: '',
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phoneNumber);
      case 2:
        return !!(formData.department && formData.course && formData.level);
      case 3:
        return !!password;
      case 4:
        return true; // Guardian info is optional
      default:
        return false;
    }
  };

  const handleCreateStudent = async () => {
    if (currentStep !== 4) {
      return;
    }
    
    setIsLoading(true);

    try {
      if (!password) {
        throw new Error('Please set a password for the student');
      }

      const newStudent = await createStudent({
        ...formData,
        password: password
      });
      
      toast({
        title: 'Student Created Successfully',
        description: `${newStudent.firstName} ${newStudent.lastName} has been enrolled with admission number: ${newStudent.admissionNumber}. Password: ${password}`,
        duration: 10000,
      });

      // Reset form
      setCurrentStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: 'male',
        course: '',
        department: '',
        level: 'certificate',
        year: 1,
        semester: 1,
        academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
        guardianName: '',
        guardianPhone: '',
        address: '',
        nationalId: '',
      });
      setPassword('');
      setSelectedDepartment('');
      setSelectedLevel('');
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create student',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission unless explicitly triggered
    // This prevents accidental submission when pressing Enter
    return false;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleFirstNameChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleLastNameChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="student@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+254 XXX XXX XXX"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleDateOfBirthChange}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={handleGenderChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={handleNationalIdChange}
                    placeholder="ID Number"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                <div className="flex items-center gap-2">
                  {coursesLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading courses...
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Course Statistics */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Available Courses:</span> {courses.length} total
                  <span className="ml-4">
                    <span className="font-medium">Departments:</span> {availableDepartments.length} total, {departmentsWithCourses.length} with courses
                  </span>
                  {selectedDepartment && selectedLevel && (
                    <span className="ml-4">
                      <span className="font-medium">Filtered:</span> {filteredCourses.length} courses
                    </span>
                  )}
                </div>
                {departmentsWithCourses.length < availableDepartments.length && (
                  <div className="text-xs text-orange-600 mt-1">
                    Some departments don't have courses yet. Create courses for: {
                      availableDepartments
                        .filter(dept => !departmentsWithCourses.includes(dept))
                        .join(', ')
                    }
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((dept) => {
                        const hasCourses = departmentsWithCourses.includes(dept);
                        return (
                          <SelectItem key={dept} value={dept}>
                            {dept} {hasCourses ? '✓' : '(no courses)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    ✓ indicates departments with available courses
                  </p>
                </div>
                <div>
                  <Label htmlFor="level">Level of Study *</Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={handleLevelChange}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="degree">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.course}
                    onValueChange={handleCourseChange}
                    disabled={!selectedDepartment || !selectedLevel}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !selectedDepartment ? "Select department first" :
                          !selectedLevel ? "Select level first" :
                          filteredCourses.length === 0 ? "No courses available for selected filters" :
                          "Select course"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourses.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          {!selectedDepartment || !selectedLevel 
                            ? "Select department and level first"
                            : "No courses available for selected department and level"
                          }
                        </div>
                      ) : (
                        filteredCourses.map((course) => (
                          <SelectItem key={course.id} value={course.name}>
                            {course.name} ({course.code}) - {course.status}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Year of Study</Label>
                  <Select value={formData.year.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={formData.semester.toString()} onValueChange={handleSemesterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={handleAcademicYearChange}
                    placeholder="2025/2026"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Student Login Credentials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentPassword">Student Password *</Label>
                  <div className="relative">
                    <Input
                      id="studentPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password for student"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                  >
                    Generate Random Password
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This password will be used by the student to log into their account. 
                  Make sure to provide it to them securely.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Guardian Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardianName}
                    onChange={handleGuardianNameChange}
                    placeholder="Guardian's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input
                    id="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleGuardianPhoneChange}
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="Student's home address"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New Student
        </CardTitle>
        <CardDescription>
          Step {currentStep} of 4: Fill in the student's information to generate an admission number and create their account.
        </CardDescription>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Step {currentStep} of 4
              </span>
            </div>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleCreateStudent}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? 'Creating Student...' : 'Create Student'}
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddStudentForm;
