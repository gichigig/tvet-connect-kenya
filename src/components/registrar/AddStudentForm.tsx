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
import { UserPlus, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

const departments = [
  'Computer Science',
  'Information Technology',
  'Engineering',
  'Business Studies',
  'Hospitality',
  'Agriculture',
  'Health Sciences',
  'Education',
];

const courses = {
  'Computer Science': {
    'Certificate': [
      'Certificate in Computer Applications',
      'Certificate in IT Support',
      'Certificate in Web Development',
    ],
    'Diploma': [
      'Diploma in Computer Science',
      'Diploma in Software Engineering',
      'Diploma in Information Systems',
    ],
    'Degree': [
      'Bachelor of Computer Science',
      'Bachelor of Information Technology',
      'Bachelor of Software Engineering',
    ],
  },
  'Information Technology': {
    'Certificate': [
      'Certificate in IT Support',
      'Certificate in Network Administration',
      'Certificate in Cybersecurity',
    ],
    'Diploma': [
      'Diploma in Information Technology',
      'Diploma in Network Administration',
      'Diploma in Database Management',
    ],
    'Degree': [
      'Bachelor of Information Technology',
      'Bachelor of Network Engineering',
      'Bachelor of Cybersecurity',
    ],
  },
  'Engineering': {
    'Certificate': [
      'Certificate in Mechanical Engineering',
      'Certificate in Electrical Installation',
      'Certificate in Civil Engineering',
    ],
    'Diploma': [
      'Diploma in Civil Engineering',
      'Diploma in Mechanical Engineering',
      'Diploma in Electrical Engineering',
    ],
    'Degree': [
      'Bachelor of Civil Engineering',
      'Bachelor of Mechanical Engineering',
      'Bachelor of Electrical Engineering',
    ],
  },
  'Business Studies': {
    'Certificate': [
      'Certificate in Entrepreneurship',
      'Certificate in Business Management',
      'Certificate in Marketing',
    ],
    'Diploma': [
      'Diploma in Business Management',
      'Diploma in Accounting',
      'Diploma in Marketing',
    ],
    'Degree': [
      'Bachelor of Business Administration',
      'Bachelor of Commerce',
      'Bachelor of Economics',
    ],
  },
  'Hospitality': {
    'Certificate': [
      'Certificate in Food & Beverage',
      'Certificate in Housekeeping',
      'Certificate in Front Office Operations',
    ],
    'Diploma': [
      'Diploma in Hotel Management',
      'Diploma in Tourism Management',
      'Diploma in Culinary Arts',
    ],
    'Degree': [
      'Bachelor of Hotel Management',
      'Bachelor of Tourism Management',
      'Bachelor of Culinary Arts',
    ],
  },
  'Agriculture': {
    'Certificate': [
      'Certificate in Crop Production',
      'Certificate in Animal Husbandry',
      'Certificate in Agricultural Extension',
    ],
    'Diploma': [
      'Diploma in Agriculture',
      'Diploma in Animal Health',
      'Diploma in Horticulture',
    ],
    'Degree': [
      'Bachelor of Agriculture',
      'Bachelor of Veterinary Science',
      'Bachelor of Agricultural Economics',
    ],
  },
  'Health Sciences': {
    'Certificate': [
      'Certificate in Community Health',
      'Certificate in Pharmacy Technology',
      'Certificate in Laboratory Technology',
    ],
    'Diploma': [
      'Diploma in Nursing',
      'Diploma in Medical Laboratory',
      'Diploma in Public Health',
    ],
    'Degree': [
      'Bachelor of Nursing',
      'Bachelor of Medical Laboratory Science',
      'Bachelor of Public Health',
    ],
  },
  'Education': {
    'Certificate': [
      'Certificate in Primary Education',
      'Certificate in Special Needs Education',
      'Certificate in ECDE',
    ],
    'Diploma': [
      'Diploma in Early Childhood Education',
      'Diploma in Secondary Education',
      'Diploma in Special Needs Education',
    ],
    'Degree': [
      'Bachelor of Education (Primary)',
      'Bachelor of Education (Secondary)',
      'Bachelor of Special Needs Education',
    ],
  },
};

export const AddStudentForm: React.FC = () => {
  const { toast } = useToast();
  const { courses } = useCoursesContext();
  const [isLoading, setIsLoading] = useState(false);
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

  // Filter courses by department and level
  const filteredCourses = courses.filter(course => {
    const departmentMatch = !selectedDepartment || course.department === selectedDepartment;
    const levelMatch = !selectedLevel || course.level === selectedLevel;
    return departmentMatch && levelMatch && course.status === 'active';
  });

  // Get unique departments from courses
  const availableDepartments = [...new Set(courses.map(course => course.department))];

  // Generate a random password
  const generatePassword = useCallback(() => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
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
      course: '', // Reset course when department changes
    }));
  }, []);

  const handleLevelChange = useCallback((level: 'certificate' | 'diploma' | 'degree') => {
    setSelectedLevel(level);
    setFormData(prev => ({
      ...prev,
      level,
      course: '', // Reset course when level changes
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phoneNumber || !formData.course || !formData.department) {
        throw new Error('Please fill in all required fields');
      }

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
        duration: 10000, // Show for 10 seconds so password can be noted
      });

      // Reset form
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
      setSelectedDepartment('');
      setSelectedLevel('');
      generatePassword(); // Generate new password for next student
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create student',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
          Fill in the student's information to generate an admission number and create their account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
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
              <Select
                value={formData.gender}
                onValueChange={handleGenderChange}
              >
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

          {/* Student Login Credentials */}
          <div className="border-t pt-6">
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
          </div>

          {/* Academic Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.map((course) => (
                      <SelectItem key={course.id} value={course.name}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Year of Study</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={handleYearChange}
                >
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
                <Select
                  value={formData.semester.toString()}
                  onValueChange={handleSemesterChange}
                >
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

          {/* Guardian Information */}
          <div className="border-t pt-6">
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Student...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddStudentForm;
