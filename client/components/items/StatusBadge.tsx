import { Gift } from "lucide-react";
import type { ItemKind, ItemStatus } from "@shared/api";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  ItemStatus,
  { label: string; className: string; dot: string }
> = {
  available: {
    label: "Disponible",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  unavailable: {
    label: "Emprunté",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  removed: {
    label: "Retiré",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

/** Gifts that are still available get their own "À donner" badge. */
export function StatusBadge({
  status,
  kind,
  className,
}: {
  status: ItemStatus;
  kind?: ItemKind;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide";
  if (kind === "gift" && status === "available") {
    return (
      <span
        className={cn(base, "bg-apricot text-apricot-foreground", className)}
      >
        <Gift className="size-3" aria-hidden />À donner
      </span>
    );
  }
  const style = statusStyles[status];
  return (
    <span className={cn(base, style.className, className)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
