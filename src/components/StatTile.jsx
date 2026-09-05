export default function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={16} strokeWidth={1.75} className="shrink-0 text-text-secondary" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text-primary">{value}</p>
        <p className="truncate text-[11px] text-text-muted">{label}</p>
      </div>
    </div>
  );
}
