import { prisma } from "../../config/database.js";
import { mean, susGrade } from "../../utils/surveyMath.js";

// Mesmas 5 perguntas de escala Likert que o frontend usa para calcular a
// "satisfação média" (ver LIKERT_QUESTIONS em ResultadosPage.jsx) — as
// perguntas Q4/Q5/Q8 são de múltipla escolha e Q9/Q10 são texto livre,
// então não entram numa média numérica.
const CHAVES_LIKERT = ["q1", "q2", "q3", "q6", "q7"];

function resumoSatisfacao(respostas) {
  if (respostas.length === 0) return { total: 0, mediaGeral: null };
  const valores = [];
  respostas.forEach((r) => {
    CHAVES_LIKERT.forEach((chave) => {
      const v = Number(r.respostas[chave]);
      if (!Number.isNaN(v)) valores.push(v);
    });
  });
  return { total: respostas.length, mediaGeral: Number(mean(valores).toFixed(2)) };
}

function resumoNps(respostas) {
  const total = respostas.length;
  if (total === 0) return { total: 0, score: null, promotores: 0, neutros: 0, detratores: 0 };

  const promotores = respostas.filter((r) => r.categoria === "Promotor").length;
  const neutros = respostas.filter((r) => r.categoria === "Neutro").length;
  const detratores = respostas.filter((r) => r.categoria === "Detrator").length;
  const score = Math.round(((promotores - detratores) / total) * 100);

  return { total, score, promotores, neutros, detratores };
}

function resumoSus(respostas) {
  if (respostas.length === 0) return { total: 0, mediaScore: null, nota: null, corNota: null };

  const scores = respostas.map((r) => Number(r.score));
  const media = mean(scores);
  const grade = susGrade(media);

  return { total: respostas.length, mediaScore: Number(media.toFixed(1)), nota: grade.letter, corNota: grade.color };
}

export async function resumoGeral(usuarioId) {
  const [totalConsultas, consultasPorStatusRaw, proximas] = await Promise.all([
    prisma.consulta.count({ where: { usuarioId } }),
    prisma.consulta.groupBy({ by: ["status"], where: { usuarioId }, _count: true }),
    prisma.consulta.findMany({
      where: {
        usuarioId,
        status: { in: ["AGENDADA", "CONFIRMADA"] },
        dataHoraInicio: { gte: new Date() },
      },
      orderBy: { dataHoraInicio: "asc" },
      take: 5,
    }),
  ]);

  const consultasPorStatus = Object.fromEntries(
    consultasPorStatusRaw.map((linha) => [linha.status, linha._count])
  );

  // As avaliações de UX são agregadas globalmente (todos os respondentes),
  // não só do paciente logado — isso é intencional: é uma "visão de
  // produto", não um dado pessoal do usuário.
  const [satisfacao, nps, sus] = await Promise.all([
    prisma.avaliacao.findMany({ where: { tipo: "SATISFACAO" } }),
    prisma.avaliacao.findMany({ where: { tipo: "NPS" } }),
    prisma.avaliacao.findMany({ where: { tipo: "SUS" } }),
  ]);

  return {
    consultas: { total: totalConsultas, porStatus: consultasPorStatus, proximas },
    avaliacoes: {
      satisfacao: resumoSatisfacao(satisfacao),
      nps: resumoNps(nps),
      sus: resumoSus(sus),
    },
  };
}
