export default function SusGauge({ score, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 24;
  const clamped = Math.min(100, Math.max(0, score));
  const angle = 180 - (clamped / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + r * Math.cos(rad);
  const needleY = cy - r * Math.sin(rad);

  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;
  const arc = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;

  return (
    <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
      <defs>
        <linearGradient id="susGaugeGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="25%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="75%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d={arc} fill="none" stroke="var(--border-color)" strokeWidth={14} strokeLinecap="round" />
      <path
        d={arc}
        fill="none"
        stroke="url(#susGaugeGradient)"
        strokeWidth={14}
        strokeLinecap="round"
        opacity={0.85}
      />
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke="var(--text-primary)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={6} fill="var(--text-primary)" />
    </svg>
  );
}
