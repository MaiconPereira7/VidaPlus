import { readJSON, writeJSON, uid } from "./storage";
import { todayISO } from "./dates";

function key(email, name) {
  return `u:${email}:${name}`;
}

export const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", label: "Péssimo", color: "#dc2626" },
  { value: 2, emoji: "🙁", label: "Ruim", color: "#d97706" },
  { value: 3, emoji: "😐", label: "Ok", color: "#737373" },
  { value: 4, emoji: "🙂", label: "Bem", color: "#2563eb" },
  { value: 5, emoji: "😄", label: "Ótimo", color: "#059669" },
];

export function moodMeta(value) {
  return MOOD_OPTIONS.find((m) => m.value === value) || MOOD_OPTIONS[2];
}

// ---------- Humor ----------
export function getMoodLog(email) {
  return readJSON(key(email, "mood"), []);
}

export function getMoodToday(email) {
  const today = todayISO();
  const log = getMoodLog(email);
  return log.find((m) => m.date === today) || null;
}

export function setMoodToday(email, value) {
  const today = todayISO();
  const log = getMoodLog(email).filter((m) => m.date !== today);
  const entry = { date: today, mood: value, timestamp: Date.now() };
  const updated = [...log, entry].sort((a, b) => a.date.localeCompare(b.date));
  writeJSON(key(email, "mood"), updated);
  return entry;
}

// ---------- Hidratação ----------
export const WATER_GOAL = 8;

export function getWaterMap(email) {
  return readJSON(key(email, "water"), {});
}

export function getWaterToday(email) {
  const map = getWaterMap(email);
  return map[todayISO()] || 0;
}

export function setWaterToday(email, count) {
  const map = getWaterMap(email);
  const today = todayISO();
  const clamped = Math.max(0, Math.min(20, count));
  map[today] = clamped;
  writeJSON(key(email, "water"), map);
  return clamped;
}

// ---------- Passos ----------
export const STEPS_GOAL = 6000;

export function getStepsMap(email) {
  return readJSON(key(email, "steps"), {});
}

export function getStepsToday(email) {
  const map = getStepsMap(email);
  return map[todayISO()] || 0;
}

export function setStepsToday(email, count) {
  const map = getStepsMap(email);
  const today = todayISO();
  const clamped = Math.max(0, Math.min(50000, count));
  map[today] = clamped;
  writeJSON(key(email, "steps"), map);
  return clamped;
}

// ---------- Medicamentos ----------
export function getMeds(email) {
  return readJSON(key(email, "meds"), []);
}

export function addMed(email, { name, time, dosage = "", frequency = "diario" }) {
  const meds = getMeds(email);
  const med = { id: uid(), name, time, dosage, frequency, takenDates: [] };
  writeJSON(key(email, "meds"), [...meds, med]);
  return med;
}

export function deleteMed(email, id) {
  const meds = getMeds(email).filter((m) => m.id !== id);
  writeJSON(key(email, "meds"), meds);
  return meds;
}

export function toggleMedTakenToday(email, id) {
  const today = todayISO();
  const meds = getMeds(email);
  const updated = meds.map((m) => {
    if (m.id !== id) return m;
    const taken = m.takenDates.includes(today);
    return {
      ...m,
      takenDates: taken
        ? m.takenDates.filter((d) => d !== today)
        : [...m.takenDates, today],
    };
  });
  writeJSON(key(email, "meds"), updated);
  return updated;
}

// ---------- Exames / Prontuário ----------
export const EXAM_STATUS = ["Normal", "Atenção", "Crítico"];

export const EXAM_STATUS_STYLES = {
  Normal: "bg-accent/10 text-accent-hover dark:text-accent",
  Atenção: "bg-amber/10 text-amber",
  Crítico: "bg-danger/10 text-danger",
};

export function getExams(email) {
  return readJSON(key(email, "exams"), []);
}

export function addExam(email, { name, date, result, status }) {
  const exams = getExams(email);
  const exam = { id: uid(), name, date, result, status };
  const updated = [exam, ...exams].sort((a, b) => b.date.localeCompare(a.date));
  writeJSON(key(email, "exams"), updated);
  return exam;
}

export function updateExam(email, id, patch) {
  const exams = getExams(email).map((e) => (e.id === id ? { ...e, ...patch } : e));
  writeJSON(key(email, "exams"), exams);
  return exams;
}

export function deleteExam(email, id) {
  const exams = getExams(email).filter((e) => e.id !== id);
  writeJSON(key(email, "exams"), exams);
  return exams;
}
