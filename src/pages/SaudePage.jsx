import { Fragment, useMemo, useState } from "react";
import {
  Plus,
  FileText,
  Trash2,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus as MinusIcon,
  Droplets,
  Smile,
  Pill,
} from "lucide-react";
import Card from "../components/Card";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getMoodLog,
  moodMeta,
  getWaterMap,
  getMeds,
  getExams,
  addExam,
  deleteExam,
  EXAM_STATUS,
  EXAM_STATUS_STYLES,
} from "../lib/health";
import {
  lastNDays,
  lastNDaysOffset,
  weekdayShort,
  formatDateBR,
  todayISO,
} from "../lib/dates";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:ring-2";

function average(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function SaudePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const email = user.email;

  const [exams, setExams] = useState(() => getExams(email));
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  const [form, setForm] = useState({
    name: "",
    date: todayISO(),
    result: "",
    status: "Normal",
  });

  const last7 = useMemo(() => lastNDays(7), []);
  const previous7 = useMemo(() => lastNDaysOffset(7, 7), []);
  const meds = useMemo(() => getMeds(email), [email]);

  const moodLog = useMemo(() => getMoodLog(email), [email]);
  const moodByDate = useMemo(() => {
    const map = {};
    moodLog.forEach((m) => (map[m.date] = m.mood));
    return map;
  }, [moodLog]);

  const waterMap = useMemo(() => getWaterMap(email), [email]);
  const avgWater = useMemo(() => {
    const values = last7.map((d) => waterMap[d] || 0);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [last7, waterMap]);

  const mostFrequentMood = useMemo(() => {
    const weekMoods = last7.map((d) => moodByDate[d]).filter(Boolean);
    if (weekMoods.length === 0) return null;
    const counts = {};
    weekMoods.forEach((m) => (counts[m] = (counts[m] || 0) + 1));
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return moodMeta(Number(best[0]));
  }, [last7, moodByDate]);

  const moodTrend = useMemo(() => {
    const current = average(last7.map((d) => moodByDate[d]).filter(Boolean));
    const previous = average(previous7.map((d) => moodByDate[d]).filter(Boolean));
    if (current === null || previous === null) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.15) return { direction: "same" };
    return { direction: diff > 0 ? "up" : "down" };
  }, [last7, previous7, moodByDate]);

  const completeMedDays = useMemo(() => {
    if (meds.length === 0) return 0;
    return last7.filter((d) => meds.every((m) => m.takenDates.includes(d))).length;
  }, [last7, meds]);

  const filteredExams = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exams.filter((e) => {
      if (statusFilter !== "Todos" && e.status !== statusFilter) return false;
      if (dateFilter && e.date !== dateFilter) return false;
      if (term && !e.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [exams, statusFilter, dateFilter, search]);

  function toggleExpanded(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddExam(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    addExam(email, form);
    setExams(getExams(email));
    setForm({ name: "", date: todayISO(), result: "", status: "Normal" });
    setModalOpen(false);
    showToast("Exame adicionado ao prontuário!");
  }

  function handleDeleteExam(id) {
    setExams(deleteExam(email, id));
    showToast("Exame removido.", "info");
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up">
        <h1 className="page-title">Saúde</h1>
        <p className="mt-1 text-sm text-text-secondary">Acompanhe seu histórico e exames.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="relative animate-fade-in-up overflow-hidden" style={{ animationDelay: "40ms" }}>
          <Droplets
            size={48}
            strokeWidth={1}
            className="pointer-events-none absolute -right-1 -top-1 text-[#2563eb] opacity-[0.07]"
          />
          <div className="mb-2 flex items-center gap-1.5 text-text-secondary">
            <Droplets size={16} strokeWidth={1.5} />
            <p className="meta-label">Hidratação média (7 dias)</p>
          </div>
          <p className="text-[28px] font-bold tracking-tight text-text-primary">{avgWater} copos</p>
        </Card>
        <Card className="relative animate-fade-in-up overflow-hidden" style={{ animationDelay: "70ms" }}>
          <Smile
            size={48}
            strokeWidth={1}
            className="pointer-events-none absolute -right-1 -top-1 text-[#7c3aed] opacity-[0.07]"
          />
          <div className="mb-2 flex items-center gap-1.5 text-text-secondary">
            <Smile size={16} strokeWidth={1.5} />
            <p className="meta-label">Humor mais frequente</p>
          </div>
          {mostFrequentMood ? (
            <p className="text-[28px] font-bold tracking-tight text-text-primary">
              {mostFrequentMood.emoji} {mostFrequentMood.label}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Sem dados</p>
          )}
        </Card>
        <Card className="relative animate-fade-in-up overflow-hidden" style={{ animationDelay: "100ms" }}>
          <Pill
            size={48}
            strokeWidth={1}
            className="pointer-events-none absolute -right-1 -top-1 text-accent opacity-[0.07]"
          />
          <div className="mb-2 flex items-center gap-1.5 text-text-secondary">
            <Pill size={16} strokeWidth={1.5} />
            <p className="meta-label">Dias com medicação completa</p>
          </div>
          <p className="text-[28px] font-bold tracking-tight text-accent">{completeMedDays} / 7</p>
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "130ms" }}>
        <div className="mb-4 flex items-center justify-between">
          <p className="meta-label">Histórico de humor (últimos 7 dias)</p>
          {moodTrend && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                moodTrend.direction === "up"
                  ? "bg-accent/10 text-accent-hover dark:text-accent"
                  : moodTrend.direction === "down"
                  ? "bg-danger/10 text-danger"
                  : "bg-border/60 text-text-secondary"
              }`}
            >
              {moodTrend.direction === "up" && <TrendingUp size={12} />}
              {moodTrend.direction === "down" && <TrendingDown size={12} />}
              {moodTrend.direction === "same" && <MinusIcon size={12} />}
              {moodTrend.direction === "up"
                ? "Melhor que a semana anterior"
                : moodTrend.direction === "down"
                ? "Pior que a semana anterior"
                : "Estável"}
            </span>
          )}
        </div>
        <div className="relative flex justify-between">
          <div className="absolute left-5 right-5 top-[18px] h-px bg-border" />
          {last7.map((d) => {
            const value = moodByDate[d];
            const meta = value ? moodMeta(value) : null;
            const isToday = d === todayISO();
            return (
              <div key={d} className="relative flex flex-col items-center gap-1.5">
                <div
                  className={`flex items-center justify-center rounded-full border bg-bg-card text-base ${
                    isToday ? "h-10 w-10 border-accent" : "h-9 w-9 border-border"
                  }`}
                >
                  {meta ? meta.emoji : <span className="text-text-muted">–</span>}
                </div>
                <span className="text-[10px] font-medium text-text-muted">{weekdayShort(d)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <FileText size={16} strokeWidth={1.5} />
            <p className="meta-label">Prontuário / Exames</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <Plus size={14} /> Novo Exame
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[160px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exame..."
              className="w-full rounded-lg border border-border bg-bg-secondary py-1.5 pl-8 pr-2 text-xs text-text-primary outline-none ring-accent/40 focus:ring-2"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary outline-none"
          >
            <option value="Todos">Todos os status</option>
            {EXAM_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary outline-none"
          />
          {(statusFilter !== "Todos" || dateFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter("Todos");
                setDateFilter("");
                setSearch("");
              }}
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Limpar
            </button>
          )}
        </div>

        {filteredExams.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum exame encontrado"
            description="Ajuste os filtros ou adicione um novo exame."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted">
                  <th className="pb-2 pr-2 font-medium">Nome do Exame</th>
                  <th className="pb-2 pr-2 font-medium">Data</th>
                  <th className="pb-2 pr-2 font-medium">Status</th>
                  <th className="pb-2 pr-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => {
                  const isOpen = expanded.has(exam.id);
                  return (
                    <Fragment key={exam.id}>
                      <tr
                        onClick={() => toggleExpanded(exam.id)}
                        className="cursor-pointer border-b border-border transition-colors odd:bg-transparent even:bg-black/[0.015] hover:bg-black/[0.03] dark:even:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                      >
                        <td className="py-2.5 pr-2 font-medium text-text-primary">{exam.name}</td>
                        <td className="py-2.5 pr-2 text-text-secondary">{formatDateBR(exam.date)}</td>
                        <td className="py-2.5 pr-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${EXAM_STATUS_STYLES[exam.status]}`}
                          >
                            {exam.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-1 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ChevronDown
                              size={16}
                              className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExam(exam.id);
                              }}
                              className="text-text-muted hover:text-danger"
                              aria-label="Excluir exame"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-border bg-bg-secondary/60">
                          <td colSpan={4} className="px-2 py-3 text-xs text-text-secondary">
                            {exam.result || "Nenhuma observação registrada para este exame."}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo exame">
        <form onSubmit={handleAddExam} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Nome do exame
            </label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Hemograma completo"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Resultado</label>
            <textarea
              value={form.result}
              onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
              placeholder="Observações sobre o resultado"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Status</label>
            <div className="flex gap-2">
              {EXAM_STATUS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                    form.status === s
                      ? `border-transparent ${EXAM_STATUS_STYLES[s]}`
                      : "border-border text-text-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Adicionar exame
          </button>
        </form>
      </Modal>
    </div>
  );
}
