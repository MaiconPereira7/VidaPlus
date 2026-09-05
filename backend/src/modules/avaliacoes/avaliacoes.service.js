import { prisma } from "../../config/database.js";
import { computeSusScore, npsCategory } from "../../utils/surveyMath.js";

// usuarioId é opcional de propósito: as avaliações de UX deste projeto
// pedem só o primeiro nome (RespondentGate no frontend), então nem todo
// respondente é necessariamente alguém com conta — pode ser um colega de
// turma testando o protótipo sem se cadastrar.
export async function criarSatisfacao({ respondenteNome, respostas }, usuarioId) {
  return prisma.avaliacao.create({
    data: { tipo: "SATISFACAO", respondenteNome, respostas, usuarioId: usuarioId ?? null },
  });
}

export async function criarNps({ respondenteNome, score, comentario }, usuarioId) {
  return prisma.avaliacao.create({
    data: {
      tipo: "NPS",
      respondenteNome,
      respostas: { score, comentario },
      score,
      categoria: npsCategory(score),
      usuarioId: usuarioId ?? null,
    },
  });
}

export async function criarSus({ respondenteNome, respostas }, usuarioId) {
  const score = computeSusScore(respostas);
  return prisma.avaliacao.create({
    data: {
      tipo: "SUS",
      respondenteNome,
      respostas,
      score,
      usuarioId: usuarioId ?? null,
    },
  });
}

export async function listarPorTipo(tipo) {
  return prisma.avaliacao.findMany({
    where: { tipo: tipo.toUpperCase() },
    orderBy: { criadoEm: "desc" },
  });
}
