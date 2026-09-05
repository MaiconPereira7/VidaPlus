import { createContext, useContext, useState, useCallback } from "react";
import { api, setToken, getToken } from "../lib/api";

const AuthContext = createContext(null);
const USER_KEY = "vidaplus_user";

// A API fala português (nome, senha) — o resto do frontend já foi escrito
// esperando "name"/"email" em inglês. Em vez de reescrever todo componente
// que lê user.name, normalizamos aqui, na borda entre API e app. É a
// fronteira certa para essa tradução: um único lugar, fácil de re-adaptar
// se a API mudar de novo.
function normalizarUsuario(usuario) {
  return { ...usuario, name: usuario.nome };
}

function lerUsuarioSalvo() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function salvarSessao(token, usuario) {
  setToken(token);
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  } catch {
    // ignore
  }
}

function limparSessao() {
  setToken(null);
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? lerUsuarioSalvo() : null));

  const register = useCallback(async ({ name, email, password, cpf, dataNascimento, telefone }) => {
    try {
      const { token, usuario } = await api.post("/auth/registrar", {
        nome: name,
        email,
        senha: password,
        cpf,
        dataNascimento,
        telefone,
      });
      const usuarioNormalizado = normalizarUsuario(usuario);
      salvarSessao(token, usuarioNormalizado);
      setUser(usuarioNormalizado);
      return { ok: true, user: usuarioNormalizado };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const { token, usuario } = await api.post("/auth/login", { email, senha: password });
      const usuarioNormalizado = normalizarUsuario(usuario);
      salvarSessao(token, usuarioNormalizado);
      setUser(usuarioNormalizado);
      return { ok: true, user: usuarioNormalizado };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const usuario = await api.patch("/auth/me", { nome: patch.name, email: patch.email });
    const usuarioNormalizado = normalizarUsuario(usuario);
    salvarSessao(getToken(), usuarioNormalizado);
    setUser(usuarioNormalizado);
    return usuarioNormalizado;
  }, []);

  const logout = useCallback(() => {
    limparSessao();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
