
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Login useEffect - Current user:', user);
    console.log('🔄 Login useEffect - Auth loading state:', loading);
    console.log('🔄 Login useEffect - Component loading state:', isLoading);
    
    // Only redirect if auth is not loading and user exists
    if (!loading && user) {
      console.log('🚀 User detected and auth loaded, redirecting to home page for role:', user.role);
      navigate('/');
    }
  }, [user, navigate, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('🔐 Starting login with identifier:', identifier);

    try {
      const userData = await login(identifier, password);
      console.log('✅ Login result:', userData);
      
      if (userData) {
        console.log('🎉 Login successful, showing toast');
        toast({
          title: "Login Successful",
          description: "Welcome back to TVET Connect Kenya!",
        });
        
        // Small delay to ensure auth state has time to update
        console.log('⏱️ Waiting for auth state to update...');
        setTimeout(() => {
          console.log('🚀 Attempting navigation to home page');
          navigate('/');
        }, 100);
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Login process complete, setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/WhatsApp Image 2025-08-06 at 11.54.03 PM.jpeg" alt="Billy Dev Logo" className="w-16 h-16 object-cover" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Billy Dev account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
              {/* Removed admin-specific login hint */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button type="button" className="w-full mt-2" variant="outline" onClick={() => toast({ title: 'Signed in as Guest', description: 'You are now signed in as a guest.' })}>
              Sign in as Guest
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
