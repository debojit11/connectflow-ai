import { useState, useCallback, useEffect } from "react";
import { dashboardApi } from "@/lib/api";

export interface DashboardStats {
  totalLeadsGenerated: number;
  aiApprovedLeads: number;
  invitesSent: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeadsGenerated: 0,
    aiApprovedLeads: 0,
    invitesSent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getStats();
      
      if (response.data) {
        const mappedStats: DashboardStats = {
          totalLeadsGenerated: response.data.totalLeads,
          aiApprovedLeads: response.data.approvedLeads,
          invitesSent: response.data.invitesSent,
        };
        setStats(mappedStats);
        return mappedStats;
      }
      
      console.error("Failed to fetch dashboard stats:", response.error);
      return null;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refresh: fetchStats,
  };
}
