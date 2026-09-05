import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  LogOut,
  Pencil,
  Check,
  ClipboardList,
  Smile,
  Gauge,
  BarChart3,
  LineChart,
  ChevronRight,
} from "lucide-react";
import Card from "../components/Card";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-center text-sm text-text-primary outline-none ring-accent/40 focus:ring-2";

export default function PerfilPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleSave() {
    if (!name.trim() || !email.trim()) return;
    updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
    setEditing(false);
    showToast("Perfil atualizado!");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up">
        <h1 className="page-title">Perfil</h1>
        <p className="mt-1 text-sm text-text-secondary">Suas informações e preferências.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col items-center gap-3 py-6 text-center animate-fade-in-up" style={{ animationDelay: "40ms" }}>
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--info))" }}
          >
            {initials}
          </div>
          {!editing ? (
            <div>
              <p className="text-lg font-semibold text-text-primary">{user.name}</p>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
          ) : (
            <div className="w-full max-w-xs space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            {editing ? <Check size={14} /> : <Pencil size={14} />}
            {editing ? "Salvar alterações" : "Editar dados"}
          </button>
        </Card>

        <div className="space-y-4">
          <Card className="animate-fade-in-up" style={{ animationDelay: "70ms" }}>
            <button onClick={toggleTheme} className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                Modo escuro
              </span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  theme === "dark" ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
            <p className="mt-4 border-t border-border pt-3 text-center text-[11px] text-text-muted">
              VidaPlus v1.0 — Projeto IHC 2026.2
            </p>
          </Card>

          <button
            onClick={() => setConfirmOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/5 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "130ms" }}>
        <h2 className="section-label mb-3 flex items-center gap-1.5">
          <ClipboardList size={14} /> Avaliar o VidaPlus
        </h2>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <EvalButton
            onClick={() => navigate("/avaliacao/satisfacao")}
            icon={Smile}
            title="Pesquisa de Satisfação"
            subtitle="10 perguntas sobre sua experiência"
          />
          <EvalButton
            onClick={() => navigate("/avaliacao/nps")}
            icon={Gauge}
            title="NPS"
            subtitle="Qual a chance de recomendar?"
          />
          <EvalButton
            onClick={() => navigate("/avaliacao/sus")}
            icon={BarChart3}
            title="Escala SUS"
            subtitle="Avaliação padronizada de usabilidade"
          />
          <EvalButton
            onClick={() => navigate("/avaliacao/resultados")}
            icon={LineChart}
            title="Ver Resultados"
            subtitle="Acesso restrito (equipe do projeto)"
          />
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
    </div>
  );
}

function EvalButton({ onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-bg-card p-3.5 text-left shadow-sm transition-shadow hover:shadow-md dark:border-border dark:shadow-none"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-secondary text-text-secondary">
        <Icon size={19} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="truncate text-xs text-text-muted">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-text-muted" />
    </button>
  );
}
