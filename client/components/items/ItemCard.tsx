import { Link } from "react-router-dom";
import type { Item } from "@shared/api";
import { ItemImage } from "./ItemImage";
import { StatusBadge } from "./StatusBadge";

export function ItemCard({ item }: { item: Item }) {
  const cover = item.photos[0];
  return (
    <Link
      to={`/items/${item.id}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-square">
        <ItemImage
          hue={cover?.hue ?? 160}
          src={cover?.src}
          label={item.title}
          className="size-full"
        />
        <StatusBadge
          status={item.status}
          kind={item.kind}
          className="absolute top-2 left-2"
        />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-bold leading-tight">{item.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {item.location} · {item.ownerName}
        </p>
      </div>
    </Link>
  );
}
