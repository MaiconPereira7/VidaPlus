import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Droplets,
  Footprints,
  Pill,
  BellRing,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  Smile,
  CalendarOff,
  Calendar,
  ArrowRight,
  Gauge,
  BarChart3,
  Activity,
  ClipboardCheck,
  ChevronRight,
  Lock,
  Undo2,
} from "lucide-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import ProgressRing from "../components/ProgressRing";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import MiniCalendar from "../components/MiniCalendar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  MOOD_OPTIONS,
  getMoodToday,
  getMoodOnDate,
  setMoodToday,
  getWaterToday,
  getWaterOnDate,
  setWaterToday,
  WATER_GOAL,
  getStepsToday,
  getStepsOnDate,
  setStepsToday,
  STEPS_GOAL,
  getMeds,
  addMed,
  deleteMed,
  toggleMedTakenToday,
  isMedScheduledOn,
  WEEKDAY_OPTIONS,
  getExams,
} from "../lib/health";
import { getAppointmentsByDate, getDateColorsMap, typeMeta, APPOINTMENT_TYPES } from "../lib/agenda";
import { getDashboardResumo } from "../lib/dashboard";
import { getTestProgress, allMissionsDone } from "../lib/testes";
import { isValidAdminCode } from "../lib/adminAccess";
import { todayISO, yesterdayISO, formatFriendlyDate, formatShortDate } from "../lib/dates";

const BLUE = "#2563eb";
const AMBER = "#d97706";
const PURPLE = "#7c3aed";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:ring-2";

// Botões de ajuste de água/passos. O hover é só CSS (enabled:hover) para não
// ficar "grudado" quando o botão é desabilitado com o mouse em cima.
const roundBtn =
  "flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-30";
const pillBase =
  "rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30";

const emptyMedForm = { name: "", dosage: "", time: "", frequency: "diario", days: [] };

function medDaysLabel(med) {
  if (med.frequency !== "especifico" || !med.days?.length) return null;
  return med.days.map((d) => WEEKDAY_OPTIONS[d].label.slice(0, 3).toLowerCase()).join(", ");
}

