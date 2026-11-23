
import api from "./api";

export const categoriaService = {
  obtenerTodas: async () => {
    return await api.get("/categorias");
  },

  obtenerPorId: async (id) => {
    return await api.get(`/categorias/${id}`);
  },
};
