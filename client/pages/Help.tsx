import { useState, type FormEvent } from "react";
import { ChevronDown, Mail } from "lucide-react";
import {
  APP_MANAGER,
  HELP_TOPICS,
  RESIDENCE,
  helpMailto,
  residenceTitle,
  type HelpTopic,
} from "@shared/residence";
import { displayName } from "@shared/wanted";
import { PageHeader } from "@/components/layout/PageHeader";
import { useProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const STEPS = [
  "Vous contactez le responsable de l’app.",
  "Il crée votre résidence, ses bâtiments et leurs étages.",
  "Il ajoute chaque voisin à son logement (par exemple A-3a).",
  "Il désigne un administrateur parmi les voisins.",
];

export default function Help() {
  const profile = useProfile();
  const [topic, setTopic] = useState<HelpTopic>(HELP_TOPICS[0]);
  const [message, setMessage] = useState("");
  const hasManager = APP_MANAGER.email.trim() !== "";
  const canSend = hasManager && message.trim() !== "";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    window.location.href = helpMailto(
      APP_MANAGER.email,
      topic,
      message,
      { name: displayName(profile), location: profile.location },
      RESIDENCE,
    );
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Aide">
        Contactez le responsable de l’app pour mettre en place votre résidence.
      </PageHeader>

      <section aria-labelledby="steps-heading" className="mx-5 mt-4">
        <h2 id="steps-heading" className="font-display text-lg font-extrabold">
          Comment ça marche
        </h2>
        <ol className="mt-3 space-y-2.5">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5 text-[15px] leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-5 mt-6 rounded-3xl border border-border bg-card p-4 shadow-sm"
      >
        <h2 className="font-display text-lg font-extrabold">
          Écrire au responsable
        </h2>

        <label htmlFor="help-topic" className="mt-4 block text-sm font-bold">
          Sujet
        </label>
        <div className="relative mt-2">
          <select
            id="help-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value as HelpTopic)}
            className="h-12 w-full appearance-none rounded-2xl border border-border bg-background pr-10 pl-4 text-base focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {HELP_TOPICS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>

        <label htmlFor="help-message" className="mt-4 block text-sm font-bold">
          Message
        </label>
        <textarea
          id="help-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="mt-2 block w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base leading-relaxed focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Envoyé de la part de {displayName(profile)} ({profile.location}),{" "}
          {residenceTitle(RESIDENCE)} · {RESIDENCE.address}.
        </p>

        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-colors",
            canSend
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.99]"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          <Mail className="size-5" aria-hidden />
          Envoyer au responsable
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {hasManager
            ? "Votre application e-mail s’ouvre avec le message prêt à envoyer."
            : "L’adresse du responsable n’est pas encore renseignée."}
        </p>
      </form>
    </div>
  );
}
