import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const APP_NAME = "Common Shed";

/** Sets the browser tab title, e.g. "Je cherche · Common Shed". */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}

/** One-line page title, matching the home page's "Résidence" header. */
export function PageHeader({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  useDocumentTitle(title);
  return (
    <header className={cn("px-5 pt-5", className)}>
      <h1 className="font-display text-xl font-extrabold tracking-tight">
        {title}
      </h1>
      {children && (
        <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>
      )}
    </header>
  );
}
