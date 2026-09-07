import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Users, Gauge, BarChart3, Smile } from "lucide-react";
import SurveyShell from "../../components/SurveyShell";
import Card from "../../components/Card";
import StatTile from "../../components/StatTile";
import { useCountUp } from "../../hooks/useCountUp";
import {
  getSatisfacaoResponses,
  getNpsResponses,
  getSusResponses,
  SUS_STATEMENTS,
  susGrade,
  mean,
  median,
  stdDev,
} from "../../lib/surveys";
import { isValidAdminCode } from "../../lib/adminAccess";

const TABS = [
  { key: "satisfacao", label: "Satisfação" },
  { key: "nps", label: "NPS" },
  { key: "sus", label: "SUS" },
  { key: "resumo", label: "Resumo Geral" },
];

const LIKERT_QUESTIONS = [
  { key: "q1", label: "Q1 · Experiência geral" },
  { key: "q2", label: "Q2 · Facilidade de navegação" },
  { key: "q3", label: "Q3 · Confiança/clareza visual" },
  { key: "q6", label: "Q6 · Organização da Home" },
  { key: "q7", label: "Q7 · Cadastro e login" },
];

const Q4_OPTIONS = [
  "Check-in diário de humor",
  "Indicadores de saúde (remédios, hidratação, passos)",
  "Consulta de exames (Prontuário)",
  "Agendamento de compromissos",
  "Lembretes e notificações",
];
const Q5_OPTIONS = ["Nenhuma dificuldade", "Pouca dificuldade", "Dificuldade moderada", "Muita dificuldade"];
const Q8_OPTIONS = ["Com certeza sim", "Provavelmente sim", "Talvez", "Provavelmente não", "Com certeza não"];

// Os dados agora vêm da API (antes eram leitura síncrona do localStorage),
// então cada aba precisa buscar de forma assíncrona. Este hook concentra
// o padrão "carregando / erro / dados" usado nas 4 abas abaixo.
function useAsyncResponses(fetcher) {
  const [state, setState] = useState({ data: null, error: null });

  useEffect(() => {
    let cancelado = false;
    fetcher()
      .then((dados) => {
        if (!cancelado) setState({ data: dados, error: null });
      })
      .catch((err) => {
        if (!cancelado) setState({ data: [], error: err.message });
      });
    return () => {
      cancelado = true;
    };
  }, [fetcher]);

  return state;
}

function distribution(responses, key, options) {
  const counts = Object.fromEntries(options.map((o) => [o, 0]));
  responses.forEach((r) => {
    const v = r.answers[key];
    if (v in counts) counts[v] += 1;
  });
  return options.map((o) => ({ label: o, count: counts[o] }));
}

