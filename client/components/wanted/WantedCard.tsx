import { toast } from "sonner";
import type { WantedRequest } from "@shared/api";
import { wantedWhenLabel } from "@shared/wanted";
import { useMe } from "@/lib/auth";
import { useRemoveWanted } from "@/lib/data";
import { card } from "@/lib/styles";

export function WantedCard({ request }: { request: WantedRequest }) {
  const { profileId } = useMe();
  const remove = useRemoveWanted();

  return (
    <article className={card}>
      <p className="font-bold">{request.authorName} recherche</p>
      <p className="mt-1 break-words whitespace-pre-wrap">{request.text}</p>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{wantedWhenLabel(request)}</span>
        {request.authorId === profileId && (
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(request.id, {
                onSuccess: () => toast("Recherche retirée"),
                onError: () =>
                  toast.error("La recherche n’a pas pu être retirée"),
              })
            }
            className="font-bold text-destructive"
          >
            Retirer
          </button>
        )}
      </div>
    </article>
  );
}
