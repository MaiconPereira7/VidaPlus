import { readJSON, writeJSON } from "./storage";

const MISSIONS = ["m1", "m2", "m3"];
const DEFAULT_PROGRESS = { m1: false, m2: false, m3: false };

function key(email) {
  return `u:${email}:testes`;
}

export function getTestProgress(email) {
  return { ...DEFAULT_PROGRESS, ...readJSON(key(email), DEFAULT_PROGRESS) };
}

export function completeMission(email, mission) {
  const progress = getTestProgress(email);
  if (progress[mission]) return progress;
  const updated = { ...progress, [mission]: true };
  writeJSON(key(email), updated);
  return updated;
}

export function countCompleted(progress) {
  return MISSIONS.filter((m) => progress[m]).length;
}

export function allMissionsDone(progress) {
  return MISSIONS.every((m) => progress[m]);
}
