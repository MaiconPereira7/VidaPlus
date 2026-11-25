import { Fragment, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Trash2,
  Pencil,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus as MinusIcon,
  Droplets,
  Smile,
  Pill,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import AdesaoBar from "../components/AdesaoBar";
import BarChart from "../components/BarChart";
import Card from "../components/Card";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getMoodLog,
  moodMeta,
  getWaterMap,
  getMeds,
  isMedScheduledOn,
  getExams,
  addExam,
  updateExam,
  deleteExam,
  EXAM_STATUS,
  EXAM_STATUS_STYLES,
  getWaterGoal,
} from "../lib/health";
import { healthAlerts, medAdherence, overallAdherence } from "../lib/insights";
import {
  lastNDays,
  lastNDaysOffset,
  weekdayShort,
  formatDateBR,
  todayISO,
} from "../lib/dates";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 input-field focus:border-accent focus:ring-2";

const filterClass =
  "input-field rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none ring-accent/40 focus:border-accent focus:ring-2";

const ALERT_STYLES = {
  alto: { dot: "bg-danger", chip: "bg-danger/10 text-danger", label: "Importante" },
  medio: { dot: "bg-amber", chip: "bg-amber/10 text-amber", label: "Atenção" },
  baixo: { dot: "bg-info", chip: "bg-info/10 text-info", label: "Lembrete" },
};

