import { Users, UserCheck, Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AutomationCard } from "@/components/dashboard/AutomationCard";
import { PipelineProgress } from "@/components/dashboard/PipelineProgress";

const metrics = [
  { title: "Total Leads Generated", value: 12847, icon: Users, trend: { value: 12.5, positive: true } },
  { title: "AI Approved Leads", value: 8432, icon: UserCheck, trend: { value: 8.2, positive: true } },
  { title: "Invitations Sent", value: 3256, icon: Send, trend: { value: 15.3, positive: true } },
];

const pipelineSteps = [
  { name: "Scraping", status: "completed" as const },
  { name: "AI Evaluation", status: "completed" as const },
  { name: "Message Generation", status: "running" as const },
  { name: "Ready for Review", status: "pending" as const },
  { name: "Invitations Sent", status: "pending" as const },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your lead automation pipeline</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MetricCard {...metric} />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Automation Card */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <AutomationCard />
          </div>

          {/* Pipeline Progress */}
          <div
            className="rounded-2xl bg-card border border-border p-6 glow-effect animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Pipeline Status</h3>
            <PipelineProgress steps={pipelineSteps} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
