import { format, parseISO } from "date-fns";
import { Calendar, Clock, Repeat, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Schedule } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SchedulesListProps {
  schedules: Schedule[];
  isLoading: boolean;
  isDeleting: string | null;
  onDelete: (scheduleId: string) => void;
}

function parseCronToHuman(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts;

  const timeStr = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  const time12h = format(new Date(`2000-01-01T${timeStr}`), "h:mm a");

  // Every day
  if (dayOfMonth === "*" && dayOfWeek === "*") {
    return `Every day at ${time12h}`;
  }

  // Weekdays
  if (dayOfWeek === "1-5") {
    return `Every weekday at ${time12h}`;
  }

  // Every Monday
  if (dayOfWeek === "1" && dayOfMonth === "*") {
    return `Every Monday at ${time12h}`;
  }

  // Every X days
  if (dayOfMonth.startsWith("*/")) {
    const interval = dayOfMonth.replace("*/", "");
    return `Every ${interval} days at ${time12h}`;
  }

  // Specific weekdays
  const weekdayMap: Record<string, string> = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
  };

  if (dayOfWeek in weekdayMap) {
    return `Every ${weekdayMap[dayOfWeek]} at ${time12h}`;
  }

  return `Cron: ${cron}`;
}

function ScheduleItem({ 
  schedule, 
  isDeleting, 
  onDelete 
}: { 
  schedule: Schedule; 
  isDeleting: boolean; 
  onDelete: () => void;
}) {
  const isOneTime = schedule.type === "one_time";
  const Icon = isOneTime ? Calendar : Repeat;

  let summary = "";
  let nextRunDisplay = "";

  if (isOneTime && schedule.run_at) {
    const runDate = parseISO(schedule.run_at);
    summary = format(runDate, "MMMM d, yyyy 'at' h:mm a");
  } else if (schedule.cron_expression) {
    summary = parseCronToHuman(schedule.cron_expression);
  }

  if (schedule.next_run) {
    const nextRun = parseISO(schedule.next_run);
    nextRunDisplay = format(nextRun, "MMM d, h:mm a");
  }

  return (
    <div className="flex items-start justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          isOneTime ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              isOneTime ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
            )}>
              {isOneTime ? "One-Time" : "Recurring"}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground mt-1 truncate">{summary}</p>
          {!isOneTime && nextRunDisplay && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Next: {nextRunDisplay}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={isDeleting}
        className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export function SchedulesList({ schedules, isLoading, isDeleting, onDelete }: SchedulesListProps) {
  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center">
        <Calendar className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No upcoming scheduled runs.</p>
        <p className="text-muted-foreground text-xs mt-1">
          Click "Schedule Recurring" to create one.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-48">
      <div className="space-y-2 pr-4">
        {schedules.map((schedule) => (
          <ScheduleItem
            key={schedule.id}
            schedule={schedule}
            isDeleting={isDeleting === schedule.id}
            onDelete={() => onDelete(schedule.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
