// Espelha exatamente a lógica de src/lib/surveys.js do frontend.
// Mantemos os dois lados idênticos de propósito: o cálculo de NPS/SUS é
// uma regra de negócio, não um detalhe de UI — ela precisa dar o mesmo
// resultado não importa onde rodar.

export function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function stdDev(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function npsCategory(score) {
  if (score >= 9) return "Promotor";
  if (score >= 7) return "Neutro";
  return "Detrator";
}

// answers: array de 10 números (1-5), índice 0 = item 1 (SUS_STATEMENTS).
export function computeSusScore(answers) {
  let total = 0;
  answers.forEach((value, idx) => {
    const isOdd = idx % 2 === 0; // itens 1,3,5,7,9 (índices 0,2,4,6,8) são positivos
    total += isOdd ? value - 1 : 5 - value;
  });
  return total * 2.5;
}

export function susGrade(score) {
  if (score <= 25) return { letter: "F", label: "Pior imaginável", color: "#dc2626" };
  if (score <= 51) return { letter: "D", label: "Ruim", color: "#d97706" };
  if (score <= 68) return { letter: "C", label: "OK", color: "#eab308" };
  if (score <= 80) return { letter: "B", label: "Bom", color: "#059669" };
  return { letter: "A", label: "Excelente", color: "#047857" };
}
