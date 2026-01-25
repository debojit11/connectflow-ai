import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DynamicTable } from "@/components/leads/DynamicTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Sample data - in production this would come from backend API
const allLeadsData = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Chen",
    company: "TechVentures Inc",
    title: "VP of Engineering",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    location: "San Francisco, CA",
    industry: "Technology",
    connectionDegree: "2nd",
    aiStatus: "Approved",
    score: 92,
    scrapedAt: "2024-01-15",
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Roberts",
    company: "Growth Partners",
    title: "CEO",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    location: "New York, NY",
    industry: "Consulting",
    connectionDegree: "3rd",
    aiStatus: "Pending",
    score: 78,
    scrapedAt: "2024-01-15",
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Johnson",
    company: "DataFlow Systems",
    title: "Head of Sales",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    location: "Austin, TX",
    industry: "SaaS",
    connectionDegree: "2nd",
    aiStatus: "Rejected",
    score: 45,
    scrapedAt: "2024-01-14",
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    company: "Innovate Labs",
    title: "CTO",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    location: "Seattle, WA",
    industry: "AI/ML",
    connectionDegree: "2nd",
    aiStatus: "Approved",
    score: 88,
    scrapedAt: "2024-01-14",
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Wang",
    company: "CloudScale",
    title: "Director of Engineering",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    location: "Boston, MA",
    industry: "Cloud Computing",
    connectionDegree: "3rd",
    aiStatus: "Approved",
    score: 85,
    scrapedAt: "2024-01-13",
  },
];

const approvedLeadsData = allLeadsData.filter((lead) => lead.aiStatus === "Approved");

const readyToInviteData = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Chen",
    company: "TechVentures Inc",
    title: "VP of Engineering",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    personalizedMessage: "Hi Sarah, I noticed your impressive work at TechVentures and would love to connect about AI automation solutions.",
    messageStatus: "waiting_for_review",
    connectionSent: false,
    score: 92,
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    company: "Innovate Labs",
    title: "CTO",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    personalizedMessage: "Hi David, as a fellow tech leader, I thought you might be interested in our AI-powered lead automation platform.",
    messageStatus: "sent",
    connectionSent: true,
    score: 88,
  },
  {
    id: "5",
    firstName: "Lisa",
    lastName: "Wang",
    company: "CloudScale",
    title: "Director of Engineering",
    linkedinProfileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    personalizedMessage: "Hi Lisa, I came across your profile and was impressed by CloudScale's growth. Would love to discuss how we can help scale your outreach.",
    messageStatus: "waiting_for_review",
    connectionSent: false,
    score: 85,
  },
];

export default function Leads() {
  const [activeTab, setActiveTab] = useState("all");

  const handleSendInvite = async (row: Record<string, unknown>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Sent invite to:", row);
  };

  const handleMessageUpdate = (rowId: string, message: string) => {
    console.log("Updated message for row:", rowId, message);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and review your scraped leads</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              All Leads
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {allLeadsData.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              Approved
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {approvedLeadsData.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="ready"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              Ready to Invite
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {readyToInviteData.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="animate-fade-in">
            <DynamicTable data={allLeadsData} />
          </TabsContent>

          <TabsContent value="approved" className="animate-fade-in">
            <DynamicTable data={approvedLeadsData} />
          </TabsContent>

          <TabsContent value="ready" className="animate-fade-in">
            <DynamicTable
              data={readyToInviteData}
              onSendInvite={handleSendInvite}
              onMessageUpdate={handleMessageUpdate}
              showSendAction
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
