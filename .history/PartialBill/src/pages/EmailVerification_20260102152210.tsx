import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      handleVerify(tokenParam);
    }
  }, [searchParams]);

  const handleVerify = async (verificationToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const result = await response.json();

      if (result.success) {
        setIsVerified(true);
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified. You can now log in.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Email Sent",
          description: "Verification email has been sent to your email address.",
        });
      } else {
        toast({
          title: "Failed to Send",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              {isVerified ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Mail className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="font-display text-2xl">
              {isVerified ? "Email Verified!" : "Verify Your Email"}
            </CardTitle>
            <CardDescription>
              {isVerified
                ? "Your email has been successfully verified."
                : "Check your email for the verification link or enter your email to resend."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerified ? (
              <Button onClick={() => navigate('/patient/login')} className="w-full">
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button onClick={handleResend} className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Resend Verification Email"}
                </Button>
              </>
            )}

            <div className="text-center">
              <button
                onClick={() => navigate('/patient/login')}
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default EmailVerification;