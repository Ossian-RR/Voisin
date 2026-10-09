import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Egg,
  Inbox,
  LayoutGrid,
  MapPin,
  Plus,
  UserRound,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const leftTabs = [
  { to: "/", label: "Items", icon: LayoutGrid, end: true },
  { to: "/food", label: "Food", icon: Egg, end: false },
];

const rightTabs = [
  { to: "/requests", label: "Requests", icon: Inbox, end: false },
  { to: "/profile", label: "Profile", icon: UserRound, end: false },
];

export default function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background sm:border-x sm:border-border">
      <header className="safe-top sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-3 px-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Warehouse className="size-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              Common Shed
            </span>
          </Link>
          <span className="inline-flex min-w-0 max-w-[9.5rem] items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            <MapPin className="size-3.5 shrink-0 text-apricot" />
            <span className="truncate">Lindenwood</span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col pb-28">
        <Outlet />
      </main>

      <nav
        aria-label="Main"
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
              aria-label="Add an item"
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
