import { cn } from "@/lib/utils";

type PipelineStatus = "pending" | "running" | "completed";

interface PipelineStep {
  name: string;
  status: PipelineStatus;
}

interface PipelineProgressProps {
  steps: PipelineStep[];
}

export function PipelineProgress({ steps }: PipelineProgressProps) {
  // Safety fallback in case steps is undefined
  const safeSteps = steps ?? [];
  
  // Filter out "Invitations Sent" step if present
  const filteredSteps = safeSteps.filter(
    (step) => step.name.toLowerCase() !== "invitations sent"
  );

  return (
    <div className="space-y-1">
      {filteredSteps.map((step, index) => (
        <div key={step.name} className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                step.status === "pending" && "bg-muted-foreground/50",
                step.status === "running" && "bg-primary animate-pulse-glow",
                step.status === "completed" && "bg-success"
              )}
            />
            {index < filteredSteps.length - 1 && (
              <div
                className={cn(
                  "w-0.5 h-8 transition-colors duration-300",
                  step.status === "completed" ? "bg-success/50" : "bg-border"
                )}
              />
            )}
          </div>

          {/* Step info */}
          <div className="flex-1 py-2">
            <p
              className={cn(
                "text-sm font-medium transition-colors",
                step.status === "running" && "text-primary",
                step.status === "completed" && "text-foreground",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {step.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
