import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DynamicTableProps {
  data: Record<string, unknown>[];
  onSendInvite?: (row: Record<string, unknown>) => Promise<void>;
  onMessageUpdate?: (rowId: string, message: string) => void;
  showSendAction?: boolean;
}

const IMAGE_FIELD_KEY = "linkedinProfileImageUrl";
const STATUS_FIELDS = ["status", "aistatus", "approvalstatus"];
const MESSAGE_STATUS_FIELD = "messagestatus";
const PERSONALIZED_MESSAGE_FIELD = "personalizedmessage";

function isStatusField(fieldName: string): boolean {
  const lowerName = fieldName.toLowerCase();
  return STATUS_FIELDS.some((pattern) => lowerName.includes(pattern));
}

function getStatusBadgeClass(value: string): string {
  const lowerValue = value?.toLowerCase() || "";
  if (lowerValue.includes("approved") || lowerValue === "approved") return "badge-approved";
  if (lowerValue.includes("rejected") || lowerValue === "rejected") return "badge-rejected";
  if (lowerValue.includes("pending") || lowerValue === "pending") return "badge-pending";
  if (lowerValue.includes("waiting") || lowerValue === "waiting_for_review") return "badge-waiting";
  if (lowerValue.includes("sent") || lowerValue === "sent") return "badge-sent";
  if (lowerValue.includes("sending") || lowerValue === "sending") return "badge-pending";
  if (lowerValue.includes("failed") || lowerValue === "failed") return "badge-failed";
  return "badge-pending";
}

function MessageCell({ 
  value, 
  rowId, 
  onUpdate 
}: { 
  value: string; 
  rowId: string; 
  onUpdate?: (rowId: string, message: string) => void;
}) {
  const [message, setMessage] = useState(value || "");
  const charCount = message.length;
  const isOverLimit = charCount > 200;

  return (
    <div className="space-y-1">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onBlur={() => onUpdate?.(rowId, message)}
        className={cn(
          "w-full min-w-[200px] p-2 rounded-lg bg-input border text-sm resize-none",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          isOverLimit ? "border-destructive" : "border-border"
        )}
        rows={3}
      />
      <p className={cn("text-xs", isOverLimit ? "text-destructive" : "text-muted-foreground")}>
        {charCount}/200 characters
      </p>
    </div>
  );
}

function AvatarCell({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt="Profile"
      className="w-10 h-10 rounded-full object-cover bg-muted flex-shrink-0"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/placeholder.svg";
      }}
    />
  );
}

function ActionCell({
  row,
  isSending,
  onSendInvite,
}: {
  row: Record<string, unknown>;
  isSending: boolean;
  onSendInvite: (row: Record<string, unknown>) => void;
}) {
  const messageStatus = String(row.messageStatus || "").toLowerCase();
  const connectionSent = Boolean(row.connectionSent);

  // Already sent - show badge
  if (connectionSent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/20 text-success text-xs font-medium">
        <Check className="w-3 h-3" />
        Sent
      </span>
    );
  }

  // Currently sending - show disabled button
  if (messageStatus === "sending" || isSending) {
    return (
      <Button
        size="sm"
        disabled
        className="gap-2 bg-primary/50 text-primary-foreground cursor-not-allowed"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        Sending…
      </Button>
    );
  }

  // Ready to send - show active button
  if (messageStatus === "waiting_for_review") {
    return (
      <Button
        size="sm"
        onClick={() => onSendInvite(row)}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Send Invite
      </Button>
    );
  }

  // Default: no action available
  return <span className="text-muted-foreground text-xs">—</span>;
}

export function DynamicTable({ data, onSendInvite, onMessageUpdate, showSendAction }: DynamicTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingRows, setSendingRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  // Check if data has image field
  const hasImageField = useMemo(() => {
    if (data.length === 0) return false;
    return IMAGE_FIELD_KEY in data[0];
  }, [data]);

  // Extract columns from data, excluding the image field (it will be first column separately)
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => key !== IMAGE_FIELD_KEY);
  }, [data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (value) => String(value).toLowerCase().includes(query)
        )
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const aVal = String(a[sortField] || "");
        const bVal = String(b[sortField] || "");
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSendInvite = async (row: Record<string, unknown>) => {
    const rowId = String(row.id);
    setSendingRows((prev) => new Set(prev).add(rowId));
    try {
      await onSendInvite?.(row);
    } finally {
      setSendingRows((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  };

  const renderCell = (row: Record<string, unknown>, column: string) => {
    const value = row[column];
    const rowId = String(row.id);
    const lowerColumn = column.toLowerCase();

    // Status fields
    if (isStatusField(column)) {
      return <span className={getStatusBadgeClass(String(value))}>{String(value)}</span>;
    }

    // Message status
    if (lowerColumn === MESSAGE_STATUS_FIELD) {
      return <span className={getStatusBadgeClass(String(value))}>{String(value)}</span>;
    }

    // Personalized message
    if (lowerColumn === PERSONALIZED_MESSAGE_FIELD) {
      return (
        <MessageCell
          value={String(value || "")}
          rowId={rowId}
          onUpdate={onMessageUpdate}
        />
      );
    }

    // Default text
    return (
      <span className="truncate max-w-[200px] block" title={String(value)}>
        {String(value ?? "—")}
      </span>
    );
  };

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-12 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {/* Avatar column header (first) */}
                {hasImageField && (
                  <th className="table-header-cell w-14"></th>
                )}
                {columns.map((column) => (
                  <th
                    key={column}
                    className="table-header-cell cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column}</span>
                      {sortField === column && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {/* Action column header (last, UI-only) */}
                {showSendAction && <th className="table-header-cell">Action</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => {
                const rowId = String(row.id);
                const isSending = sendingRows.has(rowId);
                const imageUrl = row[IMAGE_FIELD_KEY] as string | undefined;

                return (
                  <tr
                    key={rowId}
                    className="border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors"
                  >
                    {/* Avatar cell (first) */}
                    {hasImageField && (
                      <td className="table-cell w-14">
                        {imageUrl ? (
                          <AvatarCell src={String(imageUrl)} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            ?
                          </div>
                        )}
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column} className="table-cell">
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {/* Action cell (last, UI-only) */}
                    {showSendAction && (
                      <td className="table-cell">
                        <ActionCell
                          row={row}
                          isSending={isSending}
                          onSendInvite={handleSendInvite}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, processedData.length)} of{" "}
            {processedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-foreground px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
