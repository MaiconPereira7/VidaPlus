import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Home,
  HeartPulse,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/saude", label: "Saúde", icon: HeartPulse },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/perfil", label: "Perfil", icon: User },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-bg-secondary transition-[width] duration-200 md:flex ${
        collapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      <div className={`flex items-center px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-light text-accent-hover dark:bg-accent/15 dark:text-accent">
            <HeartPulse size={18} strokeWidth={2} />
          </div>
        ) : (
          <Logo size="sm" />
        )}
      </div>
      {!collapsed && (
        <p className="-mt-3 px-4 pb-4 text-[11px] italic text-text-muted">
          Sua saúde, centralizada.
        </p>
      )}

      <nav className="flex-1 space-y-0.5 px-3">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-black/[0.04] hover:text-text-primary dark:hover:bg-white/[0.06]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />
                )}
                <Icon size={20} strokeWidth={1.75} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <>
            <ChevronLeft size={16} /> Recolher
          </>
        )}
      </button>

      <div className="border-t border-border p-3">
        <div className={`flex items-center gap-2.5 rounded-lg px-1 py-1 ${collapsed ? "flex-col" : ""}`}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--info))" }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
              <p className="truncate text-xs text-text-muted">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Sair"
            title="Sair"
            className={`shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:text-danger ${
              collapsed ? "mt-1" : ""
            }`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Sair da conta"
        description="Tem certeza que deseja sair? Você precisará entrar novamente para acessar seus dados."
        confirmLabel="Sair"
      />
    </aside>
  );
}
