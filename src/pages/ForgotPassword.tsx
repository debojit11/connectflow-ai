import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authApi } from "@/lib/api";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.requestPasswordReset(email);
      
      // Check for network/server errors (status 0 means network error, 5xx means server error)
      if (response.status === 0 || response.status >= 500) {
        setError("Something went wrong. Please try again.");
        return;
      }
      
      // Always show success for security (don't reveal if email exists)
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Competitive AI</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Secure Password
              <br />
              Recovery
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              We'll send you a secure link to reset your password via email.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 Competitive AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-6">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Competitive AI</span>
            </div>

            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
                <p className="text-muted-foreground mt-2">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {submitted ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-primary/20">
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Check your email</p>
                        <p className="text-sm text-muted-foreground">
                          If this email exists, a reset link has been sent. Please check your inbox.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setEmail("");
                      }}
                      className="w-full h-11"
                    >
                      Try another email
                    </Button>
                    <Link to="/auth" className="block">
                      <Button variant="ghost" className="w-full h-11">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        className="pl-10 bg-input border-border h-11"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>

                  <Link to="/auth" className="block">
                    <Button variant="ghost" className="w-full h-11">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to login
                    </Button>
                  </Link>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
