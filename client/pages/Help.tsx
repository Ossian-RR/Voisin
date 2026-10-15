import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import {
  APP_MANAGER,
  HELP_TOPICS,
  MIN_MESSAGE_LENGTH,
  RESIDENCE,
  helpMailto,
  residenceTitle,
  type HelpTopic,
} from "@shared/residence";
import { displayName } from "@shared/wanted";
import { useDocumentTitle } from "@/components/layout/PageHeader";
import { useProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

export default function Help() {
  const profile = useProfile();
  const [topic, setTopic] = useState<HelpTopic>(HELP_TOPICS[0]);
  const [message, setMessage] = useState("");
  useDocumentTitle("Aide");
  const length = message.trim().length;
  const canSend = length >= MIN_MESSAGE_LENGTH;

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
      <form
        onSubmit={handleSubmit}
        className="mx-5 mt-5 rounded-3xl border border-border bg-card p-4 shadow-sm"
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
          Envoyer
        </button>
        <p
          className="mt-2 text-center text-xs text-muted-foreground"
          aria-live="polite"
        >
          {canSend
            ? "Votre application e-mail s’ouvre avec le message prêt à envoyer."
            : `${MIN_MESSAGE_LENGTH} caractères minimum · ${length}/${MIN_MESSAGE_LENGTH}`}
        </p>
      </form>
    </div>
  );
}
