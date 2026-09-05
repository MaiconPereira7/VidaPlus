export default function LikertScale({ value, onChange, minLabel, maxLabel, size = 5 }) {
  const options = Array.from({ length: size }, (_, i) => i + 1);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {options.map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition-colors duration-150 ${
                active
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-border text-text-secondary hover:border-accent hover:bg-accent/5"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-text-muted">
        <span className="max-w-[45%]">{minLabel}</span>
        <span className="max-w-[45%] text-right">{maxLabel}</span>
      </div>
    </div>
  );
}
