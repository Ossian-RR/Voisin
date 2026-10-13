import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { useDocumentTitle } from "@/components/layout/PageHeader";
import { WantedCard } from "@/components/wanted/WantedCard";
import { useWantedRequests } from "@/lib/wanted-requests";
import { sortRequests } from "@shared/borrow";
import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_LABELS, visibleItems } from "@shared/mock";
import { useAllItems } from "@/lib/items";
import { RESIDENCE, residenceTitle } from "@shared/residence";

/** Lowercase and strip accents so "echelle" finds "échelle". */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function Index() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const wanted = sortRequests(useWantedRequests());
  const allItems = useAllItems();
  useDocumentTitle("Objets");
  const location = useLocation();
  const justPublished = (location.state as { showWanted?: string } | null)
    ?.showWanted;

  useEffect(() => {
    if (!justPublished) return;
    document
      .getElementById(`wanted-${justPublished}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [justPublished]);

  const filteredItems = useMemo(() => {
    const needle = normalize(query.trim());
    return visibleItems(allItems).filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        needle === "" ||
        normalize(item.title).includes(needle) ||
        normalize(item.description).includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [allItems, query, category]);

  return (
    <div className="flex flex-col">
      <header className="px-5 pt-5">
        <h1 className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-xl font-extrabold tracking-tight">
            {residenceTitle(RESIDENCE)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <MapPin
              className="size-3.5 shrink-0 self-center text-apricot"
              aria-hidden
            />
            {RESIDENCE.address}
          </span>
        </h1>
      </header>

      <section className="px-5 pt-3">
        <label className="block">
          <span className="sr-only">Rechercher un objet</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Perceuse, escabeau, tables…"
              className="h-12 w-full rounded-2xl border border-border bg-card pr-4 pl-11 text-base shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </span>
        </label>

        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label="Catégories"
        >
          {CATEGORIES.map((name) => {
            const isActive = name === category;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(name)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {CATEGORY_LABELS[name]}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Objets partagés" className="mt-4 px-5">
        <p className="sr-only" aria-live="polite">
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "objet" : "objets"}
        </p>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="font-semibold">Aucun objet ne correspond</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Essayez un autre mot ou une autre catégorie.
            </p>
          </div>
        )}
      </section>

      {wanted.length > 0 && (
        <section aria-labelledby="wanted-heading" className="mt-8 px-5">
          <h2
            id="wanted-heading"
            className="font-display text-lg font-extrabold"
          >
            Vos voisins recherchent
          </h2>
          <ul className="mt-3 space-y-3">
            {wanted.map((request) => (
              <li
                key={request.id}
                id={`wanted-${request.id}`}
                className={cn(
                  "scroll-mb-28 rounded-2xl",
                  request.id === justPublished && "ring-2 ring-primary/40",
                )}
              >
                <WantedCard request={request} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
