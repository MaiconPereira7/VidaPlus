// Sessão apenas visual do Painel do Supervisor (sem backend).
const KEY = "vidaplus.supervisor";

export const isSupervisorLogado = () => sessionStorage.getItem(KEY) === "1";
export const entrarSupervisor = () => sessionStorage.setItem(KEY, "1");
export const sairSupervisor = () => sessionStorage.removeItem(KEY);
