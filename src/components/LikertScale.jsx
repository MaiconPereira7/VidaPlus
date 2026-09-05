export default function LikertScale({ value, onChange, minLabel, maxLabel, size = 5 }) {
  const options = Array.from({ length: size }, (_, i) => i + 1);
  return (
    <div>
      <div className="inline-flex w-full overflow-hidden rounded-xl border border-border">
        {options.map((n, idx) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex-1 border-r border-border py-3 text-sm font-medium transition-all duration-150 last:border-r-0 ${
                active
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              }`}
              style={{ borderRightWidth: idx === options.length - 1 ? 0 : 1 }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-text-muted">
        <span className="max-w-[45%]">{minLabel}</span>
        <span className="max-w-[45%] text-right">{maxLabel}</span>
      </div>
    </div>
  );
}
