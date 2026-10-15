import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Gift, Loader2, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toItemPhotoDataUrl } from "@/lib/image";
import { publishItem } from "@/lib/items";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-2 w-full rounded-2xl border bg-background px-4 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default function AddItem() {
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<NewItemDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<NewItemErrors>({});
  const [isReadingPhotos, setIsReadingPhotos] = useState(false);

  const update = (patch: Partial<NewItemDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch))
        delete next[key as keyof NewItemErrors];
      return next;
    });
  };

  const handlePhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_PHOTOS - draft.photos.length;
    if (files.length > room) {
      toast(`${MAX_PHOTOS} photos maximum`, {
        description: `Seules les ${room} premières ont été ajoutées.`,
      });
    }
    setIsReadingPhotos(true);
    const added: string[] = [];
    let failed = 0;
    for (const file of files.slice(0, room)) {
      try {
        added.push(await toItemPhotoDataUrl(file));
      } catch {
        failed += 1;
      }
    }
    setIsReadingPhotos(false);
    if (failed > 0) {
      toast.error(
        failed === 1
          ? "Une image n’a pas pu être lue"
          : `${failed} images n’ont pas pu être lues`,
      );
    }
    if (added.length > 0) {
      setDraft((current) => ({
        ...current,
        photos: [...current.photos, ...added],
      }));
      setErrors((current) => ({ ...current, photos: undefined }));
    }
  };

  const removePhoto = (index: number) => {
    setDraft((current) => ({
      ...current,
      photos: current.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateNewItem(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const item = publishItem(draft);
    if (!item) {
      toast.error("Pas assez de place pour enregistrer", {
        description: "Retirez une photo ou un ancien objet, puis réessayez.",
      });
      return;
    }
    toast.success(draft.isGift ? "Don publié" : "Objet publié", {
      description: "Vos voisins le voient maintenant sur l’accueil.",
    });
    window.scrollTo({ top: 0 });
    navigate("/");
  };

  const photoCount = draft.photos.length;

  return (
    <div className="flex flex-col">
      <PageHeader title="Pour mes voisins, je mets à disposition…" />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-5 mt-3 rounded-3xl border border-border bg-card p-4 shadow-sm"
      >
        <label htmlFor="item-title" className="block text-sm font-bold">
          Titre
        </label>
        <input
          id="item-title"
          value={draft.title}
          onChange={(event) => update({ title: event.target.value })}
          maxLength={80}
          aria-invalid={Boolean(errors.title)}
          className={cn(
            fieldClass,
            "h-12",
            errors.title
              ? "border-destructive"
              : "border-border focus:border-primary",
          )}
        />
        {errors.title && <FieldError>{errors.title}</FieldError>}

        <label
          htmlFor="item-description"
          className="mt-4 block text-sm font-bold"
        >
          Description
        </label>
        <textarea
          id="item-description"
          value={draft.description}
          onChange={(event) => update({ description: event.target.value })}
          rows={4}
          aria-invalid={Boolean(errors.description)}
          className={cn(
            fieldClass,
            "block resize-none py-3 leading-relaxed",
            errors.description
              ? "border-destructive"
              : "border-border focus:border-primary",
          )}
        />
        {errors.description && <FieldError>{errors.description}</FieldError>}

        <fieldset className="mt-4" aria-describedby="item-photos-hint">
          <legend className="text-sm font-bold">Photos</legend>
          <p id="item-photos-hint" className="text-xs text-muted-foreground">
            {MIN_PHOTOS} minimum, {MAX_PHOTOS} maximum · {photoCount}/
            {MAX_PHOTOS}
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {draft.photos.map((src, index) => (
              <li key={`${index}-${src.length}`} className="relative">
                <img
                  src={src}
                  alt={`Photo ${index + 1}`}
                  className="aspect-square w-full rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Retirer la photo ${index + 1}`}
                  className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-foreground/75 text-background"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
            {photoCount < MAX_PHOTOS && (
              <li>
                <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  disabled={isReadingPhotos}
                  className={cn(
                    "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs font-semibold transition-colors",
                    errors.photos
                      ? "border-destructive/60 text-destructive"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {isReadingPhotos ? (
                    <Loader2 className="size-6 animate-spin" aria-hidden />
                  ) : (
                    <Camera className="size-6" aria-hidden />
                  )}
                  {isReadingPhotos ? "Lecture…" : "Ajouter"}
                </button>
              </li>
            )}
          </ul>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotos}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          {errors.photos && <FieldError>{errors.photos}</FieldError>}
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-bold">État</legend>
          <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
            {CONDITION_CHOICES.map((condition) => {
              const isActive = draft.condition === condition;
              return (
                <button
                  key={condition}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => update({ condition })}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : errors.condition
                        ? "border-destructive/60 bg-background"
                        : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  {condition}
                </button>
              );
            })}
          </div>
          {errors.condition && <FieldError>{errors.condition}</FieldError>}
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <label
            htmlFor="item-gift"
            className={cn(
              "inline-flex cursor-pointer items-center gap-3 rounded-full border py-1.5 pr-1.5 pl-4 font-bold transition-colors",
              draft.isGift
                ? "border-apricot/50 bg-accent text-accent-foreground"
                : "border-border bg-background",
            )}
          >
            Je donne
            <Switch
              id="item-gift"
              checked={draft.isGift}
              onCheckedChange={(isGift) => update({ isGift })}
              className="data-[state=checked]:bg-apricot"
            />
          </label>
          {draft.isGift && (
            <span className="text-xs font-semibold text-accent-foreground">
              Il ne vous sera pas rendu.
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isReadingPhotos}
          className={cn(
            "mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold shadow-lg transition-colors active:scale-[0.99]",
            draft.isGift
              ? "bg-apricot text-apricot-foreground shadow-apricot/25"
              : "bg-primary text-primary-foreground shadow-primary/25",
          )}
        >
          {draft.isGift && <Gift className="size-5" aria-hidden />}
          {draft.isGift ? "Publier le don" : "Publier"}
        </button>
      </form>
    </div>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <p className="mt-1.5 text-xs font-semibold text-destructive">{children}</p>
  );
}
