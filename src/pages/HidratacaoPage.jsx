import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, Pencil, Check, Sunrise, GlassWater, Timer, Trophy } from "lucide-react";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import {
  getWaterMap,
  getWaterToday,
  setWaterToday,
  getWaterGoal,
  setWaterGoal,
  WATER_GOAL_MIN,
  WATER_GOAL_MAX,
} from "../lib/health";
import { todayISO, toISODate } from "../lib/dates";

const ACCENT = "#059669";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
// Mesmo teto de setWaterToday em lib/health.js.
const MAX_COPOS = 20;

// Datas (ISO) da semana atual, de segunda a domingo.
function semanaAtual() {
  const hoje = new Date();
  const desdeSegunda = (hoje.getDay() + 6) % 7;
  return DIAS.map((dia, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - desdeSegunda + i);
    return { dia, data: toISODate(d) };
  });
}

const DICAS = [
  {
    icon: Sunrise,
    titulo: "Beba água ao acordar",
    texto: "Um copo logo cedo repõe o líquido perdido durante a noite.",
  },
  {
    icon: GlassWater,
    titulo: "Leve uma garrafa sempre",
    texto: "Ter água por perto faz você lembrar de beber ao longo do dia.",
  },
  {
    icon: Timer,
    titulo: "Evite esperar sentir sede",
    texto: "A sede já é um sinal de que o corpo está pedindo água.",
  },
];


function BigRing({ value, max, size = 220, stroke = 16 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ACCENT} strokeOpacity={0.12} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
    </svg>
  );
}

