import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import type { WantedRequest } from "@shared/api";
import { wantedWhenLabel } from "@shared/wanted";
import { CURRENT_USER_ID } from "@/lib/borrow-requests";
import { removeWantedRequest } from "@/lib/wanted-requests";

export function WantedCard({ request }: { request: WantedRequest }) {
  const isMine = request.authorId === CURRENT_USER_ID;

  const handleRemove = () => {
    removeWantedRequest(request.id);
    toast("Recherche retirée");
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <p className="font-display font-extrabold">
        {request.authorName || "Un voisin"} recherche
      </p>
      <p className="mt-1 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
        {request.text}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {wantedWhenLabel(request)}
        </p>
        {isMine && (
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-xs font-bold text-destructive underline-offset-2 hover:underline"
          >
            Retirer
          </button>
        )}
      </div>
    </article>
  );
}
