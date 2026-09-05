import { z } from "zod";

// Cadastro público sempre cria um PACIENTE. Contas de MEDICO/ADMIN são
// criadas via seed ou por um admin autenticado (não expomos isso
// publicamente — ninguém deveria conseguir se auto-promover a médico).
export const registrarSchema = {
  body: z.object({
    nome: z.string().min(3, "Informe o nome completo."),
    email: z.string().email("E-mail inválido."),
    senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
    telefone: z.string().optional(),
    cpf: z
      .string()
      .regex(/^\d{11}$/, "CPF deve conter 11 dígitos (somente números)."),
    dataNascimento: z.string().date("Data de nascimento inválida (use AAAA-MM-DD)."),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email("E-mail inválido."),
    senha: z.string().min(1, "Informe a senha."),
  }),
};

export const atualizarPerfilSchema = {
  body: z
    .object({
      nome: z.string().min(3).optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
    })
    .strict(),
};
