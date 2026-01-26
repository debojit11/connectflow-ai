import { Users, UserCheck, Send, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AutomationCard } from "@/components/dashboard/AutomationCard";
import { PipelineProgress } from "@/components/dashboard/PipelineProgress";
import { Button } from "@/components/ui/button";
import { usePipelinePolling } from "@/hooks/usePipelinePolling";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const { pipelineStatus, isPipelineActive, isLoading: isPipelineLoading, refresh: refreshPipeline, startPipeline } = usePipelinePolling();
  const { stats, isLoading: isStatsLoading, refresh: refreshStats } = useDashboardStats();

  const metrics = [
    { title: "Total Leads Generated", value: stats.totalLeadsGenerated, icon: Users, trend: { value: 12.5, positive: true } },
    { title: "AI Approved Leads", value: stats.aiApprovedLeads, icon: UserCheck, trend: { value: 8.2, positive: true } },
    { title: "Invitations Sent", value: stats.invitesSent, icon: Send },
  ];

  const handleRefreshPipeline = async () => {
    await Promise.all([refreshPipeline(), refreshStats()]);
  };

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
            <AutomationCard disabled={isPipelineActive} onStartPipeline={startPipeline} />
          </div>

          {/* Pipeline Progress */}
          <div
            className="rounded-2xl bg-card border border-border p-6 glow-effect animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Pipeline Status</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshPipeline}
                disabled={isPipelineLoading}
                className="gap-2 border-border hover:bg-accent"
              >
                <RefreshCw className={`w-4 h-4 ${isPipelineLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <PipelineProgress steps={pipelineStatus.steps} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
