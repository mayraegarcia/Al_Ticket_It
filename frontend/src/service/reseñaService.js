import api from "./api";

export const resenaService = {
  obtenerPorEvento: async (eventoId) => {
    return await api.get(`/resenas/evento/${eventoId}`);
  },

  crear: async (resena) => {
    return await api.post("/resenas", resena);
  },
};