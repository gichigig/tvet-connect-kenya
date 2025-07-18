import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [admission, setAdmission] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [foundEmail, setFoundEmail] = useState("");
  const { toast } = useToast();

  const handleSearchEmail = async () => {
    setIsLoading(true);
    setUserFound(false);
    setFoundEmail("");
    const { findUserByEmailOrAdmission } = await import("@/integrations/firebase/findUserByEmailOrAdmission");
    const found = await findUserByEmailOrAdmission({ email });
    if (found && (found as any).email) {
      setUserFound(true);
      setFoundEmail((found as any).email);
      toast({
        title: "User Found",
        description: `User with email '${email}' found. You can now send a reset link.`,
      });
    } else {
      toast({
        title: "User Not Found",
        description: "No user found with that email.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSearchAdmission = async () => {
    setIsLoading(true);
    setUserFound(false);
    setFoundEmail("");
    const { findUserByEmailOrAdmission } = await import("@/integrations/firebase/findUserByEmailOrAdmission");
    const found = await findUserByEmailOrAdmission({ admission });
    if (found && (found as any).email) {
      setUserFound(true);
      setFoundEmail((found as any).email);
      toast({
        title: "User Found",
        description: `User with admission number '${admission}' found. You can now send a reset link.`,
      });
    } else {
      toast({
        title: "User Not Found",
        description: "No user found with that admission number.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFound || !foundEmail) return;
    setIsLoading(true);
    // TODO: Send password reset email to foundEmail
    setTimeout(() => {
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${foundEmail}, you will receive an email with instructions.`,
      });
      setIsLoading(false);
      setUserFound(false);
      setFoundEmail("");
      setEmail("");
      setAdmission("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="button" onClick={handleSearchEmail} disabled={isLoading || !email}>
                Search
              </Button>
            </div>
            <div className="space-y-2 flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="admission">Admission Number</Label>
                <Input
                  id="admission"
                  type="text"
                  placeholder="Enter your admission number"
                  value={admission}
                  onChange={(e) => setAdmission(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="button" onClick={handleSearchAdmission} disabled={isLoading || !admission}>
                Search
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !userFound}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
