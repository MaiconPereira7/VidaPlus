import { readJSON, writeJSON, removeKey } from "./storage";

const USERS_KEY = "users";
const SESSION_KEY = "session";

export function getUsers() {
  return readJSON(USERS_KEY, []);
}

function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}

export function getSessionEmail() {
  return readJSON(SESSION_KEY, null);
}

export function setSessionEmail(email) {
  writeJSON(SESSION_KEY, email);
}

export function clearSession() {
  removeKey(SESSION_KEY);
}

export function getCurrentUser() {
  const email = getSessionEmail();
  if (!email) return null;
  return getUsers().find((u) => u.email === email) || null;
}

export function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: "Já existe uma conta com este e-mail." };
  }
  const user = { name: name.trim(), email: normalizedEmail, password };
  saveUsers([...users, user]);
  setSessionEmail(normalizedEmail);
  return { ok: true, user };
}

export function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return { ok: false, error: "Não encontramos uma conta com este e-mail." };
  }
  if (user.password !== password) {
    return { ok: false, error: "Senha incorreta." };
  }
  setSessionEmail(normalizedEmail);
  return { ok: true, user };
}

export function updateCurrentUser(patch) {
  const email = getSessionEmail();
  if (!email) return null;
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx === -1) return null;
  const updated = { ...users[idx], ...patch };
  users[idx] = updated;
  saveUsers(users);
  if (patch.email && patch.email !== email) {
    setSessionEmail(patch.email);
  }
  return updated;
}

export function logout() {
  clearSession();
}
