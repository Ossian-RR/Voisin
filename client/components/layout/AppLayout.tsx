import { NavLink, Outlet } from "react-router-dom";
import { Inbox, LayoutGrid, Plus, Search, UserRound } from "lucide-react";
import { useMe } from "@/lib/auth";
import { useBorrowRequests } from "@/lib/data";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "J’emprunte", icon: LayoutGrid },
  { to: "/search", label: "Je cherche", icon: Search },
  { to: "/add", label: "Je prête", icon: Plus },
  { to: "/requests", label: "Demandes", icon: Inbox },
  { to: "/profile", label: "Profil", icon: UserRound },
];

export default function AppLayout() {
  const { profileId } = useMe();
  // Requests waiting for the neighbor's answer, shown on the tab.
  const waiting = (useBorrowRequests().data ?? []).filter(
    (r) => r.status === "pending" && r.item?.ownerId === profileId,
  ).length;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
      <main className="safe-top flex flex-1 flex-col pb-24">
        <Outlet />
      </main>
      <nav
        aria-label="Navigation principale"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto grid w-full max-w-[430px] grid-cols-5 border-t border-border bg-card py-2"
      >
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center gap-1 text-[11px] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon className="size-5" />
            {label}
            {to === "/requests" && waiting > 0 && (
              <span className="absolute -top-1 right-3 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-white">
                {waiting}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
