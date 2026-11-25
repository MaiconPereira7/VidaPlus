import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Info, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";
import { entrarSupervisor } from "../lib/supervisorSession";

export default function SupervisorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // Apenas visual: sem validação, entra direto no painel.
    entrarSupervisor();
    navigate("/supervisor/dashboard");
  }

  function handleCodeChange(e) {
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-bg-secondary py-3 pl-10 pr-3 text-sm text-text-primary outline-none ring-accent/40 input-field focus:border-accent focus:ring-2";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted";
  const labelClass = "mb-1.5 block text-xs font-semibold text-text-secondary";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-bg-primary to-accent/5 px-4 py-10">
      <div
        className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-hover dark:text-accent">
            <ShieldCheck size={14} strokeWidth={2} />
            Painel Supervisor
          </span>
        </div>

        <div className="animate-fade-in-up glass-card rounded-2xl border border-white/60 p-6 shadow-lg dark:border-border dark:shadow-none">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Acesso Restrito</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Área exclusiva para supervisores e administradores da plataforma
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5" noValidate>
            <div>
              <label htmlFor="sup-email" className={labelClass}>
                E-mail institucional
              </label>
              <div className="relative">
                <Mail size={18} className={iconClass} />
                <input
                  id="sup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supervisor@vidaplus.com.br"
                  autoComplete="username"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sup-password" className={labelClass}>
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className={iconClass} />
                <input
                  id="sup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="sup-code" className={labelClass}>
                Código de acesso
              </label>
              <div className="relative">
                <ShieldCheck size={18} className={iconClass} />
                <input
                  id="sup-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Código de 6 dígitos"
                  autoComplete="one-time-code"
                  className={`${inputClass} tracking-widest placeholder:tracking-normal`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
                Manter conectado
              </label>
              <button
                type="button"
                className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline"
              >
                Esqueci a senha
              </button>
            </div>

            <button
              type="submit"
              className="btn-gradient flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold text-white"
            >
              <LogIn size={18} />
              Entrar como Supervisor
            </button>
          </form>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase text-text-muted">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-2.5 rounded-lg bg-accent-light p-3 text-xs leading-relaxed text-accent-hover dark:text-accent">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>
              Se você é um paciente, acesse pelo{" "}
              <Link to="/login" className="font-semibold underline underline-offset-2">
                login principal
              </Link>
              . Esta área é restrita a supervisores autorizados.
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-text-muted">
          © 2024 VidaPlus · <button type="button" className="hover:text-text-secondary hover:underline">Termos de Uso</button> ·{" "}
          <button type="button" className="hover:text-text-secondary hover:underline">Privacidade</button>
        </footer>
      </div>
    </div>
  );
}
