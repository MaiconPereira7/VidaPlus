import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";

const SALT_ROUNDS = 10;

function semSenha(usuario) {
  // Nunca deixamos o hash da senha escapar para uma resposta HTTP, nem
  // por acidente — desestruturar e descartar é mais seguro do que confiar
  // em cada controller lembrar de omitir o campo manualmente.
  const { senhaHash: _senhaHash, ...resto } = usuario;
  return resto;
}

function gerarToken(usuario) {
  return jwt.sign({ sub: usuario.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function registrar({ nome, email, senha, telefone, cpf, dataNascimento }) {
  const emailEmUso = await prisma.usuario.findUnique({ where: { email } });
  if (emailEmUso) throw ApiError.conflict("Já existe uma conta com este e-mail.");

  const cpfEmUso = await prisma.usuario.findUnique({ where: { cpf } });
  if (cpfEmUso) throw ApiError.conflict("Já existe uma conta com este CPF.");

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: { nome, email, telefone, senhaHash, cpf, dataNascimento: new Date(dataNascimento) },
  });

  return { token: gerarToken(usuario), usuario: semSenha(usuario) };
}

export async function autenticar({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Mensagem idêntica para "não existe" e "senha errada" de propósito —
  // não damos pista pra quem está tentando descobrir e-mails cadastrados.
  const credenciaisInvalidas = () => ApiError.unauthorized("E-mail ou senha incorretos.");

  if (!usuario || !usuario.ativo) throw credenciaisInvalidas();

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) throw credenciaisInvalidas();

  return { token: gerarToken(usuario), usuario: semSenha(usuario) };
}

export async function buscarPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw ApiError.notFound("Usuário não encontrado.");
  return semSenha(usuario);
}

export async function atualizarPerfil(usuarioId, dados) {
  if (dados.email) {
    const emailEmUso = await prisma.usuario.findFirst({
      where: { email: dados.email, NOT: { id: usuarioId } },
    });
    if (emailEmUso) throw ApiError.conflict("Este e-mail já está em uso por outra conta.");
  }

  const usuario = await prisma.usuario.update({ where: { id: usuarioId }, data: dados });
  return semSenha(usuario);
}
