import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  HeartPulse,
  Smile,
  Pill,
  CalendarDays,
  IdCard,
  Cake,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "cadastro") {
      const cpfLimpo = cpf.replace(/\D/g, "");
      if (!name.trim() || !email.trim() || password.length < 6) {
        setError("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
        return;
      }
      if (cpfLimpo.length !== 11) {
        setError("Informe um CPF válido (11 dígitos).");
        return;
      }
      if (!dataNascimento) {
        setError("Informe sua data de nascimento.");
        return;
      }

      setEnviando(true);
      const result = await register({
        name,
        email,
        password,
        cpf: cpfLimpo,
        dataNascimento,
      });
      setEnviando(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      showToast(`Bem-vindo(a), ${name.split(" ")[0]}!`);
      navigate("/");
    } else {
      setEnviando(true);
      const result = await login({ email, password });
      setEnviando(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      showToast(`Que bom te ver de novo, ${result.user.name.split(" ")[0]}!`);
      navigate("/");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-bg-secondary py-3 pl-10 pr-3 text-sm text-text-primary outline-none ring-accent/40 placeholder:text-text-muted focus:border-accent focus:ring-2";

  return (
    <div className="min-h-screen bg-bg-primary lg:flex">
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12"
        style={{ background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)" }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: 0.06 }}
          aria-hidden="true"
        >
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <HeartPulse size={19} strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">VidaPlus</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Sua saúde, centralizada.
          </h2>
          <p className="mt-3 text-[15px] text-white/85">
            Humor, hidratação, medicamentos, exames e agenda em um só lugar — simples de usar, no
            seu ritmo.
          </p>
          <ul className="mt-8 space-y-4">
            <FeatureItem icon={Smile} text="Acompanhe seu humor todos os dias" />
            <FeatureItem icon={Pill} text="Nunca mais esqueça um medicamento" />
            <FeatureItem icon={CalendarDays} text="Organize consultas e exames num só calendário" />
          </ul>
        </div>

        <p className="relative text-xs text-white/60">Protótipo acadêmico — Projeto IHC 2026.2</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-14 lg:px-12 lg:py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="lg" withSlogan />
          </div>

          <div className="rounded-xl border border-transparent bg-bg-card p-6 shadow-lg dark:border-border dark:shadow-none">
            <div className="relative mb-5 flex rounded-lg bg-bg-secondary p-1">
              {["login", "cadastro"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`relative z-10 flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                    mode === m ? "text-accent" : "text-text-secondary"
                  }`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="login-tab-indicator"
                      className="absolute inset-0 -z-10 rounded-md bg-bg-card shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  {m === "login" ? "Entrar" : "Cadastrar"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "cadastro" && (
                <>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <IdCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="CPF"
                        maxLength={14}
                        className={inputClass}
                      />
                    </div>
                    <div className="relative flex-1">
                      <Cake size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className={`${inputClass} pr-2`}
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
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

              {error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="h-12 w-full rounded-lg bg-accent text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Aguarde..." : mode === "cadastro" ? "Criar conta" : "Entrar"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            Protótipo acadêmico — seus dados de conta ficam no banco do VidaPlus.
          </p>
          <p className="mt-2 text-center text-[11px] text-text-muted">
            Feito com ❤️ para IHC 2026.2
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }) {
  return (
    <li className="group flex items-center gap-3 text-sm text-white/95 transition-transform duration-200 hover:translate-x-1">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <Icon size={16} strokeWidth={1.5} />
      </span>
      {text}
    </li>
  );
}
