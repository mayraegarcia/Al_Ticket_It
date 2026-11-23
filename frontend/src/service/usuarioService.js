import api from "./api";

export const usuarioService = {
  obtenerUsuarioActual: async () => {
    return await api.get("/usuarios/me");
  },

  obtenerFavoritos: async () => {
    return await api.get("/usuarios/me/favoritos");
  },

  agregarFavorito: async (eventoId) => {
    return await api.post("/usuarios/me/favoritos", {
      eventoId,
    });
  },

  quitarFavorito: async (eventoId) => {
    return await api.delete("/usuarios/me/favoritos", {
      data: { eventoId },
    });
  },
};