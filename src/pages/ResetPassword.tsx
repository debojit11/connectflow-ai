import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, ArrowLeft, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authApi } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Redirect to login after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validateForm = (): boolean => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    if (!token) return;

    setIsLoading(true);

    try {
      const response = await authApi.confirmPasswordReset(token, newPassword);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalidToken = !token;

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
              Create New
              <br />
              Password
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Choose a strong password to secure your account.
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

            {isInvalidToken ? (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl font-bold text-foreground">Invalid reset link</h1>
                </div>

                <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-destructive/20">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Invalid or expired link</p>
                      <p className="text-sm text-muted-foreground">
                        This password reset link is invalid or has expired. 
                        Please request a new one.
                      </p>
                    </div>
                  </div>
                </div>

                <Link to="/forgot-password" className="block">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Request new reset link
                  </Button>
                </Link>

                <Link to="/auth" className="block">
                  <Button variant="ghost" className="w-full h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl font-bold text-foreground">Password reset successful</h1>
                </div>

                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/20">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">All done!</p>
                      <p className="text-sm text-muted-foreground">
                        Your password has been successfully reset. 
                        Redirecting you to login...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl font-bold text-foreground">Create new password</h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">New password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (validationErrors.newPassword) {
                            setValidationErrors((prev) => ({ ...prev, newPassword: undefined }));
                          }
                        }}
                        className={`pl-10 bg-input border-border h-11 ${
                          validationErrors.newPassword ? "border-destructive" : ""
                        }`}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-sm text-destructive">{validationErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (validationErrors.confirmPassword) {
                            setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                          }
                        }}
                        className={`pl-10 bg-input border-border h-11 ${
                          validationErrors.confirmPassword ? "border-destructive" : ""
                        }`}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      "Reset password"
                    )}
                  </Button>

                  <Link to="/auth" className="block">
                    <Button variant="ghost" className="w-full h-11">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to login
                    </Button>
                  </Link>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
