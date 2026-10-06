import { api } from "../../shared/api/client";

// GET (any authenticated user) / POST, PUT, DELETE (ADMIN only) /api/pecas
export const pecasApi = {
  list: () => api.get("/pecas"),
  create: (data) => api.post("/pecas", data),
  update: (id, data) => api.put(`/pecas/${id}`, data),
  remove: (id) => api.del(`/pecas/${id}`),
};
