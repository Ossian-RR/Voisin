import type { ReactNode } from "react";
import { useDocumentTitle } from "@/components/layout/PageHeader";

/** Full-page frame for the sign-in and welcome screens, with the Voisin logo. */
export function AuthScreen({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  useDocumentTitle(title);
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background sm:border-x sm:border-border">
      <main className="safe-top safe-bottom flex flex-1 flex-col px-5 pt-12 pb-8">
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 120 120"
            className="size-11 shrink-0"
            aria-hidden
            fill="none"
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline className="stroke-apricot" points="18,54 60,20 102,54" />
            <polyline className="stroke-primary" points="34,58 60,98 86,58" />
          </svg>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            Voisin
          </p>
        </div>
        <h1 className="font-display mt-10 text-2xl leading-tight font-extrabold tracking-tight">
          {title}
        </h1>
        <div className="mt-2 text-base text-muted-foreground">{intro}</div>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export const authFieldClass =
  "mt-2 h-12 w-full rounded-2xl border bg-background px-4 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export const authButtonClass =
  "mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none";
