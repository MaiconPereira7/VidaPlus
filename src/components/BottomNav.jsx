import { NavLink } from "react-router-dom";
import { Home, HeartPulse, Calendar, User } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/saude", label: "Saúde", icon: HeartPulse },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/85 backdrop-blur-2xl backdrop-saturate-150 pb-[env(safe-area-inset-bottom)] dark:bg-[#111111]/85 md:hidden"
      style={{ height: 68 }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden="true"
      />
      <div className="mx-auto flex h-full max-w-lg items-stretch justify-around">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-text-muted transition-colors"
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={isActive ? "text-accent" : "text-text-muted"}
                />
                <span className={isActive ? "text-accent" : undefined}>{label}</span>
                <span
                  className={`h-1 w-1 rounded-full transition-opacity ${
                    isActive ? "bg-accent opacity-100" : "opacity-0"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
