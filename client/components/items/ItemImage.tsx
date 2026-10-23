import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/** A real photo, or a colored placeholder while there is none. */
export function ItemImage({
  hue,
  src,
  label,
  className,
}: {
  hue: number;
  src?: string;
  label: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={cn("bg-muted object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("grid place-items-center", className)}
      style={{ background: `hsl(${hue} 45% 80%)` }}
    >
      <Package className="size-8 text-foreground/60" />
    </div>
  );
}
