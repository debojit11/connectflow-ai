import { useState } from "react";
import { Play, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleModal } from "./ScheduleModal";
import { SchedulesList } from "./SchedulesList";
import { cn } from "@/lib/utils";
import { Schedule } from "@/lib/api";

interface AutomationCardProps {
  disabled?: boolean;
  onStartPipeline?: () => Promise<boolean>;
  schedules: Schedule[];
  isLoadingSchedules: boolean;
  isDeletingSchedule: string | null;
  isCreatingSchedule: boolean;
  onCreateSchedule: (data: { type: "one_time"; runAt: string } | { type: "recurring"; cron: string }) => Promise<boolean>;
  onDeleteSchedule: (scheduleId: string) => void;
}

export function AutomationCard({ 
  disabled = false, 
  onStartPipeline,
  schedules,
  isLoadingSchedules,
  isDeletingSchedule,
  isCreatingSchedule,
  onCreateSchedule,
  onDeleteSchedule,
}: AutomationCardProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartNow = async () => {
    if (!onStartPipeline) return;
    
    setIsStarting(true);
    try {
      await onStartPipeline();
    } finally {
      setIsStarting(false);
    }
  };

  const isDisabled = disabled || isStarting;

  return (
    <>
      <div className="rounded-2xl bg-card border border-border p-6 glow-effect">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Run Automation
        </h3>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleStartNow}
            disabled={isDisabled}
            className={cn(
              "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Now
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
            disabled={isDisabled}
            className={cn(
              "gap-2 border-border hover:bg-accent hover:text-accent-foreground",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Calendar className="w-4 h-4" />
            Schedule Recurring
          </Button>
        </div>

        {disabled && (
          <p className="text-sm text-muted-foreground mt-3">
            Pipeline is currently running. Please wait for it to complete.
          </p>
        )}

        {/* Scheduled Runs Section */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Scheduled Runs</h4>
          <SchedulesList
            schedules={schedules}
            isLoading={isLoadingSchedules}
            isDeleting={isDeletingSchedule}
            onDelete={onDeleteSchedule}
          />
        </div>
      </div>

      <ScheduleModal
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onSchedule={onCreateSchedule}
        isCreating={isCreatingSchedule}
      />
    </>
  );
}
