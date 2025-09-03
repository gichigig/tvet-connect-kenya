import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Users, Shield, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// Import all our migration services
import { SimpleUserMigration } from '@/services/SimpleUserMigration';
import { FirestoreToSupabaseMigration } from '@/services/FirestoreToSupabaseMigration';
import { EnhancedStudentCreation } from '@/services/EnhancedStudentCreation';
import { supabase } from '@/integrations/supabase/client';

interface MigrationStatus {
  users: number;
  units: number;
  assignments: number;
  semesterPlans: number;
  submissions: number;
  grades: number;
}

const MigrationTestSuite: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    users: 0,
    units: 0,
    assignments: 0,
    semesterPlans: 0,
    submissions: 0,
    grades: 0
  });

  const [testResults, setTestResults] = useState<{
    userMigration?: any;
    dataMigration?: any;
    studentCreation?: any;
  }>({});

  useEffect(() => {
    checkSupabaseConnection();
    checkMigrationStatus();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setSupabaseStatus('connected');
      toast({
        title: 'Supabase Connected',
        description: 'Successfully connected to Supabase database',
      });
    } catch (error) {
      console.error('Supabase connection error:', error);
      setSupabaseStatus('error');
    }
  };

  const checkMigrationStatus = async () => {
    try {
      // Check users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Check units
      const { count: unitsCount } = await supabase
        .from('units')
        .select('*', { count: 'exact', head: true });

      // Check assignments
      const { count: assignmentsCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true });

      // Check semester plans
      const { count: semesterPlansCount } = await supabase
        .from('semester_plans')
        .select('*', { count: 'exact', head: true });

      // Check submissions
      const { count: submissionsCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true });

      // Check grades
      const { count: gradesCount } = await supabase
        .from('student_grades')
        .select('*', { count: 'exact', head: true });

      setMigrationStatus({
        users: usersCount || 0,
        units: unitsCount || 0,
        assignments: assignmentsCount || 0,
        semesterPlans: semesterPlansCount || 0,
        submissions: submissionsCount || 0,
        grades: gradesCount || 0
      });
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const testUserMigration = async () => {
    setIsLoading(true);
    setMigrationProgress(10);

    try {
      // Create a test Firebase user object
      const testFirebaseUser = {
        uid: 'test-user-' + Date.now(),
        email: 'testuser@example.com',
        displayName: 'Test Migration User',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };

      setMigrationProgress(30);

      // Test the user migration service
      const result = await SimpleUserMigration.createSupabaseUser(testFirebaseUser as any);
      
      setMigrationProgress(80);
      setTestResults(prev => ({ ...prev, userMigration: result }));

      if (result.success) {
        await checkMigrationStatus();
        toast({
          title: 'User Migration Test Successful',
          description: 'Test user created in Supabase successfully',
        });
      } else {
        toast({
          title: 'User Migration Test Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

      setMigrationProgress(100);
    } catch (error) {
      console.error('User migration test error:', error);
      setTestResults(prev => ({ 
        ...prev, 
        userMigration: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
      toast({
        title: 'User Migration Test Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMigrationProgress(0), 2000);
    }
  };

  const testDataMigration = async () => {
    setIsLoading(true);
    setMigrationProgress(10);

    try {
      const migrationService = new FirestoreToSupabaseMigration();
      
      setMigrationProgress(30);
      
      // Test migrating a small batch of data
      const result = await migrationService.migrateCollection('units', 5);
      
      setMigrationProgress(80);
      setTestResults(prev => ({ ...prev, dataMigration: result }));

      if (result.success) {
        await checkMigrationStatus();
        toast({
          title: 'Data Migration Test Successful',
          description: `Migrated ${result.totalMigrated} records successfully`,
        });
      } else {
        toast({
          title: 'Data Migration Test Failed',
          description: result.errors?.join(', ') || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

      setMigrationProgress(100);
    } catch (error) {
      console.error('Data migration test error:', error);
      setTestResults(prev => ({ 
        ...prev, 
        dataMigration: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
      toast({
        title: 'Data Migration Test Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMigrationProgress(0), 2000);
    }
  };

  const testEnhancedStudentCreation = async () => {
    setIsLoading(true);
    setMigrationProgress(10);

    try {
      // Create test student data
      const testStudentData = {
        firstName: 'Test',
        lastName: 'Student',
        username: 'teststudent' + Date.now(),
        email: `teststudent${Date.now()}@example.com`,
        phoneNumber: '0712345678',
        dateOfBirth: '2000-01-01',
        gender: 'male' as const,
        course: 'Computer Science',
        department: 'Computer Science',
        level: 'certificate' as const,
        year: 1,
        semester: 1,
        academicYear: '2024/2025',
        enrollmentType: 'fulltime' as const,
        institutionBranch: 'Main Campus',
        guardianName: 'Test Guardian',
        guardianPhone: '0712345679',
        address: 'Test Address',
        nationalId: '12345678',
        password: 'testpassword123'
      };

      setMigrationProgress(30);

      // Test the enhanced student creation service
      const result = await EnhancedStudentCreation.createStudent(testStudentData);
      
      setMigrationProgress(80);
      setTestResults(prev => ({ ...prev, studentCreation: result }));

      if (result.success) {
        await checkMigrationStatus();
        toast({
          title: 'Enhanced Student Creation Test Successful',
          description: `Student created with admission number: ${result.admissionNumber}`,
        });
      } else {
        toast({
          title: 'Enhanced Student Creation Test Failed',
          description: result.errors?.join(', ') || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

      setMigrationProgress(100);
    } catch (error) {
      console.error('Enhanced student creation test error:', error);
      setTestResults(prev => ({ 
        ...prev, 
        studentCreation: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
      toast({
        title: 'Enhanced Student Creation Test Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMigrationProgress(0), 2000);
    }
  };

  const runFullMigrationTest = async () => {
    setIsLoading(true);
    setMigrationProgress(0);

    try {
      // Step 1: Test user migration
      setMigrationProgress(15);
      await testUserMigration();
      
      // Step 2: Test data migration
      setMigrationProgress(50);
      await testDataMigration();
      
      // Step 3: Test enhanced student creation
      setMigrationProgress(85);
      await testEnhancedStudentCreation();
      
      setMigrationProgress(100);
      
      toast({
        title: 'Full Migration Test Complete',
        description: 'All migration components have been tested',
      });
    } catch (error) {
      console.error('Full migration test error:', error);
      toast({
        title: 'Full Migration Test Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMigrationProgress(0), 3000);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Migration Test Suite</h1>
          <p className="text-gray-600">Test all Firebase to Supabase migration components</p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6" />
          <Badge variant={supabaseStatus === 'connected' ? 'default' : supabaseStatus === 'error' ? 'destructive' : 'secondary'}>
            Supabase {supabaseStatus === 'connected' ? 'Connected' : supabaseStatus === 'error' ? 'Error' : 'Checking...'}
          </Badge>
        </div>
      </div>

      {/* Migration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Current Supabase Data Status</span>
          </CardTitle>
          <CardDescription>Number of records currently in Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{migrationStatus.users}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{migrationStatus.units}</div>
              <div className="text-sm text-gray-600">Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{migrationStatus.assignments}</div>
              <div className="text-sm text-gray-600">Assignments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{migrationStatus.semesterPlans}</div>
              <div className="text-sm text-gray-600">Semester Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{migrationStatus.submissions}</div>
              <div className="text-sm text-gray-600">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{migrationStatus.grades}</div>
              <div className="text-sm text-gray-600">Grades</div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={checkMigrationStatus} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Testing migration components...</span>
              <span>{migrationProgress}%</span>
            </div>
            <Progress value={migrationProgress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-migration">User Migration</TabsTrigger>
          <TabsTrigger value="data-migration">Data Migration</TabsTrigger>
          <TabsTrigger value="student-creation">Student Creation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Migration Test Suite</CardTitle>
              <CardDescription>
                Run comprehensive tests of all migration components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runFullMigrationTest}
                disabled={isLoading || supabaseStatus !== 'connected'}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Full Test Suite...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Run Full Migration Test Suite
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={testUserMigration}
                  disabled={isLoading || supabaseStatus !== 'connected'}
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Test User Migration
                </Button>
                
                <Button 
                  onClick={testDataMigration}
                  disabled={isLoading || supabaseStatus !== 'connected'}
                  variant="outline"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test Data Migration
                </Button>
                
                <Button 
                  onClick={testEnhancedStudentCreation}
                  disabled={isLoading || supabaseStatus !== 'connected'}
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Test Student Creation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Migration Test</CardTitle>
              <CardDescription>
                Test the SimpleUserMigration service that creates Supabase users during Firebase login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testUserMigration}
                disabled={isLoading || supabaseStatus !== 'connected'}
              >
                <Users className="h-4 w-4 mr-2" />
                Test User Migration
              </Button>
              
              {testResults.userMigration && (
                <Card className={`${testResults.userMigration.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.userMigration.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {testResults.userMigration.success ? 'User Migration Successful' : 'User Migration Failed'}
                      </span>
                    </div>
                    <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(testResults.userMigration, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Migration Test</CardTitle>
              <CardDescription>
                Test the FirestoreToSupabaseMigration service that transfers data from Firestore to Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testDataMigration}
                disabled={isLoading || supabaseStatus !== 'connected'}
              >
                <Database className="h-4 w-4 mr-2" />
                Test Data Migration (5 Units)
              </Button>
              
              {testResults.dataMigration && (
                <Card className={`${testResults.dataMigration.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.dataMigration.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {testResults.dataMigration.success ? 'Data Migration Successful' : 'Data Migration Failed'}
                      </span>
                    </div>
                    <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(testResults.dataMigration, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-creation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Student Creation Test</CardTitle>
              <CardDescription>
                Test the EnhancedStudentCreation service that creates students in both Firebase and Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testEnhancedStudentCreation}
                disabled={isLoading || supabaseStatus !== 'connected'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Test Enhanced Student Creation
              </Button>
              
              {testResults.studentCreation && (
                <Card className={`${testResults.studentCreation.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.studentCreation.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {testResults.studentCreation.success ? 'Student Creation Successful' : 'Student Creation Failed'}
                      </span>
                    </div>
                    <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(testResults.studentCreation, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MigrationTestSuite;