export default function HidratacaoPage() {
  const { user } = useAuth();
  const email = user.email;
  const hoje = todayISO();

  // Mesmos dados da Home: o que for registrado lá aparece aqui e vice-versa.
  const [copos, setCopos] = useState(() => getWaterToday(email));
  const [meta, setMeta] = useState(() => getWaterGoal(email));
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaRascunho, setMetaRascunho] = useState("");

  const semana = useMemo(() => {
    const mapa = getWaterMap(email);
    return semanaAtual().map(({ dia, data }) => ({
      dia,
      data,
      futuro: data > hoje,
      ehHoje: data === hoje,
      copos: data === hoje ? copos : mapa[data] || 0,
    }));
  }, [email, hoje, copos]);

  const atingiu = copos >= meta;
  const faltam = Math.max(0, meta - copos);
  const pct = Math.min(100, Math.round((copos / meta) * 100));

  // 15% de folga para o rótulo da barra mais alta caber dentro do gráfico.
  const escala = Math.max(meta, ...semana.map((d) => d.copos)) * 1.15;
  const diasPassados = semana.filter((d) => !d.futuro);
  const mediaSemana = (diasPassados.reduce((s, d) => s + d.copos, 0) / diasPassados.length)
    .toFixed(1)
    .replace(".", ",");
  const diasNaMeta = diasPassados.filter((d) => d.copos >= meta).length;

  function ajustarCopos(delta) {
    setCopos(setWaterToday(email, copos + delta));
  }

  function salvarMeta() {
    const n = Number.parseInt(metaRascunho, 10);
    if (Number.isFinite(n)) setMeta(setWaterGoal(email, n));
    setEditandoMeta(false);
  }

  function abrirEdicaoMeta() {
    setMetaRascunho(String(meta));
    setEditandoMeta(true);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 1. Header */}
      <header className="flex items-center gap-4 animate-fade-in-up">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Droplets size={26} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="page-title">Hidratação</h1>
          <p className="text-sm text-text-secondary">Acompanhe quanta água você bebe hoje e na semana.</p>
        </div>
      </header>

      {/* 2–4. Progresso do dia, botão e meta */}
      <Card
        hoverable={false}
        className="relative overflow-hidden bg-linear-to-br from-accent/[0.08] via-transparent to-transparent animate-fade-in-up dark:from-accent/15"
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex flex-col items-center gap-8 py-4 md:flex-row md:justify-center md:gap-14 md:py-6">
          <div className="relative flex items-center justify-center">
            <BigRing value={copos} max={meta} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets size={22} strokeWidth={1.5} className="mb-1 text-accent" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copos}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl font-bold tracking-tight tabular-nums text-text-primary"
                >
                  {copos}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-text-muted">de {meta} copos</span>
            </div>
          </div>

          <div className="flex w-full max-w-xs flex-col items-center text-center md:items-start md:text-left">
            <p className="meta-label">Progresso de hoje</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-text-primary" aria-live="polite">
              {copos} de {meta} copos
            </p>
            <p className={`mt-1 text-sm ${atingiu ? "font-medium text-accent" : "text-text-secondary"}`}>
              {atingiu ? (
                <span className="inline-flex items-center gap-1.5">
                  <Trophy size={14} strokeWidth={1.75} /> Meta do dia alcançada!
                </span>
              ) : (
                `Faltam ${faltam} ${faltam === 1 ? "copo" : "copos"} · ${pct}% da meta`
              )}
            </p>

            <div className="mt-5 flex w-full items-center gap-2">
              <button
                onClick={() => ajustarCopos(1)}
                disabled={copos >= MAX_COPOS}
                className="disabled:cursor-not-allowed disabled:opacity-50 flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-white shadow-md shadow-accent/20 transition-colors hover:bg-accent-hover active:scale-[0.98]"
              >
                <Plus size={20} strokeWidth={2.25} /> Adicionar Copo
              </button>
              <button
                onClick={() => ajustarCopos(-1)}
                disabled={copos === 0}
                aria-label="Remover copo"
                title="Remover copo"
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border text-text-secondary transition-colors enabled:hover:border-danger/30 enabled:hover:bg-danger/10 enabled:hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus size={18} strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-border px-3 py-2.5">
              <span className="text-sm text-text-secondary">Meta diária</span>
              {editandoMeta ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    salvarMeta();
                  }}
                >
                  <input
                    type="number"
                    min={WATER_GOAL_MIN}
                    max={WATER_GOAL_MAX}
                    value={metaRascunho}
                    onChange={(e) => setMetaRascunho(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setEditandoMeta(false)}
                    autoFocus
                    aria-label="Meta diária de copos"
                    className="w-16 rounded-lg border border-border bg-bg-secondary px-2 py-1 text-right text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
                  />
                  <button
                    type="submit"
                    aria-label="Salvar meta"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover"
                  >
                    <Check size={14} strokeWidth={2.25} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={abrirEdicaoMeta}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-text-primary hover:bg-accent/10 hover:text-accent"
                >
                  {meta} copos <Pencil size={13} strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Histórico da semana */}
      <Card hoverable={false} className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="card-title">Histórico da semana</h2>
            <p className="meta-label mt-0.5">
              Semana atual · média de {mediaSemana} copos · {diasNaMeta} de {diasPassados.length}{" "}
              {diasPassados.length === 1 ? "dia" : "dias"} na meta
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="h-px w-4 border-t border-dashed border-accent" /> meta ({meta})
          </span>
        </div>

        {/* Área das barras com folga no topo para o número acima de cada barra. */}
        <div className="relative h-40 border-b border-border">
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-accent/50"
            style={{ bottom: `${(meta / escala) * 100}%` }}
            aria-hidden="true"
          />
          <ul className="flex h-full items-end justify-between gap-2 sm:gap-4">
            {semana.map(({ dia, copos: n, futuro }) => {
              const naMeta = n >= meta;
              if (futuro) {
                return (
                  <li key={dia} className="flex h-full flex-1 items-end justify-center">
                    <div className="h-1 w-full max-w-10 rounded-full bg-border" title={`${dia}: ainda não chegou`} />
                  </li>
                );
              }
              return (
                <li key={dia} className="flex h-full flex-1 items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(n / escala) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`relative w-full max-w-10 rounded-t-lg ${naMeta ? "bg-accent" : "bg-accent/35"}`}
                    title={`${dia}: ${n} copos`}
                  >
                    <span
                      className={`absolute inset-x-0 -top-5 text-center text-xs font-semibold tabular-nums ${
                        naMeta ? "text-accent" : "text-text-secondary"
                      }`}
                    >
                      {n}
                    </span>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>
        <ul className="mt-2 flex justify-between gap-2 sm:gap-4" aria-hidden="true">
          {semana.map(({ dia, ehHoje }) => (
            <li
              key={dia}
              className={`flex-1 text-center text-xs ${ehHoje ? "font-semibold text-accent" : "text-text-muted"}`}
            >
              {ehHoje ? "Hoje" : dia}
            </li>
          ))}
        </ul>
      </Card>

      {/* 6. Dicas */}
      <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <h2 className="section-label mb-3">Dicas de hidratação</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DICAS.map(({ icon: Icon, titulo, texto }) => (
            <Card key={titulo} className="flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{titulo}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{texto}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
