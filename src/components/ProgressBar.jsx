export default function ProgressBar({ value, max, color = "var(--accent)", trackClassName = "", height = "h-2" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-border ${height} ${trackClassName}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
