import { useState, useCallback, useEffect, useRef } from "react";

export interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  linkedinProfileImageUrl?: string;
  location?: string;
  industry?: string;
  connectionDegree?: string;
  aiStatus?: string;
  score?: number;
  scrapedAt?: string;
  personalizedMessage?: string;
  connectionStatus?: string;
  connectionSent?: boolean | null;
  [key: string]: unknown;
}

interface UseLeadsDataOptions {
  pollingInterval?: number;
  isPipelineActive?: boolean;
}

export function useLeadsData(options: UseLeadsDataOptions = {}) {
  const { pollingInterval = 120000, isPipelineActive = false } = options;
  
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [approvedLeads, setApprovedLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch all leads
  const fetchAllLeads = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/leads/all");
      // const data = await response.json();
      
      // Mock data
      const mockData: Lead[] = [
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
      
      setAllLeads(mockData);
      return mockData;
    } catch (error) {
      console.error("Failed to fetch all leads:", error);
      return [];
    }
  }, []);

  // Fetch approved leads
  const fetchApprovedLeads = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/leads/approved");
      // const data = await response.json();
      
      // Mock data - approved leads with connection data
      const mockData: Lead[] = [
        {
          id: "1",
          firstName: "Sarah",
          lastName: "Chen",
          company: "TechVentures Inc",
          title: "VP of Engineering",
          linkedinProfileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          personalizedMessage: "Hi Sarah, I noticed your impressive work at TechVentures and would love to connect about AI automation solutions.",
          connectionStatus: "waiting_for_review",
          connectionSent: null,
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
          connectionStatus: "sent",
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
          connectionStatus: "waiting_for_review",
          connectionSent: null,
          score: 85,
        },
      ];
      
      setApprovedLeads(mockData);
      return mockData;
    } catch (error) {
      console.error("Failed to fetch approved leads:", error);
      return [];
    }
  }, []);

  // Filter ready to invite from approved leads
  const readyToInviteLeads = approvedLeads.filter(
    (lead) => lead.connectionSent === null && lead.connectionStatus === "waiting_for_review"
  );

  // Check if any row is currently sending
  const hasRowSending = approvedLeads.some((lead) => lead.connectionStatus === "sending");

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAllLeads(), fetchApprovedLeads()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllLeads, fetchApprovedLeads]);

  // Send invite
  const sendInvite = useCallback(async (leadId: string) => {
    // Find the lead and check status
    const lead = approvedLeads.find((l) => l.id === leadId);
    if (!lead || lead.connectionStatus !== "waiting_for_review") {
      return false;
    }

    setIsSendingInvite(true);
    
    // Update local state to "sending" for all sends (disable all buttons)
    setApprovedLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, connectionStatus: "sending" } : l
      )
    );

    try {
      // TODO: Replace with actual API call
      // await fetch("/invite/send", {
      //   method: "POST",
      //   body: JSON.stringify({ leadId }),
      // });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // After success, refresh the data
      await fetchApprovedLeads();
      
      return true;
    } catch (error) {
      console.error("Failed to send invite:", error);
      // Revert status on error
      setApprovedLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, connectionStatus: "not_sent" } : l
        )
      );
      return false;
    } finally {
      setIsSendingInvite(false);
    }
  }, [approvedLeads, fetchApprovedLeads]);

  // Update message
  const updateMessage = useCallback((leadId: string, message: string) => {
    setApprovedLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, personalizedMessage: message } : l
      )
    );
  }, []);

  // Polling effect
  useEffect(() => {
    if (isPipelineActive) {
      intervalRef.current = setInterval(() => {
        refreshAll();
      }, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPipelineActive, pollingInterval, refreshAll]);

  // Initial fetch
  useEffect(() => {
    refreshAll();
  }, []);

  return {
    allLeads,
    approvedLeads,
    readyToInviteLeads,
    isLoading,
    isSendingInvite,
    hasRowSending,
    refreshAll,
    sendInvite,
    updateMessage,
  };
}
