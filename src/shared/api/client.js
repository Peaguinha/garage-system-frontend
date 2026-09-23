// Cliente HTTP compartilhado para a API REST do backend (ver ../../../backend/README.md).
// Cada feature deve importar `api` daqui em vez de chamar fetch() diretamente,
// para manter em um único lugar: base URL, header Authorization e tratamento de erro.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

let authToken = null;

// Chamado pelo AuthContext após login/logout, para que toda chamada
// subsequente já saia com o header Authorization correto.
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = payload?.message || `Erro ${res.status} ao chamar ${path}`;
    throw new Error(message);
  }

  // O backend responde { success, data, message } — devolvemos só o `data`
  // quando existir, senão o payload inteiro (ex.: respostas de erro/health).
  return payload && "data" in payload ? payload.data : payload;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
