import type { ItemStatus } from "@shared/api";
import { cn } from "@/lib/utils";

const statusStyles: Record<ItemStatus, { label: string; className: string; dot: string }> = {
  available: {
    label: "Available",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  unavailable: {
    label: "Unavailable",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  removed: {
    label: "Removed",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function StatusBadge({ status, className }: { status: ItemStatus; className?: string }) {
  const style = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
        style.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
