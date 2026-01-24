import { useState } from "react";
import { User, Lock, LogOut, Mail, Building } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
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

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating account:", accountInfo);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Resetting password");
  };

  const handleLogout = () => {
    console.log("Logging out...");
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

            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
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

            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Update Password
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
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
