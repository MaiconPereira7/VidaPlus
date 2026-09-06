import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, HeartPulse, Calendar, User, LogOut, Sun, Moon } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/saude", label: "Saúde", icon: HeartPulse },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/perfil", label: "Perfil", icon: User },
];

export default function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

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
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-white/80 backdrop-blur-xl dark:bg-[#0A0A0A]/80 md:h-16">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-2 px-5 md:px-10 lg:px-16">
        <button onClick={() => navigate("/")} className="flex shrink-0 items-center gap-2">
          <span className="text-xl tracking-tight text-text-primary">
            <span className="font-light">Vida</span>
            <span className="font-bold text-accent">Plus</span>
          </span>
          <span className="relative flex h-2 w-2 shrink-0 rounded-full bg-accent animate-pulse-dot" />
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "font-semibold text-accent"
                    : "text-text-secondary hover:bg-black/[0.04] hover:text-text-primary dark:hover:bg-white/[0.05]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="hidden lg:inline">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-primary"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex"
              >
                {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[11px] font-semibold text-white transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
              aria-label="Menu do usuário"
              aria-expanded={menuOpen}
            >
              {initials}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-xl border border-transparent bg-bg-card p-2 shadow-lg dark:border-border dark:bg-[#171717] dark:shadow-none"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
                    <p className="truncate text-xs text-text-muted">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/5"
                  >
                    <LogOut size={16} strokeWidth={1.5} /> Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
    </header>
  );
}
