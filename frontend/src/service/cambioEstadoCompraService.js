import api from "./api";

export const cambioEstadoCompraService = {
  obtenerPorCompra: async (compraId) => {
    return await api.get(
      `/cambios-estado-compra/compra/${compraId}`
    );
  },

  obtenerDelUsuarioActual: async () => {
    return await api.get("/cambios-estado-compra/me");
  },
};