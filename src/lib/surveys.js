import { readJSON, writeJSON, uid } from "./storage";

const SATISFACAO_KEY = "survey:satisfacao";
const NPS_KEY = "survey:nps";
const SUS_KEY = "survey:sus";

// ---------- Satisfação ----------
export function getSatisfacaoResponses() {
  return readJSON(SATISFACAO_KEY, []);
}

export function addSatisfacaoResponse(respondent, answers) {
  const entry = { id: uid(), respondent, answers, timestamp: Date.now() };
  const all = [...getSatisfacaoResponses(), entry];
  writeJSON(SATISFACAO_KEY, all);
  return entry;
}

// ---------- NPS ----------
export function npsCategory(score) {
  if (score >= 9) return "Promotor";
  if (score >= 7) return "Neutro";
  return "Detrator";
}

export function getNpsResponses() {
  return readJSON(NPS_KEY, []);
}

export function addNpsResponse(respondent, score, comment) {
  const entry = {
    id: uid(),
    respondent,
    score,
    comment,
    category: npsCategory(score),
    timestamp: Date.now(),
  };
  const all = [...getNpsResponses(), entry];
  writeJSON(NPS_KEY, all);
  return entry;
}

// ---------- SUS ----------
export const SUS_STATEMENTS = [
  { n: 1, text: "Eu gostaria de usar o VidaPlus Web com frequência.", positive: true },
  { n: 2, text: "Achei o VidaPlus Web desnecessariamente complexo.", positive: false },
  { n: 3, text: "Achei o VidaPlus Web fácil de usar.", positive: true },
  {
    n: 4,
    text: "Acho que precisaria de ajuda de uma pessoa técnica para usar o VidaPlus Web.",
    positive: false,
  },
  { n: 5, text: "As funções do VidaPlus Web estão bem integradas.", positive: true },
  { n: 6, text: "Achei que havia muita inconsistência no VidaPlus Web.", positive: false },
  {
    n: 7,
    text: "Imagino que a maioria das pessoas aprenderia a usar o VidaPlus Web rapidamente.",
    positive: true,
  },
  { n: 8, text: "Achei o VidaPlus Web muito complicado de usar.", positive: false },
  { n: 9, text: "Me senti confiante ao usar o VidaPlus Web.", positive: true },
  {
    n: 10,
    text: "Precisei aprender muitas coisas antes de conseguir usar o VidaPlus Web.",
    positive: false,
  },
];

export function computeSusScore(answers) {
  // answers: array of 10 numbers (1-5), index 0 = item 1
  let total = 0;
  answers.forEach((value, idx) => {
    const isOdd = idx % 2 === 0; // items 1,3,5,7,9 (index 0,2,4,6,8)
    total += isOdd ? value - 1 : 5 - value;
  });
  return total * 2.5;
}

export function susGrade(score) {
  if (score <= 25) return { letter: "F", label: "Pior imaginável", color: "#dc2626" };
  if (score <= 51) return { letter: "D", label: "Ruim", color: "#f97316" };
  if (score <= 68) return { letter: "C", label: "OK", color: "#eab308" };
  if (score <= 80) return { letter: "B", label: "Bom", color: "#22c55e" };
  return { letter: "A", label: "Excelente", color: "#16a34a" };
}

export function getSusResponses() {
  return readJSON(SUS_KEY, []);
}

export function addSusResponse(respondent, answers) {
  const score = computeSusScore(answers);
  const entry = { id: uid(), respondent, answers, score, timestamp: Date.now() };
  const all = [...getSusResponses(), entry];
  writeJSON(SUS_KEY, all);
  return entry;
}

// ---------- Estatísticas genéricas ----------
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
