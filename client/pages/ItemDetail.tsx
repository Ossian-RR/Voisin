import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { canRequest, findOpenRequest } from "@shared/borrow";
import { describeLocation } from "@shared/location";
import { isGift } from "@shared/new-item";
import { wantedWhenLabel } from "@shared/wanted";
import { DateTimeFields, useDateTime } from "@/components/DateTimeFields";
import { ItemImage } from "@/components/items/ItemImage";
import { StatusBadge } from "@/components/items/StatusBadge";
import { useDocumentTitle } from "@/components/layout/PageHeader";
import { useMe } from "@/lib/auth";
import {
  useAskToBorrow,
  useBorrowRequests,
  useItems,
  useRemoveItem,
} from "@/lib/data";
import { card, primaryButton, secondaryButton } from "@/lib/styles";

export default function ItemDetail() {
  const { id } = useParams();
  const { profileId } = useMe();
  const items = useItems();
  const requests = useBorrowRequests().data ?? [];
  const ask = useAskToBorrow();
  const remove = useRemoveItem();
  const navigate = useNavigate();
  const item = items.data?.find((i) => i.id === id);
  const when = useDateTime();
  const [asking, setAsking] = useState(false);
  useDocumentTitle(item?.title ?? "Objet");

  if (items.isPending) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        Chargement…
      </p>
    );
  }
  if (!item) {
    return (
      <div className="p-8 text-center">
        <p className="font-display text-xl font-extrabold">Objet introuvable</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Son propriétaire l’a peut-être retiré.
        </p>
        <Link to="/" className="mt-4 inline-block font-bold text-primary">
          Retour aux objets
        </Link>
      </div>
    );
  }

  const mine = item.ownerId === profileId;
  const gift = isGift(item);
  const sent = findOpenRequest(requests, item.id, profileId);

  const handleAsk = () =>
    ask.mutate(
      { item, ...when.value },
      {
        onSuccess: () => {
          setAsking(false);
          toast.success(`Demande envoyée à ${item.ownerName}`, {
            description: "Suivez-la dans l’onglet Demandes.",
          });
        },
        onError: () => toast.error("La demande n’a pas pu être envoyée"),
      },
    );

  const handleRemove = () => {
    if (
      !window.confirm(
        `Retirer « ${item.title} » ? Vos voisins ne le verront plus.`,
      )
    )
      return;
    remove.mutate(item, {
      onSuccess: () => {
        toast("Objet retiré");
        navigate("/");
      },
      onError: () => toast.error("L’objet n’a pas pu être retiré"),
    });
  };

  return (
    <article className="flex flex-col gap-4 px-5 pt-4">
      <Link
        to="/"
        className="flex items-center gap-1 text-sm font-semibold text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Tous les objets
      </Link>
      <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl">
        {item.photos.map((photo, i) => (
          <ItemImage
            key={i}
            hue={photo.hue}
            src={photo.src}
            label={`${item.title}, photo ${i + 1}`}
            className="aspect-[4/3] w-full shrink-0 snap-start"
          />
        ))}
      </div>
      <StatusBadge
        status={item.status}
        kind={item.kind}
        className="self-start"
      />
      <h1 className="font-display text-2xl font-extrabold">{item.title}</h1>
      <p className="text-sm text-muted-foreground">
        {gift ? "Donné par" : "Prêté par"} {item.ownerName} · {item.location} (
        {describeLocation(item.location)})
      </p>
      <p>
        {item.description} <strong>État : {item.condition}.</strong>
      </p>
      {mine ? (
        <button
          type="button"
          onClick={handleRemove}
          disabled={remove.isPending}
          className={`${secondaryButton} text-destructive`}
        >
          Retirer cet objet
        </button>
      ) : asking ? (
        <section className={`${card} space-y-4`}>
          <h2 className="font-bold">
            Quand souhaitez-vous {gift ? "le récupérer" : "l’emprunter"} ?
          </h2>
          <DateTimeFields state={when} />
          <button
            type="button"
            onClick={handleAsk}
            disabled={ask.isPending}
            className={primaryButton}
          >
            Envoyer la demande
          </button>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="w-full text-sm font-bold text-muted-foreground"
          >
            Annuler
          </button>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          disabled={!canRequest(item, requests, profileId)}
          className={primaryButton}
        >
          {sent
            ? "Demande envoyée"
            : item.status !== "available"
              ? "Emprunté en ce moment"
              : gift
                ? "Je le veux"
                : "Demander à emprunter"}
        </button>
      )}
      {sent && (
        <p className="text-center text-sm text-muted-foreground">
          {wantedWhenLabel(sent)} · suivez-la dans l’onglet Demandes.
        </p>
      )}
    </article>
  );
}
