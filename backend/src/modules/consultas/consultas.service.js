import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";

// Centraliza a tradução do erro de banco (violação da EXCLUSION
// CONSTRAINT "sem_conflito_horario_pessoal") numa mensagem de negócio
// amigável. Isso fica aqui — não no errorHandler genérico — porque só
// quem chama create/update de consulta sabe que ESTE é o contexto certo
// para essa mensagem específica.
async function executarComTraducaoDeConflito(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.message?.includes("sem_conflito_horario_pessoal")) {
      throw ApiError.conflict(
        "Você já tem um compromisso marcado nesse horário. Escolha outro horário."
      );
    }
    throw err;
  }
}

export async function criar(usuarioId, dados) {
  return executarComTraducaoDeConflito(() =>
    prisma.consulta.create({
      data: {
        usuarioId,
        titulo: dados.titulo,
        dataHoraInicio: new Date(dados.dataHoraInicio),
        dataHoraFim: new Date(dados.dataHoraFim),
        tipo: dados.tipo,
        observacoes: dados.observacoes,
      },
    })
  );
}

export async function listar(usuarioId, filtros) {
  const where = { usuarioId };

  if (filtros.status) where.status = filtros.status;
  if (filtros.de || filtros.ate) {
    where.dataHoraInicio = {};
    if (filtros.de) where.dataHoraInicio.gte = new Date(`${filtros.de}T00:00:00.000Z`);
    if (filtros.ate) where.dataHoraInicio.lte = new Date(`${filtros.ate}T23:59:59.999Z`);
  }

  return prisma.consulta.findMany({ where, orderBy: { dataHoraInicio: "asc" } });
}

async function buscarOuFalhar(id, usuarioId) {
  const consulta = await prisma.consulta.findUnique({ where: { id } });
  if (!consulta) throw ApiError.notFound("Compromisso não encontrado.");
  // Só o dono do compromisso pode vê-lo/editá-lo/cancelá-lo — isso é o que
  // impede o "IDOR" clássico (trocar o :id na URL e mexer no compromisso
  // de outra pessoa).
  if (consulta.usuarioId !== usuarioId) throw ApiError.forbidden();
  return consulta;
}

export async function buscarPorId(id, usuarioId) {
  return buscarOuFalhar(id, usuarioId);
}

export async function atualizar(id, usuarioId, dados) {
  await buscarOuFalhar(id, usuarioId);

  return executarComTraducaoDeConflito(() =>
    prisma.consulta.update({
      where: { id },
      data: {
        ...dados,
        dataHoraInicio: dados.dataHoraInicio ? new Date(dados.dataHoraInicio) : undefined,
        dataHoraFim: dados.dataHoraFim ? new Date(dados.dataHoraFim) : undefined,
      },
    })
  );
}

export async function cancelar(id, usuarioId) {
  await buscarOuFalhar(id, usuarioId);
  // Vira CANCELADA em vez de deletar: mantém histórico (útil para o
  // dashboard) e libera o horário automaticamente, já que a EXCLUSION
  // CONSTRAINT ignora linhas com status = CANCELADA.
  return prisma.consulta.update({ where: { id }, data: { status: "CANCELADA" } });
}

export async function remover(id, usuarioId) {
  await buscarOuFalhar(id, usuarioId);
  await prisma.consulta.delete({ where: { id } });
}
