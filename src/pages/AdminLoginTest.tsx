import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const AdminLoginTest = () => {
  const [email, setEmail] = useState('billyblund17@gmail.com');
  const [password, setPassword] = useState('bildad');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const testLogin = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      console.log('🔐 Testing direct Supabase login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setResult(`❌ Login failed: ${error.message}`);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResult(`✅ Login successful! User: ${data.user?.email}`);
        toast({
          title: "Login Successful",
          description: "Direct Supabase authentication worked!",
        });
        
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          setResult(prev => prev + `\n⚠️ Profile error: ${profileError.message}`);
        } else {
          setResult(prev => prev + `\n👤 Profile found: ${profile.role}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult(`💥 Unexpected error: ${errorMsg}`);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login Test</CardTitle>
          <CardDescription>
            Test direct Supabase authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={testLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Login"}
            </Button>
            
            {result && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginTest;
