import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Inbox, LayoutGrid, Plus, Search, UserRound } from "lucide-react";
import { isMember, useMe, useMember } from "@/lib/auth";
import { useBorrowRequests } from "@/lib/data";
import { card, primaryButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "J’emprunte", icon: LayoutGrid },
  { to: "/search", label: "Je cherche", icon: Search },
  { to: "/add", label: "Je prête", icon: Plus },
  { to: "/requests", label: "Demandes", icon: Inbox },
  { to: "/profile", label: "Profil", icon: UserRound },
];

/** Pages that work before the neighbor belongs to a residence. */
const OPEN_PAGES = ["/profile", "/help"];

export default function AppLayout() {
  const me = useMe();
  const { pathname } = useLocation();
  const member = isMember(me);

  // First sign-in: start on Profil to fill it in.
  if (!me.profileId && pathname === "/") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
      <main className="safe-top flex flex-1 flex-col pb-24">
        {member || OPEN_PAGES.includes(pathname) ? <Outlet /> : <Onboarding />}
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
            {to === "/requests" && member && <WaitingBadge />}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Requests waiting for the neighbor's answer. */
function WaitingBadge() {
  const { profileId } = useMember();
  const waiting = (useBorrowRequests().data ?? []).filter(
    (r) => r.status === "pending" && r.item?.ownerId === profileId,
  ).length;
  if (waiting === 0) return null;
  return (
    <span className="absolute -top-1 right-3 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-white">
      {waiting}
    </span>
  );
}

/** What a new user sees on pages that need a residence. */
export function Onboarding() {
  const me = useMe();
  const step = !me.profileId
    ? {
        title: "Bienvenue sur Voisin !",
        text: "Commencez par compléter votre profil : civilité, nom et logement.",
        to: "/profile",
        action: "Compléter mon profil",
      }
    : {
        title: "Rejoignez votre résidence",
        text: "Voisin fonctionne entre voisins d’une même résidence. Écrivez-nous depuis l’Aide pour rejoindre la vôtre ou la créer : nous vous y ajoutons, puis vous voyez les objets de vos voisins.",
        to: "/help",
        action: "Demander via l’Aide",
      };
  return (
    <div className="flex flex-col gap-4 px-5 pt-8">
      <div className={card}>
        <h1 className="font-display text-xl font-extrabold">{step.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
      </div>
      <Link to={step.to} className={primaryButton}>
        {step.action}
      </Link>
    </div>
  );
}
