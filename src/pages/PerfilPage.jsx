import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  LogOut,
  Pencil,
  Check,
  CalendarCheck,
  Pill,
  FileText,
  Droplets,
} from "lucide-react";
import Card from "../components/Card";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { getMoodLog, getWaterMap, getMeds, getExams, getWaterGoal } from "../lib/health";
import { overallAdherence } from "../lib/insights";
import { lastNDays } from "../lib/dates";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none ring-accent/40 input-field focus:border-accent focus:ring-2";

export default function PerfilPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    // Mesmas regras do backend (auth.validators.js), checadas antes de enviar.
    if (name.trim().length < 3) return setProfileError("O nome precisa ter pelo menos 3 caracteres.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setProfileError("Informe um e-mail válido.");
    setProfileError("");
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
      setEditing(false);
      showToast("Perfil atualizado!");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setName(user.name);
    setEmail(user.email);
    setProfileError("");
    setEditing(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const resumo = useMemo(() => {
    const last30 = lastNDays(30);
    const moodDates = new Set(getMoodLog(user.email).map((m) => m.date));
    const water = getWaterMap(user.email);
    const meds = getMeds(user.email);
    const waterGoal = getWaterGoal(user.email);
    return {
      diasRegistrados: last30.filter((d) => moodDates.has(d) || water[d]).length,
      metaAgua: last30.filter((d) => (water[d] || 0) >= waterGoal).length,
      adesao: overallAdherence(meds, lastNDays(7)),
      meds: meds.length,
      exames: getExams(user.email).length,
    };
  }, [user.email]);

  const initials = user.name
    .split(" ")
    .filter(Boolean)
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
        <Card className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: "40ms" }}>
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ring-4 ring-accent/10"
            style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-left">
            {!editing ? (
              <div>
                <p className="truncate text-lg font-semibold text-text-primary">{user.name}</p>
                <p className="truncate text-sm text-text-secondary">{user.email}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Nome"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="E-mail"
                  className={inputClass}
                />
                {profileError && (
                  <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                    {profileError}
                  </p>
                )}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/[0.06]"
              >
                {editing ? <Check size={14} strokeWidth={1.5} /> : <Pencil size={14} strokeWidth={1.5} />}
                {editing ? (saving ? "Salvando..." : "Salvar alterações") : "Editar dados"}
              </button>
              {editing && (
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="animate-fade-in-up" style={{ animationDelay: "70ms" }}>
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === "dark"}
              className="flex w-full items-center justify-between gap-3 rounded-lg"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                {theme === "dark" ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
                Modo escuro
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  theme === "dark" ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
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
            <LogOut size={16} strokeWidth={1.5} /> Sair da conta
          </button>
        </div>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "130ms" }}>
        <p className="meta-label mb-4">Seu resumo</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ResumoTile
            icon={CalendarCheck}
            iconClass="bg-accent/10 text-accent"
            value={`${resumo.diasRegistrados}/30`}
            label="Dias com registro no último mês"
          />
          <ResumoTile
            icon={Droplets}
            iconClass="bg-info/10 text-info"
            value={`${resumo.metaAgua} dias`}
            label="Meta de água batida no último mês"
          />
          <ResumoTile
            icon={Pill}
            iconClass="bg-purple/10 text-purple"
            value={resumo.adesao === null ? "—" : `${resumo.adesao}%`}
            label={`Adesão aos remédios (7 dias) · ${resumo.meds} cadastrado${resumo.meds === 1 ? "" : "s"}`}
          />
          <ResumoTile
            icon={FileText}
            iconClass="bg-amber/10 text-amber"
            value={resumo.exames}
            label={`Exame${resumo.exames === 1 ? "" : "s"} no prontuário`}
          />
        </div>
      </Card>

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

function ResumoTile({ icon: Icon, iconClass, value, label }) {
  return (
    <div className="rounded-xl bg-bg-primary p-3 transition-transform duration-200 hover:-translate-y-0.5 dark:bg-white/[0.03]">
      <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <p className="text-xl font-bold tabular-nums tracking-tight text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}
