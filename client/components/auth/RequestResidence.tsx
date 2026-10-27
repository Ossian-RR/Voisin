import { useState, type FormEvent } from "react";
import {
  EMPTY_RESIDENCE_REQUEST,
  residenceRequestErrorMessage,
  residenceRequestRow,
  validateResidenceRequest,
  type ResidenceRequestDraft,
  type ResidenceRequestErrors,
} from "@shared/residence-request";
import { FieldError, fieldClass } from "@/components/ProfileFields";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AuthScreen, authButtonClass } from "./AuthScreen";

const FIELDS: {
  key: keyof ResidenceRequestDraft;
  label: string;
  type?: string;
  multiline?: boolean;
}[] = [
  { key: "contactName", label: "Votre nom" },
  { key: "email", label: "Votre adresse e-mail", type: "email" },
  { key: "address", label: "Adresse de la résidence" },
  {
    key: "flats",
    label: "Nombre de logements (environ, facultatif)",
    type: "number",
  },
  { key: "message", label: "Message (facultatif)", multiline: true },
];

/** For people whose residence isn't on Voisin yet: the request reaches the admin. */
export function RequestResidence({
  initialEmail = "",
  onBack,
}: {
  initialEmail?: string;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<ResidenceRequestDraft>({
    ...EMPTY_RESIDENCE_REQUEST,
    email: initialEmail,
  });
  const [errors, setErrors] = useState<ResidenceRequestErrors>({});
  const [failure, setFailure] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateResidenceRequest(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSending(true);
    // No .select(): visitors may send a request but never read one back.
    const { error } = await supabase
      .from("residence_requests")
      .insert(residenceRequestRow(draft));
    setSending(false);
    if (error) setFailure(residenceRequestErrorMessage(error));
    else setSent(true);
  };

  if (sent) {
    return (
      <AuthScreen
        title="Demande envoyée"
        intro={
          <>
            Merci ! Nous vous répondrons à{" "}
            <strong className="text-foreground">{draft.email.trim()}</strong>{" "}
            pour créer votre résidence sur Voisin et inviter vos voisins.
          </>
        }
      >
        <button type="button" onClick={onBack} className={authButtonClass}>
          Retour à la connexion
        </button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Voisin pour ma résidence"
      intro="Votre résidence n’est pas encore sur Voisin ? Écrivez-nous : nous la créons et vous invitons, vous et vos voisins."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {FIELDS.map(({ key, label, type, multiline }) => {
          const error = errors[key as keyof ResidenceRequestErrors];
          const props = {
            value: draft[key],
            onChange: (e: { target: { value: string } }) => {
              setDraft((d) => ({ ...d, [key]: e.target.value }));
              setErrors({});
              setFailure(undefined);
            },
            "aria-invalid": Boolean(error),
            className: cn(
              fieldClass,
              multiline && "h-auto py-2",
              error ? "border-destructive" : "border-border",
            ),
          };
          return (
            <div key={key}>
              <label className="block text-sm font-bold">
                {label}
                {multiline ? (
                  <textarea rows={4} maxLength={2000} {...props} />
                ) : (
                  <input
                    type={type ?? "text"}
                    inputMode={type === "number" ? "numeric" : undefined}
                    maxLength={200}
                    {...props}
                  />
                )}
              </label>
              {error && <FieldError text={error} />}
            </div>
          );
        })}
        {failure && <FieldError text={failure} />}
        <button type="submit" disabled={sending} className={authButtonClass}>
          {sending ? "Envoi…" : "Envoyer ma demande"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="h-11 w-full text-sm font-bold text-muted-foreground"
        >
          Retour
        </button>
      </form>
    </AuthScreen>
  );
}
