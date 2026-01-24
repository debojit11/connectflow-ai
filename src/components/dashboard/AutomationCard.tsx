import { useState } from "react";
import { Play, Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export function AutomationCard() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("09:00");

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  const handleStartNow = () => {
    console.log("Starting automation now...");
  };

  const handleSaveSchedule = () => {
    console.log("Scheduling automation for:", selectedDate, selectedTime);
    setIsScheduleOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl bg-card border border-border p-6 glow-effect">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Run Automation
        </h3>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleStartNow}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          >
            <Play className="w-4 h-4" />
            Start Now
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsScheduleOpen(true)}
            className="gap-2 border-border hover:bg-accent hover:text-accent-foreground"
          >
            <Calendar className="w-4 h-4" />
            Schedule Recurring
          </Button>
        </div>
      </div>

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Schedule Automation</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Date</label>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border border-border bg-background pointer-events-auto"
                disabled={(date) => date < new Date()}
              />
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
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

            {/* Save Button */}
            <Button
              onClick={handleSaveSchedule}
              disabled={!selectedDate}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
