import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ArrowUpRight, BellRing, ChevronRight, Users } from "lucide-react";
import { AdesaoBar, Avatar, LineChart, Panel, PageHeader } from "../../components/supervisor/ui";
import { ALERTAS, ATIVIDADE_SEMANA, PACIENTES } from "../../data/supervisorMock";

const NIVEL = {
  alto: { label: "Alto", dot: "bg-danger", chip: "bg-danger/10 text-danger" },
  medio: { label: "Médio", dot: "bg-amber", chip: "bg-amber/10 text-amber" },
  baixo: { label: "Baixo", dot: "bg-info", chip: "bg-info/10 text-info" },
};

export default function Dashboard() {
  const topAtivos = [...PACIENTES].sort((a, b) => b.adesao - a.adesao).slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral dos pacientes acompanhados pela plataforma" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Users} label="Total de Pacientes" value="247">
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent">
            <ArrowUpRight size={14} />
            12% este mês
          </span>
        </KpiCard>
        <KpiCard icon={Activity} label="Pacientes Ativos Hoje" value="183">
          <span className="text-xs text-text-secondary">74% do total</span>
        </KpiCard>
        <KpiCard icon={AlertTriangle} label="Alertas de Saúde" value="8" iconClass="bg-danger/10 text-danger">
          <span className="inline-flex items-center rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">
            3 críticos
          </span>
        </KpiCard>
        <KpiCard icon={BellRing} label="Adesão aos Lembretes" value="76%">
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: "76%" }} />
          </div>
        </KpiCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="card-title">Atividade dos Pacientes</h2>
              <p className="text-xs text-text-secondary">Pacientes ativos por dia · últimos 7 dias</p>
            </div>
            <span className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-hover dark:text-accent">
              Média 166/dia
            </span>
          </div>
          <LineChart data={ATIVIDADE_SEMANA.map((d) => ({ label: d.dia, value: d.ativos }))} />
        </Panel>

        <Panel>
          <h2 className="card-title mb-4">Pacientes Mais Ativos</h2>
          <ul className="space-y-3.5">
            {topAtivos.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/supervisor/pacientes/${p.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <Avatar nome={p.nome} size="sm" seed={p.id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{p.nome}</p>
                    <AdesaoBar value={p.adesao} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="card-title">Alertas Recentes</h2>
          <Link to="/supervisor/pacientes" className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
            Ver pacientes
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {ALERTAS.map((a) => {
            const n = NIVEL[a.nivel];
            return (
              <li key={a.id}>
                <Link
                  to={`/supervisor/pacientes/${a.pacienteId}`}
                  className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${n.dot}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{a.texto}</p>
                    <p className="text-xs text-text-muted">{a.quando}</p>
                  </div>
                  <span className={`hidden rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline ${n.chip}`}>
                    {n.label}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

function KpiCard({ icon: Icon, label, value, children, iconClass = "bg-accent-light text-accent-hover dark:text-accent" }) {
  return (
    <Panel className="hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <p className="meta-label">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
      <p className="stat-number mt-1">{value}</p>
      <div className="mt-2 flex min-h-5 items-center">{children}</div>
    </Panel>
  );
}
