import React from 'react';
import { useGradeVault } from '../../contexts/GradeVaultContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Download, Filter, GraduationCap, TrendingUp } from 'lucide-react';

const StudentGradeVault: React.FC = () => {
  const { user } = useAuth();
  const {
    getResultsByStudent,
    searchStudentResults,
    calculateGPA,
    loading
  } = useGradeVault();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [semesterFilter, setSemesterFilter] = React.useState('all');
  const [yearFilter, setYearFilter] = React.useState('all');
  const [results, setResults] = React.useState<any[]>([]);
  const [gpa, setGPA] = React.useState<number>(0);

  React.useEffect(() => {
    if (user?.id) {
      loadStudentResults();
    }
  }, [user?.id, semesterFilter, yearFilter]);

  const loadStudentResults = async () => {
    if (!user?.id) return;
    
    try {
      const studentResults = getResultsByStudent(user.id);
      let filteredResults = studentResults;

      // Apply filters
      if (semesterFilter !== 'all') {
        filteredResults = filteredResults.filter(result => result.semester.toString() === semesterFilter);
      }
      if (yearFilter !== 'all') {
        filteredResults = filteredResults.filter(result => result.year === parseInt(yearFilter));
      }

      setResults(filteredResults);
      
      // Calculate overall GPA
      const overallGPA = calculateGPA(filteredResults);
      setGPA(overallGPA);
    } catch (error) {
      console.error('Error loading student results:', error);
    }
  };

  const handleSearch = async () => {
    if (!user?.id || !searchTerm.trim()) return;
    
    try {
      const searchResults = await searchStudentResults(searchTerm);
      // Filter by current user
      const userResults = searchResults.filter(result => result.studentId === user.id);
      setResults(userResults);
    } catch (error) {
      console.error('Error searching results:', error);
    }
  };

  const handleExport = async () => {
    if (!user?.id) return;
    
    try {
      // Create CSV export of student results
      const userResults = getResultsByStudent(user.id);
      const csvContent = createCSVExport(userResults);
      const filename = `grade-vault-${user.firstName || user.email || 'student'}-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const createCSVExport = (results: any[]) => {
    const headers = ['Unit Code', 'Unit Name', 'Assessment', 'Marks', 'Grade', 'Semester', 'Year', 'Status'];
    const rows = results.map(result => [
      result.unitCode,
      result.unitName,
      result.assessmentType,
      result.marks,
      result.grade,
      result.semester,
      result.year,
      result.status
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your academic results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">My Academic Results</h1>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Results</span>
        </Button>
      </div>

      {/* GPA Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Academic Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{gpa.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Overall GPA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{results.filter(r => r.status === 'approved' || r.status === 'published').length}</div>
              <div className="text-sm text-gray-600">Approved Results</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{results.length}</div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by unit name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4">
        {results.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No results match your search criteria.' : 'No academic results available yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={`${result.unitId}-${result.semester}-${result.year}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{result.unitName || result.unitCode}</h3>
                      <Badge variant="outline">{result.unitCode}</Badge>
                      <Badge className={getGradeColor(result.grade)}>
                        Grade: {result.grade}
                      </Badge>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Marks:</span>
                        <div className="font-medium">{result.marks || 0}/{result.maxMarks || 100}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Semester:</span>
                        <div className="font-medium">Semester {result.semester}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Year:</span>
                        <div className="font-medium">{result.year}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Assessment:</span>
                        <div className="font-medium capitalize">{result.assessmentType}</div>
                      </div>
                    </div>
                    {result.feedback && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Feedback:</span>
                        <p className="text-sm mt-1">{result.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentGradeVault;