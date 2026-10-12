import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { displayName, todayIso } from "@shared/wanted";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/profile";
import { publishWantedRequest } from "@/lib/wanted-requests";

export default function Wanted() {
  const [text, setText] = useState("");
  const [wantedOn, setWantedOn] = useState("");
  const [wantedAt, setWantedAt] = useState("");
  const navigate = useNavigate();
  const profile = useProfile();
  const canPublish = text.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const request = publishWantedRequest({ text, wantedOn, wantedAt });
    if (!request) return;
    toast.success("Recherche publiée", {
      description: "Elle est visible par vos voisins sur l’accueil.",
    });
    // Show it where the neighbors see it: at the bottom of the home page.
    navigate("/", { state: { showWanted: request.id } });
  };

  return (
    <div className="flex flex-col px-5 pt-5">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-border bg-card p-4 shadow-sm"
      >
        <h1 className="font-display text-xl leading-tight font-extrabold tracking-tight">
          <label htmlFor="wanted-text">{displayName(profile)} recherche</label>
        </h1>
        <textarea
          id="wanted-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-gramm="false"
          className="mt-3 block w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base leading-relaxed focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />

        <label htmlFor="wanted-date" className="mt-4 block text-sm font-bold">
          pour la date du
        </label>
        <input
          id="wanted-date"
          type="date"
          value={wantedOn}
          min={todayIso(new Date())}
          onChange={(event) => setWantedOn(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />

        <label htmlFor="wanted-time" className="mt-4 block text-sm font-bold">
          à l’heure suivante :
        </label>
        <input
          id="wanted-time"
          type="time"
          value={wantedAt}
          onChange={(event) => setWantedAt(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />

        <button
          type="submit"
          disabled={!canPublish}
          className={cn(
            "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-colors",
            canPublish
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.99]"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          <Send className="size-5" />
          Publier ma recherche
        </button>
      </form>
    </div>
  );
}
