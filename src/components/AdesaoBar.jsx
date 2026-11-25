import { corAdesao } from "../lib/adesao";

export default function AdesaoBar({ value, showLabel = true }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full min-w-16 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: corAdesao(value) }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-text-primary">
          {value}%
        </span>
      )}
    </div>
  );
}
