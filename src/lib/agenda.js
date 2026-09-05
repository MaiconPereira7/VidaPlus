import { api } from "./api";
import { toISODate, todayISO } from "./dates";

// A UI inteira (AgendaPage, HomePage) foi escrita em cima de um formato
// "achatado" (title/date/time/type/notes). O backend fala outro dialeto
// (titulo/dataHoraInicio/dataHoraFim/tipo/observacoes, tipo em maiúsculas).
// Em vez de reescrever as telas, adaptamos aqui — é a mesma estratégia
// usada em AuthContext.jsx para o usuário.

export const APPOINTMENT_TYPES = [
  { value: "Consulta", color: "#2563eb" },
  { value: "Exame", color: "#7c3aed" },
  { value: "Lembrete", color: "#d97706" },
  { value: "Outro", color: "#737373" },
];

export function typeMeta(type) {
  return APPOINTMENT_TYPES.find((t) => t.value === type) || APPOINTMENT_TYPES[3];
}

function paraTipoBackend(tipoFrontend) {
  return tipoFrontend.toUpperCase();
}

function paraTipoFrontend(tipoBackend) {
  return tipoBackend.charAt(0) + tipoBackend.slice(1).toLowerCase();
}

function combinarDataHora(date, time) {
  // Sem sufixo de fuso, o motor JS interpreta como horário local — exatamente
  // o que queremos, já que "date"/"time" vêm de inputs locais do usuário.
  return new Date(`${date}T${time}:00`).toISOString();
}

function somarMinutos(isoDateTime, minutos) {
  return new Date(new Date(isoDateTime).getTime() + minutos * 60000).toISOString();
}

const DURACAO_PADRAO_MINUTOS = 30;

function paraFrontend(consulta) {
  const inicio = new Date(consulta.dataHoraInicio);
  return {
    id: consulta.id,
    title: consulta.titulo,
    date: toISODate(inicio),
    time: `${String(inicio.getHours()).padStart(2, "0")}:${String(inicio.getMinutes()).padStart(2, "0")}`,
    type: paraTipoFrontend(consulta.tipo),
    notes: consulta.observacoes || "",
    status: consulta.status,
  };
}

export async function getAppointments() {
  const consultas = await api.get("/consultas");
  // Canceladas somem da agenda (mesmo efeito visual de "excluído"), mas
  // continuam no banco para histórico/auditoria — ver deleteAppointment.
  return consultas.filter((c) => c.status !== "CANCELADA").map(paraFrontend);
}

export async function getAppointmentsByDate(date) {
  const todas = await getAppointments();
  return todas.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

export async function getTodayReminders() {
  return getAppointmentsByDate(todayISO());
}

export async function getDateColorsMap() {
  const todas = await getAppointments();
  const map = new Map();
  todas.forEach((a) => {
    const color = typeMeta(a.type).color;
    const colors = map.get(a.date) || [];
    if (!colors.includes(color)) colors.push(color);
    map.set(a.date, colors);
  });
  return map;
}

export async function addAppointment({ title, date, time, type, notes }) {
  const inicio = combinarDataHora(date, time);
  const consulta = await api.post("/consultas", {
    titulo: title,
    dataHoraInicio: inicio,
    dataHoraFim: somarMinutos(inicio, DURACAO_PADRAO_MINUTOS),
    tipo: paraTipoBackend(type),
    observacoes: notes || undefined,
  });
  return paraFrontend(consulta);
}

export async function updateAppointment(id, { title, date, time, type, notes }) {
  const inicio = combinarDataHora(date, time);
  const consulta = await api.patch(`/consultas/${id}`, {
    titulo: title,
    dataHoraInicio: inicio,
    dataHoraFim: somarMinutos(inicio, DURACAO_PADRAO_MINUTOS),
    tipo: paraTipoBackend(type),
    observacoes: notes || undefined,
  });
  return paraFrontend(consulta);
}

export async function deleteAppointment(id) {
  // Cancela em vez de apagar de verdade: some da agenda pro usuário, mas
  // preserva o registro para o histórico/dashboard — a mesma decisão que
  // já vale para o botão de excluir uma consulta pelo médico.
  await api.patch(`/consultas/${id}/cancelar`);
}
