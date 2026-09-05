import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Clock, CalendarDays, FileText, ArrowUpRight } from "lucide-react";
import Card from "../components/Card";
import Modal from "../components/Modal";
import MiniCalendar from "../components/MiniCalendar";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getAppointmentsByDate,
  getDateColorsMap,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  APPOINTMENT_TYPES,
  typeMeta,
} from "../lib/agenda";
import { getExams, EXAM_STATUS_STYLES } from "../lib/health";
import { todayISO, formatFriendlyDate } from "../lib/dates";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:ring-2";

const emptyForm = { title: "", date: todayISO(), time: "", type: "Consulta", notes: "" };

export default function AgendaPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const email = user.email;

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [colorsByDate, setColorsByDate] = useState(() => getDateColorsMap(email));
  const [appointments, setAppointments] = useState(() => getAppointmentsByDate(email, todayISO()));
  const [exams] = useState(() => getExams(email));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const examMeta = typeMeta("Exame");
  const examsForDate = useMemo(
    () => exams.filter((e) => e.date === selectedDate),
    [exams, selectedDate]
  );
  const colorsByDateWithExams = useMemo(() => {
    const map = new Map(colorsByDate);
    exams.forEach((e) => {
      const arr = map.get(e.date) || [];
      if (!arr.includes(examMeta.color)) map.set(e.date, [...arr, examMeta.color]);
    });
    return map;
  }, [colorsByDate, exams, examMeta.color]);

  function refresh(date = selectedDate) {
    setAppointments(getAppointmentsByDate(email, date));
    setColorsByDate(getDateColorsMap(email));
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
    setAppointments(getAppointmentsByDate(email, date));
  }

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm, date: selectedDate });
    setModalOpen(true);
  }

  function openEditModal(appt) {
    setEditingId(appt.id);
    setForm({
      title: appt.title,
      date: appt.date,
      time: appt.time,
      type: appt.type,
      notes: appt.notes || "",
    });
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) return;
    if (editingId) {
      updateAppointment(email, editingId, form);
      showToast("Compromisso atualizado!");
    } else {
      addAppointment(email, form);
      showToast("Compromisso adicionado!");
    }
    setSelectedDate(form.date);
    refresh(form.date);
    setModalOpen(false);
  }

  function handleDelete(id) {
    deleteAppointment(email, id);
    refresh();
    showToast("Compromisso excluído.", "info");
  }

  const dayLabel = useMemo(() => formatFriendlyDate(selectedDate), [selectedDate]);

  return (
    <div className="space-y-5 pb-16">
      <div className="animate-fade-in-up">
        <h1 className="page-title">Agenda</h1>
        <p className="mt-1 text-sm text-text-secondary">Consultas, exames e lembretes.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="animate-fade-in-up lg:col-span-3" style={{ animationDelay: "40ms" }}>
          <MiniCalendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            colorsByDate={colorsByDateWithExams}
          />
          <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3">
            {APPOINTMENT_TYPES.map((t) => (
              <span key={t.value} className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.value}
              </span>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <p className="meta-label mb-3 animate-fade-in-up capitalize" style={{ animationDelay: "70ms" }}>
            {dayLabel}
          </p>

          {appointments.length === 0 && examsForDate.length === 0 ? (
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <EmptyState
                icon={CalendarDays}
                title="Nenhum compromisso nesta data"
                description="Toque no + para adicionar um novo compromisso."
              />
            </Card>
          ) : (
            <ul className="space-y-2.5">
              {appointments.map((appt, idx) => {
                const meta = typeMeta(appt.type);
                return (
                  <li key={appt.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + idx * 30}ms` }}>
                    <Card className="group border-l-[3px]" style={{ borderLeftColor: meta.color }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                            >
                              {appt.type}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock size={12} strokeWidth={1.5} /> {appt.time}
                            </span>
                          </div>
                          <p className="mt-1.5 truncate text-sm font-medium text-text-primary">
                            {appt.title}
                          </p>
                          {appt.notes && (
                            <p className="mt-0.5 text-xs text-text-secondary">{appt.notes}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => openEditModal(appt)}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-black/[0.04] hover:text-text-primary dark:hover:bg-white/[0.06]"
                            aria-label="Editar"
                          >
                            <Pencil size={15} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(appt.id)}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
                            aria-label="Excluir"
                          >
                            <Trash2 size={15} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}

          {examsForDate.length > 0 && (
            <div className="mt-4">
              <p className="meta-label mb-2.5 flex items-center gap-1.5">
                <FileText size={13} strokeWidth={1.5} /> Exames do prontuário
              </p>
              <ul className="space-y-2.5">
                {examsForDate.map((exam, idx) => (
                  <li
                    key={exam.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${100 + (appointments.length + idx) * 30}ms` }}
                  >
                    <Card
                      onClick={() => navigate("/saude")}
                      className="cursor-pointer border-l-[3px]"
                      style={{ borderLeftColor: examMeta.color }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: `${examMeta.color}1a`, color: examMeta.color }}
                            >
                              Exame
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${EXAM_STATUS_STYLES[exam.status]}`}
                            >
                              {exam.status}
                            </span>
                          </div>
                          <p className="mt-1.5 truncate text-sm font-medium text-text-primary">
                            {exam.name}
                          </p>
                          {exam.result && (
                            <p className="mt-0.5 truncate text-xs text-text-secondary">
                              {exam.result}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight size={16} strokeWidth={1.5} className="shrink-0 text-text-muted" />
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <motion.button
        onClick={openAddModal}
        aria-label="Novo compromisso"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover md:bottom-8 md:right-8"
        style={{ boxShadow: "0 4px 14px rgba(5,150,105,0.4)" }}
      >
        <Plus size={26} strokeWidth={1.5} />
      </motion.button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar compromisso" : "Novo compromisso"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Título</label>
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Consulta com cardiologista"
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
              <label className="mb-1 block text-xs font-medium text-text-secondary">Horário</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Tipo</label>
            <div className="grid grid-cols-4 gap-2">
              {APPOINTMENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                  className={`rounded-lg border py-2 text-[11px] font-semibold transition-colors ${
                    form.type === t.value ? "border-transparent" : "border-border text-text-secondary"
                  }`}
                  style={
                    form.type === t.value
                      ? { backgroundColor: `${t.color}1a`, color: t.color }
                      : undefined
                  }
                >
                  {t.value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Detalhes adicionais (opcional)"
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            {editingId ? "Salvar alterações" : "Adicionar compromisso"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
