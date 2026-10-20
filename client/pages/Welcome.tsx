import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { NeighborProfile } from "@shared/api";
import { defaultNeighbor } from "@shared/mock";
import {
  hasFieldChanges,
  validateProfile,
  type ProfileErrors,
} from "@shared/profile";
import { CIVILITIES } from "@shared/wanted";
import {
  AuthScreen,
  authButtonClass,
  authFieldClass,
} from "@/components/auth/AuthScreen";
import { useAuth } from "@/lib/auth";
import { readProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

/** Starts from what the neighbor typed before accounts existed, if anything. */
function initialDraft(): NeighborProfile {
  const saved = readProfile();
  if (hasFieldChanges(saved, defaultNeighbor)) {
    return {
      civility: saved.civility,
      lastName: saved.lastName,
      location: saved.location,
    };
  }
  return { civility: "Madame", lastName: "", location: "" };
}

/** First sign-in: the neighbor tells who they are and where they live. */
export default function Welcome() {
  const { createProfile, signOut } = useAuth();
  const [draft, setDraft] = useState<NeighborProfile>(initialDraft);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const update = (patch: Partial<NeighborProfile>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
    setFailed(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    const ok = await createProfile(draft);
    setSaving(false);
    if (!ok) setFailed(true);
  };

  return (
    <AuthScreen
      title="Bienvenue sur Voisin"
      intro="Présentez-vous à vos voisins : ils verront votre nom et votre logement à côté de vos objets."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-end gap-2">
          <div className="relative shrink-0">
            <select
              aria-label="Civilité"
              value={draft.civility}
              onChange={(event) =>
                update({
                  civility: event.target.value as NeighborProfile["civility"],
                })
              }
              className="h-12 appearance-none rounded-2xl border border-border bg-background pr-9 pl-4 text-base font-semibold focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {CIVILITIES.map((civility) => (
                <option key={civility} value={civility}>
                  {civility}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1">
            <label
              htmlFor="welcome-last-name"
              className="block text-sm font-bold"
            >
              Nom
            </label>
            <input
              id="welcome-last-name"
              value={draft.lastName}
              onChange={(event) => update({ lastName: event.target.value })}
              autoComplete="family-name"
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={
                errors.lastName ? "welcome-last-name-error" : undefined
              }
              className={cn(
                authFieldClass,
                errors.lastName
                  ? "border-destructive"
                  : "border-border focus:border-primary",
              )}
            />
          </div>
        </div>
        {errors.lastName && (
          <p
            id="welcome-last-name-error"
            className="mt-1.5 text-xs font-semibold text-destructive"
          >
            {errors.lastName}
          </p>
        )}

        <label
          htmlFor="welcome-location"
          className="mt-4 block text-sm font-bold"
        >
          Logement
        </label>
        <p id="welcome-location-hint" className="text-xs text-muted-foreground">
          Bâtiment, étage, porte. Par exemple A-3a.
        </p>
        <input
          id="welcome-location"
          value={draft.location}
          onChange={(event) => update({ location: event.target.value })}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(errors.location)}
          aria-describedby={
            errors.location
              ? "welcome-location-hint welcome-location-error"
              : "welcome-location-hint"
          }
          className={cn(
            authFieldClass,
            errors.location
              ? "border-destructive"
              : "border-border focus:border-primary",
          )}
        />
        {errors.location && (
          <p
            id="welcome-location-error"
            className="mt-1.5 text-xs font-semibold text-destructive"
          >
            {errors.location}
          </p>
        )}

        {failed && (
          <p
            role="alert"
            className="mt-4 text-sm font-semibold text-destructive"
          >
            Votre profil n’a pas pu être enregistré. Vérifiez votre connexion et
            réessayez.
          </p>
        )}

        <button type="submit" disabled={saving} className={authButtonClass}>
          {saving ? "Enregistrement…" : "Entrer dans Voisin"}
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 h-11 w-full rounded-2xl text-sm font-bold text-muted-foreground"
        >
          Se déconnecter
        </button>
      </form>
    </AuthScreen>
  );
}
