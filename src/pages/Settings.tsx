import { useState, useEffect } from "react";
import { User, Lock, LogOut, Mail, Building, Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [accountInfo, setAccountInfo] = useState({
    fullName: "",
    email: "",
    company: "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getProfile();
        
        if (response.status === 401) {
          navigate("/auth");
          return;
        }
        
        if (response.data) {
          setAccountInfo({
            fullName: response.data.fullName || "",
            email: response.data.email || "",
            company: response.data.company || "",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      const response = await userApi.updateProfile({
        fullName: accountInfo.fullName,
        company: accountInfo.company,
      });
      
      if (response.status === 401) {
        navigate("/auth");
        return;
      }
      
      if (response.error) {
        toast({
          title: "Update Failed",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your account information has been saved.",
      });
    } catch {
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
      const response = await userApi.sendResetLink();
      
      if (response.status === 401) {
        navigate("/auth");
        return;
      }
      
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
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      
      navigate("/auth");
    } catch {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

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
              <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={accountInfo.fullName}
                  onChange={(e) => setAccountInfo({ ...accountInfo, fullName: e.target.value })}
                  className="pl-10 bg-input border-border"
                  placeholder="Enter your full name"
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
                  className="pl-10 bg-input border-border opacity-60 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                  placeholder="Enter your company name"
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
