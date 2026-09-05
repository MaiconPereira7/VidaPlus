export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Icon size={40} strokeWidth={1.5} className="text-text-muted" />
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {description && (
          <p className="mt-0.5 max-w-[240px] text-xs text-text-muted">{description}</p>
        )}
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-1 text-xs font-semibold text-accent hover:text-accent-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