function BarRow({ label, value, max, suffix = "", color = "var(--accent)" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="pr-2 text-text-secondary">{label}</span>
        <span className="shrink-0 font-semibold text-text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ResultadosPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("satisfacao");

  function handleUnlock(e) {
    e.preventDefault();
    if (isValidAdminCode(code)) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Código incorreto.");
    }
  }

  if (!unlocked) {
    return (
      <SurveyShell title="Painel de Resultados">
        <div className="flex flex-col items-center gap-5 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber/10 text-amber">
            <Lock size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Acesso restrito</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Digite o código de acesso da equipe do projeto para ver os resultados agregados.
            </p>
          </div>
          <form onSubmit={handleUnlock} className="w-full space-y-3">
            <input
              autoFocus
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de acesso"
              className="w-full rounded-lg border border-border bg-bg-secondary px-4 py-3 text-center text-sm text-text-primary outline-none ring-accent/40 placeholder:text-text-muted focus:ring-2"
            />
            {error && <p className="text-xs font-medium text-danger">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Entrar
            </button>
          </form>
        </div>
      </SurveyShell>
    );
  }

  return (
    <SurveyShell title="Painel de Resultados" onBack={() => navigate("/perfil")} maxWidth="max-w-5xl">
      <div className="mb-5 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent-hover dark:text-accent">
        <ShieldCheck size={16} strokeWidth={1.5} /> Acesso liberado — dados agregados deste navegador.
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg bg-bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative shrink-0 rounded-md px-4 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
              tab === t.key ? "text-accent" : "text-text-secondary"
            }`}
          >
            {tab === t.key && (
              <motion.span
                layoutId="resultados-tab-indicator"
                className="absolute inset-0 -z-10 rounded-md bg-bg-card shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === "satisfacao" && <SatisfacaoResults />}
        {tab === "nps" && <NpsResults />}
        {tab === "sus" && <SusResults />}
        {tab === "resumo" && <ResumoGeral />}
      </div>
    </SurveyShell>
  );
}

function ResumoGeral() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([getSatisfacaoResponses(), getNpsResponses(), getSusResponses()])
      .then(([satisfacao, nps, sus]) => {
        if (!cancelado) setDados({ satisfacao, nps, sus });
      })
      .catch(() => {
        if (!cancelado) setDados({ satisfacao: [], nps: [], sus: [] });
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Hooks precisam rodar sempre na mesma ordem — por isso os useMemo abaixo
  // usam fallback de arrays vazios em vez de retornar cedo antes deles.
  const satisfacao = dados?.satisfacao ?? [];
  const nps = dados?.nps ?? [];
  const sus = dados?.sus ?? [];

  // Dependendo de `dados` (a referência do state) em vez dos arrays
  // derivados: satisfacao/nps/sus são recriados a cada render pelo `?? []`,
  // então usá-los como dependência faria o useMemo recalcular sempre —
  // `dados` só muda de fato quando setDados roda.
  const totalRespondentes = useMemo(() => {
    const names = new Set();
    [...satisfacao, ...nps, ...sus].forEach((r) => r.respondent && names.add(r.respondent.trim().toLowerCase()));
    return names.size;
  }, [dados]); // eslint-disable-line react-hooks/exhaustive-deps

  const satisfacaoMedia = useMemo(() => {
    if (satisfacao.length === 0) return null;
    const values = [];
    satisfacao.forEach((r) => {
      LIKERT_QUESTIONS.forEach((q) => {
        const v = Number(r.answers[q.key]);
        if (!Number.isNaN(v)) values.push(v);
      });
    });
    return mean(values);
  }, [dados]); // eslint-disable-line react-hooks/exhaustive-deps

  const npsScore = useMemo(() => {
    if (nps.length === 0) return null;
    const promoters = nps.filter((r) => r.category === "Promotor").length;
    const detractors = nps.filter((r) => r.category === "Detrator").length;
    return Math.round(((promoters - detractors) / nps.length) * 100);
  }, [dados]); // eslint-disable-line react-hooks/exhaustive-deps

  const susScore = useMemo(() => {
    if (sus.length === 0) return null;
    return mean(sus.map((r) => r.score));
  }, [dados]); // eslint-disable-line react-hooks/exhaustive-deps

  const findings = useMemo(() => {
    const list = [];
    if (satisfacao.length > 0) {
      const q4dist = distribution(satisfacao, "q4", Q4_OPTIONS).sort((a, b) => b.count - a.count)[0];
      if (q4dist && q4dist.count > 0) {
        list.push(`A funcionalidade mais citada como útil foi "${q4dist.label}".`);
      }
      const semDificuldade = satisfacao.filter((r) => r.answers.q5 === "Nenhuma dificuldade").length;
      list.push(
        `${Math.round((semDificuldade / satisfacao.length) * 100)}% dos respondentes não encontraram dificuldades ao usar o app.`
      );
      const usariam = satisfacao.filter((r) => ["Com certeza sim", "Provavelmente sim"].includes(r.answers.q8)).length;
      list.push(
        `${Math.round((usariam / satisfacao.length) * 100)}% usariam o VidaPlus Web no dia a dia.`
      );
    }
    if (npsScore !== null) {
      list.push(`O NPS atual é ${npsScore}, calculado a partir de ${nps.length} respostas.`);
    }
    if (susScore !== null) {
      const grade = susGrade(susScore);
      list.push(`A usabilidade (SUS) foi avaliada com nota ${grade.letter} (${grade.label}), score médio ${susScore.toFixed(1)}.`);
    }
    return list;
  }, [dados, npsScore, susScore]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dados === null) {
    return <Card className="text-center text-sm text-text-muted">Carregando resumo...</Card>;
  }

  const hasAny = satisfacao.length + nps.length + sus.length > 0;

  if (!hasAny) {
    return (
      <Card className="text-center text-sm text-text-muted">
        Nenhuma resposta registrada em nenhum instrumento ainda.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <StatTile icon={Users} label="Respondentes únicos" value={totalRespondentes} />
        </Card>
        <Card>
          <StatTile
            icon={Smile}
            label="Satisfação média"
            value={satisfacaoMedia !== null ? `${satisfacaoMedia.toFixed(2)}/5` : "—"}
          />
        </Card>
        <Card>
          <StatTile icon={Gauge} label="NPS" value={npsScore !== null ? npsScore : "—"} />
        </Card>
        <Card>
          <StatTile
            icon={BarChart3}
            label="SUS score"
            value={susScore !== null ? susScore.toFixed(1) : "—"}
          />
        </Card>
      </div>

      <Card>
        <p className="section-label mb-3">Principais achados</p>
        {findings.length === 0 ? (
          <p className="text-sm text-text-muted">Sem dados suficientes ainda.</p>
        ) : (
          <ul className="space-y-2">
            {findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SatisfacaoResults() {
  const { data: responses, error } = useAsyncResponses(getSatisfacaoResponses);

  if (responses === null) {
    return (
      <Section title="Pesquisa de Satisfação">
        <EmptyState text="Carregando respostas..." />
      </Section>
    );
  }

  if (error || responses.length === 0) {
    return (
      <Section title="Pesquisa de Satisfação">
        <EmptyState text={error || "Nenhuma resposta registrada ainda."} />
      </Section>
    );
  }

  const q4dist = distribution(responses, "q4", Q4_OPTIONS);
  const q5dist = distribution(responses, "q5", Q5_OPTIONS);
  const q8dist = distribution(responses, "q8", Q8_OPTIONS);
  const maxQ4 = Math.max(1, ...q4dist.map((d) => d.count));
  const maxQ5 = Math.max(1, ...q5dist.map((d) => d.count));
  const maxQ8 = Math.max(1, ...q8dist.map((d) => d.count));

  return (
    <Section title="Pesquisa de Satisfação" count={responses.length}>
      <Card className="mb-3">
        <p className="section-label mb-3">Médias (escala de 1 a 5)</p>
        {LIKERT_QUESTIONS.map((q) => {
          const values = responses.map((r) => Number(r.answers[q.key])).filter((v) => !Number.isNaN(v));
          return <BarRow key={q.key} label={q.label} value={mean(values).toFixed(2)} max={5} />;
        })}
      </Card>

      <Card className="mb-3">
        <p className="section-label mb-3">Q4 · Funcionalidade mais útil</p>
        {q4dist.map((d) => (
          <BarRow key={d.label} label={d.label} value={d.count} max={maxQ4} color="var(--info)" />
        ))}
      </Card>

      <Card className="mb-3">
        <p className="section-label mb-3">Q5 · Dificuldade encontrada</p>
        {q5dist.map((d) => (
          <BarRow key={d.label} label={d.label} value={d.count} max={maxQ5} color="var(--amber)" />
        ))}
      </Card>

      <Card className="mb-3">
        <p className="section-label mb-3">Q8 · Intenção de uso no dia a dia</p>
        {q8dist.map((d) => (
          <BarRow key={d.label} label={d.label} value={d.count} max={maxQ8} color="var(--purple)" />
        ))}
      </Card>

      <Card>
        <p className="section-label mb-3">Respostas abertas</p>
        <p className="mb-1.5 text-xs font-semibold text-text-secondary">Q9 · O que mais gostou</p>
        <ul className="mb-4 space-y-1.5">
          {responses
            .filter((r) => r.answers.q9?.trim())
            .map((r) => (
              <OpenAnswer key={r.id + "q9"} respondent={r.respondent} text={r.answers.q9} />
            ))}
        </ul>
        <p className="mb-1.5 text-xs font-semibold text-text-secondary">
          Q10 · O que mudaria ou melhoraria
        </p>
        <ul className="space-y-1.5">
          {responses
            .filter((r) => r.answers.q10?.trim())
            .map((r) => (
              <OpenAnswer key={r.id + "q10"} respondent={r.respondent} text={r.answers.q10} />
            ))}
        </ul>
      </Card>
    </Section>
  );
}

function NpsResults() {
  const { data, error } = useAsyncResponses(getNpsResponses);
  const responses = data ?? [];
  const total = responses.length;
  const promoters = responses.filter((r) => r.category === "Promotor").length;
  const passives = responses.filter((r) => r.category === "Neutro").length;
  const detractors = responses.filter((r) => r.category === "Detrator").length;
  const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  const animatedScore = useCountUp(npsScore, 900);

  if (data === null) {
    return (
      <Section title="NPS">
        <EmptyState text="Carregando respostas..." />
      </Section>
    );
  }

  if (error || total === 0) {
    return (
      <Section title="NPS">
        <EmptyState text={error || "Nenhuma resposta registrada ainda."} />
      </Section>
    );
  }

  const promotersPct = Math.round((promoters / total) * 100);
  const detractorsPct = Math.round((detractors / total) * 100);

  const zone =
    npsScore >= 75
      ? { label: "Excelência", color: "var(--accent)" }
      : npsScore >= 50
      ? { label: "Qualidade", color: "var(--accent)" }
      : npsScore >= 1
      ? { label: "Aperfeiçoamento", color: "var(--amber)" }
      : { label: "Crítica", color: "var(--danger)" };

  return (
    <Section title="NPS (Net Promoter Score)" count={total}>
      <Card className="mb-3 text-center">
        <p className="meta-label">Score NPS</p>
        <p className="text-[64px] font-bold leading-none tracking-tight" style={{ color: zone.color }}>
          {Math.round(animatedScore)}
        </p>
        <span
          className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: zone.color }}
        >
          Zona de {zone.label}
        </span>
        <p className="mt-3 text-xs text-text-muted">
          % Promotores ({promotersPct}%) − % Detratores ({detractorsPct}%) = NPS {npsScore}
        </p>
      </Card>

      <div className="mb-3 grid grid-cols-3 gap-3">
        <div className="flex-1 rounded-xl bg-accent/10 p-4 text-center">
          <p className="text-3xl font-bold text-accent">{promoters}</p>
          <p className="mt-1 text-xs text-text-secondary">Promotores ({promotersPct}%)</p>
        </div>
        <div className="flex-1 rounded-xl bg-amber/10 p-4 text-center">
          <p className="text-3xl font-bold text-amber">{passives}</p>
          <p className="mt-1 text-xs text-text-secondary">
            Neutros ({Math.round((passives / total) * 100)}%)
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-danger/10 p-4 text-center">
          <p className="text-3xl font-bold text-danger">{detractors}</p>
          <p className="mt-1 text-xs text-text-secondary">Detratores ({detractorsPct}%)</p>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <p className="section-label mb-3">Respostas individuais</p>
        <table className="w-full min-w-[420px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="pb-2 pr-2 font-semibold">Nome</th>
              <th className="pb-2 pr-2 font-semibold">Nota</th>
              <th className="pb-2 pr-2 font-semibold">Categoria</th>
              <th className="pb-2 font-semibold">Justificativa</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border align-top transition-colors odd:bg-transparent even:bg-black/[0.015] hover:bg-black/[0.03] dark:even:bg-white/[0.02] dark:hover:bg-white/[0.04]"
              >
                <td className="py-2 pr-2 font-medium text-text-primary">{r.respondent}</td>
                <td className="py-2 pr-2 font-bold text-text-primary">{r.score}</td>
                <td className="py-2 pr-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.category === "Promotor"
                        ? "bg-accent/10 text-accent-hover dark:text-accent"
                        : r.category === "Neutro"
                        ? "bg-amber/10 text-amber"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {r.category}
                  </span>
                </td>
                <td className="py-2 text-text-secondary">{r.comment || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Section>
  );
}

function SusResults() {
  const { data, error } = useAsyncResponses(getSusResponses);
  const responses = data ?? [];
  const scores = responses.map((r) => r.score);
  const avgScore = scores.length > 0 ? mean(scores) : 0;
  const animatedAvg = useCountUp(avgScore, 900);

  if (data === null) {
    return (
      <Section title="SUS (System Usability Scale)">
        <EmptyState text="Carregando respostas..." />
      </Section>
    );
  }

  if (error || responses.length === 0) {
    return (
      <Section title="SUS (System Usability Scale)">
        <EmptyState text={error || "Nenhuma resposta registrada ainda."} />
      </Section>
    );
  }

  const grade = susGrade(avgScore);
  const med = median(scores);
  const sd = stdDev(scores);
  const min = Math.min(...scores);
  const max = Math.max(...scores);

  const itemAverages = SUS_STATEMENTS.map((s, idx) => ({
    ...s,
    avg: mean(responses.map((r) => Number(r.answers[idx]))),
  }));

  return (
    <Section title="SUS (System Usability Scale)" count={responses.length}>
      <Card className="mb-3 text-center">
        <p className="meta-label">Score médio</p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="text-5xl font-bold tracking-tight text-text-primary">
            {animatedAvg.toFixed(1)}
          </span>
          <span
            className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
            style={{ backgroundColor: grade.color }}
          >
            {grade.letter}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold" style={{ color: grade.color }}>
          {grade.label}
        </p>
        <div
          className="relative mx-auto mt-4 h-2 w-full max-w-sm overflow-visible rounded-full"
          style={{
            background: "linear-gradient(to right, #dc2626, #d97706, #eab308, #84cc16, #059669)",
          }}
        >
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow transition-all duration-1000 ease-out dark:border-[#171717]"
            style={{ left: `${Math.min(100, Math.max(0, avgScore))}%`, backgroundColor: "var(--text-primary)" }}
          />
        </div>
        <div className="mx-auto mt-1 flex max-w-sm justify-between text-[10px] text-text-muted">
          <span>F</span>
          <span>D</span>
          <span>C</span>
          <span>B</span>
          <span>A</span>
        </div>
      </Card>

      <Card className="mb-3">
        <p className="section-label mb-3">Estatísticas descritivas</p>
        <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
          <Stat label="Média" value={avgScore.toFixed(1)} />
          <Stat label="Mediana" value={med.toFixed(1)} />
          <Stat label="Desvio padrão" value={sd.toFixed(1)} />
          <Stat label="Mínimo" value={min.toFixed(1)} />
          <Stat label="Máximo" value={max.toFixed(1)} />
        </div>
      </Card>

      <Card className="mb-3">
        <p className="section-label mb-3">Média por item</p>
        {itemAverages.map((item) => (
          <BarRow
            key={item.n}
            label={`${item.n}. ${item.positive ? "(+)" : "(−)"} ${item.text}`}
            value={item.avg.toFixed(2)}
            max={5}
            color={item.positive ? "var(--accent)" : "var(--amber)"}
          />
        ))}
      </Card>

      <Card className="overflow-x-auto">
        <p className="section-label mb-3">Respostas individuais</p>
        <table className="w-full min-w-[380px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="pb-2 pr-2 font-semibold">Nome</th>
              <th className="pb-2 pr-2 font-semibold">Score</th>
              <th className="pb-2 pr-2 font-semibold">Nota</th>
              <th className="pb-2 font-semibold">Classificação</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => {
              const g = susGrade(r.score);
              return (
                <tr
                  key={r.id}
                  className="border-b border-border transition-colors odd:bg-transparent even:bg-black/[0.015] hover:bg-black/[0.03] dark:even:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <td className="py-2 pr-2 font-medium text-text-primary">{r.respondent}</td>
                  <td className="py-2 pr-2 font-bold text-text-primary">{r.score.toFixed(1)}</td>
                  <td className="py-2 pr-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: g.color }}
                    >
                      {g.letter}
                    </span>
                  </td>
                  <td className="py-2 text-text-secondary">{g.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </Section>
  );
}

function Section({ title, count, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight text-text-primary">{title}</h2>
        {typeof count === "number" && (
          <span className="rounded-full bg-bg-secondary px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {count} {count === 1 ? "resposta" : "respostas"}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ text }) {
  return <Card className="text-center text-sm text-text-muted">{text}</Card>;
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-[10px] font-medium text-text-muted">{label}</p>
    </div>
  );
}

function OpenAnswer({ respondent, text }) {
  return (
    <li className="rounded-lg bg-bg-secondary px-3 py-2">
      <p className="text-sm text-text-secondary">&ldquo;{text}&rdquo;</p>
      <p className="mt-1 text-[11px] font-semibold text-text-muted">— {respondent}</p>
    </li>
  );
}
