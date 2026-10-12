import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

export default function Placeholder({ title }: { title: string }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <Hammer className="size-7" />
      </span>
      <h1 className="font-display mt-5 text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
        Cette page n’est pas encore prête. Elle arrive bientôt.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl border border-border bg-card px-5 text-sm font-bold"
      >
        Retour aux objets
      </Link>
    </section>
  );
}
