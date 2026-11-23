
import api from "./api";

export const eventoService = {
  obtenerTodos: async () => {
    return await api.get("/eventos");
  },

  buscar: async (filtros = {}) => {
    return await api.get("/eventos/buscar", {
      params: filtros,
    });
  },

  obtenerPorId: async (id) => {
    return await api.get(`/eventos/${id}`);
  },

  obtenerMisEventos: async () => {
    return await api.get("/eventos/organizador/mis-eventos");
  },

  crear: async (evento) => {
    return await api.post("/eventos", evento);
  },

  modificar: async (id, evento) => {
    return await api.put(`/eventos/${id}`, evento);
  },

  publicar: async (id) => {
    return await api.patch(`/eventos/${id}/publicar`);
  },

  cancelar: async (id) => {
    return await api.patch(`/eventos/${id}/cancelar`);
  },
};
