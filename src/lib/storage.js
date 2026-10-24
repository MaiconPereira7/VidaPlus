const PREFIX = "vidaplus_";

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage indisponível (modo privado, cota excedida) — falha silenciosa no protótipo
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

// Os dados de saúde ficam em chaves "u:<email>:<tipo>". Quando o usuário
// troca de e-mail, movemos tudo para o e-mail novo — senão o histórico
// inteiro "sumiria" da conta.
export function migrateUserKeys(oldEmail, newEmail) {
  if (!oldEmail || !newEmail || oldEmail === newEmail) return;
  try {
    const oldPrefix = `${PREFIX}u:${oldEmail}:`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(oldPrefix)) keys.push(k);
    }
    keys.forEach((k) => {
      const newKey = `${PREFIX}u:${newEmail}:${k.slice(oldPrefix.length)}`;
      localStorage.setItem(newKey, localStorage.getItem(k));
      localStorage.removeItem(k);
    });
  } catch {
    // ignore
  }
}

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
