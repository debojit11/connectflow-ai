import { useState, useCallback, useEffect } from "react";

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
      // TODO: Replace with actual API call
      // const response = await fetch("/dashboard/stats");
      // const data = await response.json();
      // invitesSent = count where connectionSent = 1
      
      // Mock data
      const mockStats: DashboardStats = {
        totalLeadsGenerated: 12847,
        aiApprovedLeads: 8432,
        invitesSent: 3256,
      };
      
      setStats(mockStats);
      return mockStats;
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
