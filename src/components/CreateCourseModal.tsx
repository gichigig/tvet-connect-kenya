import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreateCourseModalProps {
  triggerText?: string;
  onCourseCreated?: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ 
  triggerText = "Create Course",
  onCourseCreated 
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentId: ''
  });

  // Load departments when modal opens
  useEffect(() => {
    const loadDepartments = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading departments:', error);
      } else {
        setDepartments(data || []);
      }
    };
    
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.departmentId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description,
          department_id: formData.departmentId
        });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Course Created Successfully",
        description: `${formData.name} (${formData.code}) has been created`
      });
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        departmentId: ''
      });
      
      setOpen(false);
      onCourseCreated?.();
    } catch (error: any) {
      toast({
        title: "Error Creating Course",
        description: error.message || "An error occurred while creating the course",
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
          <BookOpen className="w-4 h-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Computer Science"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="code">Course Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. CS101"
              required
            />
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Course description (optional)"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Course'}
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