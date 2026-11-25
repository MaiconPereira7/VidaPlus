// Peças visuais compartilhadas pelas páginas do Painel do Supervisor.

export { default as AdesaoBar } from "../AdesaoBar";
export { default as BarChart } from "../BarChart";
export { default as Toggle } from "../Toggle";

const AVATAR_CORES = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
];

export function iniciais(nome) {
  return nome
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ nome, size = "md", seed = 0 }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl" };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]} ${
        AVATAR_CORES[seed % AVATAR_CORES.length]
      }`}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}

export function Panel({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-border dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const selectClass =
  "input-field rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:border-accent focus:ring-2";

export const inputClass =
  "input-field w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:border-accent focus:ring-2";

export const btnPrimary =
  "btn-gradient inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent";

/** Gráfico de linha simples em SVG. data: [{ label, value }] */
export function LineChart({ data, height = 200 }) {
  const w = 600;
  const h = height;
  const pad = { t: 16, r: 16, b: 28, l: 36 };
  const values = data.map((d) => d.value);
  const min = Math.floor((Math.min(...values) - 10) / 10) * 10;
  const max = Math.ceil((Math.max(...values) + 5) / 10) * 10;
  const x = (i) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1);
  const y = (v) => pad.t + ((max - v) * (h - pad.t - pad.b)) / (max - min);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `${x(0)},${h - pad.b} ${pts} ${x(data.length - 1)},${h - pad.b}`;
  const ticks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Gráfico de atividade">
      <defs>
        <linearGradient id="sup-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border-color)" strokeDasharray="4 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)">
            {Math.round(t)}
          </text>
        </g>
      ))}
      <polygon points={area} fill="url(#sup-area)" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2">
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
          <text x={x(i)} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
