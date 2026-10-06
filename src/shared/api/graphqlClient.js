// Cliente GraphQL compartilhado — usado só pela tela de Usuários (F6),
// já que o backend não expõe rota REST para usuários (ver
// "Exceção: tela de Usuários" no Garage System - Fase 2 Frontend.md).
// Reaproveita o mesmo token de autenticação de shared/api/client.js.

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql";

let authToken = null;

// Chamado pelo AuthContext junto com setAuthToken do cliente REST, para que
// toda query GraphQL também saia com o header Authorization correto.
export function setGraphqlAuthToken(token) {
  authToken = token;
}

export async function graphqlRequest(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok || payload?.errors?.length) {
    const message = payload?.errors?.[0]?.message || `Erro ${res.status} ao consultar o GraphQL`;
    throw new Error(message);
  }

  return payload.data;
}
