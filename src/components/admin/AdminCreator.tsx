import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/config';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

export const AdminCreator = () => {
  const [email, setEmail] = useState('admin@tvetkenya.com');
  const [password, setPassword] = useState('admin123');
  const [firstName, setFirstName] = useState('System');
  const [lastName, setLastName] = useState('Administrator');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAdminUser = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Step 1: Create user account
      setMessage('Creating user account...');
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      });

      if (signupError) {
        if (signupError.message.includes('already registered')) {
          setMessage('User already exists. Attempting to sign in...');
          
          const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signinError) {
            throw new Error(`Sign in failed: ${signinError.message}`);
          }
          
          setMessage('✅ Successfully signed in existing admin user!');
        } else {
          throw signupError;
        }
      } else {
        setMessage('✅ Admin user created successfully!');
        
        if (signupData.user) {
          // Step 2: Try to create profile (if profiles table exists)
          try {
            setMessage('Creating user profile...');
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: signupData.user.id,
                email: signupData.user.email,
                first_name: firstName,
                last_name: lastName,
                role: 'admin',
                approved: true,
                username: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (profileError) {
              console.warn('Profile creation failed (table may not exist):', profileError.message);
              setMessage('✅ User created! (Profile table may need to be created separately)');
            } else {
              setMessage('✅ Admin user and profile created successfully!');
            }
          } catch (profileError) {
            console.warn('Profile creation failed:', profileError);
            setMessage('✅ User created! (Profile will be created on first login)');
          }
        }
      }

      // Show success info
      setTimeout(() => {
        setMessage(prev => prev + '\n\n📊 Check Supabase dashboard:\n' +
          'https://supabase.com/dashboard/project/ympnvccreuhxouyovszg/auth/users\n\n' +
          '🔑 Login credentials:\n' +
          `Email: ${email}\n` +
          `Password: ${password}\n` +
          'Login URL: /supabase-login');
      }, 1000);

    } catch (err) {
      setError(err.message || 'Failed to create admin user');
      console.error('Admin creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tvetkenya.com"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter secure password"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="System"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Administrator"
            />
          </div>
        </div>

        <Button 
          onClick={createAdminUser} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Admin...' : 'Create Admin User'}
        </Button>

        {message && (
          <Alert>
            <AlertDescription className="whitespace-pre-line text-sm">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCreator;
