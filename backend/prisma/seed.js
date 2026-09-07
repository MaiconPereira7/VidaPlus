// Popula o banco com dados realistas para demonstração/apresentação.
// Idempotente: limpa as tabelas na ordem certa (filhas antes das mães,
// por causa das FKs) e recria tudo do zero a cada execução.
//
// Uso: npm run seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SENHA_PADRAO = "vidaplus123";

const USUARIOS = [
  { nome: "João Pedro Almeida", email: "joao.almeida@example.com", nascimento: "1988-03-12" },
  { nome: "Mariana Costa Silva", email: "mariana.silva@example.com", nascimento: "1995-07-24" },
  { nome: "Lucas Henrique Souza", email: "lucas.souza@example.com", nascimento: "1979-11-02" },
  { nome: "Fernanda Oliveira Santos", email: "fernanda.santos@example.com", nascimento: "2001-01-30" },
  { nome: "Gabriel Rodrigues Lima", email: "gabriel.lima@example.com", nascimento: "1992-09-18" },
  { nome: "Beatriz Carvalho Pereira", email: "beatriz.pereira@example.com", nascimento: "1985-05-06" },
  { nome: "Rafael Martins Alves", email: "rafael.alves@example.com", nascimento: "1998-12-14" },
  { nome: "Camila Ribeiro Gomes", email: "camila.gomes@example.com", nascimento: "1973-04-27" },
];

const TITULOS_CONSULTA = ["Consulta de rotina", "Avaliação cardiológica", "Retorno de exames", "Check-up anual"];
const TITULOS_EXAME = ["Hemograma completo", "Eletrocardiograma", "Raio-X de tórax", "Exame dermatológico"];
const TITULOS_LEMBRETE = ["Tomar medicação contínua", "Renovar receita", "Levar exames anteriores"];

const Q4_OPCOES = [
  "Check-in diário de humor",
  "Indicadores de saúde (remédios, hidratação, passos)",
  "Consulta de exames (Prontuário)",
  "Agendamento de compromissos",
  "Lembretes e notificações",
];
const Q5_OPCOES = ["Nenhuma dificuldade", "Pouca dificuldade", "Dificuldade moderada", "Muita dificuldade"];
const Q8_OPCOES = ["Com certeza sim", "Provavelmente sim", "Talvez", "Provavelmente não", "Com certeza não"];

const NPS_RESPOSTAS = [
  { respondenteNome: "Lucas M.", score: 9, comentario: "Interface limpa e fácil de entender. Gostei dos lembretes." },
  { respondenteNome: "Ana Clara S.", score: 8, comentario: "Bom, mas senti falta de mais opções de personalização." },
  { respondenteNome: "Pedro H.", score: 10, comentario: "Excelente! Tudo que preciso pra gerenciar minha saúde num lugar só." },
  { respondenteNome: "Juliana R.", score: 7, comentario: "Funcional, mas o prontuário poderia ter mais filtros." },
  { respondenteNome: "Rafael T.", score: 9, comentario: "Muito intuitivo, a Home resume tudo que preciso ver no dia." },
  { respondenteNome: "Camila O.", score: 8, comentario: "Gostei bastante, só achei o cadastro um pouco simples demais." },
  { respondenteNome: "Thiago B.", score: 6, comentario: "Razoável. Esperava poder adicionar mais de um perfil (família)." },
  { respondenteNome: "Larissa F.", score: 9, comentario: "Adorei o check-in de humor, uso diário fácil." },
];

function cpfFicticio(indice) {
  // Formato válido (11 dígitos), sem se preocupar com dígito verificador
  // real — é dado de demonstração, não precisa passar em validação de CPF.
  return String(10000000000 + indice * 137).padStart(11, "0").slice(0, 11);
}

