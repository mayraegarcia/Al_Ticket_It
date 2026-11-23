import api from "./api";

export const tipoEntradaService = {
  obtenerPorEvento: async (eventoId) => {
    return await api.get(`/tipos-entrada/eventos/${eventoId}`);
  },

  obtenerPorId: async (id) => {
    return await api.get(`/tipos-entrada/${id}`);
  },

  agregar: async (eventoId, tipoEntrada) => {
    return await api.post(
      `/tipos-entrada/eventos/${eventoId}`,
      tipoEntrada
    );
  },

  modificar: async (eventoId, id, tipoEntrada) => {
    return await api.put(
      `/tipos-entrada/eventos/${eventoId}/${id}`,
      tipoEntrada
    );
  },

  eliminar: async (eventoId, id) => {
    return await api.delete(
      `/tipos-entrada/eventos/${eventoId}/${id}`
    );
  },
};