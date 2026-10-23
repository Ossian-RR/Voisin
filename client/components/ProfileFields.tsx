import type { NeighborProfile } from "@shared/api";
import { CIVILITIES, type ProfileErrors } from "@shared/profile";
import { cn } from "@/lib/utils";

export const fieldClass =
  "mt-1 h-12 w-full rounded-xl border bg-background px-3 text-base focus:border-primary focus:outline-none";

/** Civility, last name and flat, as on the welcome screen and the Profil page. */
export function ProfileFields({
  value,
  errors,
  onChange,
}: {
  value: NeighborProfile;
  errors: ProfileErrors;
  onChange: (patch: Partial<NeighborProfile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <label className="block shrink-0 text-sm font-bold">
          Civilité
          <select
            value={value.civility}
            onChange={(e) =>
              onChange({
                civility: e.target.value as NeighborProfile["civility"],
              })
            }
            className={cn(fieldClass, "border-border")}
          >
            {CIVILITIES.map((civility) => (
              <option key={civility}>{civility}</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 flex-1 text-sm font-bold">
          Nom
          <input
            value={value.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            className={cn(
              fieldClass,
              errors.lastName ? "border-destructive" : "border-border",
            )}
          />
        </label>
      </div>
      {errors.lastName && <FieldError text={errors.lastName} />}
      <label className="block text-sm font-bold">
        Logement
        <span className="block text-xs font-normal text-muted-foreground">
          Bâtiment, étage, porte. Par exemple A-3a.
        </span>
        <input
          value={value.location}
          onChange={(e) => onChange({ location: e.target.value })}
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(errors.location)}
          className={cn(
            fieldClass,
            errors.location ? "border-destructive" : "border-border",
          )}
        />
      </label>
      {errors.location && <FieldError text={errors.location} />}
    </div>
  );
}

export function FieldError({ text }: { text: string }) {
  return (
    <p role="alert" className="text-sm font-semibold text-destructive">
      {text}
    </p>
  );
}
