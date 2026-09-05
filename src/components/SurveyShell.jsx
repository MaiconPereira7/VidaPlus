import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SurveyShell({ title, progress, step, total, children, onBack, maxWidth = "max-w-[600px]" }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-primary/95 backdrop-blur">
        <div className={`mx-auto flex items-center justify-between gap-3 px-4 py-3.5 ${maxWidth}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : navigate("/perfil"))}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-semibold text-text-primary">{title}</h1>
          </div>
          {typeof step === "number" && typeof total === "number" && (
            <span className="text-xs font-medium text-text-muted">
              {step} de {total}
            </span>
          )}
        </div>
        {typeof progress === "number" && (
          <div className="h-[3px] w-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>
      <main className={`mx-auto px-4 py-8 ${maxWidth}`}>{children}</main>
    </div>
  );
}
