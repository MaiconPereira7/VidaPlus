// Dados fictícios do Painel do Supervisor (sem backend).

export const SUPERVISOR = {
  nome: "Dr. Carlos Mendes",
  primeiroNome: "Dr. Carlos",
  email: "carlos.mendes@vidaplus.com.br",
  cargo: "Supervisor Clínico",
};

export const HUMORES = {
  otimo: { emoji: "😄", label: "Ótimo" },
  bem: { emoji: "🙂", label: "Bem" },
  neutro: { emoji: "😐", label: "Neutro" },
  triste: { emoji: "😔", label: "Triste" },
  mal: { emoji: "😣", label: "Mal" },
};

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// ultimoAcessoMin: minutos desde o último acesso (usado para ordenar).
export const PACIENTES = [
  { id: 1, nome: "Maria Silva", idade: 67, email: "maria.silva@email.com", telefone: "(11) 98765-4321", cadastro: "12/03/2024", ultimoAcessoMin: 4320, humor: "triste", copos: 2, meta: 8, adesao: 34, ativo: false },
  { id: 2, nome: "João Santos", idade: 54, email: "joao.santos@email.com", telefone: "(21) 99654-1122", cadastro: "02/05/2024", ultimoAcessoMin: 120, humor: "mal", copos: 5, meta: 8, adesao: 58, ativo: true },
  { id: 3, nome: "Ana Oliveira", idade: 42, email: "ana.oliveira@email.com", telefone: "(31) 98111-2233", cadastro: "18/01/2024", ultimoAcessoMin: 15, humor: "otimo", copos: 8, meta: 8, adesao: 96, ativo: true },
  { id: 4, nome: "Pedro Costa", idade: 71, email: "pedro.costa@email.com", telefone: "(41) 99777-8899", cadastro: "25/02/2024", ultimoAcessoMin: 45, humor: "bem", copos: 6, meta: 8, adesao: 91, ativo: true },
  { id: 5, nome: "Juliana Lima", idade: 36, email: "juliana.lima@email.com", telefone: "(51) 98222-3344", cadastro: "09/06/2024", ultimoAcessoMin: 300, humor: "bem", copos: 7, meta: 10, adesao: 88, ativo: true },
  { id: 6, nome: "Roberto Alves", idade: 63, email: "roberto.alves@email.com", telefone: "(61) 99333-4455", cadastro: "14/04/2024", ultimoAcessoMin: 10080, humor: "neutro", copos: 1, meta: 8, adesao: 22, ativo: false },
  { id: 7, nome: "Fernanda Rocha", idade: 48, email: "fernanda.rocha@email.com", telefone: "(71) 98444-5566", cadastro: "30/01/2024", ultimoAcessoMin: 90, humor: "otimo", copos: 6, meta: 8, adesao: 84, ativo: true },
  { id: 8, nome: "Carlos Pereira", idade: 59, email: "carlos.pereira@email.com", telefone: "(81) 99555-6677", cadastro: "07/07/2024", ultimoAcessoMin: 1440, humor: "neutro", copos: 4, meta: 8, adesao: 52, ativo: true },
  { id: 9, nome: "Beatriz Souza", idade: 29, email: "beatriz.souza@email.com", telefone: "(85) 98666-7788", cadastro: "21/08/2024", ultimoAcessoMin: 30, humor: "bem", copos: 5, meta: 8, adesao: 79, ativo: true },
  { id: 10, nome: "Antônio Ferreira", idade: 76, email: "antonio.ferreira@email.com", telefone: "(91) 99888-9900", cadastro: "03/02/2024", ultimoAcessoMin: 2880, humor: "triste", copos: 3, meta: 8, adesao: 45, ativo: false },
  { id: 11, nome: "Luciana Martins", idade: 51, email: "luciana.martins@email.com", telefone: "(11) 97123-4567", cadastro: "11/09/2024", ultimoAcessoMin: 240, humor: "bem", copos: 7, meta: 8, adesao: 73, ativo: true },
  { id: 12, nome: "Ricardo Gomes", idade: 45, email: "ricardo.gomes@email.com", telefone: "(19) 98234-5678", cadastro: "19/10/2024", ultimoAcessoMin: 5760, humor: "neutro", copos: 2, meta: 8, adesao: 38, ativo: false },
];

export function formatUltimoAcesso(min) {
  if (min < 60) return `Há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Há ${h} hora${h > 1 ? "s" : ""}`;
  const d = Math.round(h / 24);
  return `Há ${d} dia${d > 1 ? "s" : ""}`;
}

export function getPaciente(id) {
  return PACIENTES.find((p) => p.id === Number(id));
}

