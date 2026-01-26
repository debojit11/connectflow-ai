import { useState, useEffect, useCallback, useRef } from "react";
import { pipelineApi } from "@/lib/api";

type StepStatus = "pending" | "running" | "completed";

export interface PipelineStatus {
  jobType: "acquisition" | "evaluation" | "message_generation" | null;
  status: "pending" | "running" | "completed" | "failed" | null;
  steps: Array<{
    name: string;
    status: StepStatus;
  }>;
}

interface UsePipelinePollingOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

// Derive steps from jobType and status (backend doesn't return steps)
function deriveSteps(
  jobType: PipelineStatus["jobType"],
  status: PipelineStatus["status"]
): Array<{ name: string; status: StepStatus }> {
  const steps: Array<{ name: string; status: StepStatus }> = [
    { name: "Scraping", status: "pending" },
    { name: "AI Evaluation", status: "pending" },
    { name: "Message Generation", status: "pending" },
    { name: "Ready for Review", status: "pending" },
  ];

  if (!jobType || !status) {
    return steps;
  }

  const stepStatus: StepStatus = status === "running" ? "running" : status === "completed" ? "completed" : "pending";

  if (jobType === "acquisition") {
    steps[0].status = stepStatus;
  } else if (jobType === "evaluation") {
    steps[0].status = "completed";
    steps[1].status = stepStatus;
  } else if (jobType === "message_generation") {
    steps[0].status = "completed";
    steps[1].status = "completed";
    steps[2].status = stepStatus;
    if (status === "completed") {
      steps[3].status = "completed";
    }
  }

  return steps;
}

export function usePipelinePolling(options: UsePipelinePollingOptions = {}) {
  const { pollingInterval = 60000, enabled = true } = options;
  
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    jobType: null,
    status: null,
    steps: deriveSteps(null, null),
  });
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine if polling should stop
  const shouldStopPolling = useCallback((jobType: PipelineStatus["jobType"], jobStatus: PipelineStatus["status"]): boolean => {
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
        const { jobType, status } = response.data;
        const derivedSteps = deriveSteps(jobType, status);
        
        setPipelineStatus({
          jobType,
          status,
          steps: derivedSteps,
        });
        
        // Check if we should stop polling
        if (shouldStopPolling(jobType, status)) {
          stopPolling();
        }
        
        return { jobType, status, steps: derivedSteps };
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
