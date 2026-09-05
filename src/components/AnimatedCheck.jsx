export default function AnimatedCheck({ size = 64, color = "var(--accent)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke={color}
        strokeWidth="4"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
        style={{ animation: "stroke-draw 0.5s ease-out forwards" }}
      />
      <path
        d="M20 33 L28 41 L44 23"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
        style={{ animation: "stroke-draw 0.35s ease-out 0.45s forwards" }}
      />
    </svg>
  );
}
