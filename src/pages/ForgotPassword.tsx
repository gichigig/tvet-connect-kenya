import { useState, useEffect } from "react";
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { firebaseApp } from "@/integrations/firebase/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [admission, setAdmission] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [foundEmail, setFoundEmail] = useState("");
  const [authUserExists, setAuthUserExists] = useState(false);
  const { toast } = useToast();

  // Auto-search with debounce when user types
  useEffect(() => {
    const searchUser = async () => {
      if (!email && !admission) {
        setUserFound(false);
        setFoundEmail("");
        setAuthUserExists(false);
        return;
      }

      setIsSearching(true);
      setUserFound(false);
      setFoundEmail("");
      setAuthUserExists(false);
      
      try {
        // First search in database
        const { findUserByEmailOrAdmission } = await import("@/integrations/firebase/findUserByEmailOrAdmission");
        const found = await findUserByEmailOrAdmission({ 
          email: email || undefined, 
          admission: admission || undefined 
        });
        
        if (found && (found as any).email) {
          setUserFound(true);
          setFoundEmail((found as any).email);
          
          // Check if user exists in Firebase Auth
          try {
            const auth = getAuth(firebaseApp);
            const signInMethods = await fetchSignInMethodsForEmail(auth, (found as any).email);
            
            if (signInMethods.length > 0) {
              setAuthUserExists(true);
            } else {
              // User exists in database but not in Firebase Auth - create it automatically
              console.log('User found in database but not in Firebase Auth - creating account automatically');

              const { createAuthAccountForUser } = await import("@/integrations/firebase/authHelper");
              const result = await createAuthAccountForUser((found as any).email);
              
              if (result.success) {
                setAuthUserExists(true);
                toast({
                  title: "Account Ready",
                  description: `User found! Authentication account automatically created and password reset email sent to ${(found as any).email}`,
                });
              } else {
                toast({
                  title: "Setup Failed",
                  description: result.message,
                  variant: "destructive"
                });
              }
            }
          } catch (authError) {
            console.error('Error with Firebase Auth setup:', authError);
            toast({
              title: "Authentication Error",
              description: "Unable to verify or create authentication account.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "User Not Found",
            description: `No user found with the provided ${email ? 'email' : 'admission number'}.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "An error occurred while searching for the user.",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUser, 1000); // Increased to 1 second to allow for auto-creation
    return () => clearTimeout(timeoutId);
  }, [email, admission, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFound || !foundEmail) return;
    setIsLoading(true);
    
    console.log('🔍 Password Reset Debug Info:');
    console.log('- Found Email:', foundEmail);
    console.log('- Auth Domain:', getAuth(firebaseApp).app.options.authDomain);
    console.log('- Project ID:', getAuth(firebaseApp).app.options.projectId);
    console.log('- Current URL:', window.location.origin);
    
    try {
      const auth = getAuth(firebaseApp);
      
      // Double-check user exists before sending
      const signInMethods = await fetchSignInMethodsForEmail(auth, foundEmail);
      console.log('- User Auth Methods:', signInMethods);
      
      if (signInMethods.length === 0) {
        throw new Error('User does not exist in Firebase Auth - this should not happen after auto-creation');
      }
      
      await sendPasswordResetEmail(auth, foundEmail, {
        url: `${window.location.origin}/login`, // Redirect back to login after reset
        handleCodeInApp: false,
        // Add more specific configuration if needed
      });
      
      console.log('✅ Password reset email sent successfully');
      
      toast({
        title: "Password Reset Email Sent",
        description: `Password reset instructions have been sent to ${foundEmail}. Please check your email (including spam folder). If not received within 5 minutes, contact support.`,
      });
      setUserFound(false);
      setFoundEmail("");
      setEmail("");
      setAdmission("");
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = "Failed to send reset email.";
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = "This email is not registered in the authentication system. Please contact admin for assistance.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many reset attempts. Please try again later.";
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact admin.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Email sending is not authorized for this domain. Please contact admin.";
      } else if (err.code === 'auth/invalid-action-code') {
        errorMessage = "Invalid reset configuration. Please contact admin.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email or admission number to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value) setAdmission(""); // Clear admission when typing email
                }}
                disabled={isLoading || isSearching}
              />
              {isSearching && email && (
                <p className="text-sm text-gray-500">Searching...</p>
              )}
            </div>
            
            <div className="text-center text-sm text-gray-500">
              OR
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admission">Admission Number</Label>
              <Input
                id="admission"
                type="text"
                placeholder="Enter your admission number"
                value={admission}
                onChange={(e) => {
                  setAdmission(e.target.value);
                  if (e.target.value) setEmail(""); // Clear email when typing admission
                }}
                disabled={isLoading || isSearching}
              />
              {isSearching && admission && (
                <p className="text-sm text-gray-500">Searching...</p>
              )}
            </div>

            {isSearching && (email || admission) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  🔍 Searching for user and automatically setting up authentication if needed...
                </p>
              </div>
            )}

            {userFound && foundEmail && authUserExists && !isSearching && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✅ Ready! Password reset email can be sent to: <strong>{foundEmail}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Note: If this user didn't have authentication before, it was automatically set up
                </p>
              </div>
            )}

            {!userFound && (email || admission) && !isSearching && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  ❌ No user found with the provided {email ? 'email' : 'admission number'}
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !userFound || isSearching || !authUserExists}
            >
              {isLoading 
                ? "Sending Reset Email..." 
                : isSearching 
                  ? "Searching & Setting Up..." 
                  : "Send Password Reset Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
