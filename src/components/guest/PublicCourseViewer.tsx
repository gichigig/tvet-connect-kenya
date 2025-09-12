import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Eye, 
  GraduationCap,
  Calendar,
  Users,
  Star,
  Filter,
  DollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  department: {
    name: string;
    code: string;
  };
}

interface FeeStructure {
  id: string;
  course_id: string;
  level: string;
  tuition_fee: number;
  exam_fee: number;
  library_fee: number;
  lab_fee: number;
  activity_fee: number;
  medical_fee: number;
  total_fee: number;
  academic_year: string;
  is_active: boolean;
}

export const PublicCourseViewer: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [feeStructures, setFeeStructures] = useState<Record<string, FeeStructure[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);

      // Load courses with departments
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          department:departments(name, code)
        `)
        .order('name');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Load fee structures
      const { data: feesData, error: feesError } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('is_active', true)
        .order('level');

      if (feesError) throw feesError;
      
      // Group fee structures by course_id
      const groupedFees = (feesData || []).reduce((acc, fee) => {
        if (!acc[fee.course_id]) acc[fee.course_id] = [];
        acc[fee.course_id].push(fee);
        return acc;
      }, {} as Record<string, FeeStructure[]>);
      
      setFeeStructures(groupedFees);

      // Log guest view
      const { error: logError } = await supabase
        .from('guest_course_views')
        .insert([{
          visitor_ip: null, // Will be set by database trigger if needed
          visitor_user_agent: navigator.userAgent
        }]);

      if (logError) console.warn('Failed to log guest view:', logError);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load course information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !departmentFilter || course.department?.name === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const uniqueDepartments = [...new Set(courses.map(c => c.department?.name).filter(Boolean))];

  const generatePDF = async (course: Course) => {
    try {
      const fees = feeStructures[course.id] || [];
      
      // Create a simple HTML content for the PDF
      const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>${course.name} (${course.code})</h1>
          <h2>Course Information</h2>
          <p><strong>Department:</strong> ${course.department?.name || 'N/A'}</p>
          <p><strong>Description:</strong> ${course.description || 'No description available'}</p>
          
          <h2>Fee Structure</h2>
          ${fees.length > 0 ? fees.map(fee => `
            <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px;">
              <h3>${fee.level} Level - Academic Year ${fee.academic_year}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Tuition Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">$${fee.tuition_fee?.toLocaleString() || 0}</td></tr>
                <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Exam Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">$${fee.exam_fee?.toLocaleString() || 0}</td></tr>
                <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Library Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">$${fee.library_fee?.toLocaleString() || 0}</td></tr>
                <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Lab Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">$${fee.lab_fee?.toLocaleString() || 0}</td></tr>
                <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Activity Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">$${fee.activity_fee?.toLocaleString() || 0}</td></tr>
                <tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Medical Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">$${fee.medical_fee?.toLocaleString() || 0}</td></tr>
                <tr style="background-color: #f5f5f5;"><td style="border: 1px solid #ddd; padding: 8px;"><strong>Total Fee:</strong></td><td style="border: 1px solid #ddd; padding: 8px;"><strong>$${fee.total_fee?.toLocaleString() || 0}</strong></td></tr>
              </table>
            </div>
          `).join('') : '<p>No fee structure available for this course.</p>'}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>For more information, please contact our admissions office.</p>
          </div>
        </div>
      `;

      // Create a new window with the content for printing/PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${course.name} - Course Information</title>
              <style>
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${content}
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      toast.success('Course brochure generated! Check your downloads or print dialog.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate course brochure');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of technical and vocational courses designed to prepare you for success in your chosen career.
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const fees = feeStructures[course.id] || [];
            const minFee = fees.length > 0 ? Math.min(...fees.map(f => f.total_fee || 0)) : 0;
            const maxFee = fees.length > 0 ? Math.max(...fees.map(f => f.total_fee || 0)) : 0;

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {course.code}
                      </Badge>
                    </div>
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Department:</strong> {course.department?.name || 'N/A'}
                    </p>
                    <p className="text-sm line-clamp-3">
                      {course.description || 'No description available'}
                    </p>
                  </div>

                  {fees.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">Fee Range</span>
                      </div>
                      <div className="text-sm">
                        {minFee === maxFee ? (
                          <span className="font-bold text-green-600">${minFee.toLocaleString()}</span>
                        ) : (
                          <span className="font-bold text-green-600">
                            ${minFee.toLocaleString()} - ${maxFee.toLocaleString()}
                          </span>
                        )}
                        <span className="text-muted-foreground ml-1">per year</span>
                      </div>
                      
                      <div className="space-y-1">
                        {fees.map((fee) => (
                          <div key={fee.id} className="flex justify-between text-xs">
                            <span>{fee.level} Level ({fee.academic_year})</span>
                            <span className="font-medium">${fee.total_fee?.toLocaleString() || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => generatePDF(course)}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Brochure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find the courses you're looking for.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Ready to Apply?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our admissions office for more information about enrollment and application procedures.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                📧 admissions@college.edu
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                📞 +1 (555) 123-4567
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};