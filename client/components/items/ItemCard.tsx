import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Item } from "@shared/api";
import { cn } from "@/lib/utils";
import { ItemImage } from "./ItemImage";
import { StatusBadge } from "./StatusBadge";

export function ItemCard({ item }: { item: Item }) {
  const cover = item.photos[0];
  const isAvailable = item.status === "available";

  return (
    <Link
      to={`/items/${item.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/5]">
        <ItemImage
          category={item.category}
          hue={cover.hue}
          label={`${item.title}, ${cover.label}`}
          className={cn(
            "size-full transition-transform duration-500 group-hover:scale-[1.03]",
            !isAvailable && "saturate-50",
          )}
        />
        <StatusBadge status={item.status} className="absolute top-2.5 left-2.5 shadow-sm" />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 p-3">
        <h3 className="font-display line-clamp-2 min-h-[2.5rem] text-[15px] leading-tight font-bold">
          {item.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {item.distance} · {item.ownerFirstName}
          </span>
        </p>
      </div>
    </Link>
  );
}
