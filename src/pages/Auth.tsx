import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

type AuthTab = "signin" | "signup" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleAuthSuccess = () => {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
    navigate(from, { replace: true });
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
              Automate Your Lead
              <br />
              Generation Pipeline
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              AI-powered lead acquisition, evaluation, and outreach automation for modern sales teams.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>Intelligent Filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Automated Outreach</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 Competitive AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AuthTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger 
                  value="signin"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger 
                  value="forgot"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Forgot
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="signin" className="mt-0 animate-fade-in">
                  <div className="space-y-6">
                    <div className="text-center lg:text-left">
                      <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                      <p className="text-muted-foreground mt-2">
                        Enter your credentials to access your dashboard
                      </p>
                    </div>
                    <SignInForm onSuccess={handleAuthSuccess} />
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="mt-0 animate-fade-in">
                  <div className="space-y-6">
                    <div className="text-center lg:text-left">
                      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                      <p className="text-muted-foreground mt-2">
                        Get started with AI-powered lead automation
                      </p>
                    </div>
                    <SignUpForm onSuccess={handleAuthSuccess} />
                  </div>
                </TabsContent>

                <TabsContent value="forgot" className="mt-0 animate-fade-in">
                  <div className="space-y-6">
                    <div className="text-center lg:text-left">
                      <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
                      <p className="text-muted-foreground mt-2">
                        We'll help you get back into your account
                      </p>
                    </div>
                    <ForgotPasswordForm />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
