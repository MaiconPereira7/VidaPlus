import { z } from "zod";

const nomeRespondente = z.string().min(1, "Informe seu nome.");

export const criarSatisfacaoSchema = {
  body: z.object({
    respondenteNome: nomeRespondente,
    respostas: z.record(z.string(), z.union([z.string(), z.number()])),
  }),
};

export const criarNpsSchema = {
  body: z.object({
    respondenteNome: nomeRespondente,
    score: z.number().int().min(0).max(10),
    comentario: z.string().optional().default(""),
  }),
};

export const criarSusSchema = {
  body: z.object({
    respondenteNome: nomeRespondente,
    respostas: z.array(z.number().int().min(1).max(5)).length(10, "SUS precisa de exatamente 10 respostas."),
  }),
};

export const tipoParamSchema = {
  params: z.object({ tipo: z.enum(["satisfacao", "nps", "sus"]) }),
};
