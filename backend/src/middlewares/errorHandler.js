import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

// Middleware de erro do Express (assinatura de 4 argumentos é obrigatória
// para o Express reconhecer isto como error handler, mesmo sem usar "next").
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // 1) Erros de negócio que nós mesmos lançamos (service/controller).
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    });
  }

  // 2) Erro de validação de entrada (body/query/params) via Zod.
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Dados inválidos.",
        details: err.flatten().fieldErrors,
      },
    });
  }

  // 3) Erros conhecidos do Prisma (violação de unique, FK, etc.).
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const campo = err.meta?.target?.join(", ") ?? "campo";
      return res.status(409).json({
        error: { message: `Já existe um registro com este ${campo}.` },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: { message: "Registro não encontrado." } });
    }
    // Ex.: violação da EXCLUSION CONSTRAINT anti-conflito de horário
    // (código Postgres 23P01), que o Prisma repassa sem mapear para um
    // P-code específico. A tradução amigável ideal fica no service que
    // sabe o contexto (ver consultas.service.js na Fase 2); aqui é a
    // última rede de segurança.
    if (err.message.includes("sem_conflito_horario_medico")) {
      return res.status(409).json({
        error: { message: "Este médico já possui uma consulta nesse horário." },
      });
    }
  }

  // 4) Qualquer outra coisa é um bug nosso — logamos o stack completo no
  // servidor, mas nunca vazamos detalhes internos para o cliente em produção.
  console.error(err);
  return res.status(500).json({
    error: {
      message: "Erro interno do servidor.",
      ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  });
}
