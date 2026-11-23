import api from "./api";

export const resenaService = {
  obtenerPorEvento: async (eventoId) => {
    return await api.get(`/reseñas/evento/${eventoId}`);
  },

  crear: async (resena) => {
    return await api.post("/reseñas", resena);
  },
};