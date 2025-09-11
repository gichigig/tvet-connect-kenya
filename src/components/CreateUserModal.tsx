import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
=======
import { UserPlus, Eye, EyeOff } from 'lucide-react';
>>>>>>> 248ed50 (added tables)

interface CreateUserModalProps {
  triggerText?: string;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ triggerText = "Create New User" }) => {
<<<<<<< HEAD
  const { user, createUserWithBypass } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
=======
  const { createUser, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
>>>>>>> 248ed50 (added tables)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
<<<<<<< HEAD
    username: '',
    password: '',
    role: 'student' as const,
=======
    password: '',
    role: 'student' as 'student' | 'lecturer' | 'admin' | 'registrar' | 'finance' | 'hod',
>>>>>>> 248ed50 (added tables)
    course: '',
    department: '',
    phone: ''
  });

<<<<<<< HEAD
  // Load courses and departments
  useEffect(() => {
    const loadData = async () => {
      const [coursesResult, deptResult] = await Promise.all([
        supabase.from('courses').select('*'),
        supabase.from('departments').select('*')
      ]);
      
      if (coursesResult.data) setCourses(coursesResult.data);
      if (deptResult.data) setDepartments(deptResult.data);
    };
    
    if (open) {
      loadData();
    }
  }, [open]);

  // Role-based access control
  const canCreateRole = (role: string) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'registrar') return role === 'student';
    return false;
  };

  const showCourseAndDepartment = () => {
    return formData.role === 'student' || formData.role === 'lecturer';
  };
=======
  // Determine what roles the current user can create
  const getAvailableRoles = () => {
    if (currentUser?.role === 'admin') {
      return [
        { value: 'student', label: 'Student' },
        { value: 'lecturer', label: 'Lecturer' },
        { value: 'admin', label: 'Admin' },
        { value: 'registrar', label: 'Registrar' },
        { value: 'finance', label: 'Finance' },
        { value: 'hod', label: 'HOD' }
      ];
    } else if (currentUser?.role === 'registrar') {
      return [
        { value: 'student', label: 'Student' }
      ];
    }
    return [];
  };

  const availableRoles = getAvailableRoles();
>>>>>>> 248ed50 (added tables)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
<<<<<<< HEAD
    const requiredFields = ['firstName', 'lastName', 'email', 'username', 'password', 'role'];
=======
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'password', 'role'];
>>>>>>> 248ed50 (added tables)
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Additional validation for students
    if (formData.role === 'student' && (!formData.course || !formData.department)) {
      toast({
        title: "Validation Error",
        description: "Course and Department are required for students",
        variant: "destructive"
      });
      return;
    }

    // Check role permissions
    if (currentUser?.role === 'registrar' && formData.role !== 'student') {
      toast({
        title: "Permission Error",
        description: "Registrars can only create student accounts",
        variant: "destructive"
      });
      return;
    }

    if (!canCreateRole(formData.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create users with this role",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
<<<<<<< HEAD
      await createUserWithBypass(formData);
=======
      await createUser(formData, formData.password);
>>>>>>> 248ed50 (added tables)
      toast({
        title: "User Created Successfully",
        description: `${formData.firstName} ${formData.lastName} has been created with username: ${formData.username}. They can login immediately - no email verification required.`
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
<<<<<<< HEAD
        username: '',
=======
>>>>>>> 248ed50 (added tables)
        password: '',
        role: 'student',
        course: '',
        department: '',
        phone: ''
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Creating User",
        description: error.message || "An error occurred while creating the user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user doesn't have permission to create users
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'registrar')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New {currentUser?.role === 'registrar' ? 'Student' : 'User'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Ã¢Å“â€¦ Users created here can login immediately - no email verification required
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username for login"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
<<<<<<< HEAD
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="e.g. john.doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter a secure password"
              required
            />
=======
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter secure password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
>>>>>>> 248ed50 (added tables)
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
<<<<<<< HEAD
                {canCreateRole('student') && <SelectItem value="student">Student</SelectItem>}
                {canCreateRole('lecturer') && <SelectItem value="lecturer">Lecturer</SelectItem>}
                {canCreateRole('admin') && <SelectItem value="admin">Admin</SelectItem>}
                {canCreateRole('registrar') && <SelectItem value="registrar">Registrar</SelectItem>}
                {canCreateRole('finance') && <SelectItem value="finance">Finance</SelectItem>}
                {canCreateRole('hod') && <SelectItem value="hod">HOD</SelectItem>}
=======
                {availableRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
>>>>>>> 248ed50 (added tables)
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

<<<<<<< HEAD
          {showCourseAndDepartment() && (
            <>
              <div>
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.name}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
=======
          {/* Course and Department only for students */}
          {formData.role === 'student' && (
            <>
              <div>
                <Label htmlFor="course">Course *</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                  placeholder="e.g., Information Technology"
                  required={formData.role === 'student'}
                />
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Computer Science"
                  required={formData.role === 'student'}
                />
>>>>>>> 248ed50 (added tables)
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : `Create ${formData.role === 'student' ? 'Student' : 'User'}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};