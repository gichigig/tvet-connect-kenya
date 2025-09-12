import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Mail, 
  AlertCircle, 
  CheckCircle,
  User,
  IdCard
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const PasswordResetRequest: React.FC = () => {
  const [searchMethod, setSearchMethod] = useState<'email' | 'admission'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userFound, setUserFound] = useState<boolean | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a value to search');
      return;
    }

    setIsSearching(true);
    setUserFound(null);

    try {
      // Search for user in profiles table
      let query = supabase.from('profiles').select('*');
      
      if (searchMethod === 'email') {
        query = query.eq('email', searchValue.trim());
      } else {
        query = query.eq('admission_number', searchValue.trim());
      }

      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const found = !!data;
      setUserFound(found);

      if (found) {
        toast.success('User found! You can proceed with the reset request.');
      } else {
        toast.error('No user found with the provided information.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for user');
      setUserFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (userFound !== true) {
      toast.error('Please search and verify user exists first');
      return;
    }

    try {
      const requestData: any = {
        user_found: true,
        registrar_notified: false,
        reset_link_sent: false,
        status: 'pending'
      };

      if (searchMethod === 'email') {
        requestData.email = searchValue.trim();
      } else {
        requestData.admission_number = searchValue.trim();
      }

      const { error } = await supabase
        .from('password_reset_requests')
        .insert([requestData]);

      if (error) throw error;

      setRequestSubmitted(true);
      toast.success('Password reset request submitted successfully!');
    } catch (error) {
      console.error('Request submission error:', error);
      toast.error('Failed to submit password reset request');
    }
  };

  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Request Submitted</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your password reset request has been submitted to the registrar.
              </p>
              <p>
                You will receive further instructions via email once your request is processed.
              </p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  Alternative: Visit the eLearning office for immediate assistance
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Location: Administration Building, Ground Floor
                </p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full mt-6"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Password Reset Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Search Method</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={searchMethod === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSearchMethod('email');
                    setSearchValue('');
                    setUserFound(null);
                  }}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant={searchMethod === 'admission' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSearchMethod('admission');
                    setSearchValue('');
                    setUserFound(null);
                  }}
                  className="flex-1"
                >
                  <IdCard className="h-4 w-4 mr-2" />
                  Admission Number
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="search-value">
                {searchMethod === 'email' ? 'Email Address' : 'Admission Number'}
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="search-value"
                  type={searchMethod === 'email' ? 'email' : 'text'}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setUserFound(null);
                  }}
                  placeholder={
                    searchMethod === 'email' 
                      ? 'Enter your email address' 
                      : 'Enter your admission number'
                  }
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchValue.trim()}
                  size="sm"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {userFound !== null && (
              <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                userFound 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {userFound ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">User found! You can proceed with the request.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">No user found with this information.</span>
                  </>
                )}
              </div>
            )}
          </div>

          {userFound === true && (
            <Button onClick={handleSubmitRequest} className="w-full">
              Submit Password Reset Request
            </Button>
          )}

          {userFound === false && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Visit eLearning Office</h3>
                    <p className="text-sm text-blue-800">
                      If you can't find your account, please visit the eLearning office for assistance.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Location: Administration Building, Ground Floor<br />
                      Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchValue('');
                  setUserFound(null);
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/login'}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};