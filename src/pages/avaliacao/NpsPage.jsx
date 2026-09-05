import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SurveyShell from "../../components/SurveyShell";
import RespondentGate from "../../components/RespondentGate";
import AnimatedCheck from "../../components/AnimatedCheck";
import { addNpsResponse, npsCategory } from "../../lib/surveys";
import { useToast } from "../../context/ToastContext";

const CATEGORY_STYLES = {
  Promotor: "bg-accent/10 text-accent-hover dark:text-accent",
  Neutro: "bg-amber/10 text-amber",
  Detrator: "bg-danger/10 text-danger",
};

function scoreColor(n) {
  if (n <= 3) return "var(--danger)";
  if (n <= 6) return "var(--amber)";
  if (n <= 8) return "#eab308";
  return "var(--accent)";
}

export default function NpsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [respondent, setRespondent] = useState(null);
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState("");
  const [result, setResult] = useState(null);

  function handleSubmit() {
    if (score === null) return;
    const entry = addNpsResponse(respondent, score, comment);
    setResult(entry);
    showToast("Resposta enviada. Obrigado!");
  }

  if (!respondent) {
    return (
      <SurveyShell title="NPS">
        <RespondentGate
          title="Net Promoter Score"
          description="Duas perguntas rápidas sobre o quanto você recomendaria o VidaPlus Web."
          onStart={setRespondent}
        />
      </SurveyShell>
    );
  }

  if (result) {
    return (
      <SurveyShell title="NPS" onBack={() => navigate("/perfil")}>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <AnimatedCheck />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Obrigado, {respondent}!
          </h2>
          <p className="text-sm text-text-secondary">Sua nota foi registrada:</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold tracking-tight text-text-primary">{result.score}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${CATEGORY_STYLES[result.category]}`}>
              {result.category}
            </span>
          </div>
          <button
            onClick={() => navigate("/perfil")}
            className="mt-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Voltar ao Perfil
          </button>
        </div>
      </SurveyShell>
    );
  }

  const previewCategory = score !== null ? npsCategory(score) : null;

  return (
    <SurveyShell title="NPS">
      <div className="space-y-9">
        <div>
          <h2 className="mb-5 text-xl font-semibold leading-snug tracking-tight text-text-primary">
            Em uma escala de 0 a 10, qual a probabilidade de você recomendar o VidaPlus Web a um
            amigo ou familiar?
          </h2>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => {
              const color = scoreColor(n);
              const isSelected = score === n;
              return (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  className="flex h-12 w-full items-center justify-center rounded-[10px] border text-base font-semibold transition-colors"
                  style={{
                    borderColor: isSelected ? color : "var(--border-color)",
                    backgroundColor: isSelected ? color : "transparent",
                    color: isSelected ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-text-muted">
            <span>Nada provável</span>
            <span>Muito provável</span>
          </div>
          {previewCategory && (
            <p className="mt-4 text-center text-sm font-medium">
              Categoria:{" "}
              <span className={`rounded-full px-2 py-0.5 font-bold ${CATEGORY_STYLES[previewCategory]}`}>
                {previewCategory}
              </span>
            </p>
          )}
        </div>

        <div>
          <p className="meta-label mb-3">O que motivou a sua nota?</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Conte um pouco mais..."
            className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none ring-accent/40 placeholder:text-text-muted focus:ring-2"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={score === null}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enviar resposta
        </button>
      </div>
    </SurveyShell>
  );
}