function average(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function SaudePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const email = user.email;
  const waterGoal = useMemo(() => getWaterGoal(email), [email]);

  const [exams, setExams] = useState(() => getExams(email));
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());
  // Exame separado do "aberto" para o nome não sumir durante a animação de saída.
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // id do exame em edição; null = modal em modo "Novo exame".
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    date: todayISO(),
    result: "",
    status: "Normal",
    local: "",
  });
  const [pdfState, setPdfState] = useState({ status: "idle", fileName: "" });
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

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
    return last7.filter((d) => {
      const scheduled = meds.filter((m) => isMedScheduledOn(m, d));
      return scheduled.length > 0 && scheduled.every((m) => m.takenDates.includes(d));
    }).length;
  }, [last7, meds]);

  const waterWeek = useMemo(
    () =>
      last7.map((d) => ({
        label: weekdayShort(d),
        value: waterMap[d] || 0,
        highlight: d === todayISO(),
      })),
    [last7, waterMap]
  );
  const waterGoalDays = waterWeek.filter((d) => d.value >= waterGoal).length;

  const medsAdherence = useMemo(
    () => meds.map((m) => ({ med: m, adherence: medAdherence(m, last7) })),
    [meds, last7]
  );
  const adherenceTotal = useMemo(() => overallAdherence(meds, last7), [meds, last7]);

  const alerts = useMemo(
    () => healthAlerts({ days: last7, waterMap, waterGoal, moodByDate, meds, exams }),
    [last7, waterMap, waterGoal, moodByDate, meds, exams]
  );

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

  function handleSubmitExam(e) {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Informe o nome do exame.");
    if (!form.date) return setFormError("Informe a data do exame.");
    const data = { ...form, name: form.name.trim(), local: form.local.trim() };
    if (editingId) {
      updateExam(email, editingId, data);
      showToast("Exame atualizado com sucesso!");
    } else {
      addExam(email, data);
      showToast("Exame adicionado com sucesso!");
    }
    setExams(getExams(email));
    resetExamForm();
    setModalOpen(false);
  }

  function openEditExam(exam) {
    setForm({
      name: exam.name,
      date: exam.date,
      result: exam.result || "",
      status: exam.status,
      local: exam.local || "",
    });
    setEditingId(exam.id);
    setModalOpen(true);
  }

  function resetExamForm() {
    setEditingId(null);
    setForm({ name: "", date: todayISO(), result: "", status: "Normal", local: "" });
    setPdfState({ status: "idle", fileName: "" });
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePdfSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfState({ status: "loading", fileName: file.name });
    try {
      // pdf.js é pesado (~400 KB); só baixa quando o usuário escolhe um PDF.
      const { extractPdfText, parseExamPdfText } = await import("../lib/pdf");
      const text = await extractPdfText(file);
      const parsed = parseExamPdfText(text, file.name);
      setForm((f) => ({
        ...f,
        name: parsed.name || f.name,
        date: parsed.date || f.date,
        status: parsed.status,
        local: parsed.local || f.local,
        result: parsed.result,
      }));
      setPdfState({ status: "done", fileName: file.name });
      showToast("PDF lido! Confira os dados antes de salvar.");
    } catch {
      setPdfState({ status: "error", fileName: file.name });
      showToast("Não foi possível ler esse PDF.", "error");
    }
  }

  function handleConfirmDeleteExam() {
    if (!examToDelete) return;
    setExams(deleteExam(email, examToDelete.id));
    setDeleteOpen(false);
    showToast("Exame excluído com sucesso!");
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-in-up">
        <h1 className="page-title">Saúde</h1>
        <p className="mt-1 text-sm text-text-secondary">Acompanhe seu histórico e exames.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="relative animate-fade-in-up overflow-hidden bg-linear-to-br from-info/[0.06] to-transparent dark:from-info/10"
          style={{ animationDelay: "40ms" }}
        >
          <Droplets
            size={48}
            strokeWidth={1}
            className="pointer-events-none absolute -right-1 -top-1 text-[#2563eb] opacity-[0.07]"
          />
          <div className="mb-3 flex items-center gap-2.5 text-text-secondary">
            <span className="flex shrink-0 items-center justify-center rounded-xl bg-info/10 p-2.5 text-info dark:bg-info/20">
              <Droplets size={16} strokeWidth={1.5} />
            </span>
            <p className="meta-label">Hidratação média (7 dias)</p>
          </div>
          <p className="text-[28px] font-bold tracking-tight tabular-nums text-text-primary">{avgWater} copos</p>
        </Card>
        <Card
          className="relative animate-fade-in-up overflow-hidden bg-linear-to-br from-purple/[0.06] to-transparent dark:from-purple/10"
          style={{ animationDelay: "70ms" }}
        >
          <Smile
            size={48}
            strokeWidth={1}
            className="pointer-events-none absolute -right-1 -top-1 text-[#7c3aed] opacity-[0.07]"
          />
          <div className="mb-3 flex items-center gap-2.5 text-text-secondary">
            <span className="flex shrink-0 items-center justify-center rounded-xl bg-purple/10 p-2.5 text-purple dark:bg-purple/20">
              <Smile size={16} strokeWidth={1.5} />
            </span>
            <p className="meta-label">Humor mais frequente</p>
          </div>
          {mostFrequentMood ? (
            <p className="text-[28px] font-bold tracking-tight tabular-nums text-text-primary">
              {mostFrequentMood.emoji} {mostFrequentMood.label}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Sem dados</p>
          )}
        </Card>
        <Card
          className="relative animate-fade-in-up overflow-hidden bg-linear-to-br from-accent/[0.06] to-transparent dark:from-accent/[0.07]"
          style={{ animationDelay: "100ms" }}
        >
          <Pill
            size={48}
            strokeWidth={1}
            className="pointer-events-none absolute -right-1 -top-1 text-accent opacity-[0.07]"
          />
          <div className="mb-3 flex items-center gap-2.5 text-text-secondary">
            <span className="flex shrink-0 items-center justify-center rounded-xl bg-accent/10 p-2.5 text-accent dark:bg-accent/20">
              <Pill size={16} strokeWidth={1.5} />
            </span>
            <p className="meta-label">Dias com medicação completa</p>
          </div>
          <p className="text-[28px] font-bold tracking-tight tabular-nums text-accent">{completeMedDays} / 7</p>
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "115ms" }} hoverable={false}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <AlertTriangle size={16} strokeWidth={1.5} />
            <p className="meta-label">Pontos de atenção da semana</p>
          </div>
          {alerts.length > 0 && (
            <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">{alerts.length}</span>
          )}
        </div>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-accent/[0.06] px-3 py-3 dark:bg-accent/10">
            <ShieldCheck size={20} strokeWidth={1.5} className="shrink-0 text-accent" />
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Tudo em dia.</span> Nenhum ponto de atenção nos
              últimos 7 dias.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.map((a) => {
              const st = ALERT_STYLES[a.level];
              return (
                <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{a.text}</p>
                    {a.action && (
                      <Link
                        to={a.action.to}
                        className="mt-1 inline-flex items-center gap-0.5 text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
                      >
                        {a.action.label}
                        <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                  <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline ${st.chip}`}>
                    {st.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up" style={{ animationDelay: "125ms" }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Droplets size={16} strokeWidth={1.5} />
              <p className="meta-label">Hidratação (últimos 7 dias)</p>
            </div>
            <span className="rounded-full bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">
              Meta batida em {waterGoalDays}/7 dias
            </span>
          </div>
          <BarChart data={waterWeek} max={waterGoal} goal={waterGoal} color="var(--info)" height={160} />
          <p className="mt-3 text-xs text-text-muted">
            Meta: {waterGoal} copos por dia. Barras verdes = meta atingida.
          </p>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "135ms" }}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Pill size={16} strokeWidth={1.5} />
              <p className="meta-label">Adesão aos medicamentos (7 dias)</p>
            </div>
            {adherenceTotal !== null && (
              <span className="text-sm font-bold tabular-nums text-text-primary">{adherenceTotal}%</span>
            )}
          </div>
          {meds.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="Nenhum medicamento cadastrado"
              description="Cadastre seus remédios na Home para acompanhar a adesão aqui."
            />
          ) : (
            <ul className="space-y-3.5">
              {medsAdherence.map(({ med, adherence }) => (
                <li key={med.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {med.name}
                      {med.dosage && <span className="font-normal text-text-muted"> · {med.dosage}</span>}
                    </p>
                    <span className="shrink-0 text-xs text-text-muted">
                      {adherence ? `${adherence.taken}/${adherence.scheduled} doses` : "Sem doses previstas ainda"}
                    </span>
                  </div>
                  {adherence ? (
                    <AdesaoBar value={adherence.pct} />
                  ) : (
                    <div className="h-2 w-full rounded-full bg-border" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "145ms" }}>
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
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exame..."
              aria-label="Buscar exame"
              className={`${filterClass} w-full pl-9`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por status"
            className={filterClass}
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
            aria-label="Filtrar por data"
            className={filterClass}
          />
          {(statusFilter !== "Todos" || dateFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter("Todos");
                setDateFilter("");
                setSearch("");
              }}
              className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
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
            <table className="w-full min-w-0 text-left text-sm">
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
                        <td className="py-2.5 pr-2">
                          <p className="font-medium text-text-primary">{exam.name}</p>
                          {exam.local && <p className="text-xs text-text-muted">{exam.local}</p>}
                        </td>
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
                                openEditExam(exam);
                              }}
                              className="text-text-muted hover:text-accent"
                              aria-label={`Alterar exame ${exam.name}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExamToDelete(exam);
                                setDeleteOpen(true);
                              }}
                              className="text-text-muted hover:text-danger"
                              aria-label={`Excluir exame ${exam.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-border bg-bg-secondary/60">
                          <td colSpan={4} className="px-2 py-3 text-xs text-text-secondary">
                            {exam.local && (
                              <p className="mb-1 font-medium text-text-primary">Local: {exam.local}</p>
                            )}
                            <p className="whitespace-pre-line">
                              {exam.result || "Nenhuma observação registrada para este exame."}
                            </p>
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

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDeleteExam}
        title="Excluir exame"
        description={`Tem certeza que deseja excluir o exame '${examToDelete?.name ?? ""}'? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetExamForm();
        }}
        title={editingId ? "Alterar exame" : "Novo exame"}
      >
        <form onSubmit={handleSubmitExam} className="space-y-3">
          {!editingId && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfSelect}
                className="hidden"
                id="exam-pdf-input"
              />
              <label
                htmlFor="exam-pdf-input"
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed px-3 py-2.5 text-xs font-medium transition-colors ${
                  pdfState.status === "done"
                    ? "border-accent bg-accent/10 text-accent-hover dark:text-accent"
                    : "border-border text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {pdfState.status === "loading" ? (
                  <Loader2 size={16} className="shrink-0 animate-spin" />
                ) : pdfState.status === "done" ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <Upload size={16} className="shrink-0" />
                )}
                <span className="truncate">
                  {pdfState.status === "loading"
                    ? `Lendo ${pdfState.fileName}...`
                    : pdfState.status === "done"
                    ? `${pdfState.fileName} — dados preenchidos abaixo`
                    : pdfState.status === "error"
                    ? "Erro ao ler o PDF, tente outro arquivo"
                    : "Importar exame de um PDF (opcional)"}
                </span>
              </label>
            </div>
          )}
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
          <div className="grid grid-cols-2 gap-3">
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
              <label className="mb-1 block text-xs font-medium text-text-secondary">Local</label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
                placeholder="Ex: Laboratório Central"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Resultado</label>
            <textarea
              value={form.result}
              onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
              placeholder="Observações sobre o resultado"
              rows={3}
              aria-describedby="exam-result-help"
              className={`${inputClass} resize-none`}
            />
            <p id="exam-result-help" className="mt-1 text-[11px] text-text-muted">
              Dica: insira valores e observações do laudo médico
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Status</label>
            <div className="flex gap-2" role="group" aria-describedby="exam-status-help">
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
            <p id="exam-status-help" className="mt-1.5 text-[11px] leading-relaxed text-text-muted">
              <strong className="font-semibold">Normal</strong> = dentro da referência ·{" "}
              <strong className="font-semibold">Atenção</strong> = fora da referência ·{" "}
              <strong className="font-semibold">Crítico</strong> = requer ação urgente
            </p>
          </div>
          {formError && (
            <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {formError}
            </p>
          )}
          <button
            type="submit"
            className="btn-gradient w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          >
            {editingId ? "Salvar alterações" : "Adicionar exame"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
