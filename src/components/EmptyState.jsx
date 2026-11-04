export default function EmptyState({ icon: Icon, title = "Nada por aqui ainda", description, actionLabel, onAction }) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-xl px-4 py-8 text-center">
      <div className="empty-state-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Icon size={32} strokeWidth={1.5} className="opacity-70" />
      </div>
      <div className="relative">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-[260px] text-xs text-text-muted">{description}</p>
        )}
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="relative mt-1 text-xs font-semibold text-accent hover:text-accent-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
