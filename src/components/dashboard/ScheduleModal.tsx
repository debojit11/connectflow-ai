import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: { type: "one_time"; runAt: string } | { type: "recurring"; cron: string }) => Promise<boolean>;
  isCreating: boolean;
}

type RecurringPattern = "daily" | "weekdays" | "weekly_monday" | "custom_days";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

const RECURRING_PATTERNS: { value: RecurringPattern; label: string; description: string }[] = [
  { value: "daily", label: "Every day", description: "Runs every day at the selected time" },
  { value: "weekdays", label: "Every weekday", description: "Monday through Friday" },
  { value: "weekly_monday", label: "Every Monday", description: "Once a week on Monday" },
  { value: "custom_days", label: "Every X days", description: "Custom interval in days" },
];

export function ScheduleModal({ open, onOpenChange, onSchedule, isCreating }: ScheduleModalProps) {
  const [scheduleType, setScheduleType] = useState<"one_time" | "recurring">("one_time");
  
  // One-time state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  
  // Recurring state
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>("daily");
  const [recurringTime, setRecurringTime] = useState("09:00");
  const [customDays, setCustomDays] = useState("2");
  
  // Advanced mode
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rawCron, setRawCron] = useState("");

  const generateCronExpression = (): string => {
    if (showAdvanced && rawCron) {
      return rawCron;
    }

    const [hour, minute] = recurringTime.split(":").map(Number);

    switch (recurringPattern) {
      case "daily":
        return `${minute} ${hour} * * *`;
      case "weekdays":
        return `${minute} ${hour} * * 1-5`;
      case "weekly_monday":
        return `${minute} ${hour} * * 1`;
      case "custom_days":
        // Every X days - using day of month modulo (simplified approach)
        const days = parseInt(customDays) || 2;
        return `${minute} ${hour} */${days} * *`;
      default:
        return `${minute} ${hour} * * *`;
    }
  };

  const getRecurringSummary = (): string => {
    if (showAdvanced && rawCron) {
      return `Custom cron: ${rawCron}`;
    }

    const timeFormatted = format(new Date(`2000-01-01T${recurringTime}`), "h:mm a");

    switch (recurringPattern) {
      case "daily":
        return `Every day at ${timeFormatted}`;
      case "weekdays":
        return `Every weekday (Mon-Fri) at ${timeFormatted}`;
      case "weekly_monday":
        return `Every Monday at ${timeFormatted}`;
      case "custom_days":
        const days = parseInt(customDays) || 2;
        return `Every ${days} day${days > 1 ? "s" : ""} at ${timeFormatted}`;
      default:
        return "";
    }
  };

  const getOneTimeSummary = (): string => {
    if (!selectedDate) return "";
    const timeFormatted = format(new Date(`2000-01-01T${selectedTime}`), "h:mm a");
    const dateFormatted = format(selectedDate, "MMMM d, yyyy");
    return `This will run on ${dateFormatted} at ${timeFormatted}`;
  };

  const handleSubmit = async () => {
    if (scheduleType === "one_time") {
      if (!selectedDate) return;
      
      // Combine date and time into ISO string
      const [hour, minute] = selectedTime.split(":").map(Number);
      const runAtDate = new Date(selectedDate);
      runAtDate.setHours(hour, minute, 0, 0);
      
      const success = await onSchedule({
        type: "one_time",
        runAt: runAtDate.toISOString(),
      });
      
      if (success) {
        resetForm();
        onOpenChange(false);
      }
    } else {
      const cronExpression = generateCronExpression();
      
      if (!cronExpression) return;
      
      const success = await onSchedule({
        type: "recurring",
        cron: cronExpression,
      });
      
      if (success) {
        resetForm();
        onOpenChange(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("09:00");
    setRecurringPattern("daily");
    setRecurringTime("09:00");
    setCustomDays("2");
    setShowAdvanced(false);
    setRawCron("");
  };

  const isValid = scheduleType === "one_time" ? !!selectedDate : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Schedule Automation</DialogTitle>
        </DialogHeader>

        <Tabs value={scheduleType} onValueChange={(v) => setScheduleType(v as "one_time" | "recurring")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="one_time">One-Time</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
          </TabsList>

          {/* One-Time Schedule */}
          <TabsContent value="one_time" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Select Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground">
                {getOneTimeSummary()}
              </div>
            )}
          </TabsContent>

          {/* Recurring Schedule */}
          <TabsContent value="recurring" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Frequency</label>
              <div className="space-y-2">
                {RECURRING_PATTERNS.map((pattern) => (
                  <button
                    key={pattern.value}
                    onClick={() => setRecurringPattern(pattern.value)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all border",
                      recurringPattern === pattern.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="font-medium text-foreground">{pattern.label}</div>
                    <div className="text-xs text-muted-foreground">{pattern.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {recurringPattern === "custom_days" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Every how many days?</label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-24"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setRecurringTime(time)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      recurringTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Mode Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-foreground">Advanced Mode</label>
                <p className="text-xs text-muted-foreground">Enter a raw cron expression</p>
              </div>
              <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
            </div>

            {showAdvanced && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cron Expression</label>
                <Input
                  value={rawCron}
                  onChange={(e) => setRawCron(e.target.value)}
                  placeholder="0 9 * * 1-5"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Format: minute hour day month weekday
                </p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground">
              {getRecurringSummary()}
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isCreating}
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Schedule"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
