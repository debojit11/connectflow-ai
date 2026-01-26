import { useState, useEffect, useCallback, useRef } from "react";

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
      { name: "Scraping", status: "completed" },
      { name: "AI Evaluation", status: "completed" },
      { name: "Message Generation", status: "running" },
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
      // TODO: Replace with actual API call
      // const response = await fetch("/pipeline/status");
      // const data = await response.json();
      
      // Mock response for now
      const mockData: PipelineStatus = {
        jobType: "message_generation",
        status: "running",
        steps: [
          { name: "Scraping", status: "completed" },
          { name: "AI Evaluation", status: "completed" },
          { name: "Message Generation", status: "running" },
          { name: "Ready for Review", status: "pending" },
        ],
      };
      
      setPipelineStatus(mockData);
      
      // Check if we should stop polling
      if (shouldStopPolling(mockData)) {
        stopPolling();
      }
      
      return mockData;
    } catch (error) {
      console.error("Failed to fetch pipeline status:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [shouldStopPolling]);

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

  return {
    pipelineStatus,
    isPipelineActive,
    isPolling,
    isLoading,
    refresh,
    startPolling,
    stopPolling,
  };
}
