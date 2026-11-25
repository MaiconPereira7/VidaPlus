// Indicadores do paciente calculados a partir dos próprios registros
// (mesma ideia dos indicadores do Painel do Supervisor, mas com dados reais).
import { WATER_GOAL, isMedScheduledOn, medStartDate, moodMeta } from "./health";
import { todayISO } from "./dates";

/**
 * Adesão de um medicamento nos dias informados: doses marcadas / doses previstas.
 * Hoje só entra na conta se a dose já foi marcada — senão o dia ainda não acabou.
 */
export function medAdherence(med, days) {
  const today = todayISO();
  const start = medStartDate(med);
  const scheduled = days.filter(
    (d) => d >= start && isMedScheduledOn(med, d) && (d !== today || med.takenDates.includes(d))
  );
  if (scheduled.length === 0) return null;
  const taken = scheduled.filter((d) => med.takenDates.includes(d)).length;
  return { pct: Math.round((taken / scheduled.length) * 100), taken, scheduled: scheduled.length };
}

export function overallAdherence(meds, days) {
  let taken = 0;
  let scheduled = 0;
  meds.forEach((m) => {
    const a = medAdherence(m, days);
    if (a) {
      taken += a.taken;
      scheduled += a.scheduled;
    }
  });
  return scheduled === 0 ? null : Math.round((taken / scheduled) * 100);
}

/**
 * Pontos de atenção da semana, no tom de um lembrete gentil (não de alarme).
 * days: últimos 7 dias (ISO), do mais antigo para hoje.
 */
export function healthAlerts({ days, waterMap, waterGoal = WATER_GOAL, moodByDate, meds, exams }) {
  const alerts = [];
  const today = todayISO();
  const pastDays = days.filter((d) => d !== today);

  // Água: os 3 dias anteriores a hoje abaixo da meta, com algum registro na semana.
  const last3 = pastDays.slice(-3);
  const hasWaterData = days.some((d) => waterMap[d]);
  if (hasWaterData && last3.length === 3 && last3.every((d) => (waterMap[d] || 0) < waterGoal)) {
    alerts.push({
      id: "agua",
      level: "medio",
      text: `Você ficou abaixo da meta de ${waterGoal} copos nos últimos 3 dias.`,
      action: { label: "Registrar água", to: "/#hidratacao" },
    });
  }

  // Humor: 3+ dias "Ruim" ou "Péssimo" na semana.
  const lowMoodDays = days.filter((d) => moodByDate[d] && moodByDate[d] <= 2).length;
  if (lowMoodDays >= 3) {
    alerts.push({
      id: "humor",
      level: "alto",
      text: `Seu humor esteve ${moodMeta(2).label.toLowerCase()} ou pior em ${lowMoodDays} dos últimos 7 dias. Conversar com alguém de confiança ou com seu médico pode ajudar.`,
    });
  }

  // Medicamentos: doses previstas e não marcadas nos dias anteriores.
  const missed = meds.reduce((total, m) => {
    const start = medStartDate(m);
    return total + pastDays.filter((d) => d >= start && isMedScheduledOn(m, d) && !m.takenDates.includes(d)).length;
  }, 0);
  if (missed > 0) {
    alerts.push({
      id: "meds",
      level: missed >= 3 ? "alto" : "medio",
      text: `${missed} dose${missed > 1 ? "s" : ""} de medicamento não ${missed > 1 ? "foram marcadas" : "foi marcada"} nos últimos 7 dias.`,
      action: { label: "Ver medicamentos", to: "/" },
    });
  }

  // Exames com resultado que pede atenção.
  const flagged = exams.filter((e) => e.status === "Atenção" || e.status === "Crítico");
  if (flagged.length > 0) {
    const critico = flagged.some((e) => e.status === "Crítico");
    alerts.push({
      id: "exames",
      level: critico ? "alto" : "baixo",
      text:
        flagged.length === 1
          ? `O exame "${flagged[0].name}" está marcado como ${flagged[0].status}. Leve o resultado à sua próxima consulta.`
          : `${flagged.length} exames estão marcados como Atenção ou Crítico. Leve os resultados à sua próxima consulta.`,
    });
  }

  const order = { alto: 0, medio: 1, baixo: 2 };
  return alerts.sort((a, b) => order[a.level] - order[b.level]);
}
