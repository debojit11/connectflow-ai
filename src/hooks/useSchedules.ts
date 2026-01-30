import { useState, useCallback, useEffect } from "react";
import { scheduleApi, Schedule } from "@/lib/api";
import { toast } from "sonner";

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await scheduleApi.list();
      if (response.error) {
        console.error("Failed to fetch schedules:", response.error);
        return;
      }
      // Filter to only show active and future schedules
      const now = new Date();
      const activeSchedules = (response.data || []).filter((schedule) => {
        if (!schedule.active) return false;
        
        // For one-time schedules, check if run_at is in the future
        if (schedule.type === "one_time" && schedule.run_at) {
          return new Date(schedule.run_at) > now;
        }
        
        // Recurring schedules are always shown if active
        return true;
      });
      
      setSchedules(activeSchedules);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (data: { 
    type: "one_time" | "recurring"; 
    cron_expression?: string; 
    run_at?: string 
  }) => {
    setIsCreating(true);
    try {
      const response = await scheduleApi.create(data);
      if (response.error) {
        toast.error("Failed to create schedule", {
          description: response.error,
        });
        return false;
      }
      
      toast.success("Schedule created", {
        description: data.type === "one_time" 
          ? "Your one-time schedule has been set" 
          : "Your recurring schedule has been set",
      });
      
      // Refresh the list
      await fetchSchedules();
      return true;
    } catch (error) {
      console.error("Failed to create schedule:", error);
      toast.error("Failed to create schedule");
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [fetchSchedules]);

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    setIsDeleting(scheduleId);
    try {
      const response = await scheduleApi.delete(scheduleId);
      if (response.error) {
        toast.error("Failed to delete schedule", {
          description: response.error,
        });
        return false;
      }
      
      toast.success("Schedule deleted");
      
      // Refresh the list
      await fetchSchedules();
      return true;
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      toast.error("Failed to delete schedule");
      return false;
    } finally {
      setIsDeleting(null);
    }
  }, [fetchSchedules]);

  // Fetch on mount
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    isLoading,
    isCreating,
    isDeleting,
    fetchSchedules,
    createSchedule,
    deleteSchedule,
  };
}
