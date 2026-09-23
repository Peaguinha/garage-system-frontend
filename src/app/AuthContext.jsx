import { createContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../shared/api/client";

// { nome, email, id, role: "ADMIN" | "ATENDENTE" | "MECANICO" }
export const AuthContext = createContext(null);

const STORAGE_KEY = "gs-auth";

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // localStorage indisponível (modo privado, etc.) — segue sem sessão salva
  }
}

function persistSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sem persistência disponível — a sessão ainda funciona em memória nesta aba
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadStoredSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Garante que toda chamada à API já saia com o token certo, inclusive
  // logo após recarregar a página com uma sessão salva.
  useEffect(() => {
    setAuthToken(session?.token ?? null);
  }, [session]);

  async function login(email, senha) {
    setLoading(true);
    setError(null);
    try {
      // Formato de resposta documentado em backend/README.md:
      // POST /api/auth/login -> { token, usuario: { id, nome, email, role } }
      const data = await api.post("/auth/login", { email, senha });
      const next = { token: data.token, user: data.usuario };
      setSession(next);
      persistSession(next);
      return next.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
    persistSession(null);
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      loading,
      error,
      login,
      logout,
    }),
    [session, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
