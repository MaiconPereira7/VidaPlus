import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SurveyShell from "../../components/SurveyShell";
import RespondentGate from "../../components/RespondentGate";
import LikertScale from "../../components/LikertScale";
import AnimatedCheck from "../../components/AnimatedCheck";
import { addSatisfacaoResponse } from "../../lib/surveys";
import { useToast } from "../../context/ToastContext";

const QUESTIONS = [
  {
    key: "q1",
    type: "likert",
    text: "De modo geral, como você avalia sua experiência ao usar o VidaPlus Web?",
    minLabel: "Muito insatisfeito",
    maxLabel: "Muito satisfeito",
  },
  {
    key: "q2",
    type: "likert",
    text: "Como você avalia a facilidade para navegar entre as seções (Home, Saúde, Agenda, Perfil)?",
    minLabel: "Muito difícil",
    maxLabel: "Muito fácil",
  },
  {
    key: "q3",
    type: "likert",
    text: "O visual do VidaPlus Web (cores, ícones, tipografia) transmitiu confiança e clareza?",
    minLabel: "Discordo totalmente",
    maxLabel: "Concordo totalmente",
  },
  {
    key: "q4",
    type: "choice",
    text: "Qual funcionalidade você considerou mais útil?",
    options: [
      "Check-in diário de humor",
      "Indicadores de saúde (remédios, hidratação, passos)",
      "Consulta de exames (Prontuário)",
      "Agendamento de compromissos",
      "Lembretes e notificações",
    ],
  },
  {
    key: "q5",
    type: "choice",
    text: "Você encontrou alguma dificuldade ao realizar tarefas no VidaPlus Web?",
    options: ["Nenhuma dificuldade", "Pouca dificuldade", "Dificuldade moderada", "Muita dificuldade"],
  },
  {
    key: "q6",
    type: "likert",
    text: "A organização das informações na tela Home facilitou o acesso ao que você precisava?",
    minLabel: "Discordo totalmente",
    maxLabel: "Concordo totalmente",
  },
  {
    key: "q7",
    type: "likert",
    text: "O processo de cadastro e login foi claro e rápido?",
    minLabel: "Discordo totalmente",
    maxLabel: "Concordo totalmente",
  },
  {
    key: "q8",
    type: "choice",
    text: "Você utilizaria o VidaPlus Web no seu dia a dia para gerenciar sua saúde?",
    options: ["Com certeza sim", "Provavelmente sim", "Talvez", "Provavelmente não", "Com certeza não"],
  },
  {
    key: "q9",
    type: "text",
    text: "O que você mais gostou no VidaPlus Web?",
  },
  {
    key: "q10",
    type: "text",
    text: "O que você mudaria ou melhoraria no VidaPlus Web?",
  },
];

export default function SatisfacaoPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [respondent, setRespondent] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const question = QUESTIONS[step];
  const value = answers[question?.key];
  const canAdvance =
    question?.type === "text" ? true : value !== undefined && value !== null && value !== "";

  function setAnswer(v) {
    setAnswers((a) => ({ ...a, [question.key]: v }));
  }

  async function handleNext() {
    if (step === QUESTIONS.length - 1) {
      try {
        await addSatisfacaoResponse(respondent, answers);
        setDone(true);
        showToast("Pesquisa enviada. Obrigado!");
      } catch (err) {
        showToast(err.message, "error");
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  if (!respondent) {
    return (
      <SurveyShell title="Pesquisa de Satisfação">
        <RespondentGate
          title="Pesquisa de Satisfação"
          description="10 perguntas rápidas sobre sua experiência com o VidaPlus Web. Leva menos de 2 minutos."
          onStart={setRespondent}
        />
      </SurveyShell>
    );
  }

  if (done) {
    return (
      <SurveyShell title="Pesquisa de Satisfação" onBack={() => navigate("/perfil")}>
        <ThankYou onDone={() => navigate("/perfil")} />
      </SurveyShell>
    );
  }

  return (
    <SurveyShell
      title="Pesquisa de Satisfação"
      progress={((step + 1) / QUESTIONS.length) * 100}
      step={step + 1}
      total={QUESTIONS.length}
    >
      <div key={step} className="animate-slide-in pb-20 md:pb-0">
        <h2 className="mb-6 text-xl font-semibold leading-snug tracking-tight text-text-primary">
          {question.text}
        </h2>

        {question.type === "likert" && (
          <LikertScale value={value} onChange={setAnswer} minLabel={question.minLabel} maxLabel={question.maxLabel} />
        )}

        {question.type === "choice" && (
          <div className="flex flex-wrap gap-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors ${
                  value === opt
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-border text-text-secondary hover:border-accent hover:bg-accent/5"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {question.type === "text" && (
          <textarea
            autoFocus
            value={value || ""}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="Escreva sua resposta..."
            className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none ring-accent/40 placeholder:text-text-muted focus:ring-2"
          />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-border bg-bg-primary/90 px-4 py-3 backdrop-blur-md md:static md:mt-10 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary disabled:opacity-30"
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === QUESTIONS.length - 1 ? "Enviar" : "Próxima"} <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </SurveyShell>
  );
}

function ThankYou({ onDone }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <AnimatedCheck size={80} />
      </motion.div>
      <h2 className="text-2xl font-bold tracking-tight text-text-primary">
        Obrigado pela sua avaliação!
      </h2>
      <p className="max-w-xs text-sm text-text-secondary">
        Suas respostas foram registradas e vão ajudar a melhorar o VidaPlus Web.
      </p>
      <button
        onClick={onDone}
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Voltar ao Perfil
      </button>
    </div>
  );
}
