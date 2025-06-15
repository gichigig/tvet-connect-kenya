import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("billyblun17@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-login as admin when component mounts
  useEffect(() => {
    const autoLogin = async () => {
      setIsLoading(true);
      setDebugInfo(""); // reset
      try {
        // Try to fetch users from Supabase directly for debug output
        const { data, error } = await import("@/integrations/supabase/client")
          .then(mod => mod.supabase)
          .then(supabase =>
            supabase.from("users").select("*")
          );

        if (error) {
          setDebugInfo(`Supabase fetch error: ${JSON.stringify(error)}`);
        } else {
          setDebugInfo(
            "Supabase user data: " + JSON.stringify(data, null, 2)
          );
        }
      } catch (e: any) {
        setDebugInfo("Code error: " + e.message);
      }

      try {
        await login("billyblun17@gmail.com", "admin123");
        toast({
          title: "Auto-Login Successful",
          description: "Welcome back, Admin!",
        });
        navigate("/");
      } catch (error) {
        console.log("Auto-login failed, showing manual login form");
        toast({
          title: "Auto-Login Failed",
          description: "Please log in manually.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, [login, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back to TVET Kenya!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
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
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            {isLoading ? "Auto-logging in as Admin..." : "Sign in to your TVET Kenya account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
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
          </form>
          <div className="mt-6 text-center text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-200 text-xs text-left rounded text-red-600 whitespace-pre-wrap">
              <div className="font-bold">DEBUG:</div>
              {debugInfo}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
