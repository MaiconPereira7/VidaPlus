import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, CalendarDays, Droplets, FileText, Mail, Phone, Pill, Smile, UserX } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { AdesaoBar, Avatar, BarChart, Panel } from "../../components/supervisor/ui";
import { HUMORES, formatUltimoAcesso, getPaciente, getPacienteDetalhe } from "../../data/supervisorMock";

const TABS = [
  { id: "resumo", label: "Resumo" },
  { id: "hidratacao", label: "Hidratação" },
  { id: "humor", label: "Humor" },
  { id: "exames", label: "Exames" },
  { id: "medicamentos", label: "Medicamentos" },
];

const STATUS_EXAME = {
  Concluído: "bg-accent-light text-accent-hover dark:text-accent",
  Atenção: "bg-amber/10 text-amber",
  Agendado: "bg-info/10 text-info",
};

export default function PacienteDetalhe() {
  const { id } = useParams();
  const [tab, setTab] = useState("resumo");
  const paciente = getPaciente(id);

  if (!paciente) {
    return (
      <Panel>
        <EmptyState icon={UserX} title="Paciente não encontrado" description="O paciente pode ter sido removido." />
        <div className="text-center">
          <Link to="/supervisor/pacientes" className="text-sm font-semibold text-accent hover:text-accent-hover">
            Voltar para a lista
          </Link>
        </div>
      </Panel>
    );
  }

  const d = getPacienteDetalhe(paciente);
  const p = paciente;

  return (
    <>
      <Link
        to="/supervisor/pacientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} />
        Pacientes
      </Link>

      <Panel className="mb-4 hover:shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar nome={p.nome} size="lg" seed={p.id} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">{p.nome}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  p.ativo ? "bg-accent-light text-accent-hover dark:text-accent" : "bg-border text-text-secondary"
                }`}
              >
                {p.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              {p.idade} anos · último acesso {formatUltimoAcesso(p.ultimoAcessoMin).toLowerCase()}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><Mail size={15} className="text-text-muted" />{p.email}</span>
              <span className="inline-flex items-center gap-1.5"><Phone size={15} className="text-text-muted" />{p.telefone}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} className="text-text-muted" />Cadastro em {p.cadastro}</span>
            </div>
          </div>
          <div className="w-full sm:w-44">
            <p className="meta-label mb-1">Adesão geral</p>
            <AdesaoBar value={p.adesao} />
          </div>
        </div>
      </Panel>

      <div className="mb-4 overflow-x-auto">
        <div role="tablist" className="inline-flex min-w-full gap-1 rounded-lg bg-bg-card p-1 shadow-sm sm:min-w-0 dark:border dark:border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative z-10 flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "text-accent-hover dark:text-accent" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="paciente-tab"
                  className="absolute inset-0 -z-10 rounded-md bg-accent-light"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className="animate-fade-in" role="tabpanel">
        {tab === "resumo" && <Resumo p={p} d={d} />}
        {tab === "hidratacao" && (
          <Panel className="hover:shadow-sm">
            <h2 className="card-title">Hidratação · últimos 7 dias</h2>
            <p className="mb-5 text-xs text-text-secondary">
              Meta diária: {p.meta} copos · média{" "}
              {(d.hidratacao.reduce((s, x) => s + x.copos, 0) / d.hidratacao.length).toFixed(1)} copos
            </p>
            <BarChart
              data={d.hidratacao.map((x) => ({ label: x.dia, value: x.copos }))}
              max={p.meta}
              height={200}
              color="var(--info)"
            />
          </Panel>
        )}
        {tab === "humor" && (
          <Panel className="hover:shadow-sm">
            <h2 className="card-title mb-3">Humor · últimos 7 dias</h2>
            <ul className="divide-y divide-border">
              {d.humor.map((h) => (
                <li key={h.dia} className="flex items-center gap-4 py-3">
                  <span className="w-10 text-sm font-medium text-text-secondary">{h.dia}</span>
                  <span className="text-2xl" aria-hidden="true">{HUMORES[h.humor].emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{HUMORES[h.humor].label}</p>
                    <p className="text-sm text-text-secondary">{h.nota}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        {tab === "exames" && (
          <Panel className="overflow-hidden p-0 hover:shadow-sm">
            <ul className="divide-y divide-border">
              {d.exames.map((e) => (
                <li key={e.tipo} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{e.tipo}</p>
                    <p className="text-xs text-text-secondary">{e.data} · {e.resultado}</p>
                  </div>
                  <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-auto ${STATUS_EXAME[e.status]}`}>
                    {e.status}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        {tab === "medicamentos" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {d.medicamentos.map((m) => (
              <Panel key={m.nome}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 text-purple">
                    <Pill size={19} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">{m.nome}</p>
                    <p className="text-xs text-text-secondary">{m.dosagem} · {m.horario}</p>
                  </div>
                </div>
                <p className="meta-label mb-1">Adesão</p>
                <AdesaoBar value={m.adesao} />
              </Panel>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Resumo({ p, d }) {
  const ultimoExame = d.exames.find((e) => e.status !== "Agendado");
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Panel>
        <CardHead icon={Smile} title="Último humor" />
        <div className="flex items-center gap-3">
          <span className="text-4xl">{HUMORES[p.humor].emoji}</span>
          <div>
            <p className="font-semibold text-text-primary">{HUMORES[p.humor].label}</p>
            <p className="text-sm text-text-secondary">{d.humor[d.humor.length - 1].nota}</p>
          </div>
        </div>
      </Panel>
      <Panel>
        <CardHead icon={Droplets} title="Hidratação hoje" />
        <p className="stat-number">
          {p.copos}
          <span className="text-lg font-medium text-text-muted">/{p.meta} copos</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-info" style={{ width: `${(p.copos / p.meta) * 100}%` }} />
        </div>
      </Panel>
      <Panel>
        <CardHead icon={Bell} title="Próximos lembretes" />
        <ul className="space-y-2">
          {d.lembretes.map((l) => (
            <li key={l.titulo} className="flex items-center justify-between text-sm">
              <span className="text-text-primary">{l.titulo}</span>
              <span className="text-text-secondary">{l.quando}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel>
        <CardHead icon={FileText} title="Últimos exames" />
        <ul className="space-y-2">
          {d.exames.slice(0, 3).map((e) => (
            <li key={e.tipo} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-text-primary">{e.tipo}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_EXAME[e.status]}`}>
                {e.status}
              </span>
            </li>
          ))}
        </ul>
        {ultimoExame && <p className="mt-3 text-xs text-text-muted">Mais recente: {ultimoExame.data}</p>}
      </Panel>
    </div>
  );
}

function CardHead({ icon: Icon, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon size={17} strokeWidth={1.75} className="text-accent" />
      <h2 className="card-title">{title}</h2>
    </div>
  );
}
