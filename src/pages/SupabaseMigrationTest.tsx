import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SimpleUserMigration } from '@/services/SimpleUserMigration';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';

const SupabaseMigrationTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check current Supabase session
    checkSupabaseSession();
  }, []);

  const checkSupabaseSession = async () => {
    const session = await SimpleUserMigration.getCurrentSession();
    setSupabaseSession(session);
  };

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const testLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTestResults([]);

    try {
      addTestResult('🧪 Starting login test...', 'info');

      // Step 1: Try Firebase authentication
      addTestResult('🔥 Attempting Firebase authentication...', 'info');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (firebaseUser) {
        addTestResult(`✅ Firebase authentication successful for: ${firebaseUser.email}`, 'success');
        
        // Step 2: Migrate to Supabase
        addTestResult('🔄 Migrating user to Supabase...', 'info');
        
        const migrationResult = await SimpleUserMigration.createSupabaseUser(firebaseUser);
        
        if (migrationResult.success) {
          addTestResult('✅ Supabase user creation/migration successful!', 'success');
          
          if (migrationResult.user) {
            addTestResult(`📋 Supabase User ID: ${migrationResult.user.id}`, 'info');
          }
          
          // Check session
          await checkSupabaseSession();
          
          toast({
            title: 'Test Successful!',
            description: 'User has been created in Supabase. Check your Supabase dashboard.',
          });
        } else {
          addTestResult(`❌ Supabase migration failed: ${migrationResult.error}`, 'error');
          
          toast({
            title: 'Migration Failed',
            description: migrationResult.error,
            variant: 'destructive',
          });
        }
      }
      
    } catch (error) {
      addTestResult(`❌ Login test failed: ${error.message}`, 'error');
      
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testExistingUser = () => {
    setEmail('test@example.com');
    setPassword('password123');
    addTestResult('📝 Using test credentials. Replace with real user credentials.', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase User Migration Test</CardTitle>
            <CardDescription>
              Test Firebase login with automatic Supabase user creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={testLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Testing...' : 'Test Login & Migration'}
                </Button>
                <Button type="button" variant="outline" onClick={testExistingUser}>
                  Use Test Data
                </Button>
              </div>
            </form>
            
            {/* Current Session Status */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Current Supabase Session</h3>
              {supabaseSession ? (
                <div className="text-sm text-green-600">
                  ✅ Active session for: {supabaseSession.user.email}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  ❌ No active Supabase session
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Live log of the migration process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  No test results yet. Click "Test Login & Migration" to start.
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      result.type === 'success' ? 'bg-green-100 text-green-800' :
                      result.type === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span className="font-mono text-gray-500">{result.timestamp}</span>
                    <br />
                    {result.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 max-w-md">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. Enter valid Firebase user credentials</li>
              <li>2. Click "Test Login & Migration"</li>
              <li>3. Check Supabase dashboard → Authentication → Users</li>
              <li>4. Verify new user appears with Firebase UID</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseMigrationTest;
