import { useState } from "react";
import { User, Lock, LogOut, Mail, Building, Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [accountInfo, setAccountInfo] = useState({
    name: "John Doe",
    email: "john@company.com",
    company: "Competitive AI",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      // TODO: Add PUT /user/update-profile endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your account information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendResetLink = async () => {
    setIsSendingResetLink(true);
    
    try {
      await authApi.requestPasswordReset(accountInfo.email);
      
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
    } catch {
      toast({
        title: "Request sent",
        description: "If this email exists, a reset link has been sent.",
      });
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      
      // Redirect to auth
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl bg-card border border-border p-6 glow-effect animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Account Information</h2>
          </div>

          <form onSubmit={handleAccountUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={accountInfo.name}
                  onChange={(e) => setAccountInfo({ ...accountInfo, name: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={accountInfo.email}
                  onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={accountInfo.company}
                  onChange={(e) => setAccountInfo({ ...accountInfo, company: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isUpdatingProfile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </div>

        {/* Password Reset via Email */}
        <div
          className="rounded-2xl bg-card border border-border p-6 glow-effect animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Password</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For security reasons, password changes are handled via email verification. 
              Click the button below to receive a secure reset link.
            </p>

            <Button 
              onClick={handleSendResetLink}
              disabled={isSendingResetLink}
              variant="outline"
              className="border-border"
            >
              {isSendingResetLink ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div
          className="rounded-2xl bg-card border border-border p-6 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Logout</h2>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
