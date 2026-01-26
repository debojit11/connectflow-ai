import { useState, useEffect, useCallback, useRef } from "react";
import { pipelineApi } from "@/lib/api";

export interface PipelineStatus {
  jobType: "acquisition" | "evaluation" | "message_generation" | null;
  status: "pending" | "running" | "completed" | "failed" | null;
  steps: Array<{
    name: string;
    status: "pending" | "running" | "completed";
  }>;
}

interface UsePipelinePollingOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

export function usePipelinePolling(options: UsePipelinePollingOptions = {}) {
  const { pollingInterval = 60000, enabled = true } = options;
  
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    jobType: null,
    status: null,
    steps: [
      { name: "Scraping", status: "pending" },
      { name: "AI Evaluation", status: "pending" },
      { name: "Message Generation", status: "pending" },
      { name: "Ready for Review", status: "pending" },
    ],
  });
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine if polling should stop
  const shouldStopPolling = useCallback((status: PipelineStatus): boolean => {
    const { jobType, status: jobStatus } = status;
    
    // Stop if message_generation completed or failed
    if (jobType === "message_generation" && (jobStatus === "completed" || jobStatus === "failed")) {
      return true;
    }
    
    // Stop if acquisition or evaluation failed
    if ((jobType === "acquisition" || jobType === "evaluation") && jobStatus === "failed") {
      return true;
    }
    
    return false;
  }, []);

  // Check if pipeline is currently active (running)
  const isPipelineActive = pipelineStatus.status === "running";

  // Fetch pipeline status
  const fetchPipelineStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await pipelineApi.getStatus();
      
      if (response.data) {
        setPipelineStatus(response.data);
        
        // Check if we should stop polling
        if (shouldStopPolling(response.data)) {
          stopPolling();
        }
        
        return response.data;
      }
      
      console.error("Failed to fetch pipeline status:", response.error);
      return null;
    } catch (error) {
      console.error("Failed to fetch pipeline status:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [shouldStopPolling]);

  // Start pipeline
  const startPipeline = useCallback(async () => {
    try {
      const response = await pipelineApi.start();
      
      if (response.error) {
        console.error("Failed to start pipeline:", response.error);
        return false;
      }
      
      // Immediately fetch status after starting
      await fetchPipelineStatus();
      return true;
    } catch (error) {
      console.error("Failed to start pipeline:", error);
      return false;
    }
  }, [fetchPipelineStatus]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsPolling(true);
    intervalRef.current = setInterval(() => {
      fetchPipelineStatus();
    }, pollingInterval);
  }, [fetchPipelineStatus, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Manual refresh
  const refresh = useCallback(async () => {
    return fetchPipelineStatus();
  }, [fetchPipelineStatus]);

  // Auto-start polling when enabled and pipeline is active
  useEffect(() => {
    if (enabled && isPipelineActive && !isPolling) {
      startPolling();
    } else if (!enabled || !isPipelineActive) {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [enabled, isPipelineActive, isPolling, startPolling, stopPolling]);

  // Initial fetch on mount
  useEffect(() => {
    fetchPipelineStatus();
  }, []);

  return {
    pipelineStatus,
    isPipelineActive,
    isPolling,
    isLoading,
    refresh,
    startPipeline,
    startPolling,
    stopPolling,
  };
}
