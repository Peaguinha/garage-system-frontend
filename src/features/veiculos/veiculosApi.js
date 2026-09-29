import { api } from "../../shared/api/client";

// GET/POST/PUT/DELETE /api/veiculos (ver backend/README.md)
export const veiculosApi = {
  list: () => api.get("/veiculos"),
  create: (data) => api.post("/veiculos", data),
  update: (id, data) => api.put(`/veiculos/${id}`, data),
  remove: (id) => api.del(`/veiculos/${id}`),
};
