import { useState } from "react";
import { User, Lock, LogOut, Mail, Building, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [accountInfo, setAccountInfo] = useState({
    name: "John Doe",
    email: "john@company.com",
    company: "Competitive AI",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch("/user/update-profile", {
      //   method: "PUT",
      //   body: JSON.stringify(accountInfo),
      // });
      
      // Simulate API delay
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch("/user/reset-password", {
      //   method: "PUT",
      //   body: JSON.stringify({
      //     currentPassword: passwordForm.currentPassword,
      //     newPassword: passwordForm.newPassword,
      //   }),
      // });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear token from localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      
      // Simulate logout delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      
      // Redirect to login (or home for now)
      navigate("/");
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

        {/* Reset Password */}
        <div
          className="rounded-2xl bg-card border border-border p-6 glow-effect animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Reset Password</h2>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isResettingPassword}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
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
