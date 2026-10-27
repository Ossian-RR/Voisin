import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { BorrowRequest, BorrowRequestStatus } from "@shared/api";
import { wantedWhenLabel } from "@shared/wanted";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMember } from "@/lib/auth";
import {
  useAnswerRequest,
  useBorrowRequests,
  useCancelRequest,
} from "@/lib/data";
import { card } from "@/lib/styles";

const STATUS_LABEL: Record<BorrowRequestStatus, string> = {
  pending: "En attente",
  approved: "Acceptée",
  declined: "Refusée",
  returned: "Rendu",
};

const small = "rounded-lg px-3 py-1.5 text-sm font-bold";

/** Requests received for my items (to answer) and requests I sent. */
export default function Requests() {
  const { profileId } = useMember();
  const requests = useBorrowRequests();
  const all = requests.data ?? [];
  const received = all.filter((r) => r.item?.ownerId === profileId);
  const sent = all.filter((r) => r.borrowerId === profileId);

  return (
    <div className="flex flex-col gap-4 px-5">
      <PageHeader title="Demandes" className="px-0" />
      {requests.isPending ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : requests.isError ? (
        <p className="text-sm text-destructive">
          Les demandes n’ont pas pu être chargées.
        </p>
      ) : (
        <>
          <Section
            title="Reçues"
            empty="Personne ne vous a encore rien demandé."
          >
            {received.map((r) => (
              <ReceivedCard key={r.id} request={r} />
            ))}
          </Section>
          <Section title="Envoyées" empty="Vous n’avez encore rien demandé.">
            {sent.map((r) => (
              <SentCard key={r.id} request={r} />
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-extrabold">{title}</h2>
      {children.length > 0 ? (
        children
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}

function ItemLine({ request }: { request: BorrowRequest }) {
  return request.item ? (
    <Link
      to={`/items/${request.item.id}`}
      className="font-bold underline-offset-2 hover:underline"
    >
      {request.item.title}
    </Link>
  ) : (
    <span className="font-bold">Objet retiré</span>
  );
}

function ReceivedCard({ request }: { request: BorrowRequest }) {
  const answer = useAnswerRequest();
  const item = request.item;
  const reply = (status: BorrowRequestStatus, message: string) =>
    item &&
    answer.mutate(
      { requestId: request.id, item, answer: status },
      {
        onSuccess: () => toast.success(message),
        onError: () => toast.error("La réponse n’a pas pu être enregistrée"),
      },
    );

  return (
    <article className={card}>
      <ItemLine request={request} />
      <p className="text-sm text-muted-foreground">
        {request.borrowerName} ({request.borrowerLocation}) ·{" "}
        {STATUS_LABEL[request.status]}
      </p>
      <p className="text-sm font-semibold">{wantedWhenLabel(request)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {request.status === "pending" && (
          <>
            <button
              disabled={answer.isPending}
              onClick={() => reply("approved", "Demande acceptée")}
              className={`${small} bg-primary text-primary-foreground`}
            >
              Accepter
            </button>
            <button
              disabled={answer.isPending}
              onClick={() => reply("declined", "Demande refusée")}
              className={`${small} border border-border`}
            >
              Refuser
            </button>
          </>
        )}
        {request.status === "approved" && item?.kind === "loan" && (
          <button
            disabled={answer.isPending}
            onClick={() => reply("returned", "Objet marqué comme rendu")}
            className={`${small} border border-border`}
          >
            Il m’a été rendu
          </button>
        )}
      </div>
    </article>
  );
}

function SentCard({ request }: { request: BorrowRequest }) {
  const cancel = useCancelRequest();
  return (
    <article className={card}>
      <ItemLine request={request} />
      <p className="text-sm text-muted-foreground">
        {request.item
          ? `${request.item.ownerName} (${request.item.location})`
          : ""}{" "}
        · {STATUS_LABEL[request.status]}
      </p>
      <p className="text-sm font-semibold">{wantedWhenLabel(request)}</p>
      {request.status === "pending" && (
        <button
          disabled={cancel.isPending}
          onClick={() =>
            cancel.mutate(request.id, {
              onSuccess: () => toast("Demande annulée"),
              onError: () => toast.error("La demande n’a pas pu être annulée"),
            })
          }
          className={`${small} mt-2 border border-border text-destructive`}
        >
          Annuler
        </button>
      )}
    </article>
  );
}
