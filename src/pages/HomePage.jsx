import { useEffect, useState } from "react";
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
} from "lucide-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import ProgressRing from "../components/ProgressRing";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  MOOD_OPTIONS,
  getMoodToday,
  setMoodToday,
  getWaterToday,
  setWaterToday,
  WATER_GOAL,
  getStepsToday,
  setStepsToday,
  STEPS_GOAL,
  getMeds,
  addMed,
  deleteMed,
  toggleMedTakenToday,
} from "../lib/health";
import { getTodayReminders, typeMeta } from "../lib/agenda";
import { todayISO } from "../lib/dates";

const BLUE = "#2563eb";
const AMBER = "#d97706";
const PURPLE = "#7c3aed";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:ring-2";

const emptyMedForm = { name: "", dosage: "", time: "", frequency: "diario" };

export default function HomePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const email = user.email;
  const today = todayISO();

  const [mood, setMood] = useState(() => getMoodToday(email));
  const [water, setWater] = useState(() => getWaterToday(email));
  const [steps, setSteps] = useState(() => getStepsToday(email));
  const [meds, setMeds] = useState(() => getMeds(email));
  const [reminders, setReminders] = useState(() => getTodayReminders(email));
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [medForm, setMedForm] = useState(emptyMedForm);

  useEffect(() => {
    setReminders(getTodayReminders(email));
  }, [email]);

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
    if (!medForm.name.trim() || !medForm.time) return;
    addMed(email, { ...medForm, name: medForm.name.trim(), dosage: medForm.dosage.trim() });
    setMeds(getMeds(email));
    setMedForm(emptyMedForm);
    setMedModalOpen(false);
    showToast("Medicamento adicionado!");
  }

  function handleToggleMed(id) {
    setMeds(toggleMedTakenToday(email, id));
  }

  function handleDeleteMed(id) {
    setMeds(deleteMed(email, id));
    showToast("Medicamento removido.", "info");
  }

  const sortedMeds = [...meds].sort((a, b) => a.time.localeCompare(b.time));
  const medsTaken = sortedMeds.filter((m) => m.takenDates.includes(today)).length;
  const allMedsTaken = sortedMeds.length > 0 && medsTaken === sortedMeds.length;
  const currentMood = mood ? MOOD_OPTIONS.find((m) => m.value === mood.mood) : null;

  const summaryStats = [
    {
      icon: Pill,
      label: "Remédios hoje",
      value: sortedMeds.length ? `${medsTaken}/${sortedMeds.length}` : "—",
      color: "var(--accent)",
    },
    { icon: Droplets, label: "Copos de água", value: water, color: BLUE },
    { icon: Footprints, label: "Passos", value: steps.toLocaleString("pt-BR"), color: AMBER },
    { icon: Smile, label: "Humor hoje", value: currentMood ? currentMood.label : "—", color: PURPLE },
  ];

  return (
    <div className="space-y-5">
      <p className="section-label animate-fade-in-up">Seu resumo de hoje</p>

      <div className="-mx-4 overflow-x-auto px-4 md:hidden">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="animate-fade-in-up sm:col-span-2" style={{ animationDelay: "40ms" }}>
            <p className="meta-label mb-4">Check-in de humor</p>
            <div className="flex justify-between gap-1.5">
              {MOOD_OPTIONS.map((m) => {
                const active = mood?.mood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => handleMood(m.value)}
                    className={`flex h-20 w-16 flex-col items-center justify-center gap-1.5 rounded-xl border bg-bg-primary transition-colors duration-150 dark:bg-[#1a1a1a] ${
                      active ? "border-accent" : "border-border opacity-60 hover:opacity-100"
                    }`}
                    style={active ? { boxShadow: "0 0 0 3px var(--accent-glow)" } : undefined}
                    aria-label={m.label}
                  >
                    <motion.span
                      className="text-2xl leading-none"
                      animate={{ scale: active ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {m.emoji}
                    </motion.span>
                    <span className="text-[10px] font-medium text-text-secondary">{m.label}</span>
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
          </Card>

          <Card
            className="flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            <div className="mb-3 flex w-full items-center gap-1.5" style={{ color: BLUE }}>
              <Droplets size={16} strokeWidth={1.5} />
              <span className="meta-label text-current">Hidratação</span>
            </div>
            <ProgressRing value={water} max={WATER_GOAL} color={BLUE}>
              <span className="stat-number">{water}</span>
              <span className="text-[10px] text-text-muted">/ {WATER_GOAL}</span>
            </ProgressRing>
            <p className="mt-2 text-xs text-text-secondary">copos de água</p>
            <ProgressBar value={water} max={WATER_GOAL} color={BLUE} height="h-1" trackClassName="mt-3" />
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => adjustWater(-1)}
                disabled={water <= 0}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                style={{ "--hover-color": BLUE }}
                onMouseEnter={(e) => {
                  if (water > 0) {
                    e.currentTarget.style.backgroundColor = BLUE;
                    e.currentTarget.style.borderColor = BLUE;
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.color = "";
                }}
                aria-label="Remover copo"
              >
                <Minus size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => adjustWater(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = BLUE;
                  e.currentTarget.style.borderColor = BLUE;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.color = "";
                }}
                aria-label="Adicionar copo"
              >
                <Plus size={16} strokeWidth={1.5} />
              </button>
            </div>
          </Card>

          <Card
            className="flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: "110ms" }}
          >
            <div className="mb-3 flex w-full items-center gap-1.5" style={{ color: AMBER }}>
              <Footprints size={16} strokeWidth={1.5} />
              <span className="meta-label text-current">Passos</span>
            </div>
            <ProgressRing value={steps} max={STEPS_GOAL} color={AMBER}>
              <span className="text-2xl font-bold tracking-tight text-text-primary">
                {steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
              </span>
              <span className="text-[10px] text-text-muted">
                / {(STEPS_GOAL / 1000).toFixed(0)}k
              </span>
            </ProgressRing>
            <p className="mt-2 text-xs text-text-secondary">meta diária</p>
            <ProgressBar value={steps} max={STEPS_GOAL} color={AMBER} height="h-1" trackClassName="mt-3" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[100, 500, 1000].map((inc) => (
                <button
                  key={inc}
                  onClick={() => adjustSteps(inc)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = AMBER;
                    e.currentTarget.style.borderColor = AMBER;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.color = "";
                  }}
                >
                  +{inc}
                </button>
              ))}
            </div>
          </Card>

          <Card className="animate-fade-in-up sm:col-span-2" style={{ animationDelay: "140ms" }}>
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
              <EmptyState
                icon={Pill}
                title="Nenhum medicamento cadastrado"
                description="Adicione seus remédios para acompanhar os horários certinhos."
                actionLabel="Adicionar primeiro medicamento"
                onAction={() => setMedModalOpen(true)}
              />
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {sortedMeds.map((med) => {
                    const taken = med.takenDates.includes(today);
                    return (
                      <li key={med.id} className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: taken ? "var(--accent)" : AMBER }}
                        />
                        <button
                          onClick={() => handleToggleMed(med.id)}
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                            taken ? "border-accent bg-accent" : "border-border"
                          }`}
                          aria-label={taken ? "Marcar como não tomado" : "Marcar como tomado"}
                        >
                          {taken && <Check size={12} strokeWidth={3} className="text-white" />}
                        </button>
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
                        </div>
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-bg-secondary px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                          <Clock size={12} strokeWidth={1.5} />
                          {med.time}
                        </span>
                        <button
                          onClick={() => handleDeleteMed(med.id)}
                          className="shrink-0 text-text-muted transition-opacity hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                          aria-label="Excluir"
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

          <Card className="animate-fade-in-up sm:col-span-2" style={{ animationDelay: "170ms" }}>
            <div className="mb-3 flex items-center gap-1.5 text-text-secondary">
              <BellRing size={16} strokeWidth={1.5} />
              <span className="meta-label">Lembretes de hoje</span>
            </div>
            {reminders.length === 0 ? (
              <EmptyState icon={CalendarOff} title="Dia livre!" description="Nenhum compromisso para hoje." />
            ) : (
              <ul className="divide-y divide-border">
                {reminders.map((r) => {
                  const meta = typeMeta(r.type);
                  return (
                    <li key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="w-12 shrink-0 text-sm font-semibold text-text-primary">{r.time}</span>
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
        </div>

        <div className="hidden lg:block">
          <Card className="sticky top-24 animate-fade-in-up" style={{ animationDelay: "90ms" }}>
            <p className="section-label mb-3">Resumo do dia</p>
            <div className="space-y-2">
              {summaryStats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl bg-bg-primary p-3 dark:bg-[#1a1a1a]"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${s.color}1a`, color: s.color }}
                  >
                    <s.icon size={16} strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight text-text-primary">{s.value}</p>
                    <p className="truncate text-[11px] text-text-muted">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={medModalOpen} onClose={() => setMedModalOpen(false)} title="Novo medicamento">
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
