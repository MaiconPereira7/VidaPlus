import { HeartPulse } from "lucide-react";

export default function Logo({ size = "md", withSlogan = false }) {
  const sizes = {
    sm: { box: "h-8 w-8", icon: 16, text: "text-lg" },
    md: { box: "h-10 w-10", icon: 19, text: "text-2xl" },
    lg: { box: "h-14 w-14", icon: 26, text: "text-3xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex ${s.box} shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent-hover dark:bg-accent/15 dark:text-accent`}
        >
          <HeartPulse size={s.icon} strokeWidth={2} />
        </div>
        <span className={`${s.text} tracking-tight text-text-primary`}>
          <span className="font-normal">Vida</span>
          <span className="font-bold text-accent">Plus</span>
        </span>
      </div>
      {withSlogan && (
        <p className="text-[11px] italic text-text-muted">Sua saúde, centralizada.</p>
      )}
    </div>
  );
}