export default function HomePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const email = user.email;
  const today = todayISO();
  const firstName = user.name.split(" ")[0];
  const dateLabel = formatFriendlyDate(today);

  const [mood, setMood] = useState(() => getMoodToday(email));
  const yesterdayMood = useMemo(() => getMoodOnDate(email, yesterdayISO()), [email]);
  const [water, setWater] = useState(() => getWaterToday(email));
  const [steps, setSteps] = useState(() => getStepsToday(email));
  const [meds, setMeds] = useState(() => getMeds(email));
  const [exams] = useState(() => getExams(email));
  const [testProgress] = useState(() => getTestProgress(email));
  const [selectedDay, setSelectedDay] = useState(today);
  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [gerencial, setGerencial] = useState(null);
  const [gerencialUnlocked, setGerencialUnlocked] = useState(false);
  const [gerencialCode, setGerencialCode] = useState("");
  const [gerencialError, setGerencialError] = useState("");
  const [calendarColors, setCalendarColors] = useState(new Map());
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [medForm, setMedForm] = useState(emptyMedForm);
  const [medError, setMedError] = useState("");
  // Só a busca mais recente atualiza os lembretes (cliques rápidos no calendário).
  const dayRequestId = useRef(0);

  const isSelectedToday = selectedDay === today;
  const dayWater = useMemo(
    () => (isSelectedToday ? water : getWaterOnDate(email, selectedDay)),
    [isSelectedToday, water, email, selectedDay]
  );
  const daySteps = useMemo(
    () => (isSelectedToday ? steps : getStepsOnDate(email, selectedDay)),
    [isSelectedToday, steps, email, selectedDay]
  );

  function handleUnlockGerencial(e) {
    e.preventDefault();
    if (isValidAdminCode(gerencialCode)) {
      setGerencialUnlocked(true);
      setGerencialError("");
    } else {
      setGerencialError("Código incorreto.");
    }
  }

  const examMeta = typeMeta("Exame");
  const examsForSelectedDay = useMemo(
    () => exams.filter((e) => e.date === selectedDay),
    [exams, selectedDay]
  );
  const dayItems = useMemo(() => {
    const examItems = examsForSelectedDay.map((e) => ({
      id: `exam-${e.id}`,
      time: null,
      title: e.name,
      type: "Exame",
    }));
    return [...reminders, ...examItems].sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  }, [reminders, examsForSelectedDay]);
  const calendarColorsWithExams = useMemo(() => {
    const map = new Map(calendarColors);
    exams.forEach((e) => {
      const colors = map.get(e.date) || [];
      if (!colors.includes(examMeta.color)) map.set(e.date, [...colors, examMeta.color]);
    });
    return map;
  }, [calendarColors, exams, examMeta.color]);

  function loadDay(date) {
    const id = ++dayRequestId.current;
    setRemindersLoading(true);
    getAppointmentsByDate(date)
      .then((items) => id === dayRequestId.current && setReminders(items))
      .catch((err) => id === dayRequestId.current && showToast(err.message, "error"))
      .finally(() => id === dayRequestId.current && setRemindersLoading(false));
  }

  useEffect(() => {
    loadDay(today);
    getDashboardResumo()
      .then(setGerencial)
      .catch(() => setGerencial(false));
    getDateColorsMap()
      .then(setCalendarColors)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectDay(date) {
    setSelectedDay(date);
    loadDay(date);
  }

  function goToAgenda() {
    navigate("/agenda", { state: { date: selectedDay } });
  }

  function handleMood(value) {
    const entry = setMoodToday(email, value);
    setMood(entry);
    showToast("Humor registrado. Obrigado por compartilhar!");
  }

  function adjustWater(delta) {
    setWater(setWaterToday(email, water + delta));
  }

  function adjustSteps(delta) {
    setSteps(setStepsToday(email, steps + delta));
  }

  function handleAddMed(e) {
    e.preventDefault();
    if (!medForm.name.trim()) return setMedError("Informe o nome do medicamento.");
    if (!medForm.time) return setMedError("Informe o horário do medicamento.");
    if (medForm.frequency === "especifico" && medForm.days.length === 0)
      return setMedError("Escolha pelo menos um dia da semana.");
    addMed(email, { ...medForm, name: medForm.name.trim(), dosage: medForm.dosage.trim() });
    setMeds(getMeds(email));
    closeMedModal();
    showToast("Medicamento adicionado!");
  }

  function toggleMedFormDay(day) {
    setMedForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  }

  function closeMedModal() {
    setMedModalOpen(false);
    setMedForm(emptyMedForm);
    setMedError("");
  }

  function handleToggleMed(id) {
    setMeds(toggleMedTakenToday(email, id));
  }

  function handleDeleteMed(id) {
    setMeds(deleteMed(email, id));
    showToast("Medicamento removido.", "info");
  }

  const sortedMeds = [...meds].sort((a, b) => a.time.localeCompare(b.time));
  // Remédios de "dias específicos" que não caem hoje continuam na lista (para
  // o usuário ver que estão cadastrados), mas não contam para o progresso.
  const todaysMeds = sortedMeds.filter((m) => isMedScheduledOn(m, today));
  const medsTaken = todaysMeds.filter((m) => m.takenDates.includes(today)).length;
  const allMedsTaken = todaysMeds.length > 0 && medsTaken === todaysMeds.length;
  const currentMood = mood ? MOOD_OPTIONS.find((m) => m.value === mood.mood) : null;

  const summaryStats = [
    {
      icon: Pill,
      label: "Remédios hoje",
      value: todaysMeds.length ? `${medsTaken}/${todaysMeds.length}` : "—",
      color: "var(--accent)",
    },
    { icon: Droplets, label: "Copos de água", value: water, color: BLUE },
    { icon: Footprints, label: "Passos", value: steps.toLocaleString("pt-BR"), color: AMBER },
    { icon: Smile, label: "Humor hoje", value: currentMood ? currentMood.label : "—", color: PURPLE },
  ];

  return (
    <div className="space-y-5">
      <div className="mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Olá, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm lowercase text-text-secondary">{dateLabel}</p>
      </div>

      {!allMissionsDone(testProgress) && (
        <button
          onClick={() => navigate("/testes")}
          className="w-full animate-fade-in-up rounded-2xl border border-accent/20 bg-accent/5 p-4 text-left transition-colors hover:bg-accent/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ClipboardCheck size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Teste o VidaPlus! 🧪</p>
                <p className="text-xs text-text-secondary">Complete 3 missões para conhecer o app</p>
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-accent" />
          </div>
          <div className="mt-3 flex gap-1.5">
            {["m1", "m2", "m3"].map((m) => (
              <div
                key={m}
                className={`h-1.5 flex-1 rounded-full ${testProgress[m] ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </div>
        </button>
      )}

      <div className="-mx-5 overflow-x-auto px-5 md:hidden">
        <div className="flex gap-2.5" style={{ width: "max-content" }}>
          {summaryStats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-xl border border-border px-3 py-2.5"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${s.color}1a`, color: s.color }}
              >
                <s.icon size={14} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">{s.value}</p>
                <p className="text-[10px] text-text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card className="animate-fade-in-up" style={{ animationDelay: "40ms" }}>
            <p className="meta-label mb-4">Check-in de humor</p>
            <div className="flex flex-wrap justify-center gap-2">
              {MOOD_OPTIONS.map((m) => {
                const active = mood?.mood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => handleMood(m.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-150 ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-text-secondary opacity-70 hover:opacity-100"
                    }`}
                    style={active ? { boxShadow: "0 0 0 3px var(--accent-glow)" } : undefined}
                    aria-label={m.label}
                    aria-pressed={active}
                  >
                    <motion.span
                      className="text-xl leading-none"
                      animate={{ scale: active ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {m.emoji}
                    </motion.span>
                    <span className="text-[13px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {currentMood && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-medium text-accent"
                >
                  <CheckCircle2 size={14} strokeWidth={1.5} />
                  Você está se sentindo {currentMood.label.toLowerCase()} hoje
                </motion.p>
              )}
            </AnimatePresence>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-text-muted">
              {yesterdayMood ? (
                <>
                  Ontem: {MOOD_OPTIONS.find((m) => m.value === yesterdayMood.mood)?.emoji}{" "}
                  {MOOD_OPTIONS.find((m) => m.value === yesterdayMood.mood)?.label}
                </>
              ) : (
                "Ontem: sem registro"
              )}
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: "80ms" }}>
              <div className="mb-3 flex w-full items-center gap-1.5" style={{ color: BLUE }}>
                <Droplets size={16} strokeWidth={1.5} />
                <span className="meta-label text-current">
                  {isSelectedToday ? "Hidratação" : `Hidratação · ${formatShortDate(selectedDay)}`}
                </span>
              </div>
              <ProgressRing value={dayWater} max={WATER_GOAL} color={BLUE}>
                <span className="stat-number">{dayWater}</span>
                <span className="text-[10px] text-text-muted">/ {WATER_GOAL}</span>
              </ProgressRing>
              <p className="mt-2 text-xs text-text-secondary">copos de água</p>
              <ProgressBar value={dayWater} max={WATER_GOAL} color={BLUE} height="h-1" trackClassName="mt-3" />
              {isSelectedToday ? (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => adjustWater(-1)}
                    disabled={water <= 0}
                    className={`${roundBtn} enabled:hover:border-info enabled:hover:bg-info enabled:hover:text-white`}
                    aria-label="Remover copo"
                  >
                    <Minus size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => adjustWater(1)}
                    className={`${roundBtn} enabled:hover:border-info enabled:hover:bg-info enabled:hover:text-white`}
                    aria-label="Adicionar copo"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-center text-xs text-text-muted">Editável apenas para hoje</p>
              )}
            </Card>

            <Card className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: "110ms" }}>
              <div className="mb-3 flex w-full items-center gap-1.5" style={{ color: AMBER }}>
                <Footprints size={16} strokeWidth={1.5} />
                <span className="meta-label text-current">
                  {isSelectedToday ? "Passos" : `Passos · ${formatShortDate(selectedDay)}`}
                </span>
              </div>
              <ProgressRing value={daySteps} max={STEPS_GOAL} color={AMBER}>
                <span className="text-2xl font-bold tracking-tight text-text-primary">
                  {daySteps >= 1000 ? `${(daySteps / 1000).toFixed(1)}k` : daySteps}
                </span>
                <span className="text-[10px] text-text-muted">/ {(STEPS_GOAL / 1000).toFixed(0)}k</span>
              </ProgressRing>
              <p className="mt-2 text-xs text-text-secondary">meta diária</p>
              <ProgressBar value={daySteps} max={STEPS_GOAL} color={AMBER} height="h-1" trackClassName="mt-3" />
              {isSelectedToday ? (
                // Teste de usabilidade: com os seis botões juntos, -1000/-500/-100
                // pareciam "ações principais". Agora adicionar e corrigir ficam
                // em grupos separados e rotulados, com a correção em segundo plano.
                <div className="mt-4 w-full space-y-3">
                  <div role="group" aria-labelledby="steps-add-label">
                    <p
                      id="steps-add-label"
                      className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-amber"
                    >
                      Adicionar passos
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {[100, 500, 1000].map((inc) => (
                        <button
                          key={`inc-${inc}`}
                          onClick={() => adjustSteps(inc)}
                          className={`${pillBase} border-amber/40 bg-amber/10 font-semibold text-amber enabled:hover:border-amber enabled:hover:bg-amber enabled:hover:text-white`}
                          aria-label={`Adicionar ${inc} passos`}
                        >
                          +{inc}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    role="group"
                    aria-labelledby="steps-fix-label"
                    className="border-t border-dashed border-border pt-2.5"
                  >
                    <p
                      id="steps-fix-label"
                      className="mb-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted"
                    >
                      <Undo2 size={11} strokeWidth={2} /> Corrigir passos
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {[100, 500, 1000].map((dec) => (
                        <button
                          key={`dec-${dec}`}
                          onClick={() => adjustSteps(-dec)}
                          disabled={steps <= 0}
                          title={`Corrigir: remover ${dec} passos registrados por engano`}
                          className={`${pillBase} border-border font-medium text-text-muted enabled:hover:border-danger enabled:hover:bg-danger enabled:hover:text-white`}
                          aria-label={`Corrigir: remover ${dec} passos`}
                        >
                          −{dec}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-center text-xs text-text-muted">Editável apenas para hoje</p>
              )}
            </Card>
          </div>
        </div>

        <Card className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Calendar size={16} strokeWidth={1.5} />
              <span className="meta-label">Agenda do mês</span>
            </div>
            <button
              onClick={goToAgenda}
              className="flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Ver tudo <ArrowRight size={14} />
            </button>
          </div>
          <MiniCalendar
            selectedDate={selectedDay}
            onSelectDate={handleSelectDay}
            colorsByDate={calendarColorsWithExams}
          />
          <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
            {APPOINTMENT_TYPES.map((t) => (
              <span key={t.value} className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.value}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="hidden animate-fade-in-up md:block" style={{ animationDelay: "130ms" }}>
        <p className="section-label mb-3">Resumo do dia</p>
        <div className="flex items-center justify-between gap-4">
          {summaryStats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${s.color}1a`, color: s.color }}
              >
                <s.icon size={18} strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-text-primary">{s.value}</p>
                <p className="truncate text-[11px] text-text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up md:col-span-2" style={{ animationDelay: "160ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Pill size={16} strokeWidth={1.5} />
              <span className="meta-label">Medicamentos de hoje</span>
            </div>
            <button
              onClick={() => setMedModalOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
              aria-label="Adicionar medicamento"
            >
              <Plus size={15} strokeWidth={1.5} />
            </button>
          </div>
          {sortedMeds.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Pill size={40} strokeWidth={1.5} className="text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-secondary">Nenhum medicamento cadastrado</p>
                <p className="mt-0.5 max-w-[240px] text-xs text-text-muted">
                  Adicione seus remédios para acompanhar os horários certinhos.
                </p>
              </div>
              <button
                onClick={() => setMedModalOpen(true)}
                className="mt-1 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Adicionar primeiro medicamento
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {sortedMeds.map((med) => {
                  const taken = med.takenDates.includes(today);
                  const scheduledToday = isMedScheduledOn(med, today);
                  const daysLabel = medDaysLabel(med);
                  return (
                    <li
                      key={med.id}
                      className={`group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 ${
                        scheduledToday ? "" : "opacity-60"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: !scheduledToday ? "var(--border-color)" : taken ? "var(--accent)" : AMBER,
                        }}
                      />
                      {scheduledToday ? (
                        <button
                          onClick={() => handleToggleMed(med.id)}
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                            taken ? "border-accent bg-accent" : "border-border"
                          }`}
                          aria-label={`${med.name}: ${taken ? "marcar como não tomado" : "marcar como tomado"}`}
                          aria-pressed={taken}
                        >
                          {taken && <Check size={12} strokeWidth={3} className="text-white" />}
                        </button>
                      ) : (
                        <span className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            taken ? "text-text-muted line-through" : "text-text-primary"
                          }`}
                        >
                          {med.name}
                          {med.dosage && (
                            <span className="font-normal text-text-muted"> · {med.dosage}</span>
                          )}
                        </p>
                        {daysLabel && (
                          <p className="truncate text-[11px] text-text-muted">
                            {scheduledToday ? daysLabel : `Hoje não · ${daysLabel}`}
                          </p>
                        )}
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-bg-secondary px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                        <Clock size={12} strokeWidth={1.5} />
                        {med.time}
                      </span>
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="shrink-0 text-text-muted transition-opacity hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                        aria-label={`Excluir ${med.name}`}
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <AnimatePresence>
                {allMedsTaken && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-light px-3 py-2 text-xs font-medium text-accent-hover dark:text-accent">
                      <CheckCircle2 size={14} strokeWidth={1.5} />
                      Todos os medicamentos do dia foram tomados!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </Card>

        <Card className="animate-fade-in-up md:col-span-2" style={{ animationDelay: "190ms" }}>
          <div className="mb-3 flex items-center gap-1.5 text-text-secondary">
            <BellRing size={16} strokeWidth={1.5} />
            <span className="meta-label">
              {selectedDay === today ? "Lembretes de hoje" : `Lembretes de ${formatShortDate(selectedDay)}`}
            </span>
          </div>
          {remindersLoading ? (
            <p className="py-6 text-center text-sm text-text-muted">Carregando...</p>
          ) : dayItems.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="Dia livre!"
              description={
                selectedDay === today
                  ? "Nenhum compromisso para hoje."
                  : "Nenhum compromisso nesta data."
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {dayItems.map((r) => {
                const meta = typeMeta(r.type);
                return (
                  <li key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="w-12 shrink-0 text-sm font-semibold text-text-primary">{r.time || "—"}</span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{r.title}</p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                    >
                      {r.type}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="animate-fade-in-up md:col-span-2 lg:col-span-4" style={{ animationDelay: "220ms" }}>
          <div className="mb-4 flex items-center gap-1.5 text-text-secondary">
            <Activity size={16} strokeWidth={1.5} />
            <span className="meta-label">Visão gerencial do VidaPlus</span>
          </div>
          {!gerencialUnlocked ? (
            <form onSubmit={handleUnlockGerencial} className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm text-text-muted">
                <Lock size={15} strokeWidth={1.5} /> Acesso restrito à equipe do projeto.
              </span>
              <div className="flex min-w-[220px] flex-1 items-center gap-2">
                <input
                  type="password"
                  value={gerencialCode}
                  onChange={(e) => setGerencialCode(e.target.value)}
                  placeholder="Código de acesso"
                  className="flex-1 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none ring-accent/40 focus:ring-2"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Ver
                </button>
              </div>
              {gerencialError && <p className="w-full text-xs font-medium text-danger">{gerencialError}</p>}
            </form>
          ) : gerencial === null ? (
            <p className="text-sm text-text-muted">Carregando indicadores...</p>
          ) : gerencial === false ? (
            <p className="text-sm text-text-muted">Não foi possível carregar os indicadores agora.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <IndicadorGerencial
                icon={Gauge}
                label="NPS"
                valor={gerencial.avaliacoes.nps.score ?? "—"}
                cor={PURPLE}
              />
              <IndicadorGerencial
                icon={BarChart3}
                label={`SUS${gerencial.avaliacoes.sus.nota ? ` · nota ${gerencial.avaliacoes.sus.nota}` : ""}`}
                valor={gerencial.avaliacoes.sus.mediaScore ?? "—"}
                cor={gerencial.avaliacoes.sus.corNota || AMBER}
              />
              <IndicadorGerencial
                icon={Smile}
                label="Satisfação"
                valor={
                  gerencial.avaliacoes.satisfacao.mediaGeral !== null
                    ? `${gerencial.avaliacoes.satisfacao.mediaGeral}/5`
                    : "—"
                }
                cor={BLUE}
              />
              <IndicadorGerencial
                icon={CalendarOff}
                label="Consultas registradas"
                valor={gerencial.consultas.total}
                cor="var(--accent)"
              />
            </div>
          )}
        </Card>
      </div>

      <Modal open={medModalOpen} onClose={closeMedModal} title="Novo medicamento">
        <form onSubmit={handleAddMed} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Nome do medicamento
            </label>
            <input
              autoFocus
              type="text"
              value={medForm.name}
              onChange={(e) => setMedForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Losartana"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Dosagem (opcional)
            </label>
            <input
              type="text"
              value={medForm.dosage}
              onChange={(e) => setMedForm((f) => ({ ...f, dosage: e.target.value }))}
              placeholder="Ex: 50mg"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Horário
              </label>
              <input
                type="time"
                value={medForm.time}
                onChange={(e) => setMedForm((f) => ({ ...f, time: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Frequência
              </label>
              <select
                value={medForm.frequency}
                onChange={(e) => setMedForm((f) => ({ ...f, frequency: e.target.value }))}
                className={inputClass}
              >
                <option value="diario">Diário</option>
                <option value="especifico">Dias específicos</option>
              </select>
            </div>
          </div>
          {medForm.frequency === "especifico" && (
            <div>
              <p className="mb-1 block text-xs font-medium text-text-secondary">Dias da semana</p>
              <div className="flex gap-1.5">
                {WEEKDAY_OPTIONS.map((d) => {
                  const active = medForm.days.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleMedFormDay(d.value)}
                      aria-label={d.label}
                      aria-pressed={active}
                      className={`h-9 flex-1 rounded-lg border text-xs font-semibold transition-colors ${
                        active
                          ? "border-accent bg-accent text-white"
                          : "border-border text-text-secondary hover:border-accent hover:text-accent"
                      }`}
                    >
                      {d.short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {medError && (
            <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {medError}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Adicionar
          </button>
        </form>
      </Modal>
    </div>
  );
}

function IndicadorGerencial({ icon: Icon, label, valor, cor }) {
  return (
    <div className="rounded-xl bg-bg-primary p-3 text-center dark:bg-[#1a1a1a]">
      <Icon size={14} strokeWidth={1.5} className="mx-auto mb-1.5" style={{ color: cor }} />
      <p className="text-xl font-bold tracking-tight" style={{ color: cor }}>
        {valor}
      </p>
      <p className="mt-0.5 truncate text-[10px] text-text-muted">{label}</p>
    </div>
  );
}
