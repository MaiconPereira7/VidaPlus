import { z } from "zod";

const tipoEnum = z.enum(["CONSULTA", "EXAME", "LEMBRETE", "OUTRO"]);
const statusEnum = z.enum(["AGENDADA", "CONFIRMADA", "CANCELADA", "CONCLUIDA", "FALTOU"]);

export const criarConsultaSchema = {
  body: z
    .object({
      titulo: z.string().min(1, "Informe um título para o compromisso."),
      dataHoraInicio: z.string().datetime({ message: "Data/hora de início inválida." }),
      dataHoraFim: z.string().datetime({ message: "Data/hora de término inválida." }),
      tipo: tipoEnum.default("CONSULTA"),
      observacoes: z.string().optional(),
    })
    .refine((dados) => new Date(dados.dataHoraFim) > new Date(dados.dataHoraInicio), {
      message: "O horário de término deve ser depois do horário de início.",
      path: ["dataHoraFim"],
    }),
};

export const atualizarConsultaSchema = {
  body: z.object({
    titulo: z.string().min(1).optional(),
    dataHoraInicio: z.string().datetime().optional(),
    dataHoraFim: z.string().datetime().optional(),
    tipo: tipoEnum.optional(),
    status: statusEnum.optional(),
    observacoes: z.string().optional(),
  }),
};

export const listarConsultasSchema = {
  query: z.object({
    de: z.string().date().optional(),
    ate: z.string().date().optional(),
    status: statusEnum.optional(),
  }),
};

export const idParamSchema = {
  params: z.object({ id: z.string().uuid() }),
};
