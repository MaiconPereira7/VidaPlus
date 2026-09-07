import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Smile,
  CalendarDays,
  FileText,
  Check,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import AnimatedCheck from "../components/AnimatedCheck";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getMoodToday, getWaterToday, getStepsToday, getMeds, getExams } from "../lib/health";
import { getAppointments } from "../lib/agenda";
import { getTestProgress, completeMission, countCompleted, allMissionsDone } from "../lib/testes";

const MISSIONS = [
  {
    key: "m1",
    icon: Smile,
    title: "Seu dia de saúde",
    description: "Registre como está seu dia: humor, hidratação, passos e medicamentos.",
    route: "/",
    cta: "Ir para Home",
    tasks: [
      "Fazer o check-in de humor",
      "Adicionar pelo menos 3 copos de água na Hidratação",
      "Registrar pelo menos 1.000 passos",
      "Cadastrar 1 medicamento (nome, dosagem e horário)",
    ],
  },
  {
    key: "m2",
    icon: CalendarDays,
    title: "Agende e organize",
    description: "Crie compromissos e veja como o VidaPlus organiza sua rotina de saúde.",
    route: "/agenda",
    cta: "Ir para Agenda",
    tasks: [
      "Agendar 1 consulta médica (tipo: Consulta)",
      "Agendar 1 lembrete (tipo: Lembrete)",
      "Visualizar o compromisso no calendário",
    ],
  },
  {
    key: "m3",
    icon: FileText,
    title: "Seu histórico de saúde",
    description: "Registre um exame e explore seu histórico no prontuário.",
    route: "/saude",
    cta: "Ir para Saúde",
    tasks: [
      "Cadastrar 1 exame no Prontuário (nome, data, resultado, status)",
      "Usar o filtro de status para filtrar exames",
      "Observar os indicadores semanais (hidratação, humor, medicação)",
    ],
  },
];

export default function TestesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const email = user.email;

  const [progress, setProgress] = useState(() => getTestProgress(email));
  const [taskStates, setTaskStates] = useState({ m1: [], m2: [], m3: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const hasMood = getMoodToday(email) !== null;
      const hasWater = getWaterToday(email) >= 3;
      const hasSteps = getStepsToday(email) >= 1000;
      const hasMeds = getMeds(email).length >= 1;
      const m1Done = hasMood && hasWater && hasSteps && hasMeds;

      const hasExam = getExams(email).length >= 1;
      const m3Done = hasExam;

      let hasConsulta = false;
      let hasLembrete = false;
      try {
        const appointments = await getAppointments();
        hasConsulta = appointments.some((a) => a.type === "Consulta");
        hasLembrete = appointments.some((a) => a.type === "Lembrete");
      } catch (err) {
        if (!cancelled) showToast(err.message, "error");
      }
      const m2Done = hasConsulta && hasLembrete;

      if (cancelled) return;

      setTaskStates({
        m1: [hasMood, hasWater, hasSteps, hasMeds],
        m2: [hasConsulta, hasLembrete, hasConsulta && hasLembrete],
        m3: [hasExam, hasExam, hasExam],
      });

      let next = getTestProgress(email);
      if (m1Done && !next.m1) next = completeMission(email, "m1");
      if (m2Done && !next.m2) next = completeMission(email, "m2");
      if (m3Done && !next.m3) next = completeMission(email, "m3");
      setProgress(next);
      setLoading(false);
    }

    check();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedCount = useMemo(() => countCompleted(progress), [progress]);
  const allDone = allMissionsDone(progress);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="space-y-5">
        <div className="animate-fade-in-up">
          <h1 className="page-title">Teste o VidaPlus</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Complete as 3 missões abaixo para conhecer o app. Depois, avalie sua experiência.
          </p>
        </div>

        <Card className="animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <AnimatedCheck size={80} />
            </motion.div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Todas as missões concluídas! 🎉
            </h2>
            <p className="max-w-md text-sm text-text-secondary">
              Agora que você conhece o VidaPlus, avalie sua experiência respondendo as 3
              pesquisas abaixo. Leva menos de 5 minutos!
            </p>

            <div className="mt-2 w-full max-w-sm space-y-2.5">
              <button
                onClick={() => navigate("/avaliacao/satisfacao")}
                className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                1. Pesquisa de Satisfação
              </button>
              <button
                onClick={() => navigate("/avaliacao/nps")}
                className="w-full rounded-xl border border-accent py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
              >
                2. NPS — Recomendação
              </button>
              <button
                onClick={() => navigate("/avaliacao/sus")}
                className="w-full rounded-xl border border-accent py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
              >
                3. Escala SUS — Usabilidade
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="animate-fade-in-up">
        <h1 className="page-title">Teste o VidaPlus</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Complete as 3 missões abaixo para conhecer o app. Depois, avalie sua experiência.
        </p>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "20ms" }}>
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-text-primary">
          <span>{completedCount} de 3 missões completas</span>
          <span className="text-accent">{Math.round((completedCount / 3) * 100)}%</span>
        </div>
        <ProgressBar value={completedCount} max={3} />
      </Card>

      <div className="space-y-4">
        {MISSIONS.map((mission, idx) => (
          <MissionCard
            key={mission.key}
            index={idx + 1}
            mission={mission}
            done={progress[mission.key]}
            states={taskStates[mission.key] || []}
            onStart={() => navigate(mission.route)}
            delay={40 + idx * 40}
          />
        ))}
      </div>
    </div>
  );
}

function MissionCard({ index, mission, done, states, onStart, delay }) {
  const Icon = mission.icon;
  const someStarted = states.some(Boolean);

  return (
    <Card
      className={`animate-fade-in-up transition-colors ${done ? "border-accent/30 bg-accent/5" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            done
              ? "bg-accent/15 text-accent-hover dark:text-accent"
              : someStarted
              ? "bg-amber/15 text-amber"
              : "bg-border/60 text-text-secondary"
          }`}
        >
          Missão {index}
        </span>
        {done ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-accent">
            <CheckCircle2 size={14} strokeWidth={1.5} /> Concluída
          </span>
        ) : someStarted ? (
          <span className="text-xs font-semibold text-amber">Em andamento</span>
        ) : (
          <span className="text-xs font-medium text-text-muted">Pendente</span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-secondary text-text-secondary">
          <Icon size={19} strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-text-primary">{mission.title}</h3>
          <p className="text-xs text-text-secondary">{mission.description}</p>
        </div>
      </div>

      <ul className="mb-4 space-y-2">
        {mission.tasks.map((task, i) => {
          const taskDone = Boolean(states[i]);
          return (
            <li key={task} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                  taskDone ? "border-accent bg-accent" : "border-border"
                }`}
              >
                {taskDone && <Check size={12} strokeWidth={3} className="text-white" />}
              </span>
              <span className={taskDone ? "text-text-primary" : "text-text-secondary"}>{task}</span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={onStart}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        {mission.cta} <ArrowRight size={15} strokeWidth={1.5} />
      </button>
    </Card>
  );
}
