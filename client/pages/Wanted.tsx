import { useState, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Send } from "lucide-react";
import { toast } from "sonner";
import type { WantedRequest } from "@shared/api";
import { sortRequests } from "@shared/borrow";
import { currentNeighbor } from "@shared/mock";
import { displayName, todayIso } from "@shared/wanted";
import { CURRENT_USER_ID } from "@/lib/borrow-requests";
import { cn } from "@/lib/utils";
import {
  publishWantedRequest,
  removeWantedRequest,
  useWantedRequests,
} from "@/lib/wanted-requests";

export default function Wanted() {
  const [text, setText] = useState("");
  const [wantedOn, setWantedOn] = useState("");
  const mine = sortRequests(
    useWantedRequests().filter(
      (request) => request.authorId === CURRENT_USER_ID,
    ),
  );
  const canPublish = text.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!publishWantedRequest({ text, wantedOn })) return;
    setText("");
    setWantedOn("");
    toast.success("Recherche publiée", {
      description: "Vos voisins peuvent maintenant vous proposer un objet.",
    });
  };

  return (
    <div className="flex flex-col px-5 pt-5">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-border bg-card p-4 shadow-sm"
      >
        <h1 className="font-display text-xl leading-tight font-extrabold tracking-tight">
          <label htmlFor="wanted-text">
            {displayName(currentNeighbor)} recherche
          </label>
        </h1>
        <textarea
          id="wanted-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-gramm="false"
          className="mt-3 block w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base leading-relaxed focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />

        <label htmlFor="wanted-date" className="mt-4 block text-sm font-bold">
          Date souhaitée pour l’emprunt
        </label>
        <input
          id="wanted-date"
          type="date"
          value={wantedOn}
          min={todayIso(new Date())}
          onChange={(event) => setWantedOn(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />

        <button
          type="submit"
          disabled={!canPublish}
          className={cn(
            "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-colors",
            canPublish
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.99]"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          <Send className="size-5" />
          Publier ma recherche
        </button>
      </form>

      {mine.length > 0 && (
        <section aria-labelledby="mine-heading" className="mt-6">
          <h2 id="mine-heading" className="font-display text-lg font-extrabold">
            Mes recherches
          </h2>
          <ul className="mt-3 space-y-3">
            {mine.map((request) => (
              <li key={request.id}>
                <WantedCard request={request} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function WantedCard({ request }: { request: WantedRequest }) {
  const handleRemove = () => {
    removeWantedRequest(request.id);
    toast("Recherche retirée");
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
        {request.text}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {request.wantedOn
            ? `Pour le ${format(parseISO(request.wantedOn), "EEEE d MMMM", { locale: fr })}`
            : "Pas de date précise"}
        </p>
        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 text-xs font-bold text-destructive underline-offset-2 hover:underline"
        >
          Retirer
        </button>
      </div>
    </article>
  );
}
