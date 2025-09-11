import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EnhancedStudentCreation, EnhancedCreateStudentData } from '@/services/EnhancedStudentCreation';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { DepartmentService, Department } from '@/services/DepartmentService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { UserPlus, Eye, EyeOff, ChevronLeft, ChevronRight, RefreshCw, Database, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const EnhancedAddStudentForm: React.FC = () => {
  const { toast } = useToast();
  const { courses, loading: coursesLoading } = useCoursesContext();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [creationResult, setCreationResult] = useState(null);
  const [creationProgress, setCreationProgress] = useState(0);
  
  // Database-driven state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Load departments from database
  const loadDepartments = async () => {
    if (!user?.id) return;
    
    setLoadingDepartments(true);
    try {
      const data = await DepartmentService.getDepartmentsByCreator(user.id);
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load departments',
        variant: 'destructive',
      });
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadDepartments();
    }
  }, [user?.id]);
  
  const [formData, setFormData] = useState<EnhancedCreateStudentData>({
    firstName: '',
    lastName: '',
    username: '',
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
    enrollmentType: 'fulltime',
    institutionBranch: 'Main Campus',
    guardianName: '',
    guardianPhone: '',
    address: '',
    nationalId: '',
    password: ''
  });

  const totalSteps = 4;

  // Auto-generate username from first name and last name
  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const username = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
      setFormData(prev => ({ ...prev, username }));
    }
  }, [formData.firstName, formData.lastName]);

  // Auto-generate password if not set
  useEffect(() => {
    if (!password && formData.firstName && formData.lastName) {
      const generatedPassword = `${formData.firstName}${Math.floor(Math.random() * 1000)}`;
      setPassword(generatedPassword);
      setFormData(prev => ({ ...prev, password: generatedPassword }));
    }
  }, [formData.firstName, formData.lastName, password]);

  // Filter courses based on department and level
  const filteredCourses = courses.filter(course => {
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesDepartment && matchesLevel;
  });

  // Check for missing courses
  const showCoursesAlert = filteredCourses.length === 0 && !coursesLoading;

  const handleInputChange = useCallback((field: keyof EnhancedCreateStudentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear course if department changes
    if ((field as string) === 'department' || (field as string) === 'level') {
      setFormData(prev => ({ ...prev, course: '' }));
    }
  }, []);

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    handleInputChange('department', department);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    handleInputChange('level', level);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phoneNumber);
      case 2:
        return !!(formData.dateOfBirth && formData.gender && formData.nationalId);
      case 3:
        return !!(formData.course && formData.department && formData.level);
      case 4:
        return !!(formData.username && password);
      default:
        return true;
    }
  };

  const handleCreateStudent = async () => {
    if (!validateStep(4)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setCreationProgress(10);

    try {
      console.log('Ã°Å¸Å½â€œ Creating enhanced student with both Firebase and Supabase integration...');

      // Include password in form data and convert dateOfBirth to Date
      const studentDataWithPassword = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        password: password
      };

      setCreationProgress(30);

      // Create student using enhanced service
      const result = await EnhancedStudentCreation.createStudent(studentDataWithPassword);

      setCreationProgress(80);
      setCreationResult(result);

      if (result.success) {
        setCreationProgress(100);
        
        // Reset form for next student
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
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
          enrollmentType: 'fulltime',
          institutionBranch: 'Main Campus',
          guardianName: '',
          guardianPhone: '',
          address: '',
          nationalId: '',
          password: ''
        });
        
        setPassword('');
        setCurrentStep(1);
        setSelectedDepartment('');
        setSelectedLevel('');

      } else {
        toast({
          title: 'Creation Failed',
          description: result.errors?.join(', ') || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Error Creating Student',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setCreationProgress(0), 2000);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setFormData(prev => ({ ...prev, password: result }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="student@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="0712345678"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)} value={formData.gender}>
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
              <div>
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  placeholder="12345678"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Student address"
                />
              </div>
              <div>
                <Label htmlFor="guardianName">Guardian Name</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  placeholder="Guardian's full name"
                />
              </div>
              <div>
                <Label htmlFor="guardianPhone">Guardian Phone</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                  placeholder="Guardian's phone number"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Information</h3>
            
            {showCoursesAlert && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800">
                      No courses found for the selected department and level. Please create some courses first.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select onValueChange={handleDepartmentChange} value={selectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDepartments ? (
                      <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                    ) : departments.length === 0 ? (
                      <SelectItem value="no-departments" disabled>No departments found</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level *</Label>
                <Select onValueChange={handleLevelChange} value={selectedLevel}>
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
                  onValueChange={(value) => handleInputChange('course', value)} 
                  value={formData.course}
                  disabled={filteredCourses.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.map((course) => (
                      <SelectItem key={course.id} value={course.name}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="enrollmentType">Enrollment Type</Label>
                <Select onValueChange={(value) => handleInputChange('enrollmentType', value)} value={formData.enrollmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select enrollment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">Full Time</SelectItem>
                    <SelectItem value="parttime">Part Time</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select onValueChange={(value) => handleInputChange('year', parseInt(value))} value={formData.year.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
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
                <Select onValueChange={(value) => handleInputChange('semester', parseInt(value))} value={formData.semester.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Setup</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Enhanced Account Creation</span>
              </div>
              <p className="text-blue-700 text-sm">
                This student will be created in both Firebase (current system) and Supabase (new system) 
                for seamless access during the migration period.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Auto-generated username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      handleInputChange('password', e.target.value);
                    }}
                    placeholder="Student password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={generateRandomPassword}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Generate Password
                </Button>
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  placeholder="2024/2025"
                />
              </div>

              <div>
                <Label htmlFor="institutionBranch">Institution Branch</Label>
                <Input
                  id="institutionBranch"
                  value={formData.institutionBranch}
                  onChange={(e) => handleInputChange('institutionBranch', e.target.value)}
                  placeholder="Main Campus"
                />
              </div>
            </div>

            {/* Creation Progress */}
            {isLoading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Creating student account...</span>
                  <span>{creationProgress}%</span>
                </div>
                <Progress value={creationProgress} className="w-full" />
              </div>
            )}

            {/* Creation Result */}
            {creationResult && (
              <Card className={`mt-4 ${creationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {creationResult.success ? (
                      <>
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">Student Created Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-red-800">Creation Failed</span>
                      </>
                    )}
                  </div>
                  
                  {creationResult.success && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Admission Number:</span> 
                        <Badge variant="outline" className="ml-2">{creationResult.admissionNumber}</Badge>
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1">
                          <Badge variant={creationResult.firebaseCreated ? 'default' : 'secondary'}>
                            Firebase: {creationResult.firebaseCreated ? 'Ã¢Å“â€¦' : 'Ã¢ÂÅ’'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant={creationResult.supabaseCreated ? 'default' : 'secondary'}>
                            Supabase: {creationResult.supabaseCreated ? 'Ã¢Å“â€¦' : 'Ã¢Å¡Â Ã¯Â¸Â'}
                          </Badge>
                        </div>
                      </div>
                      {creationResult.warnings && creationResult.warnings.length > 0 && (
                        <div className="text-yellow-700">
                          <span className="font-medium">Warnings:</span>
                          <ul className="list-disc list-inside ml-2">
                            {creationResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {!creationResult.success && creationResult.errors && (
                    <div className="text-red-700 text-sm">
                      {creationResult.errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6" />
            <div>
              <CardTitle>Enhanced Student Registration</CardTitle>
              <CardDescription>
                Create student account in both Firebase and Supabase systems
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Step Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index + 1 <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreateStudent}
              disabled={isLoading || !validateStep(currentStep)}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Student...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Student
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAddStudentForm;
