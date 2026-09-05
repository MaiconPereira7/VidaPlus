import { api } from "./api";

// Agrega dados reais do Postgres: consultas do paciente logado + médias
// de todas as avaliações de UX (satisfação/NPS/SUS). Ver
// backend/src/modules/dashboard/dashboard.service.js para o cálculo.
export async function getDashboardResumo() {
  return api.get("/dashboard/resumo");
}
