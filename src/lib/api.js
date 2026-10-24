// Cliente HTTP fino para a API do VidaPlus. Centraliza a montagem da URL,
// o header de autenticação e a normalização de erro — assim, todo lugar
// que chama a API recebe sempre um Error com .message pronto pra jogar
// direto no ToastContext, sem precisar entender o formato de resposta da
// API em cada tela.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";
const TOKEN_KEY = "vidaplus_token";
export const SESSION_EXPIRED_EVENT = "vidaplus:sessao-expirada";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage indisponível — falha silenciosa, mesma política do resto do app.
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }

  if (res.status === 204) return null;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  // 401 com token enviado = token expirado/inválido. Avisamos o
  // AuthContext para encerrar a sessão em vez de deixar cada tela exibindo
  // o mesmo erro sem saída. (No login sem token, 401 é só senha errada.)
  if (res.status === 401 && token) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || `Erro inesperado (HTTP ${res.status}).`);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
