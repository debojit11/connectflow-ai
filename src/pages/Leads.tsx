import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DynamicTable } from "@/components/leads/DynamicTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLeadsData } from "@/hooks/useLeadsData";
import { usePipelinePolling } from "@/hooks/usePipelinePolling";

export default function Leads() {
  const [activeTab, setActiveTab] = useState("all");
  const { isPipelineActive } = usePipelinePolling();
  
  const {
    allLeads,
    approvedLeads,
    readyToInviteLeads,
    isLoading,
    isSendingInvite,
    hasRowSending,
    refreshAll,
    sendInvite,
    updateMessage,
  } = useLeadsData({ isPipelineActive });

  const handleSendInvite = async (row: Record<string, unknown>) => {
    const leadId = String(row.id);
    const editedMessage = String(row.personalizedMessage || "");
    await sendInvite(leadId, editedMessage);
  };

  const handleMessageUpdate = (rowId: string, message: string) => {
    updateMessage(rowId, message);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and review your scraped leads</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              All Leads
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {allLeads.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              Approved
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {approvedLeads.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="ready"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              Ready to Invite
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {readyToInviteLeads.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="animate-fade-in">
            <DynamicTable 
              data={allLeads} 
              onRefresh={refreshAll}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="approved" className="animate-fade-in">
            <DynamicTable 
              data={approvedLeads} 
              onRefresh={refreshAll}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="ready" className="animate-fade-in">
            <DynamicTable
              data={readyToInviteLeads}
              onSendInvite={handleSendInvite}
              onMessageUpdate={handleMessageUpdate}
              onRefresh={refreshAll}
              showSendAction
              isLoading={isLoading}
              isSendingAny={isSendingInvite || hasRowSending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
