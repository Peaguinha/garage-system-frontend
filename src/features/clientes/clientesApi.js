import { api } from "../../shared/api/client";

// GET/POST/PUT/DELETE /api/clientes (ver backend/README.md)
export const clientesApi = {
  list: () => api.get("/clientes"),
  create: (data) => api.post("/clientes", data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  remove: (id) => api.del(`/clientes/${id}`),
};
