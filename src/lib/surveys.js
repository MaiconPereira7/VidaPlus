import { api } from "./api";

// As telas de avaliação e o painel de resultados foram escritos em cima
// de um formato próprio (respondent/answers/category). O backend guarda
// em português (respondenteNome/respostas/categoria). Adaptamos aqui, na
// borda — mesma estratégia de AuthContext.jsx e lib/agenda.js — para não
// precisar tocar em SatisfacaoPage/NpsPage/SusPage/ResultadosPage.

function paraResposta(a) {
  return {
    id: a.id,
    respondent: a.respondenteNome,
    answers: a.respostas,
    score: a.score !== null && a.score !== undefined ? Number(a.score) : undefined,
    comment: a.respostas?.comentario,
    category: a.categoria,
    timestamp: new Date(a.criadoEm).getTime(),
  };
}

// ---------- Satisfação ----------
export async function getSatisfacaoResponses() {
  const dados = await api.get("/avaliacoes/satisfacao");
  return dados.map(paraResposta);
}

export async function addSatisfacaoResponse(respondent, answers) {
  const criado = await api.post("/avaliacoes/satisfacao", {
    respondenteNome: respondent,
    respostas: answers,
  });
  return paraResposta(criado);
}

// ---------- NPS ----------
// Puro e síncrono de propósito: usado para a prévia de categoria na tela
// enquanto a pessoa ainda está escolhendo a nota, antes de enviar.
export function npsCategory(score) {
  if (score >= 9) return "Promotor";
  if (score >= 7) return "Neutro";
  return "Detrator";
}

export async function getNpsResponses() {
  const dados = await api.get("/avaliacoes/nps");
  return dados.map(paraResposta);
}

export async function addNpsResponse(respondent, score, comment) {
  const criado = await api.post("/avaliacoes/nps", {
    respondenteNome: respondent,
    score,
    comentario: comment,
  });
  return paraResposta(criado);
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

export function susGrade(score) {
  if (score <= 25) return { letter: "F", label: "Pior imaginável", color: "#dc2626" };
  if (score <= 51) return { letter: "D", label: "Ruim", color: "#f97316" };
  if (score <= 68) return { letter: "C", label: "OK", color: "#eab308" };
  if (score <= 80) return { letter: "B", label: "Bom", color: "#22c55e" };
  return { letter: "A", label: "Excelente", color: "#16a34a" };
}

export async function getSusResponses() {
  const dados = await api.get("/avaliacoes/sus");
  return dados.map(paraResposta);
}

export async function addSusResponse(respondent, answers) {
  // O score do SUS é calculado pelo backend (mesma fórmula, ver
  // backend/src/utils/surveyMath.js) — uma única fonte de verdade para
  // uma regra de negócio que não deveria divergir entre front e back.
  const criado = await api.post("/avaliacoes/sus", { respondenteNome: respondent, respostas: answers });
  return paraResposta(criado);
}

// ---------- Estatísticas genéricas (usadas no painel de resultados) ----------
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