// Detalhes gerados de forma determinística a partir do paciente.
export function getPacienteDetalhe(p) {
  const base = p.adesao / 100;
  const humorKeys = Object.keys(HUMORES);
  const notas = [
    "Dormi bem e acordei disposto(a).",
    "Um pouco de dor de cabeça à tarde.",
    "Dia tranquilo, caminhei 20 minutos.",
    "Me senti cansado(a) o dia todo.",
    "Visita da família, fiquei feliz.",
    "Ansioso(a) com o resultado do exame.",
    "Sem nada de especial hoje.",
  ];

  return {
    hidratacao: DIAS.map((dia, i) => ({
      dia,
      copos: Math.max(0, Math.min(p.meta, Math.round(p.meta * base + ((i * 7 + p.id) % 4) - 1.5))),
      meta: p.meta,
    })),
    humor: DIAS.map((dia, i) => {
      const idx = Math.min(4, Math.max(0, Math.round((1 - base) * 3 + ((i + p.id) % 3) - 1)));
      return { dia, humor: humorKeys[idx], nota: notas[(i + p.id) % notas.length] };
    }),
    exames: [
      { data: "18/11/2026", tipo: "Hemograma completo", resultado: "Dentro da normalidade", status: "Concluído" },
      { data: "05/11/2026", tipo: "Glicemia em jejum", resultado: p.adesao < 50 ? "112 mg/dL (elevado)" : "92 mg/dL", status: p.adesao < 50 ? "Atenção" : "Concluído" },
      { data: "22/10/2026", tipo: "Colesterol total", resultado: "185 mg/dL", status: "Concluído" },
      { data: "02/12/2026", tipo: "Eletrocardiograma", resultado: "—", status: "Agendado" },
    ],
    medicamentos: [
      { nome: "Losartana", dosagem: "50 mg", horario: "08:00", adesao: Math.min(100, p.adesao + 6) },
      { nome: "Metformina", dosagem: "850 mg", horario: "08:00 · 20:00", adesao: p.adesao },
      { nome: "Sinvastatina", dosagem: "20 mg", horario: "22:00", adesao: Math.max(0, p.adesao - 9) },
    ],
    lembretes: [
      { titulo: "Beber água", quando: "Hoje, 14:00" },
      { titulo: "Metformina 850 mg", quando: "Hoje, 20:00" },
      { titulo: "Eletrocardiograma", quando: "02/12, 09:30" },
    ],
  };
}

export const ATIVIDADE_SEMANA = [
  { dia: "Seg", ativos: 162 },
  { dia: "Ter", ativos: 171 },
  { dia: "Qua", ativos: 158 },
  { dia: "Qui", ativos: 176 },
  { dia: "Sex", ativos: 169 },
  { dia: "Sáb", ativos: 141 },
  { dia: "Dom", ativos: 183 },
];

export const ALERTAS = [
  { id: 1, pacienteId: 1, texto: "Maria Silva não registra hidratação há 3 dias", nivel: "alto", quando: "Há 1 hora" },
  { id: 2, pacienteId: 2, texto: "João Santos com humor negativo por 5 dias consecutivos", nivel: "alto", quando: "Há 2 horas" },
  { id: 3, pacienteId: 6, texto: "Roberto Alves não acessa o app há 7 dias", nivel: "medio", quando: "Há 5 horas" },
  { id: 4, pacienteId: 10, texto: "Antônio Ferreira perdeu 4 doses de medicamento esta semana", nivel: "medio", quando: "Ontem" },
  { id: 5, pacienteId: 8, texto: "Carlos Pereira com glicemia acima do normal no último exame", nivel: "baixo", quando: "Ontem" },
];

export const LEMBRETES_INICIAIS = [
  { id: 1, titulo: "Beber água", descricao: "Lembrete para manter a hidratação ao longo do dia.", tipo: "hidratacao", destinatarios: "todos", horario: "De 2h em 2h (08:00–20:00)", frequencia: "diario", ativo: true },
  { id: 2, titulo: "Tomar medicamento", descricao: "Doses de uso contínuo prescritas.", tipo: "medicamento", destinatarios: "grupo", horario: "08:00, 14:00, 20:00", frequencia: "diario", ativo: true },
  { id: 3, titulo: "Registrar humor", descricao: "Check-in diário de como você está se sentindo.", tipo: "geral", destinatarios: "todos", horario: "21:00", frequencia: "diario", ativo: true },
  { id: 4, titulo: "Aferir pressão arterial", descricao: "Para pacientes hipertensos em acompanhamento.", tipo: "exame", destinatarios: "grupo", horario: "07:30", frequencia: "semanal", ativo: false },
  { id: 5, titulo: "Retorno com cardiologista", descricao: "Confirmar consulta de retorno.", tipo: "exame", destinatarios: "individual", horario: "10:00", frequencia: "semanal", ativo: true },
];

export const RELATORIOS = {
  semana: {
    adesao: { geral: 76, porDia: [72, 75, 78, 74, 79, 70, 83] },
    humor: { otimo: 22, bem: 38, neutro: 21, triste: 12, mal: 7 },
    hidratacao: { media: 5.8, meta: 8, porDia: [5.4, 5.9, 6.1, 5.6, 6.0, 5.2, 6.3] },
    atividade: { ativos: 183, inativos: 64 },
  },
  mes: {
    adesao: { geral: 73, porDia: [68, 70, 74, 76] },
    humor: { otimo: 19, bem: 36, neutro: 24, triste: 14, mal: 7 },
    hidratacao: { media: 5.5, meta: 8, porDia: [5.2, 5.4, 5.7, 5.8] },
    atividade: { ativos: 171, inativos: 76 },
  },
  trimestre: {
    adesao: { geral: 69, porDia: [64, 70, 73] },
    humor: { otimo: 17, bem: 35, neutro: 26, triste: 15, mal: 7 },
    hidratacao: { media: 5.2, meta: 8, porDia: [4.9, 5.2, 5.5] },
    atividade: { ativos: 158, inativos: 89 },
  },
};
