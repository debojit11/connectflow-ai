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
  const [draftMessages, setDraftMessages] = useState<Record<string, string>>({});
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

  // Send invite - uses draft message if available, otherwise falls back to original
  const sendInvite = useCallback(async (leadId: string, originalMessage: string) => {
    // Use draft if exists, otherwise use original message from row
    const messageToSend = draftMessages[leadId] ?? originalMessage;
    
    console.log("Sending invite:", { leadId, messageToSend, isDraft: leadId in draftMessages });
    
    setIsSendingInvite(true);
    
    // Update local state to "sending" for the specific lead
    setReadyToInviteLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, connectionStatus: "sending" } : l
      )
    );

    try {
      const response = await inviteApi.send(leadId, messageToSend);
      
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
      
      // Clear draft after successful send
      setDraftMessages((prev) => {
        const updated = { ...prev };
        delete updated[leadId];
        return updated;
      });
      
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
  }, [draftMessages, fetchReadyToInviteLeads]);

  // Update draft message - does NOT mutate readyToInviteLeads
  const updateDraftMessage = useCallback((leadId: string, message: string) => {
    setDraftMessages((prev) => ({
      ...prev,
      [leadId]: message,
    }));
  }, []);

  // Get display message - returns draft if exists, otherwise original
  const getDisplayMessage = useCallback((leadId: string, originalMessage: string): string => {
    return draftMessages[leadId] ?? originalMessage;
  }, [draftMessages]);

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
    draftMessages,
    refreshAll,
    sendInvite,
    updateDraftMessage,
    getDisplayMessage,
  };
}
