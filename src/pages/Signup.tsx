
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const KENYA_DEPARTMENTS = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Automotive Engineering",
  "Welding and Fabrication",
  "Plumbing and Pipe Fitting",
  "Building and Construction",
  "Carpentry and Joinery",
  "Masonry",
  "Information Communication Technology (ICT)",
  "Computer Studies",
  "Business Studies",
  "Accountancy",
  "Human Resource Management",
  "Marketing",
  "Supply Chain Management",
  "Hospitality and Tourism",
  "Food and Beverage",
  "Catering",
  "Fashion Design and Garment Making",
  "Hairdressing and Beauty Therapy",
  "Agriculture",
  "Horticulture",
  "Animal Husbandry",
  "Cooperative Management",
  "Social Work and Community Development",
  "Early Childhood Development Education (ECDE)",
  "Art and Design",
  "Music",
  "Journalism and Mass Communication",
  "Office Administration",
  "Secretarial Studies",
  "Records Management"
];

const COURSES = [
  "Software Engineering",
  "Computer Science",
  "Information Technology",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Accounting",
  "Marketing",
  "Human Resource Management",
  "Hospitality Management",
  "Tourism Management",
  "Agriculture",
  "Automotive Engineering"
];

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    course: "",
    level: "" as 'diploma' | 'certificate' | '',
    intake: "" as 'january' | 'may' | 'september' | '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleDepartmentChange = (value: string) => {
    setFormData({
      ...formData,
      department: value,
    });
  };

  const handleCourseChange = (value: string) => {
    setFormData({
      ...formData,
      course: value,
    });
  };

  const handleLevelChange = (value: 'diploma' | 'certificate') => {
    setFormData({
      ...formData,
      level: value,
    });
  };

  const handleIntakeChange = (value: 'january' | 'may' | 'september') => {
    setFormData({
      ...formData,
      intake: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Role Required",
        description: "Please select your role.",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === 'student' && (!formData.course || !formData.level || !formData.intake)) {
      toast({
        title: "Student Information Required",
        description: "Please fill in course, level, and intake information.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert empty strings to undefined for optional fields
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department || undefined,
        course: formData.course || undefined,
        level: formData.level || undefined,
        intake: formData.intake || undefined,
      };

      await signup(signupData);
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted and is pending approval. You will be notified once approved.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requiresDepartment = ['lecturer', 'hod'].includes(formData.role);
  const isStudent = formData.role === 'student';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join TVET Kenya to start your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={handleRoleChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="hod">Head of Department (HOD)</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                  <SelectItem value="finance">Finance Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isStudent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select onValueChange={handleCourseChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COURSES.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select onValueChange={handleLevelChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intake">Intake</Label>
                  <Select onValueChange={handleIntakeChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intake" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="may">May</SelectItem>
                      <SelectItem value="september">September</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {requiresDepartment && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={handleDepartmentChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {KENYA_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> All accounts require approval. You will be notified once your application is reviewed.
                {isStudent && " Students will receive an admission number upon approval."}
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
