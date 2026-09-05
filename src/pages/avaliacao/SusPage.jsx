import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SurveyShell from "../../components/SurveyShell";
import RespondentGate from "../../components/RespondentGate";
import LikertScale from "../../components/LikertScale";
import AnimatedCheck from "../../components/AnimatedCheck";
import { useCountUp } from "../../hooks/useCountUp";
import { SUS_STATEMENTS, addSusResponse, susGrade } from "../../lib/surveys";
import { useToast } from "../../context/ToastContext";

export default function SusPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [respondent, setRespondent] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [result, setResult] = useState(null);

  const statement = SUS_STATEMENTS[step];
  const value = answers[step];

  function setAnswer(v) {
    setAnswers((a) => {
      const next = [...a];
      next[step] = v;
      return next;
    });
  }

  function handleNext() {
    if (step === SUS_STATEMENTS.length - 1) {
      const entry = addSusResponse(respondent, answers);
      setResult(entry);
      showToast("Avaliação SUS enviada. Obrigado!");
    } else {
      setStep((s) => s + 1);
    }
  }

  if (!respondent) {
    return (
      <SurveyShell title="SUS">
        <RespondentGate
          title="System Usability Scale"
          description="10 afirmações padronizadas para medir a usabilidade do VidaPlus Web. Responda de 1 (discordo totalmente) a 5 (concordo totalmente)."
          onStart={setRespondent}
        />
      </SurveyShell>
    );
  }

  if (result) {
    return (
      <SurveyShell title="SUS" onBack={() => navigate("/perfil")}>
        <SusResult respondent={respondent} score={result.score} onDone={() => navigate("/perfil")} />
      </SurveyShell>
    );
  }

  return (
    <SurveyShell title="SUS" progress={((step + 1) / SUS_STATEMENTS.length) * 100} step={step + 1} total={SUS_STATEMENTS.length}>
      <div key={step} className="animate-slide-in">
        <h2 className="mb-6 text-xl font-semibold leading-snug tracking-tight text-text-primary">
          {statement.text}
        </h2>

        <LikertScale
          value={value}
          onChange={setAnswer}
          minLabel="Discordo totalmente"
          maxLabel="Concordo totalmente"
        />
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary disabled:opacity-30"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!value}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === SUS_STATEMENTS.length - 1 ? "Enviar" : "Próxima"} <ArrowRight size={16} />
        </button>
      </div>
    </SurveyShell>
  );
}

function SusResult({ respondent, score, onDone }) {
  const animated = useCountUp(score, 1000);
  const grade = susGrade(score);

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <AnimatedCheck />
      <h2 className="text-2xl font-bold tracking-tight text-text-primary">Obrigado, {respondent}!</h2>
      <p className="text-sm text-text-secondary">Seu score de usabilidade (SUS):</p>
      <div className="flex items-center gap-4">
        <span className="text-4xl font-bold tracking-tight text-text-primary">{animated.toFixed(1)}</span>
        <span
          className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
          style={{ backgroundColor: grade.color }}
        >
          {grade.letter}
        </span>
      </div>
      <p className="text-sm font-semibold" style={{ color: grade.color }}>
        {grade.label}
      </p>
      <div className="mx-auto mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, score)}%`, backgroundColor: grade.color }}
        />
      </div>
      <button
        onClick={onDone}
        className="mt-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Voltar ao Perfil
      </button>
    </div>
  );
}
