import { api } from "../../shared/api/client";
import { graphqlRequest } from "../../shared/api/graphqlClient";

// query { usuarios { id nome email role } } — restrita a ADMIN no backend
// (repositório garage-system-backend, src/graphql/resolvers.js, Query.usuarios).
const USUARIOS_QUERY = `
  query Usuarios {
    usuarios {
      id
      nome
      email
      role
    }
  }
`;

export const usuariosApi = {
  list: async () => {
    const data = await graphqlRequest(USUARIOS_QUERY);
    return data.usuarios;
  },
  // POST /api/auth/usuarios — ADMIN only (the first user of an empty database is the exception).
  create: (data) => api.post("/auth/usuarios", data),
};
