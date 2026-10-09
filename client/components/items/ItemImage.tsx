import { Hammer, Sprout, SprayCan, ChefHat, Tent, type LucideIcon } from "lucide-react";
import type { ItemCategory } from "@shared/api";
import { cn } from "@/lib/utils";

const categoryIcon: Record<ItemCategory, LucideIcon> = {
  Tools: Hammer,
  Garden: Sprout,
  Cleaning: SprayCan,
  Kitchen: ChefHat,
  Outdoor: Tent,
};

interface ItemImageProps {
  category: ItemCategory;
  hue: number;
  label: string;
  className?: string;
}

export function ItemImage({ category, hue, label, className }: ItemImageProps) {
  const Icon = categoryIcon[category];
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative grid place-items-center overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(150deg, hsl(${hue} 55% 88%) 0%, hsl(${hue} 42% 66%) 100%)`,
      }}
    >
      <span className="absolute -right-6 -bottom-8 size-28 rounded-full bg-white/25" />
      <span className="absolute -left-4 top-4 size-12 rounded-full bg-white/20" />
      <span className="relative grid size-14 place-items-center rounded-2xl bg-white/70 text-foreground shadow-sm backdrop-blur-sm">
        <Icon className="size-7" strokeWidth={1.8} />
      </span>
    </div>
  );
}
