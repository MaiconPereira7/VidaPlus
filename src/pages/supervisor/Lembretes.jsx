import { useState } from "react";
import { Clock, Droplets, FileText, Megaphone, Pause, Pill, Play, Plus, Repeat, Users } from "lucide-react";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import { PageHeader, Panel, btnPrimary, btnSecondary, inputClass } from "../../components/supervisor/ui";
import { LEMBRETES_INICIAIS } from "../../data/supervisorMock";

const TIPOS = {
  hidratacao: { label: "Hidratação", icon: Droplets, cls: "bg-info/10 text-info" },
  medicamento: { label: "Medicamento", icon: Pill, cls: "bg-purple/10 text-purple" },
  exame: { label: "Exame", icon: FileText, cls: "bg-amber/10 text-amber" },
  geral: { label: "Geral", icon: Megaphone, cls: "bg-accent-light text-accent-hover dark:text-accent" },
};

const DESTINATARIOS = { todos: "Todos os pacientes", grupo: "Grupo", individual: "Individual" };
const FREQUENCIAS = { diario: "Diário", semanal: "Semanal" };

const VAZIO = { titulo: "", descricao: "", tipo: "hidratacao", destinatarios: "todos", horario: "08:00", frequencia: "diario" };

export default function Lembretes() {
  const [lembretes, setLembretes] = useState(LEMBRETES_INICIAIS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState("");
  const { showToast } = useToast();

  const ativos = lembretes.filter((l) => l.ativo).length;

  function set(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  function abrirModal() {
    setForm(VAZIO);
    setErro("");
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setErro("Informe um título para o lembrete.");
      return;
    }
    setLembretes((ls) => [{ ...form, titulo: form.titulo.trim(), id: Date.now(), ativo: true }, ...ls]);
    setModalOpen(false);
    showToast("Lembrete criado");
  }

  function toggle(id) {
    const alvo = lembretes.find((l) => l.id === id);
    setLembretes((ls) => ls.map((l) => (l.id === id ? { ...l, ativo: !l.ativo } : l)));
    showToast(alvo.ativo ? "Lembrete pausado" : "Lembrete reativado", "info");
  }

  return (
    <>
      <PageHeader
        title="Lembretes"
        subtitle={`${ativos} ativos · ${lembretes.length - ativos} pausados`}
        action={
          <button onClick={abrirModal} className={btnPrimary}>
            <Plus size={18} />
            Novo Lembrete
          </button>
        }
      />

      <div className="space-y-3">
        {lembretes.map((l) => {
          const t = TIPOS[l.tipo];
          const Icon = t.icon;
          return (
            <Panel key={l.id} className={`animate-fade-in ${l.ativo ? "" : "opacity-70"}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.cls}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="card-title">{l.titulo}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        l.ativo ? "bg-accent-light text-accent-hover dark:text-accent" : "bg-border text-text-secondary"
                      }`}
                    >
                      {l.ativo ? "Ativo" : "Pausado"}
                    </span>
                  </div>
                  {l.descricao && <p className="mt-0.5 text-sm text-text-secondary">{l.descricao}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1"><Users size={13} />{DESTINATARIOS[l.destinatarios]}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={13} />{l.horario}</span>
                    <span className="inline-flex items-center gap-1"><Repeat size={13} />{FREQUENCIAS[l.frequencia]}</span>
                  </div>
                </div>
                <button onClick={() => toggle(l.id)} className={`${btnSecondary} shrink-0`}>
                  {l.ativo ? <Pause size={15} /> : <Play size={15} />}
                  {l.ativo ? "Pausar" : "Ativar"}
                </button>
              </div>
            </Panel>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo lembrete">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field label="Título" htmlFor="lem-titulo">
            <input id="lem-titulo" value={form.titulo} onChange={set("titulo")} placeholder="Ex.: Beber água" className={inputClass} autoFocus />
          </Field>
          <Field label="Descrição" htmlFor="lem-desc">
            <textarea id="lem-desc" value={form.descricao} onChange={set("descricao")} rows={2} placeholder="Opcional" className={`${inputClass} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo" htmlFor="lem-tipo">
              <select id="lem-tipo" value={form.tipo} onChange={set("tipo")} className={inputClass}>
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Destinatários" htmlFor="lem-dest">
              <select id="lem-dest" value={form.destinatarios} onChange={set("destinatarios")} className={inputClass}>
                {Object.entries(DESTINATARIOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Horário" htmlFor="lem-hora">
              <input id="lem-hora" type="time" value={form.horario} onChange={set("horario")} className={inputClass} />
            </Field>
            <Field label="Frequência" htmlFor="lem-freq">
              <select id="lem-freq" value={form.frequencia} onChange={set("frequencia")} className={inputClass}>
                {Object.entries(FREQUENCIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>

          {erro && (
            <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{erro}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className={`${btnSecondary} flex-1`}>
              Cancelar
            </button>
            <button type="submit" className={`${btnPrimary} flex-1`}>
              Criar lembrete
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
