import api from "./api";

export const favoritoService = {
  obtenerMisFavoritos: async () => {
    return await api.get("/favoritos");
  },

  agregar: async (eventoId) => {
    return await api.post("/favoritos", { eventoId });
  },

  eliminar: async (eventoId) => {
    return await api.delete(`/favoritos/${eventoId}`);
  },
};