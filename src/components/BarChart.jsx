/**
 * Barras verticais simples.
 * data: [{ label, value, highlight? }] — highlight destaca o rótulo (ex.: hoje).
 * goal: barras que atingem a meta usam goalColor.
 */
export default function BarChart({
  data,
  max,
  height = 140,
  color = "var(--accent)",
  goal,
  goalColor = "var(--accent)",
  format = (v) => v,
}) {
  const top = Math.max(max ?? 0, ...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[11px] font-semibold tabular-nums text-text-secondary">{format(d.value)}</span>
          <div className="flex min-h-0 w-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-10 rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
              style={{
                height: `${(d.value / top) * 100}%`,
                minHeight: 4,
                backgroundColor: goal != null && d.value >= goal ? goalColor : color,
                opacity: d.value === 0 ? 0.25 : 1,
              }}
              title={`${d.label}: ${format(d.value)}`}
            />
          </div>
          <span className={`text-[11px] ${d.highlight ? "font-semibold text-accent" : "text-text-muted"}`}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
