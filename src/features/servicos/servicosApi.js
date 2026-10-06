import { api } from "../../shared/api/client";

// GET (any authenticated user) / POST, PUT, DELETE (ADMIN only) /api/servicos
export const servicosApi = {
  list: () => api.get("/servicos"),
  create: (data) => api.post("/servicos", data),
  update: (id, data) => api.put(`/servicos/${id}`, data),
  remove: (id) => api.del(`/servicos/${id}`),
};
