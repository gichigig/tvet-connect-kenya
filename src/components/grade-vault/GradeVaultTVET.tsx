import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, GraduationCap, Calendar, TrendingUp, Award, FileText, Download, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGradeVault, GradeVaultResult, StudentSearchResult } from '@/contexts/GradeVaultContext';
import { useToast } from '@/hooks/use-toast';

export const GradeVaultTVET: React.FC = () => {
  const { user } = useAuth();
  const { 
    searchStudentResults, 
    getResultsByStudent, 
    calculateGPA, 
    getGradePoints,
    loading 
  } = useGradeVault();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);

  // For student users, automatically load their own results
  useEffect(() => {
    if (user?.role === 'student') {
      const studentResults = getResultsByStudent(user.id);
      if (studentResults.length > 0) {
        const visibleResults = studentResults.filter(r => r.visibleToStudent);
        const semesters = new Set(visibleResults.map(r => `${r.year}-${r.semester}`));
        const gpa = calculateGPA(visibleResults);
        
        const studentData: StudentSearchResult = {
          studentId: user.id,
          studentName: `${user.firstName} ${user.lastName}`,
          admissionNumber: user.admissionNumber || user.id,
          results: visibleResults,
          totalSemesters: semesters.size,
          overallGPA: gpa,
          currentStatus: 'active'
        };
        
        setSelectedStudent(studentData);
      }
    }
  }, [user, getResultsByStudent, calculateGPA]);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a student name, admission number, or ID to search.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchStudentResults(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results Found",
          description: `No student results found for "${searchQuery}".`,
          variant: "default"
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${results.length} student(s) with results.`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search student results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Get grade badge color
  const getGradeBadge = (grade: string) => {
    const gradeColors = {
      'A': 'bg-green-100 text-green-800 border-green-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'D': 'bg-orange-100 text-orange-800 border-orange-300',
      'E': 'bg-red-100 text-red-800 border-red-300',
      'I': 'bg-purple-100 text-purple-800 border-purple-300',
      '*': 'bg-gray-100 text-gray-800 border-gray-300',
      '#': 'bg-pink-100 text-pink-800 border-pink-300'
    };
    
    const color = gradeColors[grade as keyof typeof gradeColors] || 'bg-gray-100 text-gray-800';
    return <Badge className={`${color} font-semibold`}>{grade}</Badge>;
  };

  // Get status badge
  const getStatusBadge = (grade: string) => {
    if (['A', 'B', 'C', 'D'].includes(grade)) {
      return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
    } else if (grade === 'E') {
      return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
    } else if (grade === 'I') {
      return <Badge className="bg-purple-100 text-purple-800">Incomplete</Badge>;
    } else if (grade === '*') {
      return <Badge className="bg-gray-100 text-gray-800">Missing</Badge>;
    } else if (grade === '#') {
      return <Badge className="bg-pink-100 text-pink-800">Retake</Badge>;
    }
    return <Badge variant="outline">{grade}</Badge>;
  };

  // Filter results based on selected filters
  const getFilteredResults = (results: GradeVaultResult[]) => {
    return results.filter(result => {
      const semesterMatch = filterSemester === 'all' || result.semester.toString() === filterSemester;
      const yearMatch = filterYear === 'all' || result.year.toString() === filterYear;
      const unitMatch = filterUnit === 'all' || result.unitCode === filterUnit;
      
      return semesterMatch && yearMatch && unitMatch;
    });
  };

  // Get unique values for filters
  const getFilterOptions = (results: GradeVaultResult[]) => {
    const semesters = [...new Set(results.map(r => r.semester))].sort();
    const years = [...new Set(results.map(r => r.year))].sort((a, b) => b - a);
    const units = [...new Set(results.map(r => r.unitCode))].sort();
    
    return { semesters, years, units };
  };

  // Export results to CSV
  const exportToCSV = (results: GradeVaultResult[]) => {
    const headers = [
      'Unit Code',
      'Unit Name', 
      'Assessment Type',
      'Marks',
      'Max Marks',
      'Percentage',
      'Grade',
      'Status',
      'Semester',
      'Year',
      'Academic Year',
      'Lecturer',
      'Graded Date'
    ];

    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.unitCode,
        `"${result.unitName}"`,
        result.assessmentType.toUpperCase(),
        result.marks,
        result.maxMarks,
        result.percentage.toFixed(1),
        result.grade,
        ['A', 'B', 'C', 'D'].includes(result.grade) ? 'Pass' : 'Fail',
        result.semester,
        result.year,
        result.academicYear,
        `"${result.lecturerName}"`,
        result.gradedAt.toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grade-vault-results-${selectedStudent?.admissionNumber || 'export'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Grade Vault TVET Kenya
          </h1>
          <p className="text-gray-600 mt-2">
            Search and view student academic results across all semesters
          </p>
        </div>
      </div>

      {/* Search Section - Only show for non-student users */}
      {user?.role !== 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Student Results Search
            </CardTitle>
            <CardDescription>
              Search for student results by name, admission number, or student ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter student name, admission number, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || loading}
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Search Results</h3>
                <div className="grid gap-3">
                  {searchResults.map((student) => (
                    <Card key={student.studentId} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{student.studentName}</h4>
                            <p className="text-sm text-gray-600">
                              Admission: {student.admissionNumber} | 
                              Results: {student.results.length} | 
                              Semesters: {student.totalSemesters} |
                              GPA: {student.overallGPA.toFixed(2)}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            View Results
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Results Display */}
      {selectedStudent && (
        <div className="space-y-6">
          {/* Student Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Academic Summary - {selectedStudent.studentName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Admission Number</h3>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.admissionNumber}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Total Results</h3>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.results.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Semesters</h3>
                  <p className="text-2xl font-bold text-purple-600">{selectedStudent.totalSemesters}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Overall GPA</h3>
                  <p className="text-2xl font-bold text-orange-600">{selectedStudent.overallGPA.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Results
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportToCSV(getFilteredResults(selectedStudent.results))}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {getFilterOptions(selectedStudent.results).semesters.map(semester => (
                      <SelectItem key={semester} value={semester.toString()}>
                        Semester {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {getFilterOptions(selectedStudent.results).years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterUnit} onValueChange={setFilterUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {getFilterOptions(selectedStudent.results).units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Academic Results
              </CardTitle>
              <CardDescription>
                Detailed breakdown of all academic assessments and grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Code</TableHead>
                      <TableHead>Unit Name</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Lecturer</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredResults(selectedStudent.results).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                          No results found for the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredResults(selectedStudent.results).map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.unitCode}</TableCell>
                          <TableCell>{result.unitName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {result.assessmentType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {result.marks}/{result.maxMarks}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {result.percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>{getGradeBadge(result.grade)}</TableCell>
                          <TableCell>{getStatusBadge(result.grade)}</TableCell>
                          <TableCell>{result.semester}</TableCell>
                          <TableCell>{result.year}</TableCell>
                          <TableCell className="text-sm">{result.lecturerName}</TableCell>
                          <TableCell className="text-sm">
                            {result.gradedAt.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Grade Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Grading Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="text-center">
                  {getGradeBadge('A')}
                  <p className="text-xs mt-1">70-100%</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('B')}
                  <p className="text-xs mt-1">60-69%</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('C')}
                  <p className="text-xs mt-1">50-59%</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('D')}
                  <p className="text-xs mt-1">40-49%</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('E')}
                  <p className="text-xs mt-1">0-39% (Fail)</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('I')}
                  <p className="text-xs mt-1">Incomplete</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('*')}
                  <p className="text-xs mt-1">Missing Marks</p>
                </div>
                <div className="text-center">
                  {getGradeBadge('#')}
                  <p className="text-xs mt-1">Retake</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!selectedStudent && user?.role === 'student' && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600 mb-6">
              Your academic results will appear here once your lecturers have graded your assessments and they have been approved by the HOD.
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedStudent && user?.role !== 'student' && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Student Results</h3>
            <p className="text-gray-600">
              Use the search function above to find and view student academic results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GradeVaultTVET;
