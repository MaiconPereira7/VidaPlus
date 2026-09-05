import { readJSON, writeJSON, uid } from "./storage";
import { todayISO } from "./dates";

function key(email) {
  return `u:${email}:appointments`;
}

export const APPOINTMENT_TYPES = [
  { value: "Consulta", color: "#2563eb" },
  { value: "Exame", color: "#7c3aed" },
  { value: "Lembrete", color: "#d97706" },
  { value: "Outro", color: "#737373" },
];

export function typeMeta(type) {
  return APPOINTMENT_TYPES.find((t) => t.value === type) || APPOINTMENT_TYPES[3];
}

export function getAppointments(email) {
  return readJSON(key(email), []);
}

export function getAppointmentsByDate(email, date) {
  return getAppointments(email)
    .filter((a) => a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getTodayReminders(email) {
  return getAppointmentsByDate(email, todayISO());
}

export function getDatesWithAppointments(email) {
  return new Set(getAppointments(email).map((a) => a.date));
}

export function getDateColorsMap(email) {
  const map = new Map();
  getAppointments(email).forEach((a) => {
    const color = typeMeta(a.type).color;
    const colors = map.get(a.date) || [];
    if (!colors.includes(color)) colors.push(color);
    map.set(a.date, colors);
  });
  return map;
}

export function addAppointment(email, { title, date, time, type, notes }) {
  const appts = getAppointments(email);
  const appt = { id: uid(), title, date, time, type, notes: notes || "" };
  writeJSON(key(email), [...appts, appt]);
  return appt;
}

export function updateAppointment(email, id, patch) {
  const appts = getAppointments(email).map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeJSON(key(email), appts);
  return appts;
}

export function deleteAppointment(email, id) {
  const appts = getAppointments(email).filter((a) => a.id !== id);
  writeJSON(key(email), appts);
  return appts;
}
