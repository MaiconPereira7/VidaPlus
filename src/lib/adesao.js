// Cor da adesão: verde > 70%, amarelo 40–70%, vermelho < 40%.
export function corAdesao(pct) {
  if (pct > 70) return "var(--accent)";
  if (pct >= 40) return "var(--amber)";
  return "var(--danger)";
}
