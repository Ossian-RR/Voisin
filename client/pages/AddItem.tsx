import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  CONDITION_CHOICES,
  EMPTY_DRAFT,
  MAX_PHOTOS,
  MIN_PHOTOS,
  validateNewItem,
  type NewItemDraft,
  type NewItemErrors,
} from "@shared/new-item";
import { PageHeader } from "@/components/layout/PageHeader";
import { FieldError, fieldClass } from "@/components/ProfileFields";
import { usePublishItem } from "@/lib/data";
import { toItemPhotoDataUrl } from "@/lib/image";
import { primaryButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function AddItem() {
  const navigate = useNavigate();
  const publish = usePublishItem();
  const [draft, setDraft] = useState<NewItemDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<NewItemErrors>({});
  const [reading, setReading] = useState(false);
  const busy = reading || publish.isPending;

  const update = (patch: Partial<NewItemDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors({});
  };

  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(
      0,
      MAX_PHOTOS - draft.photos.length,
    );
    event.target.value = "";
    setReading(true);
    const added: string[] = [];
    for (const file of files) {
      try {
        added.push(await toItemPhotoDataUrl(file));
      } catch {
        toast.error("Une image n’a pas pu être lue");
      }
    }
    setReading(false);
    update({ photos: [...draft.photos, ...added] });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateNewItem(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    publish.mutate(draft, {
      onSuccess: () => {
        toast.success(draft.isGift ? "Don publié" : "Objet publié");
        navigate("/");
      },
      onError: () =>
        toast.error("L’objet n’a pas pu être publié", {
          description: "Vérifiez votre connexion internet, puis réessayez.",
        }),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 px-5"
    >
      <PageHeader title="Je prête" className="px-0" />
      <label className="block text-sm font-bold">
        Titre
        <input
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          maxLength={80}
          className={cn(
            fieldClass,
            errors.title ? "border-destructive" : "border-border",
          )}
        />
      </label>
      {errors.title && <FieldError text={errors.title} />}
      <label className="block text-sm font-bold">
        Description
        <textarea
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={4}
          className={cn(
            fieldClass,
            "h-auto py-2",
            errors.description ? "border-destructive" : "border-border",
          )}
        />
      </label>
      {errors.description && <FieldError text={errors.description} />}

      <div>
        <p className="text-sm font-bold">
          Photos{" "}
          <span className="font-normal text-muted-foreground">
            ({MIN_PHOTOS} à {MAX_PHOTOS})
          </span>
        </p>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {draft.photos.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <button
                type="button"
                aria-label={`Retirer la photo ${i + 1}`}
                onClick={() =>
                  update({ photos: draft.photos.filter((_, j) => j !== i) })
                }
                className="absolute top-1 right-1 rounded-full bg-foreground/70 p-1 text-background"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {draft.photos.length < MAX_PHOTOS && (
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground">
              {reading ? "Lecture…" : "+ Ajouter"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={addPhotos}
                disabled={busy}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>
      {errors.photos && <FieldError text={errors.photos} />}

      <fieldset>
        <legend className="text-sm font-bold">État</legend>
        <div className="mt-1 flex gap-4">
          {CONDITION_CHOICES.map((condition) => (
            <label key={condition} className="flex items-center gap-2">
              <input
                type="radio"
                name="condition"
                checked={draft.condition === condition}
                onChange={() => update({ condition })}
              />
              {condition}
            </label>
          ))}
        </div>
      </fieldset>
      {errors.condition && <FieldError text={errors.condition} />}

      <label className="flex items-center gap-2 font-bold">
        <input
          type="checkbox"
          checked={draft.isGift}
          onChange={(e) => update({ isGift: e.target.checked })}
          className="size-5"
        />
        Je donne (il ne me sera pas rendu)
      </label>

      <button type="submit" disabled={busy} className={primaryButton}>
        {publish.isPending
          ? "Publication…"
          : draft.isGift
            ? "Publier le don"
            : "Publier"}
      </button>
    </form>
  );
}
