import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreateUserModalProps {
  triggerText?: string;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ triggerText = "Create New User" }) => {
  const { user, createUserWithBypass } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'student' as const,
    course: '',
    department: '',
    phone: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['firstName', 'lastName', 'email', 'username', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
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
      await createUserWithBypass(formData);
      toast({
        title: "User Created Successfully",
        description: `${formData.firstName} ${formData.lastName} has been created with role: ${formData.role}`
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
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
                {canCreateRole('student') && <SelectItem value="student">Student</SelectItem>}
                {canCreateRole('lecturer') && <SelectItem value="lecturer">Lecturer</SelectItem>}
                {canCreateRole('admin') && <SelectItem value="admin">Admin</SelectItem>}
                {canCreateRole('registrar') && <SelectItem value="registrar">Registrar</SelectItem>}
                {canCreateRole('finance') && <SelectItem value="finance">Finance</SelectItem>}
                {canCreateRole('hod') && <SelectItem value="hod">HOD</SelectItem>}
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
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create User'}
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