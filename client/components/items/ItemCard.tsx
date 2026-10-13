import { Link } from "react-router-dom";
import { DoorOpen } from "lucide-react";
import type { Item } from "@shared/api";
import { isGift } from "@shared/new-item";
import { cn } from "@/lib/utils";
import { ItemImage } from "./ItemImage";
import { StatusBadge } from "./StatusBadge";

export function ItemCard({ item }: { item: Item }) {
  const cover = item.photos[0];
  const isAvailable = item.status === "available";

  return (
    <Link
      to={`/items/${item.id}`}
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        isGift(item) ? "border-apricot/50" : "border-border",
      )}
    >
      <div className="relative aspect-[4/5]">
        <ItemImage
          category={item.category}
          hue={cover.hue}
          src={cover.src}
          label={`${item.title}, ${cover.label}`}
          className={cn(
            "size-full transition-transform duration-500 group-hover:scale-[1.03]",
            !isAvailable && "saturate-50",
          )}
        />
        <StatusBadge
          status={item.status}
          kind={item.kind}
          className="absolute top-2.5 left-2.5 shadow-sm"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 p-3">
        <h3 className="font-display line-clamp-2 min-h-[2.5rem] text-[15px] leading-tight font-bold">
          {item.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <DoorOpen className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {item.location} · {item.ownerFirstName}
          </span>
        </p>
      </div>
    </Link>
  );
}
