import { useMemo, useState } from "react";
import { ItemCard } from "@/components/items/ItemCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { WantedCard } from "@/components/wanted/WantedCard";
import { useMember } from "@/lib/auth";
import { useItems, useWantedRequests } from "@/lib/data";
import { residenceTitle } from "@shared/residence";

/** Lowercase and strip accents so "echelle" finds "échelle". */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function Index() {
  const { residence } = useMember();
  const items = useItems();
  const wanted = useWantedRequests().data ?? [];
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const needle = normalize(query.trim());
    return (items.data ?? []).filter(
      (item) =>
        !needle ||
        normalize(`${item.title} ${item.description}`).includes(needle),
    );
  }, [items.data, query]);

  return (
    <div className="flex flex-col gap-4 px-5">
      <PageHeader title="J’emprunte" className="px-0">
        {residenceTitle(residence)} · {residence.address}
      </PageHeader>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un objet…"
        aria-label="Rechercher un objet"
        className="h-12 rounded-xl border border-border bg-card px-4"
      />
      {items.isPending ? (
        <p className="text-center text-sm text-muted-foreground">Chargement…</p>
      ) : items.isError ? (
        <p className="text-center text-sm text-destructive">
          Les objets n’ont pas pu être chargés.{" "}
          <button
            className="font-bold underline"
            onClick={() => items.refetch()}
          >
            Réessayer
          </button>
        </p>
      ) : shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {shown.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {query ? "Aucun objet ne correspond." : "Aucun objet pour l’instant."}
        </p>
      )}
      {wanted.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-extrabold">
            Vos voisins recherchent
          </h2>
          {wanted.map((request) => (
            <WantedCard key={request.id} request={request} />
          ))}
        </section>
      )}
    </div>
  );
}
