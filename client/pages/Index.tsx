import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Egg, Search } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { cn } from "@/lib/utils";
import { CATEGORIES, foodRequests, items, visibleItems } from "@shared/mock";

export default function Index() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return visibleItems(items).filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        needle === "" ||
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="flex flex-col">
      <section className="px-5 pt-6">
        <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
          Neighbors sharing, not-for-profit
        </p>
        <h1 className="font-display mt-2 text-[30px] leading-[1.08] font-extrabold tracking-tight">
          Borrow what you need. Share what you own.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Pressure washers, drills and ladders from the people two doors down.
        </p>

        <label className="mt-6 block">
          <span className="sr-only">Search items</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search drills, ladders, tables"
              className="h-12 w-full rounded-2xl border border-border bg-card pr-4 pl-11 text-base shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </span>
        </label>

        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          {CATEGORIES.map((name) => {
            const isActive = name === category;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(name)}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="items-heading" className="mt-6 px-5">
        <div className="flex items-baseline justify-between">
          <h2 id="items-heading" className="font-display text-xl font-extrabold">
            Nearby items
          </h2>
          <p className="text-xs font-semibold text-muted-foreground" aria-live="polite">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="font-semibold">Nothing matches that yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another word or pick a different category.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="food-heading" className="mt-10 px-5">
        <div className="rounded-3xl bg-accent p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wider text-accent-foreground uppercase">
                Free, always
              </p>
              <h2 id="food-heading" className="font-display mt-1 text-xl font-extrabold">
                Food corner
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                Ask neighbors for a few basics. Nothing is sold here.
              </p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-apricot text-apricot-foreground">
              <Egg className="size-5" />
            </span>
          </div>

          <ul className="mt-4 divide-y divide-accent-foreground/10">
            {foodRequests.map((request) => (
              <li key={request.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{request.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{request.note}</p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="font-bold text-accent-foreground">{request.neededBy}</p>
                  <p className="text-muted-foreground">
                    {request.requesterFirstName} · {request.distance}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/food"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-accent-foreground"
          >
            See all food requests
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
