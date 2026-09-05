import { createContext, useContext, useState, useCallback } from "react";
import {
  getCurrentUser,
  registerUser,
  loginUser,
  updateCurrentUser,
  logout as logoutStorage,
} from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const register = useCallback((data) => {
    const result = registerUser(data);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const login = useCallback((data) => {
    const result = loginUser(data);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const updateProfile = useCallback((patch) => {
    const updated = updateCurrentUser(patch);
    if (updated) setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(() => {
    logoutStorage();
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
