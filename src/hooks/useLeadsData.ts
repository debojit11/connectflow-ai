import { useState, useCallback, useEffect, useRef } from "react";
import { leadsApi, inviteApi } from "@/lib/api";

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
  const [readyToInviteLeads, setReadyToInviteLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch all leads
  const fetchAllLeads = useCallback(async () => {
    try {
      const response = await leadsApi.getAll();
      
      if (response.data) {
        setAllLeads(response.data as Lead[]);
        return response.data as Lead[];
      }
      
      console.error("Failed to fetch all leads:", response.error);
      return [];
    } catch (error) {
      console.error("Failed to fetch all leads:", error);
      return [];
    }
  }, []);

  // Fetch approved leads
  const fetchApprovedLeads = useCallback(async () => {
    try {
      const response = await leadsApi.getApproved();
      
      if (response.data) {
        setApprovedLeads(response.data as Lead[]);
        return response.data as Lead[];
      }
      
      console.error("Failed to fetch approved leads:", response.error);
      return [];
    } catch (error) {
      console.error("Failed to fetch approved leads:", error);
      return [];
    }
  }, []);

  // Fetch ready to invite leads
  const fetchReadyToInviteLeads = useCallback(async () => {
    try {
      const response = await leadsApi.getReady();
      
      if (response.data) {
        setReadyToInviteLeads(response.data as Lead[]);
        return response.data as Lead[];
      }
      
      console.error("Failed to fetch ready leads:", response.error);
      return [];
    } catch (error) {
      console.error("Failed to fetch ready leads:", error);
      return [];
    }
  }, []);

  // Check if any row is currently sending
  const hasRowSending = readyToInviteLeads.some((lead) => lead.connectionStatus === "sending");

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAllLeads(), fetchApprovedLeads(), fetchReadyToInviteLeads()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllLeads, fetchApprovedLeads, fetchReadyToInviteLeads]);

  // Send invite
  const sendInvite = useCallback(async (leadId: string, editedMessage: string) => {
    // Always attempt to send - backend handles all validation
    console.log("Sending invite:", { leadId, editedMessage });
    
    setIsSendingInvite(true);
    
    // Update local state to "sending" for the specific lead
    setReadyToInviteLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, connectionStatus: "sending" } : l
      )
    );

    try {
      const response = await inviteApi.send(leadId, editedMessage);
      
      if (response.error) {
        console.error("Failed to send invite:", response.error);
        // Revert status on error
        setReadyToInviteLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, connectionStatus: "not_sent" } : l
          )
        );
        return false;
      }
      
      // After success, refresh the ready to invite data
      await fetchReadyToInviteLeads();
      
      return true;
    } catch (error) {
      console.error("Failed to send invite:", error);
      // Revert status on error
      setReadyToInviteLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, connectionStatus: "not_sent" } : l
        )
      );
      return false;
    } finally {
      setIsSendingInvite(false);
    }
  }, [readyToInviteLeads, fetchReadyToInviteLeads]);

  // Update message
  const updateMessage = useCallback((leadId: string, message: string) => {
    setReadyToInviteLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, personalizedMessage: message } : l
      )
    );
  }, []);

  // Polling effect - only when pipeline is active
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
