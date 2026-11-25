import { useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  FileText,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import ConfirmDialog from "../components/ConfirmDialog";
import { Avatar } from "../components/supervisor/ui";
import { useTheme } from "../context/ThemeContext";
import { ALERTAS, SUPERVISOR } from "../data/supervisorMock";
import { isSupervisorLogado, sairSupervisor } from "../lib/supervisorSession";


const ITEMS = [
  { to: "/supervisor/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/supervisor/pacientes", label: "Pacientes", icon: Users },
  { to: "/supervisor/relatorios", label: "Relatórios", icon: FileText },
  { to: "/supervisor/lembretes", label: "Lembretes", icon: Bell },
  { to: "/supervisor/configuracoes", label: "Configurações", icon: Settings },
];

export default function SupervisorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  useEffect(() => {
    if (!notifOpen) return;
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [notifOpen]);

  if (!isSupervisorLogado()) {
    return <Navigate to="/supervisor" replace />;
  }

  function handleLogout() {
    sairSupervisor();
    navigate("/supervisor", { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-bg-card transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"
        }`}
        aria-label="Navegação do supervisor"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-hover dark:text-accent">
              <ShieldCheck size={11} strokeWidth={2.25} />
              Supervisor
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-black/[0.04] hover:text-text-primary lg:hidden dark:hover:bg-white/[0.06]"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-accent-light text-accent-hover dark:text-accent"
                    : "text-text-secondary hover:bg-black/[0.04] hover:text-text-primary dark:hover:bg-white/[0.05]"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.75} className="transition-transform duration-150 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-white/85 px-4 backdrop-blur-2xl backdrop-saturate-150 sm:px-6 lg:px-8 dark:bg-[#0A0A0A]/85">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary lg:hidden dark:hover:bg-white/[0.06]"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <p className="text-sm text-text-secondary sm:text-base">
              Olá, <span className="font-semibold text-text-primary">{SUPERVISOR.primeiroNome}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary dark:hover:bg-white/[0.06]"
              aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary dark:hover:bg-white/[0.06]"
                aria-label={`Notificações (${ALERTAS.length} novas)`}
                aria-expanded={notifOpen}
              >
                <Bell size={19} />
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {ALERTAS.length}
                </span>
              </button>
              {notifOpen && (
                <div className="animate-scale-in absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-bg-card shadow-lg">
                  <p className="border-b border-border px-4 py-3 text-sm font-semibold text-text-primary">
                    Notificações
                  </p>
                  <ul className="max-h-80 overflow-y-auto">
                    {ALERTAS.map((a) => (
                      <li key={a.id}>
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(`/supervisor/pacientes/${a.pacienteId}`);
                          }}
                          className="w-full px-4 py-3 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                        >
                          <p className="text-sm text-text-primary">{a.texto}</p>
                          <p className="mt-0.5 text-xs text-text-muted">{a.quando}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/supervisor/configuracoes")}
              className="ml-1 rounded-full transition-transform hover:scale-105"
              aria-label="Abrir perfil"
            >
              <Avatar nome={SUPERVISOR.nome} size="sm" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Sair do painel?"
        description="Você precisará entrar novamente para acessar o Painel do Supervisor."
        confirmLabel="Sair"
      />
    </div>
  );
}
