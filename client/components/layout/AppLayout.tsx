import { Link, NavLink, Outlet } from "react-router-dom";
import { Inbox, LayoutGrid, Plus, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const leftTabs = [
  { to: "/", label: "Objets", icon: LayoutGrid, end: true },
  { to: "/search", label: "Recherche", icon: Search, end: false },
];

const rightTabs = [
  { to: "/requests", label: "Demandes", icon: Inbox, end: false },
  { to: "/profile", label: "Profil", icon: UserRound, end: false },
];

export default function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background sm:border-x sm:border-border">
      <main className="safe-top flex flex-1 flex-col pb-28">
        <Outlet />
      </main>

      <nav
        aria-label="Navigation principale"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-border bg-card"
      >
        <ul className="grid grid-cols-5 items-end px-2 pt-2 pb-2">
          {leftTabs.map((tab) => (
            <li key={tab.to}>
              <TabLink {...tab} />
            </li>
          ))}
          <li className="flex justify-center">
            <Link
              to="/add"
              aria-label="Partager un objet"
              className="-mt-7 grid size-14 place-items-center rounded-2xl bg-apricot text-apricot-foreground shadow-lg shadow-apricot/30 transition-transform active:scale-95"
            >
              <Plus className="size-7" strokeWidth={2.5} />
            </Link>
          </li>
          {rightTabs.map((tab) => (
            <li key={tab.to}>
              <TabLink {...tab} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function TabLink({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  end: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "grid h-7 w-12 place-items-center rounded-full transition-colors",
              isActive && "bg-secondary",
            )}
          >
            <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}
