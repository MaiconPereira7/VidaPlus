import { useState } from "react";
import { Activity, BellRing, ChevronDown, Droplets, Download, Smile } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { BarChart, PageHeader, Panel, btnSecondary, selectClass } from "../../components/supervisor/ui";
import { HUMORES, RELATORIOS } from "../../data/supervisorMock";

const PERIODOS = {
  semana: { label: "Última semana", eixo: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] },
  mes: { label: "Último mês", eixo: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  trimestre: { label: "Últimos 3 meses", eixo: ["Set", "Out", "Nov"] },
};

const HUMOR_CORES = {
  otimo: "var(--accent)",
  bem: "#34d399",
  neutro: "var(--amber)",
  triste: "#f97316",
  mal: "var(--danger)",
};

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("semana");
  const [tipo, setTipo] = useState("todos");
  const [aberto, setAberto] = useState(null);
  const { showToast } = useToast();
  const dados = RELATORIOS[periodo];
  const eixo = PERIODOS[periodo].eixo;

  const relatorios = [
    {
      id: "adesao",
      titulo: "Relatório de Adesão",
      descricao: "% geral de adesão aos lembretes",
      icon: BellRing,
      iconClass: "bg-accent-light text-accent-hover dark:text-accent",
      destaque: `${dados.adesao.geral}%`,
      resumo: <Progress value={dados.adesao.geral} color="var(--accent)" />,
      detalhe: (
        <>
          <p className="meta-label mb-3">Adesão por período</p>
          <BarChart data={dados.adesao.porDia.map((v, i) => ({ label: eixo[i], value: v }))} max={100} format={(v) => `${v}%`} />
          <p className="mt-4 text-sm text-text-secondary">
            Medicamentos têm a maior adesão (82%); lembretes de exames, a menor (61%).
          </p>
        </>
      ),
    },
    {
      id: "humor",
      titulo: "Relatório de Humor",
      descricao: "Distribuição dos humores registrados",
      icon: Smile,
      iconClass: "bg-amber/10 text-amber",
      destaque: `${dados.humor.otimo + dados.humor.bem}% positivos`,
      resumo: (
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {Object.entries(dados.humor).map(([k, v]) => (
            <div key={k} style={{ width: `${v}%`, backgroundColor: HUMOR_CORES[k] }} title={`${HUMORES[k].label}: ${v}%`} />
          ))}
        </div>
      ),
      detalhe: (
        <ul className="space-y-2.5">
          {Object.entries(dados.humor).map(([k, v]) => (
            <li key={k} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{HUMORES[k].emoji}</span>
              <span className="w-16 text-text-primary">{HUMORES[k].label}</span>
              <div className="flex-1"><Progress value={v} color={HUMOR_CORES[k]} /></div>
              <span className="w-10 text-right font-semibold tabular-nums text-text-primary">{v}%</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "hidratacao",
      titulo: "Relatório de Hidratação",
      descricao: "Média de copos por paciente",
      icon: Droplets,
      iconClass: "bg-info/10 text-info",
      destaque: `${dados.hidratacao.media.toFixed(1).replace(".", ",")} copos/dia`,
      resumo: <Progress value={(dados.hidratacao.media / dados.hidratacao.meta) * 100} color="var(--info)" />,
      detalhe: (
        <>
          <p className="meta-label mb-3">Média de copos (meta {dados.hidratacao.meta})</p>
          <BarChart
            data={dados.hidratacao.porDia.map((v, i) => ({ label: eixo[i], value: v }))}
            max={dados.hidratacao.meta}
            color="var(--info)"
            format={(v) => v.toFixed(1).replace(".", ",")}
          />
          <p className="mt-4 text-sm text-text-secondary">
            {Math.round((dados.hidratacao.media / dados.hidratacao.meta) * 100)}% da meta diária atingida em média.
          </p>
        </>
      ),
    },
    {
      id: "atividade",
      titulo: "Relatório de Atividade",
      descricao: "Pacientes ativos vs inativos",
      icon: Activity,
      iconClass: "bg-purple/10 text-purple",
      destaque: `${dados.atividade.ativos} ativos`,
      resumo: (
        <Progress
          value={(dados.atividade.ativos / (dados.atividade.ativos + dados.atividade.inativos)) * 100}
          color="var(--purple)"
        />
      ),
      detalhe: (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Ativos" value={dados.atividade.ativos} className="text-accent" />
          <Stat label="Inativos" value={dados.atividade.inativos} className="text-text-secondary" />
          <p className="col-span-2 text-sm text-text-secondary">
            Paciente inativo = sem nenhum registro no período. 41% dos inativos têm mais de 65 anos.
          </p>
        </div>
      ),
    },
  ];

  const visiveis = tipo === "todos" ? relatorios : relatorios.filter((r) => r.id === tipo);

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Indicadores consolidados dos pacientes"
        action={
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} aria-label="Período" className={selectClass}>
              {Object.entries(PERIODOS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo de relatório" className={selectClass}>
              <option value="todos">Todos os tipos</option>
              {relatorios.map((r) => (
                <option key={r.id} value={r.id}>{r.titulo.replace("Relatório de ", "")}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {visiveis.map((r) => {
          const expandido = aberto === r.id;
          const Icon = r.icon;
          return (
            <Panel key={r.id} className={expandido ? "ring-2 ring-accent/30" : ""}>
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.iconClass}`}>
                  <Icon size={19} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="card-title">{r.titulo}</h2>
                  <p className="text-xs text-text-secondary">{r.descricao}</p>
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-text-primary">{r.destaque}</p>
              <div className="mt-2">{r.resumo}</div>

              {expandido && (
                <div className="animate-fade-in mt-5 border-t border-border pt-5">
                  {r.detalhe}
                  <button
                    onClick={() => showToast("Exportação disponível em breve", "info")}
                    className={`${btnSecondary} mt-5 w-full`}
                  >
                    <Download size={16} />
                    Exportar PDF
                  </button>
                </div>
              )}

              <button
                onClick={() => setAberto(expandido ? null : r.id)}
                aria-expanded={expandido}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                {expandido ? "Recolher" : "Ver Completo"}
                <ChevronDown size={16} className={`transition-transform duration-200 ${expandido ? "rotate-180" : ""}`} />
              </button>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

function Progress({ value, color }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-border">
      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className="rounded-lg bg-bg-primary p-3">
      <p className="meta-label">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${className}`}>{value}</p>
    </div>
  );
}