function amostra(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function inteiroEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function computeSusScore(respostas) {
  let total = 0;
  respostas.forEach((valor, idx) => {
    const positivo = idx % 2 === 0;
    total += positivo ? valor - 1 : 5 - valor;
  });
  return total * 2.5;
}

function npsCategoria(score) {
  if (score >= 9) return "Promotor";
  if (score >= 7) return "Neutro";
  return "Detrator";
}

async function limparBanco() {
  await prisma.avaliacao.deleteMany();
  await prisma.consulta.deleteMany();
  await prisma.usuario.deleteMany();
}

async function criarUsuarios(senhaHash) {
  const usuarios = [];
  for (let i = 0; i < USUARIOS.length; i++) {
    const u = USUARIOS[i];
    const usuario = await prisma.usuario.create({
      data: {
        nome: u.nome,
        email: u.email,
        senhaHash,
        cpf: cpfFicticio(i),
        dataNascimento: new Date(u.nascimento),
        telefone: `(11) 9${inteiroEntre(1000, 9999)}-${inteiroEntre(1000, 9999)}`,
      },
    });
    usuarios.push(usuario);
  }
  return usuarios;
}

// Gera compromissos para cada usuário garantindo que Consulta/Exame nunca
// se sobreponham para a MESMA pessoa: cada pessoa "anda" por uma agenda
// sequencial de slots de 30-45min, nunca voltando atrás no tempo.
async function criarConsultas(usuarios) {
  const agendaPorUsuario = new Map(usuarios.map((u) => [u.id, new Date("2026-08-10T08:00:00Z")]));

  function proximoSlot(usuarioId, minutos) {
    const inicio = new Date(agendaPorUsuario.get(usuarioId));
    const fim = new Date(inicio.getTime() + minutos * 60000);
    agendaPorUsuario.set(usuarioId, new Date(fim.getTime() + 15 * 60000)); // 15min de intervalo
    return { inicio, fim };
  }

  const statusPassado = ["CONCLUIDA", "CONCLUIDA", "FALTOU"];
  const statusFuturo = ["AGENDADA", "CONFIRMADA"];

  for (const usuario of usuarios) {
    const qtd = inteiroEntre(2, 4);
    for (let i = 0; i < qtd; i++) {
      const ehTempoBloqueado = Math.random() > 0.3; // Consulta/Exame ocupam agenda; Lembrete/Outro não
      const ehExame = Math.random() > 0.5;
      const tipo = ehTempoBloqueado ? (ehExame ? "EXAME" : "CONSULTA") : amostra(["LEMBRETE", "OUTRO"]);
      const titulo = !ehTempoBloqueado
        ? amostra(TITULOS_LEMBRETE)
        : ehExame
        ? amostra(TITULOS_EXAME)
        : amostra(TITULOS_CONSULTA);

      const duracao = ehExame ? 45 : 30;
      const { inicio, fim } = ehTempoBloqueado
        ? proximoSlot(usuario.id, duracao)
        : { inicio: new Date("2026-09-08T12:00:00Z"), fim: new Date("2026-09-08T12:30:00Z") };

      const noPassado = inicio < new Date("2026-09-05T00:00:00Z");

      await prisma.consulta.create({
        data: {
          usuarioId: usuario.id,
          titulo,
          dataHoraInicio: inicio,
          dataHoraFim: fim,
          tipo,
          status: noPassado ? amostra(statusPassado) : amostra(statusFuturo),
          observacoes: Math.random() > 0.6 ? "Trazer exames anteriores, se houver." : null,
        },
      });
    }
  }
}

async function criarAvaliacoes(usuarios) {
  // Satisfação: 6 respostas, com uma leve tendência positiva (realista
  // para um app que está indo bem, mas não perfeito).
  for (let i = 0; i < 6; i++) {
    const usuario = amostra(usuarios);
    const nota = () => inteiroEntre(3, 5);
    await prisma.avaliacao.create({
      data: {
        tipo: "SATISFACAO",
        respondenteNome: usuario.nome.split(" ")[0],
        usuarioId: usuario.id,
        respostas: {
          q1: nota(),
          q2: nota(),
          q3: nota(),
          q4: amostra(Q4_OPCOES),
          q5: amostra(Q5_OPCOES),
          q6: nota(),
          q7: nota(),
          q8: amostra(Q8_OPCOES),
          q9: "Gosto do lembrete de medicamentos, me ajuda bastante no dia a dia.",
          q10: "Poderia ter notificação por e-mail além do app.",
        },
      },
    });
  }

  // NPS: respostas com nomes e comentários fixos (mais realistas que texto genérico).
  for (let i = 0; i < NPS_RESPOSTAS.length; i++) {
    const { respondenteNome, score, comentario } = NPS_RESPOSTAS[i];
    const usuario = usuarios[i % usuarios.length];
    await prisma.avaliacao.create({
      data: {
        tipo: "NPS",
        respondenteNome,
        usuarioId: usuario.id,
        respostas: { score, comentario },
        score,
        categoria: npsCategoria(score),
      },
    });
  }

  // SUS: 6 respostas de 10 afirmações cada (1-5).
  for (let i = 0; i < 6; i++) {
    const usuario = amostra(usuarios);
    const respostas = Array.from({ length: 10 }, () => inteiroEntre(3, 5));
    const score = computeSusScore(respostas);
    await prisma.avaliacao.create({
      data: {
        tipo: "SUS",
        respondenteNome: usuario.nome.split(" ")[0],
        usuarioId: usuario.id,
        respostas,
        score,
      },
    });
  }
}

async function main() {
  console.log("Limpando banco...");
  await limparBanco();

  console.log("Criando senha compartilhada de demonstração...");
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

  console.log("Criando usuários...");
  const usuarios = await criarUsuarios(senhaHash);

  console.log("Criando compromissos da agenda...");
  await criarConsultas(usuarios);

  console.log("Criando avaliações de UX...");
  await criarAvaliacoes(usuarios);

  console.log("\nSeed concluído!");
  console.log(`Senha de todas as contas de demonstração: "${SENHA_PADRAO}"`);
  console.log("Exemplo de login:", USUARIOS[0].email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
