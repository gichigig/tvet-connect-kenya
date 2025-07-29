import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, BookOpen, Users, Calendar, DollarSign } from 'lucide-react';
import { useCoursesContext } from '@/contexts/courses/CoursesContext';
import { Course } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

interface CourseFormData {
  title: string;
  code: string;
  description: string;
  department: string;
  level: 'certificate' | 'diploma' | 'higher_diploma' | 'degree';
  duration: number;
  durationType: 'months' | 'years';
  mode: 'full_time' | 'part_time' | 'evening' | 'distance_learning';
  maxCapacity: number;
  applicationDeadline: string;
  startDate: string;
  requirements: string[];
  objectives: string[];
}

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

export const CreateCourseForm: React.FC = () => {
  const { createCourse } = useCoursesContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    code: '',
    description: '',
    department: '',
    level: 'certificate',
    duration: 1,
    durationType: 'years',
    mode: 'full_time',
    maxCapacity: 30,
    applicationDeadline: '',
    startDate: '',
    requirements: [''],
    objectives: ['']
  });

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'requirements' | 'objectives', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requirements' | 'objectives') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'requirements' | 'objectives', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Course title is required", variant: "destructive" });
      return false;
    }
    if (!formData.code.trim()) {
      toast({ title: "Error", description: "Course code is required", variant: "destructive" });
      return false;
    }
    if (!formData.department) {
      toast({ title: "Error", description: "Please select a department", variant: "destructive" });
      return false;
    }
    if (!formData.startDate) {
      toast({ title: "Error", description: "Start date is required", variant: "destructive" });
      return false;
    }
    if (!formData.applicationDeadline) {
      toast({ title: "Error", description: "Application deadline is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const courseData: Omit<Course, 'id' | 'createdAt' | 'createdBy'> = {
        name: formData.title.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        department: formData.department,
        level: formData.level,
        duration: formData.duration,
        durationType: formData.durationType,
        mode: formData.mode,
        totalCredits: formData.duration * 30, // Estimate 30 credits per year
        units: [],
        lecturerIds: [],
        hodId: null, // Set to null instead of undefined
        feeStructureId: null, // Set to null instead of undefined
        studentsEnrolled: 0,
        maxCapacity: formData.maxCapacity,
        isActive: false,
        status: 'draft',
        approvedAt: null, // Set to null instead of undefined
        approvedBy: null, // Set to null instead of undefined
        semester: 1, // Default to first semester
        academicYear: new Date().getFullYear().toString(),
        entryRequirements: formData.requirements.filter(req => req.trim() !== ''),
        learningOutcomes: formData.objectives.filter(obj => obj.trim() !== ''),
        applicationDeadline: formData.applicationDeadline,
        startDate: formData.startDate
      };

      const courseId = await createCourse(courseData);
      
      toast({
        title: "Course Created Successfully",
        description: `Course "${formData.title}" has been created and is pending approval.`
      });

      // Reset form
      setFormData({
        title: '',
        code: '',
        description: '',
        department: '',
        level: 'certificate',
        duration: 1,
        durationType: 'years',
        mode: 'full_time',
        maxCapacity: 30,
        applicationDeadline: '',
        startDate: '',
        requirements: [''],
        objectives: ['']
      });

    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Create New Course
        </CardTitle>
        <CardDescription>
          Create a new course that will be submitted for approval by the HOD and Finance departments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Advanced Web Development"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Course Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., CS301"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a detailed description of the course..."
              rows={4}
            />
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Academic Level</Label>
              <Select value={formData.level} onValueChange={(value: any) => handleInputChange('level', value)}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="mode">Study Mode</Label>
              <Select value={formData.mode} onValueChange={(value: any) => handleInputChange('mode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="distance_learning">Distance Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-20"
                />
                <Select value={formData.durationType} onValueChange={(value: any) => handleInputChange('durationType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Maximum Capacity</Label>
              <Input
                type="number"
                id="maxCapacity"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 30)}
                min="1"
                max="200"
              />
            </div>
          </div>

          {/* Important Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline *</Label>
              <Input
                type="date"
                id="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Course Start Date *</Label>
              <Input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Entry Requirements</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('requirements')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Requirement
              </Button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    placeholder="e.g., KCSE mean grade C+"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Learning Objectives</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('objectives')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Objective
              </Button>
            </div>
            <div className="space-y-2">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={objective}
                    onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                    placeholder="e.g., Students will be able to design responsive web applications"
                    rows={2}
                  />
                  {formData.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('objectives', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: '',
                  code: '',
                  description: '',
                  department: '',
                  level: 'certificate',
                  duration: 1,
                  durationType: 'years',
                  mode: 'full_time',
                  maxCapacity: 30,
                  applicationDeadline: '',
                  startDate: '',
                  requirements: [''],
                  objectives: ['']
                });
              }}
            >
              Reset Form
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
